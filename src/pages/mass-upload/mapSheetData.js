const OPERATION_TYPES = {
  PHYSICAL_PRODUCT: "1",
  PRODUCT_STRUCTURE: "2",
  DOCUMENT: "3",
  PRODUCT_DOCUMENT: "4",
};


const mappers = {
  // Physical Product/Raw Material mapper
  [OPERATION_TYPES.PHYSICAL_PRODUCT]: (row) => {
    // Get the value and convert to lowercase for case-insensitive comparison
    const productType =
      row["Physical product/Raw Material"]?.toLowerCase()?.trim() || "";

    let type;
    if (productType.includes("physical product")) {
      type = "VPMReference";
    } else if (productType.includes("raw material")) {
      type = "Raw_Material";
    } else {
      type = ""; // Default empty if neither matches
    }

    return {
      type,
      title: row["Title"] || "",
      attributes: {
        description: row["Description"] || "",
        path: row["Item Catalog Category"] || "",
        "dseno:EnterpriseAttributes": {
          "XP_VPMReference_Ext.EMR_ERP_PrimaryUOM":
            row["Unit Of Measure"] || row["Unit of Measure"] || "",
        },
        "dseng:EnterpriseReference": {
          partNumber: row["EIN Number"] || "",
        },
      },
      classificationType: row["Type"] || "",
      collabspace: row["Collaborative Space"] || row["Collabspace"] || "",
    };
  },

  // Product Structure mapper
  [OPERATION_TYPES.PRODUCT_STRUCTURE]: (row) => ({
    parentId: row["Parent EIN"] || "",
    childId: row["Child EIN"] || "",
    relationshipType: "Product Structure",
    attributes: {
      quantity: row["Quantity"] || "1",
      unit: row["Unit"] || "Each",
    },
  }),

  // Document mapper
  [OPERATION_TYPES.DOCUMENT]: (row) => ({
    type: "Document",
    title: row["Document Name"] || "",
    attributes: {
      description: row["Description"] || "",
      "document:attributes": {
        documentType: row["Document Type"] || "",
        revision: row["Revision"] || "",
      },
    },
    collabspace: row["Collaborative Space"] || row["Collabspace"] || "",
  }),

  // Product-Document mapper
  [OPERATION_TYPES.PRODUCT_DOCUMENT]: (row) => ({
    productId: row["Product EIN"] || "",
    documentId: row["Document Name"] || "",
    relationshipType: row["Relationship Type"] || "Reference",
  }),
};

const processInChunks = (items, chunkSize = 1000) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
};

const mapsheetData = (sheetData, operationType, chunkSize = 1000) => {
  if (!Array.isArray(sheetData) || sheetData.length === 0) {
    return { items: [], chunks: [], totalItems: 0, totalChunks: 0 };
  }

  // Add debug logging
  console.log("Raw Sheet Data:", sheetData);
  console.log("Operation Type:", operationType);

  const mapper = mappers[operationType];
  if (!mapper) {
    console.error(`No mapper found for operation type: ${operationType}`);
    return { items: [], chunks: [], totalItems: 0, totalChunks: 0 };
  }

  const items = sheetData.map((row, index) => {
    const mappedItem = mapper(row);

    return mappedItem;
  });

  const chunks = processInChunks(items, chunkSize);

  const result = {
    items,
    chunks,
    totalItems: items.length,
    totalChunks: chunks.length,
    originalData: sheetData // Store original data for future mappings
  };

  console.log("Final mapped data:", result);
  return result;
};

export default mapsheetData;
