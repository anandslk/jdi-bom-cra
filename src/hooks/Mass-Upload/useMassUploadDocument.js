import { MSG_FETCH_CSRF_HEADERS_FAILED } from "../../utils/toastMessages";
import useToast from "../useToast";
import { fetchCsrfToken } from "../../services/api/PlantAssignment/fetchCsrfService";
import { callEnoviaWebService } from "../../utils/helpers";
import { useEffect, useState } from "react";

const useFetchDocumentData = (initialOperationType) => {
  const { showErrorToast } = useToast();
  const [documentData, setDocumentData] = useState(null);
  const [mappedAttributes, setMappedAttributes] = useState({
    allNLSValues: [],
    dropdownOptions: [],
    mappedData: [],
  });
  const [operationType, setOperationType] = useState(initialOperationType);
  const ENOVIA_BASE_URL = process.env.REACT_APP_ENOVIA_BASE_URL;
  const API_URL = `${ENOVIA_BASE_URL}/resources/v1/collabServices/authoring/createContent/typeInfo?tenant=OI000186152&xrequestedwith=xmlhttprequest`;

  const fetchDocumentData = async (operation = null) => {
    // Use passed operation or fall back to state
    const effectiveOperation = operation || operationType;

    if (effectiveOperation !== "3") {
      console.log("Not document operation type, skipping fetch");
      return;
    }

    // Update state if new operation passed
    if (operation && operation !== operationType) {
      setOperationType(operation);
    }

    try {
      console.log(
        "Fetching document data for operation type:",
        effectiveOperation
      );

      // Get CSRF Headers
      const headers = await fetchCsrfToken();
      if (!headers) {
        console.error("Failed to fetch CSRF headers.");
        showErrorToast(MSG_FETCH_CSRF_HEADERS_FAILED);
        return;
      }

      const body = {
        type: "Document",
        preferedType: "Document",
        typeName: "Document",
        subTypes: true,
        runUXBL: true,
        metrics: {
          UXName: "New",
          client_app_domain: "3DEXPERIENCE 3DDashboard",
          client_app_name: "ENXWDOC_AP",
        },
      };

      // Fetch data from API
      const response = await callEnoviaWebService(
        "POST",
        API_URL,
        body,
        headers
      );
      console.log("API Response for Document template:", response);

      // Validate response structure
      if (response.status !== true) {
        console.error("Invalid API response structure:", response);
        showErrorToast(
          "Failed to fetch document data. Invalid response structure."
        );
        return;
      }

      // Extract relevant data
      const documentInfo = response.output.result[0];
      console.log(
        "Full documentInfo structure:",
        JSON.stringify(documentInfo, null, 2)
      );

      // Check different possible paths for extensionAttributes
      const extensionAttributes =
        documentInfo?.extensionAttributes ||
        documentInfo?.attributes?.extensionAttributes ||
        [];

      console.log("Found extensionAttributes:", extensionAttributes);

      // Your hardcoded document attributes
      const DocumentsAttributes = [
        {
          name: "description",
          nls: "Description",
          groupNLS: "DocumentsAttributes",
        },
        {
          name: "name",
          nls: "Document Name",
          groupNLS: "DocumentsAttributes",
        },
        {
          name: "type",
          nls: "Document Type",
          groupNLS: "DocumentsAttributes",
        },
        {
          name: "title",
          nls: "Title",
          groupNLS: "DocumentsAttributes",
        },
        {
          name: "collabspaceTitle",
          nls: "Collaborative Space",
          groupNLS: "DocumentsAttributes",
        },
      ];

      // Extract dropdown options only if extensionAttributes exists
      if (extensionAttributes && extensionAttributes.length > 0) {
        // Extract all NLS values from API
        const apiNlsValues = extensionAttributes.map((attr) => attr.nls);
        console.log("API NLS Values:", apiNlsValues);

        // Extract NLS values from hardcoded attributes
        const hardcodedNlsValues = DocumentsAttributes.map((attr) => attr.nls);
        // console.log("Hardcoded NLS Values:", hardcodedNlsValues);

        // Combine both NLS value sets (using Set to remove duplicates)
        const allNLSValues = [
          ...new Set([...apiNlsValues, ...hardcodedNlsValues]),
        ];
        console.log(
          "Document Operation - All Combined NLS Values:",
          allNLSValues
        );

        // Process API attributes (with name splitting)
        const apiOptions = extensionAttributes.map((attr) => {
          // Extract the attribute name after the dot
          const fullName = attr.name;
          const nameParts = fullName.split(".");
          const extractedName = nameParts.length > 1 ? nameParts[1] : fullName;

          return {
            uiLabel: attr.nls,
            backendName: extractedName,
            fullName: attr.name,
            group: "API Attributes",
          };
        });

        // Process hardcoded attributes
        const hardcodedOptions = DocumentsAttributes.map((attr) => {
          return {
            uiLabel: attr.nls,
            backendName: attr.name,
            group: attr.groupNLS,
          };
        });

        // Combine both for mappedData
        const combinedMappedData = [...apiOptions, ...hardcodedOptions];

        // console.log("Document Operation - API Dropdown Options:", apiOptions);
        console.log(
          "Document Operation - Combined Mapped Data:",
          combinedMappedData
        );

        // Update state with specific configurations for each property
        setMappedAttributes({
          allNLSValues: allNLSValues, // Combined NLS values for matching
          dropdownOptions: apiOptions, // Only API options for dropdown
          mappedData: combinedMappedData, // Both API and hardcoded for payload
        });
      } else {
        // If no API attributes, use hardcoded ones for everything
        const hardcodedNlsValues = DocumentsAttributes.map((attr) => attr.nls);

        // Create hardcoded options for mappedData when no API data exists
        const hardcodedOptions = DocumentsAttributes.map((attr) => {
          return {
            uiLabel: attr.nls,
            backendName: attr.name,
            group: attr.groupNLS,
          };
        });

        setMappedAttributes({
          allNLSValues: hardcodedNlsValues, // Use hardcoded NLS for matching
          dropdownOptions: [], // Empty dropdown options as requested
          mappedData: hardcodedOptions, // Use hardcoded options for payload
        });
      }

      // Set the document data in state
      setDocumentData(documentInfo);
    } catch (error) {
      console.error("Error fetching document data:", error);
      showErrorToast(error.message || "Error fetching document data.");
    }
  };

  useEffect(() => {
    if (operationType === "3") {
      fetchDocumentData();
    }
  }, [operationType]);

  // Return structure matching useMassUpload
  return {
    mappedAttributes,
    refreshMapping: fetchDocumentData,
  };
};

export default useFetchDocumentData;
