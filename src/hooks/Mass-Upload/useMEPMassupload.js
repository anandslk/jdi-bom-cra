import { callEnoviaWebService } from "../../utils/helpers";
import { MSG_FETCH_CSRF_HEADERS_FAILED } from "../../utils/toastMessages";
import { useDispatch } from "react-redux";
import { fetchCsrfToken } from "../../services/api/PlantAssignment/fetchCsrfService";
import useToast from "../useToast";
import { useState } from "react";

const useMEPMassUpload = () => {
  const [updateItems, setUpdateItems] = useState([]);
  const [createItems, setCreateItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showErrorToast, showSuccessToast } = useToast();
  const dispatch = useDispatch();
  const ENOVIA_BASE_URL = process.env.REACT_APP_ENOVIA_BASE_URL;

  const handleMEPMassupload = async (sheetData) => {
    try {
      setLoading(true);
      setCreateItems([]);
      setUpdateItems([]);
      const headers = await fetchCsrfToken();
      if (!headers) {
        showErrorToast(MSG_FETCH_CSRF_HEADERS_FAILED);
        return;
      }

      console.log("useMEPMassUpload Headers", headers);
      console.log("useMEPMassUpload in SheetData", sheetData);
      console.log("ENOVIA_BASE_URL", ENOVIA_BASE_URL);

      if (!sheetData || sheetData.length === 0) {
        showErrorToast("No data to upload. Please check your sheet.");
        return;
      }

      let searchedItems = [];
      let createMEPItems = [];
      for (let i = 0; i < sheetData.length; i++) {
        const row = sheetData[i];
        try {
          const searchStr = row?.Title;
          const response = await callEnoviaWebService(
            "GET",
            `${ENOVIA_BASE_URL}/resources/v1/modeler/dseng/dseng:EngItem/search?$searchStr=${searchStr}`,
            "",
            headers
          );
          if (response?.status === true && response?.output?.member?.length) {
            const match = response.output.member.find(
              (item) => item?.title === row?.Title
            );
            if (match) {
              console.log("==================", match)
              let checkMepResponse = await ValidateMep(ENOVIA_BASE_URL, match?.title, headers);
              console.log("New APi Check Validation",checkMepResponse)
              if(checkMepResponse.status && checkMepResponse?.output?.member?.length > 0){
                 let memberData= checkMepResponse?.output?.member[0];
                 console.log("memberData =======", memberData)
                  if(memberData?.manufacturer){
                    searchedItems.push({ ...match, row });
                  }else{
                    showErrorToast("It's not a Manufacturing Equalent Item")
                  }
              }
            }
          } else if (response?.output?.member?.length === 0) {
            console.log("No match found for row", row);
            createMEPItems.push(row);
          }
        } catch (error) {
          console.error(
            `Error processing row ${i} with Title ${row?.Title}:`,
            error
          );
        }
      }
      console.log("All matched items:", searchedItems);
      console.log(`Not Matched Items:`, createMEPItems);
      setCreateItems(createMEPItems);
      setUpdateItems(searchedItems);
    } catch (error) {
      console.error("MEP MASS UPLOAD Error:", error);
      showErrorToast("An error occurred while fetching MEP Mass Upload data.");
    } finally {
      setLoading(false);
    }
  };

  const updateMassupload = async (createItems, updateItems, reset) => {
    try {
      setLoading(true);
      const headers = await fetchCsrfToken();
      if (!headers) {
        showErrorToast(MSG_FETCH_CSRF_HEADERS_FAILED);
        return;
      }

      const { SecurityContext, ENO_CSRF_TOKEN } = headers;
      const newHeaders = {
        SecurityContext: "VPLMProjectLeader.Company Name.Micro Motion",
        ENO_CSRF_TOKEN: ENO_CSRF_TOKEN,
      };
      let createFailed = false;
      let updateFailed = false;
      if (!updateItems || updateItems.length === 0) {
        showErrorToast("No data to Update.");
        // return;
      }
      if (!createItems || createItems.length === 0) {
        showErrorToast("No data to Create.");
        // return;
      }
      // ============ For Create MEP Mass Upload Update =================
      if (createItems?.length > 0) {
        for (let i = 0; i < createItems.length; i++) {
          const row = createItems[i];
          const createBody = {
            items: [
              {
                type: "VPMReference",
                attributes: {
                  title: row?.Title,
                  isManufacturable: true,
                  description: row?.Description,
                },
              },
            ],
          };
          try {
            const response = await callEnoviaWebService(
              "POST",
              `${ENOVIA_BASE_URL}/resources/v1/modeler/dseng/dseng:EngItem`,
              createBody,
              newHeaders
            );
            console.log("Create Item Response:", response);
            if (response.status && response.output?.member?.length) {
              const extensionBody = [
                {
                  engItem: {
                    source:
                      "https://oi000186152-us1-compass.3dexperience.3ds.com:443/enovia",
                    type: "VPMReference",
                    identifier: response.output?.member[0]?.id,
                    relativePath:
                      "/resource/v1/dseng/dseng:EngItem/" +
                      response.output?.member[0]?.id,
                  },
                  manufacturerCompany: {
                    identifier: "uuid:f635eda1-d663-4d18-a269-de034998a6e1",
                    relativePath:
                      "/3drdfpersist/resources/v1/modeler/dsvnp/dsvnp:SupplierCompany/uuid:f635eda1-d663-4d18-a269-de034998a6e1",
                    source:
                      "https://oi000186152-us1-3dnetwork.3dexperience.3ds.com:443",
                    type: "SupplierCompany",
                  },
                  manufacturerPartNumber: String(
                    row["Manufacturer Part Number"]
                  ),
                  partSourceURL: row["Part Source URL"],
                  partSource: row["Part Source"],
                },
              ];
              const extensionresponse = await callEnoviaWebService(
                "POST",
                `${ENOVIA_BASE_URL}/resources/v1/modeler/dssrc/dssrc:ManufacturerEquivalentItems`,
                extensionBody,
                newHeaders
              );
              console.log("Extension Item Response:", extensionresponse);
              if (
                !(
                  extensionresponse.status &&
                  extensionresponse.output?.member?.length
                )
              ) {
                createFailed = true;
                console.error(
                  `Failed to create ManufacturerEquivalentItems for row ${i} with Title ${row?.Title}.`
                );
                showErrorToast(
                  extensionresponse?.message ||
                    "Failed to create ManufacturerEquivalentItems."
                );
              }
            }
          } catch (error) {
            createFailed = true;
            console.error(
              `Error creating item for row ${i} with Title ${row?.Title}:`,
              error
            );
            showErrorToast(
              `An error occurred while creating item for row ${i} with Title ${row?.Title}.`
            );
          }
        }
      }
      if (updateItems?.length > 0) {
        for (let i = 0; i < updateItems.length; i++) {
          const row = updateItems[i];
          const uploadBody = {
            partSource: row?.row["Part Source"],
            partSourceURL: row?.row["Part Source URL"],
            manufacturerPartNumber: String(
              row?.row["Manufacturer Part Number"]
            ),
            cestamp: row?.cestamp,
          };
          console.log("Upload Body:", uploadBody);
          try {
            const response = await callEnoviaWebService(
              "PATCH",
              `${ENOVIA_BASE_URL}/resources/v1/modeler/dssrc/dssrc:ManufacturerEquivalentItems/${row?.id}`,
              uploadBody,
              newHeaders
            );
            if (response.status) {
              console.log("Update Item Response:", response);
            } else {
              showErrorToast(response?.message || "");
              updateFailed = true;
            }
           
          } catch (error) {
            updateFailed = true;
            console.error(
              `Error creating item for row ${i} with Title ${row?.row?.Title}:`,
              error
            );
            showErrorToast(`Error creating item for row ${i} with Title ${row?.row?.Title}`);
          }
        }
      }
      if (!createFailed && !updateFailed) {
        showSuccessToast("MEP Mass Upload completed successfully.");
      }
      // ============ For MEP Mass Upload Update =================
    } catch (error) {
      console.error("MEP MASS UPLOAD Error:", error);
      showErrorToast("An error occurred while fetching MEP Mass Upload data.");
    } finally {
      setLoading(false);
    }
  };

  // return { handleMEPMassupload };
  return {
    updateItems,
    createItems,
    handleMEPMassupload,
    loading,
    updateMassupload,
  };
};

export default useMEPMassUpload;

async function ValidateMep(ENOVIA_BASE_URL, searchStr, headers){
  // https://oi000186152-us1-space.3dexperience.3ds.com/enovia/resources/v1/modeler/dseng/dseng:EngItem/search?$searchStr=SS_Rev02&$mask=dssrc:ManufacturerEquivalentItems.Basic
  const response = await callEnoviaWebService(
    "GET",
    `${ENOVIA_BASE_URL}/resources/v1/modeler/dseng/dseng:EngItem/search?$searchStr=${searchStr}&$mask=dssrc:ManufacturerEquivalentItems.Basic`,
    "",
    headers
  );
  return response;
}