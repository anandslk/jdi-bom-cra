import React, { useState, useEffect, useRef } from "react";
import "./massupload.css";
import { Form, Stack } from "react-bootstrap";
import CustomButton from "../../components/Button/Button";
import FileUpload from "../../components/FileUploader/FileUploader";
import { downloadTemplate } from "../../utils/downloadTemplate";
import useToast from "../../hooks/useToast";
import Loader from "../../components/Loader/Loader";
import validateFile from "./validateFile";
import CustomSelect from "../../components/Select/customSelect";
import {
  globalCollabSpaceTitles,
  // globalCollabSpaceNames,
} from "../../services/api/droppableService";
import ContentErrorsModal from "../../components/Modals/ContentErrorsModal";
import ConfirmationModal from "../../components/Modals/ConfirmationModal";
import ColumnMappingModal from "../../components/Modals/ColumnMappingModal";
import api from "../../utils/api";
import useMassUpload from "../../hooks/Mass-Upload/useMassUpload";
import useFetchDocumentData from "../../hooks/Mass-Upload/useMassUploadDocument";
import getUserDetails from "../../utils/getUserDetails";
// import ReusableTable from "../../components/Table/Table";
import SuccessModal from "../../components/Modals/SuccessModal";
import {
  MSG_TEMPLATE_OPERATION_MISMATCH,
  MSG_NO_DATA_TO_SUBMIT,
  MSG_INVALID_OPERATION_TYPE,
  MSG_UPLOAD_FAILED_CONTACT_ADMIN,
  MSG_NO_SHEET_DATA,
  MSG_UPLOAD_FAILED,
  MSG_FILE_VALIDATED_SUCCESS,
  MSG_WIDGET_RESET_SUCCESS,
  MSG_UPLOAD_SUCCESS,
  MSG_OPERATION_CHNAGED,
} from "../../utils/toastMessages";

const API_ENDPOINTS = {
  1: "/massUpload/uploadItems",
  2: "/massUpload/uploadItemStructure",
  3: "/massUpload/documents",
  4: "/massUpload/uploadProductDocument",
};

