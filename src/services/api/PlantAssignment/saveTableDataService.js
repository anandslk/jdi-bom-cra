import axios from "axios";
import { loadWAFData } from "../../../utils/helpers";

export const saveData = async (
  updatedItems,
  classesToBeClassified,
  initialAssignedClasses,
  headers,
  productId,
  AllClasses,
  productChilds,
  type,
  rowstoDelete,
  finalArray,
  proposedChanges
) => {
  try {
    const ENOVIA_BASE_URL = process.env.REACT_APP_ENOVIA_BASE_URL;
    console.log("[Save Data] Starting data saving process...");
    console.log("Type in Save Table Data:", type);
    console.log("Final aRRAY IS inside Save:", finalArray);
    console.log("Proposed Changes in Save", proposedChanges);
    const classifiedClasses = [...classesToBeClassified];
    const WAFData = await loadWAFData();
    const fetchOOTBData = async (url, body, method) => {
      console.log("Fetching URL:", url);
      console.log("Request Body:", JSON.stringify(body, null, 2));

      return new Promise((resolve, reject) => {
        WAFData.authenticatedRequest(url, {
          method,
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          data: JSON.stringify(body),
          type: "json",
          onComplete: (response) => {
            console.log("Response received:", response);
            resolve(response);
          },
          onFailure: (error) => {
            console.error("Request failed:", error);
            reject(error);
          },
        });
      });
    };

    const fetchData = async (
      url,
      body = null,
      method = "GET"
      // headers = {}
    ) => {
      console.log("Fetching URL:", url);
      console.log("Method is:");
      console.log("Request Body:", JSON.stringify(body, null, 2));

      try {
        const response = await axios({
          url,
          method,
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          data: body, // Include body only if provided
        });

        console.log("Response received:", response.data);
        return response.data;
      } catch (error) {
        console.error("Request failed:", error);
        throw error; // Propagate the error to the caller
      }
    };

    // released childs but not present in CA Proposed Changes
    let NotPropagableChilds = productChilds.filter((prodChild) => {
      if (prodChild.state.toLowerCase() === "released") {
        const change = proposedChanges.find(
          (change) =>
            change.identifier === prodChild.id &&
            change.action.toLowerCase() === "modify"
        );
        return !change;
      }
      return false;
    });
    console.log("NotPropagableChilds ARE :", NotPropagableChilds);

    let ErrorObj = [];
    finalArray.forEach((classItem) => {
      //if (classItem.Type === "New" || classItem.Type === "Update" ) {
      if (classItem.MBOMValue) {
        let prodchilds = [];
        NotPropagableChilds.forEach((notPropagableChild) => {
          if (!notPropagableChild.classes.includes(classItem.id)) {
            prodchilds.push({
              childId: notPropagableChild.id,
              childName: notPropagableChild.name,
            });
          }
        });
        if (prodchilds.length > 0) {
          ErrorObj.push({
            id: classItem.id,
            title: classItem.title,
            childs: prodchilds,
            type: classItem.Type,
          });
        }
      }
    });
    let Finalmessage = "";
    console.log("ErrorObj IS", ErrorObj);
    ErrorObj.forEach((item) => {
      let message = "";

      // Check if item.childs is an array and contains valid objects with titles
      if (
        Array.isArray(item.childs) &&
        item.childs.every((child) => child.childName)
      ) {
        const childTitles = item.childs
          .map((child) => child.childName)
          .join(", ");
        console.log("Chilld Titles are", childTitles);
        if (item.type.toLowerCase() !== "new") {
          message = `${item.title} MBOM can't be Make due to unclassified child items: ${childTitles}`;
        } else {
          message = `Unable to classify product ${item.title} due to unclassified child items: ${childTitles}`;
        }
        console.log("Message is:", message);
      } else {
        // Handle case where childs is invalid or missing titles
        message = `Invalid child data for ${item.title}.`;
      }

      //  item.message = message;
      Finalmessage += `${message}\n`; // Using '\n' to separate each message with a new line
    });
    console.log(ErrorObj);
    console.log("Concatenated Messages:\n", Finalmessage);

    let newClasses = finalArray
      .filter(
        (classItem) =>
          classItem.Type.toLowerCase() === "new" &&
          !ErrorObj.some((errorItem) => errorItem.id === classItem.id)
      )
      .map((classItem) => classItem.id);
    console.log("New Classes are:", newClasses);
    let updateBody = {};
    finalArray.forEach((classItem) => {
      const isIdNotInErrorObj = !ErrorObj.some(
        (errorItem) => errorItem.id === classItem.id
      );
      if (
        isIdNotInErrorObj &&
        (classItem.Type.toLowerCase() === "update" ||
          (classItem.Type.toLowerCase() === "new" && classItem.MBOMValue))
      ) {
        updateBody[classItem.MBOMName] = classItem.MBOMValue;
      }
    });
    console.log("Update body is:", updateBody);

    let propagateClasses = finalArray
      .filter(
        (classItem) =>
          classItem.MBOMValue &&
          !ErrorObj.some((errorItem) => errorItem.id === classItem.id)
      )
      .map((classItem) => classItem.id);

    console.log("Propogateable classes are", propagateClasses);

    if (newClasses.length > 0) {
      let classifyUrl =
        "https://emr-product-datahub-server-sap-stage.azurewebsites.net/plantAssignment/classifyProductToClass";
      let classifybody = {
        id: productId,
        type: type,
        classes: newClasses,
        mode: "classifyParent",
      };
      const classifyResponse = await fetchData(
        classifyUrl,
        classifybody,
        "POST"
      );
      console.log("classifyResponse:", JSON.stringify(classifyResponse));
    }

    if (Object.keys(updateBody).length > 0) {
      const nextApiUrl = `${ENOVIA_BASE_URL}/resources/v1/modeler/dslib/dslib:ClassifiedItem/${productId}`;
      const response = await fetchOOTBData(nextApiUrl, "", "GET");
      console.log("CStamp Response:", response);
      let cestamp = response.member[0]?.cestamp || "";
      updateBody["cestamp"] = cestamp;

      const patchUrl = `https://emr-product-datahub-server-sap-stage.azurewebsites.net/plantAssignment/updateClassificationAttribute?id=${productId}`;
      await fetchData(patchUrl, updateBody, "PATCH");
      console.log("Updated database successfully.");
    }

    if (
      propagateClasses.length > 0 &&
      productChilds.length > 0 &&
      type === "VPMReference"
    ) {
      let classifyUrl =
        "https://emr-product-datahub-server-sap-stage.azurewebsites.net/plantAssignment/classifyProductToClass";

      let classifybody = {
        id: productId,
        type: type,
        classes: propagateClasses,
        childs: productChilds,
        mode: "classifychilds",
      };
      const childclassifyResponse = await fetchData(
        classifyUrl,
        classifybody,
        "POST"
      );
      console.log(
        "child classifyResponse:",
        JSON.stringify(childclassifyResponse)
      );
    }
    if (rowstoDelete.length > 0) {
      let declassifyUrl =
        "https://emr-product-datahub-server-sap-stage.azurewebsites.net/plantAssignment/declassifyProductToClass";

      let classifybody = {
        id: productId,
        type: type,
        classes: rowstoDelete,
      };
      const declassifyResponse = await fetchData(
        declassifyUrl,
        classifybody,
        "POST"
      );
      console.log("declassifyResponse:", JSON.stringify(declassifyResponse));
    }

    console.log("All classification API calls completed successfully.");

    return {
      success: true,
      message: "Data saved successfully",
      ErrorObj: ErrorObj,
      Finalmessage: Finalmessage,
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return { success: false, message: "Failed to save data", error };
  }
};
