import { MSG_FETCH_CSRF_HEADERS_FAILED } from "../../utils/toastMessages";
import useToast from "../useToast";
import { fetchCsrfToken } from "../../services/api/PlantAssignment/fetchCsrfService";
import { callEnoviaWebService, fetchData } from "../../utils/helpers";
import { useEffect, useState } from "react";

const useMassUpload = (initialOperationChoice) => {
  const { showErrorToast } = useToast();
  const [mappedAttributes, setMappedAttributes] = useState([]);
  const [operationChoice, setOperationChoice] = useState(
    initialOperationChoice
  );
  const ENOVIA_BASE_URL = process.env.REACT_APP_ENOVIA_BASE_URL;

  // Function to Fetch Spreadsheet Column Mapping
  const fetchColumnMapping = async (operation = null) => {
    try {
      // Use the passed operation or fall back to state
      const effectiveOperation = operation || operationChoice;
      console.log("Fetching column mapping for operation:", effectiveOperation);

      if (!effectiveOperation) {
        console.log("No operation specified, skipping fetch");
        return;
      }

      // Update state if a new operation is passed
      if (operation && operation !== operationChoice) {
        setOperationChoice(operation);
      }

      console.log("Fetching column mapping...");

      // Get CSRF Headers
      const headers = await fetchCsrfToken();
      if (!headers) {
        showErrorToast(MSG_FETCH_CSRF_HEADERS_FAILED);
        return;
      }

      // 🔹 Step 1: Call API 1 (GET) to Fetch Metadata
      const metadataResponse = await callEnoviaWebService(
        "GET",
        `${ENOVIA_BASE_URL}/resources/v1/modeler/dseng/dseng:EngItem/search?%24top=1`,
        "",
        headers
      );

      if (!metadataResponse || !metadataResponse.output) {
        throw new Error("Failed to fetch metadata.");
      }
      console.log("Metadata Member:", metadataResponse.output.member);

      const objectId = metadataResponse.output?.member?.[0]?.id;
      if (!objectId) {
        throw new Error("No object ID found in metadata.");
      }

      console.log("Extracted Object ID:", objectId);

      // 🔹 Step 2: Call API 2 (POST) to Fetch Attributes
      const attributeResponse = await callEnoviaWebService(
        "POST",
        `${ENOVIA_BASE_URL}/resources/v1/collabServices/attributes/op/read?tenant=OI000186152&xrequestedwith=xmlhttprequest`,
        {
          busIDs: [objectId],
        },
        headers
      );

      if (!attributeResponse || !attributeResponse.output) {
        throw new Error("Failed to fetch attribute data.");
      }
      console.log("Attribute Response:", attributeResponse.output);

      // 🔹 Step 3: Extract & Map Relevant Attributes

      const groupData = attributeResponse.output.results?.[0]?.groupData || [];

      console.log(
        "Full Group Data (with all NLS values):",
        groupData.map((item) => item.nls)
      );

      const systemAttributes = [
        {
          name: "description", // Change from backendName to name
          nls: "Description",
          groupNLS: "System Attributes",
        },
        {
          name: "Part Number", // Change from backendName to name
          nls: "EIN Number",
          groupNLS: "System Attributes",
        },
        {
          name: "type", // Change from backendName to name
          nls: "Type",
          groupNLS: "System Attributes",
        },
        {
          name: "title", // Change from backendName to name
          nls: "Title",
          groupNLS: "System Attributes",
        },
        {
          name: "collabspaceTitle", // Change from backendName to name
          nls: "Collaborative Space",
          groupNLS: "System Attributes",
        },
        {
          name:"Physical Product/Raw Material",
          nls: "Physical Product/Raw Material",
          groupNLS: "System Attributes",
        
        }
       
      ];

      // Define EBOM attributes for Product Structure operation
      let ebomAttributes = [];
      if (effectiveOperation === "2") {
        ebomAttributes = [
          {
            name: "MBOMFindNumber__e7ead0d4e78a4d7f99e9e5fd900f8fdf",
            nls: "Find Number",
            group: "EBOM Attributes",
            groupNLS: "EBOM Attributes",
          },
          {
            name: "MBOMComponentLocation__00cc2e44830642d69dd3728d8c279a75",
            nls: "Component Location",
            group: "EBOM Attributes",
            groupNLS: "EBOM Attributes",
          },
          {
            name: "Level",
            nls: "Level",
            group: "EBOM Attributes",
            groupNLS: "EBOM Attributes",
          },
          {
            name: "name",
            nls: "Reference Designator",
            group: "EBOM Attributes",
            groupNLS: "EBOM Attributes",
          },
        ];
      }

      const attributeGroups = groupData.map((item) => item.groupNLS);
      console.log("Attribute Groups:", attributeGroups);

      // Add EBOM Attributes group for operation 2
      if (
        effectiveOperation === "2" &&
        !attributeGroups.includes("EBOM Attributes")
      ) {
        attributeGroups.push("EBOM Attributes");
      }

      // Get NLS values from API response
      const apiNlsValues = groupData.map((item) => item.nls);
      console.log("API NLS Values:", apiNlsValues);

      // Get NLS values from hardcoded system attributes
      const systemNlsValues = systemAttributes.map((item) => item.nls);
      console.log("System NLS Values:", systemNlsValues);

      // Get NLS values from EBOM attributes when operation is 2
      let ebomNlsValues = [];
      if (effectiveOperation === "2") {
        ebomNlsValues = ebomAttributes.map((item) => item.nls);
        console.log("EBOM NLS Values:", ebomNlsValues);
      }

      // Combine all NLS values including EBOM attributes if operation is 2
      const allNLSValues = [
        ...new Set([...apiNlsValues, ...systemNlsValues, ...ebomNlsValues]),
      ];
      console.log("all nls value with Hardcode :", allNLSValues);

      // First filter out System Attributes from API response
      const filteredGroupData = groupData.filter(
        (attr) => attr.groupNLS !== "System Attributes"
      );

      console.log(
        "Filtered out API system attributes:",
        groupData.length - filteredGroupData.length,
        "items removed"
      );

      // Then merge non-system API attributes with hardcoded ones and EBOM attributes
      let mergeAttributes = [...filteredGroupData, ...systemAttributes];
      if (effectiveOperation === "2") {
        mergeAttributes = [...mergeAttributes, ...ebomAttributes];
        console.log(
          "Added EBOM attributes to merged attributes for operation 2",
          mergeAttributes
        );
      }

      // Then continue with your other filtering if needed
      const relevantAttributes =
        mergeAttributes.filter(
          (attr) =>
            attr.deploymentExtension === true ||
            (attr.groupNLS && attr.groupNLS.trim() !== "") ||
            (effectiveOperation === "2" && attr.group === "EBOM Attributes")
        ) || [];

      console.log("Non-system attributes from API:", relevantAttributes.length);

      const mappedData = relevantAttributes.map((attr) => ({
        uiLabel: attr.nls, // UI Display Name
        backendName: attr.name || attr.backendName, // Backend Name (or name)
        group: attr.groupNLS || attr.group || "General", // Default group if not specified
      }));

      // Create a filtered version for dropdown that excludes System Attributes
      const dropdownOptions = mappedData.filter(
        (attr) => attr.group !== "System Attributes"
      );
      console.log("Mapped Attributes (total):", mappedData);
      console.log(
        "Dropdown Options (excluding System Attributes):",
        dropdownOptions
      );

      // Organize attributes by their groups
      const attributesByGroup = {};

      attributeGroups.forEach((group) => {
        attributesByGroup[group] = mappedData.filter(
          (attr) => attr.group === group
        );
      });

      console.log("Mapped Attributes:", mappedData);
      console.log("All available NLS values:", allNLSValues);
      console.log(
        "Mapped Attributes (for dropdown) excluding System Attributes:",
        dropdownOptions
      );
      console.log("Attributes By Group:", attributesByGroup);
      console.log(
        "System Attributes found:",
        relevantAttributes.filter(
          (attr) => attr.groupNLS === "System Attributes"
        ).length
      );
      console.log(
        "Sample System Attribute:",
        relevantAttributes.find((attr) => attr.groupNLS === "System Attributes")
      );

      // For operation 2, log EBOM attributes as well
      if (effectiveOperation === "2") {
        console.log(
          "EBOM Attributes found:",
          relevantAttributes.filter(
            (attr) =>
              attr.groupNLS === "EBOM Attributes" ||
              attr.group === "EBOM Attributes"
          ).length
        );
        console.log(
          "Sample EBOM Attribute:",
          relevantAttributes.find(
            (attr) =>
              attr.groupNLS === "EBOM Attributes" ||
              attr.group === "EBOM Attributes"
          )
        );
      }

      

      setMappedAttributes({
        allNLSValues: allNLSValues,
        dropdownOptions: dropdownOptions, // Use filtered list without System Attributes
        mappedData: mappedData, // Keep full list for other purposes
        attributesByGroup: attributesByGroup,
        groups: attributeGroups,
      });
    } catch (error) {
      console.error("Error fetching column mapping:", error);
      showErrorToast(error.message || "Error fetching column mapping.");
    }
  };

  useEffect(() => {
    if (operationChoice) {
      fetchColumnMapping();
    }
  }, [operationChoice]);

  return { mappedAttributes, refreshMapping: fetchColumnMapping };
};

export default useMassUpload;