const transformSheetDataWithMappings = (
  sheetData,
  columnMappings,
  operationType,
  mappedAttributesData,
  collabMapping // Add this parameter
) => {
  const excludedColumns = ["Physical Product/Raw Material"];

  if (sheetData.length > 0) {
    console.log(
      "Actual column names in sheet data:",
      Object.keys(sheetData[0])
    );
    console.log("Sample row values:", sheetData[0]);
    console.log("Column mappings applied:", columnMappings);
  }

  if (!sheetData || !columnMappings) {
    console.error("Missing data or mappings for transformation");
    return null;
  }

  console.log("Transforming sheet data with mappings:", columnMappings);
  const mappedData = mappedAttributesData?.mappedData || [];

  console.log("Mapped data in Massupload:", mappedData);

  // For Document operation type (3), use different processing logic
  if (operationType === "3") {
    console.log("Processing document data with operation type 3");

    // Transform each row into document format
    // Transform each row into document format
    const documentItems = sheetData.map((row) => {
      // Create separate objects for root-level data and nested dataelements
      const rootData = {};
      const dataelements = {};
      const apiAttributes = {}; // For storing API attributes

      Object.entries(row).forEach(([columnName, value]) => {
        if (excludedColumns.includes(columnName)) {
          // console.log(`Skipping excluded column "${columnName}" in payload`);
          return;
        }
        if (
          !columnMappings[columnName] ||
          value === undefined ||
          value === null
        )
          return;

        const backendFieldName = columnMappings[columnName];

        // Find attribute in mappedData to check if it's an API attribute
        const attribute = mappedData.find(
          (attr) =>
            attr.uiLabel === backendFieldName ||
            attr.backendName === backendFieldName
        );

        console.log(
          `Processing column ${columnName} -> ${backendFieldName}`,
          attribute
        );

        // Special case handling for known fields
        if (backendFieldName === "Document Type") {
          rootData["classificationType"] = value;
        } else if (backendFieldName === "Collaborative Space") {
          const collabspaceTitle = value;
          rootData["collabSpaceTitle"] = collabspaceTitle;

          // Use the mapping to get the corresponding name
          if (collabMapping[collabspaceTitle]) {
            rootData["collabSpace"] = collabMapping[collabspaceTitle];
            console.log(
              `Mapped collabspace title "${collabspaceTitle}" to name "${collabMapping[collabspaceTitle]}"`
            );
          } else {
            console.warn(
              `No mapping found for collabspace title: ${collabspaceTitle}`
            );
          }
        } else if (
          backendFieldName.toLowerCase().includes("collaborative") ||
          backendFieldName.toLowerCase().includes("collab")
        ) {
          // Try to catch variations of Collaborative Space
          const collabspaceTitle = value;
          rootData["collabSpaceTitle"] = collabspaceTitle;

          // Use the mapping to get the corresponding name
          if (collabMapping[collabspaceTitle]) {
            rootData["collabSpace"] = collabMapping[collabspaceTitle];
            console.log(
              `Mapped collabspace title "${collabspaceTitle}" to name "${collabMapping[collabspaceTitle]}"`
            );
          } else {
            console.warn(
              `No mapping found for collabspace title: ${collabspaceTitle}`
            );
          }
        } else if (backendFieldName === "Document Name") {
          dataelements["name"] = value;
        }
        // For API attributes with group "API Attributes", include them with their fullName
        else if (
          attribute &&
          attribute.group === "API Attributes" &&
          attribute.fullName
        ) {
          // Store API attributes using their full name
          dataelements[attribute.backendName] = value;

          // console.log(
          //   `Added API attribute: ${attribute.backendName} = ${value}`
          // );
        }
        // For regular mapped fields that aren't API attributes
        else if (attribute || backendFieldName) {
          // Only include mapped fields (either through attribute lookup or direct mapping)
          dataelements[backendFieldName] = value;
        }
        // Fields without mappings or API attribute status are excluded
      });

      // Combine root data, dataelements, and API attributes
      return {
        ...rootData,
        dataelements,
        // ...apiAttributes, // Include API attributes at root level
      };
    });

    // Log sample document for verification
    if (documentItems.length > 0) {
      console.log(
        "Sample document structure:",
        JSON.stringify(documentItems[0], null, 2)
      );
    }

    // Create chunks for batched processing
    const CHUNK_SIZE = 1000;
    const chunks = [];

    for (let i = 0; i < documentItems.length; i += CHUNK_SIZE) {
      chunks.push(documentItems.slice(i, i + CHUNK_SIZE));
    }

    return {
      chunks,
      totalChunks: chunks.length,
      totalItems: documentItems.length,
      originalData: sheetData,
      mappings: columnMappings,
      // Special field to indicate this is document data
      isDocumentPayload: true,
      documents: documentItems,
    };
  } else {
    // KEEP EXISTING CODE FOR PHYSICAL PRODUCTS (operations 1, 2, 4)
    console.log(
      "Processing physical product data with operation type:",
      operationType
    );

    const attributeGroupMap = {};
    if (Array.isArray(mappedData)) {
      mappedData.forEach((option) => {
        attributeGroupMap[option.backendName] = option.group || "System";
        if (option.fullName) {
          attributeGroupMap[`fullName:${option.backendName}`] = option.fullName;
        }
        console.log(
          `Mapping ${option.backendName} to group ${option.group || "System"}`
        );
      });
    }

    // Modify getPathForAttribute to handle EBOM Attributes for operation type 2
    const getPathForAttribute = (backendName, columnName) => {
      // Special handling for collabSpace in operation 2 - ADD THIS FIRST
      if (operationType === "2" && backendName === "collabSpace") {
        console.log("Operation 2: collabSpace explicitly placed at root level");
        return "collabSpace"; // Keep at root level
      }

      // Special case for level - always place at root level for operation type 2
      if (operationType === "2" && backendName === "Level") {
        console.log(
          "'Level' identified as EBOM Attribute but placing at root level"
        );
        return "Level";
      }

      // Check for other EBOM Attributes for operation type 2
      if (
        operationType === "2" &&
        attributeGroupMap[backendName] === "EBOM Attributes" &&
        backendName !== "Level" // Make sure level doesn't go into instanceAttributes
      ) {
        console.log(
          `${backendName} identified as EBOM Attribute, placing in instanceAttributes`
        );
        return `instanceAttributes.${backendName}`;
      }

      // Rest of existing code remains the same...
      if (operationType === "1" && backendName === "title") {
        console.log("Operation type 1: title placed inside attributes");
        return "attributes.title";
      }

      if (
        backendName === "type" ||
        backendName === "classificationType" ||
        backendName === "collabSpaceTitle"
      ) {
        if (backendName === "collabSpaceTitle") {
          console.log("collabSpaceTitle mapped to root collabspace");
          return "collabSpaceTitle";
        }

        console.log(`${backendName} placed at root level`);
        return backendName;
      }

      // For the physical product operation (in getPathForAttribute)
      if (backendName === "collabSpaceTitle") {
        console.log("collabSpaceTitle mapped to root collabspace");
        return "collabSpaceTitle";
      }

      // Add a special case for collabspaceName if we need it in the payload
      if (backendName === "collabspaceName") {
        console.log("collabspaceName mapped to root");
        return "collabSpace";
      }

      if (
        columnName === "EIN Number" ||
        backendName === "PartNumber" ||
        backendName === "Part Number"
      ) {
        console.log(
          "EIN Number mapped to attributes.dseng:EnterpriseReference.partNumber"
        );
        return "attributes.dseng:EnterpriseReference.partNumber";
      }

      if (backendName === "description") {
        console.log("Description mapped to attributes.description");
        return "attributes.description";
      }

      const group = attributeGroupMap[backendName];
      console.log(`Attribute: ${backendName}, Group: ${group || "unknown"}`);

      if (!group) {
        console.log(`Skipping attribute with unknown group: ${backendName}`);
        return null;
      }

      if (group === "System Attributes") {
        return `attributes.${backendName}`;
      } else {
        return `attributes.dseno:EnterpriseAttributes.${backendName}`;
      }
    };

    const transformedItems = sheetData.map((row) => {
      const transformedRow = {};

      // Add instanceAttributes object for operation 2
      if (operationType === "2") {
        transformedRow.instanceAttributes = {};
      }

      // The rest of your existing transformation code...
      Object.entries(row).forEach(([columnName, value]) => {
        if (excludedColumns.includes(columnName)) {
          // console.log(`Skipping excluded column "${columnName}" in payload`);
          return;
        }
        if (!columnMappings[columnName]) return;

        const uiLabelBackendName = columnMappings[columnName];

        const systemAttributeMappings = {
          Title: "title",
          Description: "description",
          "Collaborative Space": "collabSpaceTitle",
          "Collab Space": "collabSpaceTitle",
          Type: "type",
        };

        const backendName =
          systemAttributeMappings[uiLabelBackendName] ||
          mappedData.find((attr) => attr.uiLabel === uiLabelBackendName)
            ?.backendName ||
          uiLabelBackendName;

        // **MOVE THIS CODE BLOCK UP HERE**
        // Handle collabspace title and name mapping immediately
        if (
          (operationType === "1" || operationType === "2") &&
          backendName === "collabSpaceTitle"
        ) {
          // Set the title as usual
          transformedRow["collabSpaceTitle"] = value;

          // Also set the collabspace name using the mapping
          if (collabMapping && collabMapping[value]) {
            transformedRow["collabSpace"] = collabMapping[value];
            console.log(
              `Mapped collabspace title "${value}" to name "${collabMapping[value]}"`
            );
          } else {
            console.warn(`No mapping found for collabspace title: ${value}`);
          }
          // Continue to the next attribute
          return;
        }

        const path = getPathForAttribute(backendName, columnName);

        if (
          backendName === "title" ||
          backendName === "description" ||
          backendName.toLowerCase() === "collabspace"
        ) {
          console.log(`Placing ${backendName} at path: ${path}`);
        }

        if (!path) return;

        const pathParts = path.split(".");
        let current = transformedRow;

        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }

        current[pathParts[pathParts.length - 1]] = value;

        // Special handling for collabspace in operation 2
      });

      if (operationType === "1") {
        const productTypeColumn = Object.keys(row).find(
          (key) =>
            key.toLowerCase().includes("physical product") ||
            key.toLowerCase().includes("raw material")
        );

        if (productTypeColumn && row[productTypeColumn]) {
          const productType = row[productTypeColumn].toLowerCase().trim();
          transformedRow["type"] = productType.includes("physical product")
            ? "VPMReference"
            : productType.includes("raw material")
            ? "Raw_Material"
            : "";

          console.log(
            `Product type determined: ${transformedRow["type"]} from value: ${row[productTypeColumn]}`
          );
        }
      }

      // Special handling for operation 2 default values
      if (operationType === "2") {
        // Set default type for Product Structure if not specified
        const productTypeColumn = Object.keys(row).find(
          (key) =>
            key.toLowerCase().includes("physical product") ||
            key.toLowerCase().includes("raw material")
        );

        if (productTypeColumn && row[productTypeColumn]) {
          const productType = row[productTypeColumn].toLowerCase().trim();
          transformedRow["type"] = productType.includes("physical product")
            ? "VPMReference"
            : productType.includes("raw material")
            ? "Raw_Material"
            : "";

          console.log(
            `Product type determined: ${transformedRow["type"]} from value: ${row[productTypeColumn]}`
          );
        }

        // Make sure instanceAttributes exists even if no EBOM attributes were found
        if (!transformedRow.instanceAttributes) {
          transformedRow.instanceAttributes = {};
        }
      }

      return transformedRow;
    });

    if (transformedItems.length > 0) {
      console.log(
        "Sample transformed item structure:",
        JSON.stringify(transformedItems[0], null, 2)
      );
    }

    const CHUNK_SIZE = 1000;
    const chunks = [];

    for (let i = 0; i < transformedItems.length; i += CHUNK_SIZE) {
      chunks.push(transformedItems.slice(i, i + CHUNK_SIZE));
    }

    return {
      chunks,
      totalChunks: chunks.length,
      totalItems: transformedItems.length,
      originalData: sheetData,
      mappings: columnMappings,
      isDocumentPayload: false,
    };
  }
};

const generateColumnMappings = (
  columnHeaders,
  mandatoryAttributes,
  mappedAttributes
) => {
  const { allNLSValues = [], dropdownOptions = [] } = mappedAttributes || {};
  const completeMappings = {};
  const simplifiedMappings = {};

  const excludedColumns = ["Physical Product/Raw Material"];

  const hasMatchingNLS = (header) => {
    if (!Array.isArray(allNLSValues)) return false;
    const normalizedHeader = header.toLowerCase().trim();
    return allNLSValues.some(
      (nls) => nls.toLowerCase().trim() === normalizedHeader
    );
  };

  const systemAttributeMappings = {
    Title: "title",
    Description: "description",
    "Collaborative Space": "collabSpaceTitle",
    "Collab Space": "collabSpaceTitle",
    Type: "classificationType",
    "EIN Number": "Part Number",
  };

  const getBackendNameForHeader = (header) => {
    if (systemAttributeMappings[header]) {
      return systemAttributeMappings[header];
    }

    const normalizedHeader = header.toLowerCase().trim();

    const systemAttrKey = Object.keys(systemAttributeMappings).find(
      (key) => key.toLowerCase() === normalizedHeader
    );

    if (systemAttrKey) {
      return systemAttributeMappings[systemAttrKey];
    }

    const matchingOption = dropdownOptions.find(
      (opt) => opt.uiLabel.toLowerCase().trim() === normalizedHeader
    );
    return matchingOption ? matchingOption.backendName : header;
  };

  const specialMappings = {
    "EIN Number": "PartNumber",
  };

  columnHeaders.forEach((columnName) => {
    // Skip excluded columns
    if (excludedColumns.includes(columnName)) {
      console.log(`Column "${columnName}" is excluded from mapping`);
      return;
    }
    const hasNLS = hasMatchingNLS(columnName);
    const isSpecialColumn = specialMappings[columnName];
    const isMandatory = mandatoryAttributes.includes(columnName);

    if (isSpecialColumn) {
      const mappedAttribute = specialMappings[columnName];

      completeMappings[columnName] = {
        columnName: columnName,
        uiLabel: columnName,
        mappedAttribute: mappedAttribute,
        isMandatory: isMandatory || false,
        autoMapped: true,
        isSpecial: true,
      };

      simplifiedMappings[columnName] = mappedAttribute;
    } else if (hasNLS || isMandatory) {
      const mappedAttribute = getBackendNameForHeader(columnName);

      completeMappings[columnName] = {
        columnName: columnName,
        uiLabel: columnName,
        mappedAttribute: mappedAttribute,
        isMandatory: isMandatory,
        autoMapped: true,
      };

      simplifiedMappings[columnName] = mappedAttribute;
    }
  });

  return {
    completeMappings,
    simplifiedMappings,
    totalColumns: Object.keys(completeMappings).length,
  };
};

// Add this function near the top of your file, outside the MassUpload component

const MassUpload = () => {
  const [collabTitles, setCollabTitles] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [errorModalShow, setErrorModalShow] = useState(false);
  const [showContentErrors, setShowContentErrors] = useState(false);
  const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);
  const { showErrorToast, showSuccessToast, showInfoToast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [operationChoice, setOperationChoice] = useState("");
  const [errors, setErrors] = useState([]);
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [mandatoryAttributes, setMandatoryAttributes] = useState([]);
  const fileUploaderRef = useRef();
  const [formattedData, setFormattedData] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [securityContext, setSecurityContext] = useState(null); // New state for security context
  const [collabNames, setCollabNames] = useState([]); // Add new state for names
  const [collabMapping, setCollabMapping] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    mappedAttributes: productMappedAttributes,
    refreshMapping: refreshProductMapping,
  } = useMassUpload();
  const {
    mappedAttributes: documentMappedAttributes,
    refreshMapping: refreshDocumentMapping,
  } = useFetchDocumentData(operationChoice);

  const getActiveData = () => {
    console.log("Getting active data for operation:", operationChoice);

    switch (operationChoice) {
      case "1":
        return {
          mappedAttributes: productMappedAttributes,
          refreshMapping: refreshProductMapping,
        };
      case "2":
        return {
          mappedAttributes: productMappedAttributes,
          refreshMapping: refreshProductMapping,
        };
      case "3":
        return {
          mappedAttributes: documentMappedAttributes,
          refreshMapping: refreshDocumentMapping,
        };
      case "4":
        return {
          mappedAttributes: productMappedAttributes,
          refreshMapping: refreshProductMapping,
        };
      default:
        return {
          mappedAttributes: productMappedAttributes,
          refreshMapping: refreshProductMapping,
        };
    }
  };

  const { mappedAttributes, refreshMapping } = getActiveData();

  console.log("Active operation:", operationChoice);
  console.log("Active mappedAttributes:", mappedAttributes);

  const handleRefreshForCurrentOperation = async (operation) => {
    try {
      console.log("Refreshing data for operation:", operation);
      const { refreshMapping } = getActiveData();
      await refreshMapping(operation);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // const handleOperationChange = (value) => {
  //   console.log("Operation selected:", value);
  //   setOperationChoice(value);
  //   handleRefreshForCurrentOperation(value);
  // };

  const handleOperationChange = (value) => {
    console.log("Operation selected:", value);

    // If we already had a previous operation selected and files uploaded
    if (operationChoice && formattedData) {
      console.log("Operation changed - resetting uploaded file");

      // Reset file-related states
      setErrors([]);
      setColumnHeaders([]);
      setMandatoryAttributes([]);
      setFormattedData(null);

      // Clear the file uploader
      if (fileUploaderRef.current) {
        fileUploaderRef.current.handleClearFiles(true); // Pass true to skip success toast
      }

      // Optional: Show toast informing the user
      showInfoToast(MSG_OPERATION_CHNAGED);
    }

    // Update operation choice and refresh mapping
    setOperationChoice(value);
    handleRefreshForCurrentOperation(value);
  };

  // Update the existing useEffect to handle collabspace names

  // Update the existing useEffect to create the title-to-name mapping
  // useEffect(() => {
  //   console.log(
  //     "[MassUpload.jsx] Global collabSpaceTitles:",
  //     globalCollabSpaceTitles
  //   );
  //   console.log(
  //     "[MassUpload.jsx] Global collabSpaceNames:",
  //     globalCollabSpaceNames
  //   );

  //   // Set titles and names arrays
  //   if (Array.isArray(globalCollabSpaceTitles)) {
  //     setCollabTitles([...globalCollabSpaceTitles]);
  //   } else {
  //     console.error(
  //       "[MassUpload.jsx] globalCollabSpaceTitles is not an array!",
  //       globalCollabSpaceTitles
  //     );
  //   }

  //   if (Array.isArray(globalCollabSpaceNames)) {
  //     setCollabNames([...globalCollabSpaceNames]);
  //   } else {
  //     console.error(
  //       "[MassUpload.jsx]  globalCollabSpaceNames is not an array!",
  //       globalCollabSpaceNames
  //     );
  //   }

  //   // Create a mapping object from titles to names
  //   if (
  //     Array.isArray(globalCollabSpaceTitles) &&
  //     Array.isArray(globalCollabSpaceNames) &&
  //     globalCollabSpaceTitles.length === globalCollabSpaceNames.length
  //   ) {
  //     const mapping = {};
  //     for (let i = 0; i < globalCollabSpaceTitles.length; i++) {
  //       mapping[globalCollabSpaceTitles[i]] = globalCollabSpaceNames[i];
  //     }

  //     setCollabMapping(mapping);
  //     console.log(
  //       "[MassUpload.jsx] Collabspace title-to-name mapping:",
  //       mapping
  //     );
  //   }

  //   console.log("[MassUpload.jsx] Retrieved collabSpaceTitles:", collabTitles);
  //   console.log("[MassUpload.jsx] Retrieved collabSpaceNames:", collabNames);
  // }, []);

  // Add this after the existing console.log
  // console.log("getUserDetails function", getUserDetails);

  // Add this code to actually call the function and show its response
  useEffect(() => {
    async function fetchUserDetails() {
      try {
        console.log("Calling getUserDetails...");
        const userData = await getUserDetails();
        console.log(" User Details Response:", userData);
        // Add this line to store the user data
        setUserDetails(userData);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }

    fetchUserDetails();
  }, []);
  // console.log("widget window", window.widget);
  // Add an effect to get and set the security context
  useEffect(() => {
    try {
      // Get security context from widget
      if (window.widget && typeof window.widget.getValue === "function") {
        const securityContextValue = window.widget.getValue("Credentials");
        console.log("Security Context:", securityContextValue);
        setSecurityContext(securityContextValue);
      } else {
        console.warn("window.widget or getValue function not available");
      }
    } catch (error) {
      console.error("Error getting security context:", error);
    }
  }, []);

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;

    try {
      setIsValidating(true);
      console.log("Starting file validation...");
      console.log("Selected Operation:", operationChoice);
      console.log("File:", files[0].name);

      const validationResult = await validateFile(
        files[0],
        collabTitles,
        operationChoice
      );

      const {
        headers = [],
        validationErrors = [],
        mandatoryAttributes = [],
        sheetData = [],
      } = validationResult;

      setColumnHeaders(headers);
      setMandatoryAttributes(mandatoryAttributes);

      if (sheetData.length > 0) {
        console.log("Sheet Data ", sheetData);
        setFormattedData({ originalData: sheetData });

        await handleRefreshForCurrentOperation(operationChoice);

        setTimeout(() => {
          console.log(
            "Applying automatic column mapping with:",
            mappedAttributes
          );
          if (mappedAttributes && Object.keys(mappedAttributes).length > 0) {
            const { simplifiedMappings } = generateColumnMappings(
              headers,
              mandatoryAttributes,
              mappedAttributes
            );

            console.log("Auto-generated mappings:", simplifiedMappings);

            if (Object.keys(simplifiedMappings).length > 0) {
              const transformedData = transformSheetDataWithMappings(
                sheetData,
                simplifiedMappings,
                operationChoice,
                mappedAttributes,
                collabMapping // Add this parameter
              );

              setFormattedData(transformedData);
              showSuccessToast(
                `Data automatically mapped with ${
                  Object.keys(simplifiedMappings).length
                } columns`
              );
            }
          }
        }, 500);
      }

      if (validationErrors.length === 0) {
        setErrors([]);
        showSuccessToast(MSG_FILE_VALIDATED_SUCCESS);
      } else {
        setErrors(validationErrors);
        setErrorModalShow(true);
      }
    } catch (errorResponse) {
      console.error("Validation failed:", errorResponse);

      const {
        errors: responseErrors = ["Unknown validation error."],
        headers: responseHeaders = [],
        mandatoryAttributes: responseMandatoryAttributes = [],
        isTemplateMismatch = false,
      } = errorResponse;

      if (isTemplateMismatch) {
        showErrorToast(MSG_TEMPLATE_OPERATION_MISMATCH);
        handleReset(true);
        if (fileUploaderRef.current) {
          fileUploaderRef.current.handleClearFiles();
        }
        return;
      }

      setErrors(responseErrors);
      setColumnHeaders(responseHeaders);
      setMandatoryAttributes(responseMandatoryAttributes);
      setErrorModalShow(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(showErrorToast)(operationChoice);
  };

  const handleReset = (skipSuccessToast = false) => {
    setModalShow(false);
    setErrorModalShow(false);
    setShowContentErrors(false);
    setShowSpreadsheetModal(false);
    setIsValidating(false);
    setOperationChoice("");
    setErrors([]);
    setColumnHeaders([]);
    setMandatoryAttributes([]);
    setFormattedData(null);

    const selectElement = document.querySelector(
      'select[aria-label="Choose Operations"]'
    );
    if (selectElement) {
      selectElement.value = "";
    }

    if (!skipSuccessToast) {
      showSuccessToast(MSG_WIDGET_RESET_SUCCESS);
    }
  };

  const handleOpenSpreadsheetModal = () => {
    setShowContentErrors(false);
    setShowSpreadsheetModal(true);
  };

  const submitDisabled = columnHeaders.length === 0 || errors.length > 0;
  const manageSpreadsheetDisabled =
    columnHeaders.length === 0 || errors.length > 0;

  const handleConfirmSubmit = async () => {
    try {
      // Close the confirmation modal immediately
      setModalShow(false);
      setIsSubmitting(true);

      if (!formattedData) {
        showErrorToast(MSG_NO_DATA_TO_SUBMIT);
        setIsSubmitting(false);
        return;
      }

      const endpoint = API_ENDPOINTS[operationChoice];
      if (!endpoint) {
        showErrorToast(MSG_INVALID_OPERATION_TYPE);
        setIsSubmitting(false);
        return;
      }

      const { chunks, totalChunks, isDocumentPayload, documents } =
        formattedData;
      let successCount = 0;
      let failureCount = 0;
      let allResponses = [];
      let hasErrors = false;

      // For document payload (operation 3)
      if (operationChoice === "3" && isDocumentPayload) {
        try {
          // Create document-specific chunks if needed
          const docChunks = [];
          for (let i = 0; i < documents.length; i += 1000) {
            docChunks.push(documents.slice(i, i + 1000));
          }

          console.log(`Processing ${docChunks.length} document chunks`);

          // Add user info if available (similar to other operations)
          const userInfo = {
            ...(userDetails?.email ? { email: userDetails.email } : {}),
            ...(userDetails?.login ? { userId: userDetails.login } : {}),
            ...(securityContext ? { securityContext: securityContext } : {}),
          };

          for (let i = 0; i < docChunks.length; i++) {
            console.log(
              `Sending document chunk ${i + 1} of ${docChunks.length}`
            );

            const response = await api.post(endpoint, {
              ...userInfo,
              documents: docChunks[i],
            });

            console.log(`Document chunk ${i + 1} response:`, response);

            if (response.data) {
              if (response.data.success === true) {
                successCount++;
                if (Array.isArray(response.data.responses)) {
                  allResponses = [...allResponses, ...response.data.responses];
                }
              } else {
                hasErrors = true;
                failureCount++;
                console.error(
                  `Document API returned success: false`,
                  response.data
                );
              }
            }

            if (i % 5 === 0 || i === docChunks.length - 1) {
              showSuccessToast(
                `Processed ${i + 1} of ${docChunks.length} document chunks...`
              );
            }
          }
        } catch (error) {
          hasErrors = true;
          failureCount++;
          console.error("Document upload failed:", error);
        }
      } else {
        // For operations 1, 2, and 4
        // Create appropriate user info object based on operation type
        const userInfo = {
          // Include user information for operations 1 and 2
          ...(["1", "2"].includes(operationChoice) && userDetails?.email
            ? { email: userDetails.email }
            : {}),
          ...(["1", "2"].includes(operationChoice) && userDetails?.login
            ? { userId: userDetails.login }
            : {}),
          ...(["1", "2"].includes(operationChoice) && securityContext
            ? { securityContext: securityContext }
            : {}),
          // Add emailNotification flag only for operation 1
          ...(["1", "2"].includes(operationChoice)
            ? { emailNotification: false }
            : {}),
        };

        for (let i = 0; i < chunks.length; i++) {
          try {
            const chunk = chunks[i];

            // For operation 2, validate that instanceAttributes exist in each item
            if (operationChoice === "2") {
              chunk.forEach((item, idx) => {
                if (!item.instanceAttributes) {
                  item.instanceAttributes = {};
                }
              });
            }

            const response = await api.post(endpoint, {
              ...userInfo,
              items: chunk,
            });

            console.log(`Chunk ${i + 1} response:`, response);

            // Process response data
            if (response.data) {
              if (response.data.success === true) {
                successCount++;
                if (Array.isArray(response.data.responses)) {
                  allResponses = [...allResponses, ...response.data.responses];
                }
              } else {
                hasErrors = true;
                failureCount++;
                console.error(
                  `Operation ${operationChoice} API returned success: false`,
                  response.data
                );
              }
            } else {
              hasErrors = true;
              failureCount++;
              console.error("Empty response data received");
            }
          } catch (error) {
            hasErrors = true;
            failureCount++;
            console.error(
              `Chunk ${i + 1} failed for operation ${operationChoice}:`,
              error
            );
          }
        }
      }

      // Show results
      setApiResponse(allResponses);
      console.log(
        `Operation ${operationChoice} completed. All responses:`,
        allResponses
      );

      if (!hasErrors && allResponses.length > 0) {
        showSuccessToast(MSG_UPLOAD_SUCCESS);
        setShowSuccessModal(true);
      } else {
        showErrorToast(MSG_UPLOAD_FAILED_CONTACT_ADMIN);
        setShowSuccessModal(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      showErrorToast(`${MSG_UPLOAD_FAILED}${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // console.log("Errors in Massupload.jsx:", errors);

  const isFileUploadDisabled = !operationChoice;

  return (
    <>
      <div
        className="container-fluid d-flex justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="w-100"
          style={{
            maxWidth: "1200px",
            maxHeight: "500px",
            minHeight: "300px",
            minWidth: "300px",
          }}
        >
          <Stack className="mt-3" gap={4}>
            <Stack direction="horizontal">
              <CustomSelect
                selectedValue={operationChoice}
                onChange={handleOperationChange}
                size="lg"
                className="w-50"
                options={{
                  defaultLabel: "Choose Operations",
                  list: [
                    { value: "1", label: "Physical Product/Raw Material" },
                    { value: "2", label: "Physical Product Structure" },
                    { value: "3", label: "Document" },
                    { value: "4", label: "Physical Product-Document" },
                  ],
                }}
              />
              <div className="ms-auto">
                <CustomButton
                  variant="link"
                  size="lg"
                  onClick={handleDownloadTemplate}
                  text="Download Template"
                />
              </div>
            </Stack>

            <div className={isFileUploadDisabled ? "opacity-50" : ""}>
              <FileUpload
                ref={fileUploaderRef}
                fileTypes={["XLSX"]}
                multiple={false}
                onUpload={handleFileUpload}
                onReset={handleReset}
                disabled={isFileUploadDisabled}
                message={
                  isFileUploadDisabled
                    ? "Please select an operation first"
                    : "Drag & Drop your files here or Click to browse"
                }
              />
            </div>

            {isValidating && <Loader />}

            {/* Add this where you want the loader to appear */}
            {isSubmitting && <Loader />}

            <Stack direction="horizontal" gap={2}>
              {/* <Form.Check
            type="checkbox"
            label="Background"
            className="size-increase"
          /> */}
              <div className="ms-auto d-flex gap-5">
                {errors.length > 0 && (
                  <CustomButton
                    variant="danger"
                    onClick={() => setShowContentErrors(true)}
                    text={`Content Errors (${errors.length})`}
                  />
                )}

                <CustomButton
                  variant={manageSpreadsheetDisabled ? "secondary" : "info"}
                  onClick={handleOpenSpreadsheetModal}
                  text="Manage Spreadsheet Columns"
                  disabled={manageSpreadsheetDisabled}
                />

                <CustomButton
                  variant={submitDisabled ? "secondary" : "primary"}
                  disabled={submitDisabled}
                  size="lg"
                  onClick={() => setModalShow(true)}
                  text="Submit"
                />
              </div>
            </Stack>
          </Stack>
        </div>
      </div>

      <ContentErrorsModal
        show={showContentErrors}
        onHide={() => setShowContentErrors(false)}
        errors={errors}
      />

      <ConfirmationModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        onConfirm={handleConfirmSubmit}
      />

      <ColumnMappingModal
        show={showSpreadsheetModal}
        onHide={() => setShowSpreadsheetModal(false)}
        columnHeaders={columnHeaders}
        mandatoryAttributes={mandatoryAttributes}
        existingMappings={formattedData?.mappings ? formattedData.mappings : {}}
        dropdownOptions={mappedAttributes?.dropdownOptions}
        allNLSValues={mappedAttributes?.allNLSValues}
        operationChoice={operationChoice}
        onColumnsMapped={(mappings, finalMapping) => {
          console.log("Column mappings received:", mappings);

          const columnMappings = mappings;

          if (formattedData && formattedData.originalData) {
            const transformedData = transformSheetDataWithMappings(
              formattedData.originalData,
              columnMappings,
              operationChoice,
              mappedAttributes,
              collabMapping
            );

            setFormattedData(transformedData);
            showSuccessToast(
              `Data mapped successfully with ${
                Object.keys(mappings).length
              } columns`
            );
          } else {
            showErrorToast(MSG_NO_SHEET_DATA);
          }
        }}
      />

      <SuccessModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        responseData={apiResponse || []}
      />
    </>
  );
};

export default MassUpload;
