// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { callEnoviaWebService } from "../../utils/helpers";
// import { MSG_FETCH_CSRF_HEADERS_FAILED } from "../../utils/toastMessages";
// import { fetchCsrfToken } from "../../services/api/PlantAssignment/fetchCsrfService";
// import useToast from "../useToast";

// // =============== Utility function for fetching attached document IDs Start==================
// async function getAttachedDocumentId(
//   ENOVIA_BASE_URL,
//   productId,
//   headers,
//   parentRelName
// ) {
//   try {
//     const documentIds = [];
//     const response = await callEnoviaWebService(
//       "GET",
//       `${ENOVIA_BASE_URL}/resources/v1/modeler/documents/parentId/${productId}?parentRelName=${parentRelName}&tenant=OI000186152`,
//       "",
//       headers
//     );

//     if (response?.status) {
//       const documentData = response?.output?.data || [];
//       if (documentData.length === 0) {
//         console.log(`No documents attached to product: ${productId}`);
//       } else {
//         documentData.forEach((item) => documentIds.push(item.id));
//       }
//     }

//     console.log("Attached document IDs:", documentIds);
//     return documentIds;
//   } catch (error) {
//     console.error("Error fetching attached document IDs:", error);
//     return [];
//   }
// }
// // =============== Utility function for fetching attached document IDs Start==================

// const useRemoveDocConnection = () => {
//   const [loading, setLoading] = useState(false);
//   const[specificationDocument, setSpecificationDocument] = useState([]);
//   const[referenceDocument, setReferenceDocument] = useState([]);
//   const { showErrorToast, showSuccessToast, showWarningToast } = useToast();
//   // const dispatch = useDispatch();
//   const ENOVIA_BASE_URL = process.env.REACT_APP_ENOVIA_BASE_URL;

//   const handleDocDisconnectingMassupload = async (sheetData) => {
//     setLoading(true);
//     let specificBodyArray= []
//     let referenceBodyArray= []
//     try {
//       const headers = await fetchCsrfToken();
//       if (!headers) {
//         showErrorToast(MSG_FETCH_CSRF_HEADERS_FAILED);
//         return;
//       }
//       if (!sheetData || sheetData.length === 0) {
//         showErrorToast("No data to upload. Please check your sheet.");
//         return;
//       }
//       console.log("Sheet data", sheetData)
//       // =============== Loop for Excel sheet Dat Start =====================
//       for (const [index, row] of sheetData.entries()) {
//         try {
//           const searchStr = row["Item Title"];
//           const response = await callEnoviaWebService(
//             "GET",
//             `${ENOVIA_BASE_URL}/resources/v1/modeler/dseng/dseng:EngItem/search?$searchStr=${searchStr}`,
//             "",
//             headers
//           );

//           if (response?.status && response?.output?.member?.length) {
//             const match = response.output.member.find(
//               (item) => item?.title === row["Item Title"]
//             );

//             if (match) {

//               console.log(`Matched product found for row ${index}:`, match);
//                const specificationDocumentIds = await getAttachedDocumentId(
//                   ENOVIA_BASE_URL,
//                   match?.id,
//                   headers,
//                   "SpecificationDocument"
//                 );
//                 const referenceDocumentIds = await getAttachedDocumentId(
//                   ENOVIA_BASE_URL,
//                   match?.id,
//                   headers,
//                   "Reference%20Document"
//                 );

//                 if(!specificationDocumentIds || !referenceDocumentIds){
//                   showWarningToast(
//                     `No documents found for row ${index} with title ${row['Item Title']}`
//                   );
//                   continue;
//                 }
//                 if(specificationDocumentIds?.length === 0 && referenceDocumentIds?.length === 0) {
//                   showWarningToast(
//                     `No documents found for row ${index} with title ${row['Item Title']}`
//                   );
//                   continue;
//                 }
//                 console.log(
//                   `Specification Document IDs for row ${index}:`,
//                   specificationDocumentIds
//                 );
//                 console.log(
//                   `Reference Document IDs for row ${index}:`,
//                   referenceDocumentIds
//                 );
//                 if(specificationDocumentIds?.length > 0){
//                   const updatedSpecs = specificationDocumentIds.map((id) => ({
//                     id: id,
//                     updateAction: "NONE",
//                     relateddata: {
//                       parents: [
//                         {
//                           id: match?.id,
//                           updateAction: "DISCONNECT",
//                         },
//                       ],
//                     },
//                   }));
//                   console.log("updatedSpecs", updatedSpecs)
//                   const body = { data: updatedSpecs, documentType: "SpecificationDocument" }
//                   specificBodyArray.push(body);
//                 }
//                 if(referenceDocumentIds?.length > 0){
//                   const updatedRefs = referenceDocumentIds.map((id) => ({
//                     id: id,
//                     updateAction: "NONE",
//                     relateddata: {
//                       parents: [
//                         {
//                           id: match?.id,
//                           updateAction: "DISCONNECT",
//                         },
//                       ],
//                     },
//                   }));
//                   console.log("updatedRefs", updatedRefs)
//                   const refbody = { data: updatedRefs, documentType: "Reference%20Document" }
//                   referenceBodyArray.push(refbody);
//                 }
//             }
//           } else {
//             showWarningToast(
//               `No match found for row ${index} with title ${row['Item Title']}`
//             );
//           }
//         } catch (rowError) {
//           console.error(`Error processing row ${index}:`, rowError);
//         }
//       }
//       // =============== Loop for Excel sheet Dat End =====================
//       console.log("Specific Body Array", specificBodyArray);
//       console.log("Reference Body Array", referenceBodyArray);
//       setReferenceDocument(referenceBodyArray);
//       setSpecificationDocument(specificBodyArray);
//     } catch (mainError) {
//       console.error("Error during document disconnection:", mainError);
//       showErrorToast("An error occurred while processing the mass upload.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDocumentsDisconnect = async (specificationDocument,referenceDocument) =>{
//     console.log("specificationDocument", specificationDocument);
//     console.log("referenceDocument", referenceDocument);
//      const headers = await fetchCsrfToken();
//       if (!headers) {
//         showErrorToast(MSG_FETCH_CSRF_HEADERS_FAILED);
//         return;
//       }
//       if(specificationDocument?.length === 0 && referenceDocument?.length === 0) {
//         showWarningToast(
//           `No documents found to disconnect. Please check your sheet.`
//         );
//         return;
//       }
//     if(referenceDocument?.length > 0){
//       for(const item of referenceDocument){
//         const url = `${ENOVIA_BASE_URL}/resources/v1/modeler/documents?parentRelName=${item.documentType}&parentDirection=from&tenant=OI000186152`;
//         try {
//           const disconnectingResponse = await callEnoviaWebService(
//             "POST",
//             url,
//             item,
//             headers
//           );
//           console.log(
//             `disconnecting done for ${item.documentType}`,
//             disconnectingResponse
//           );
//         } catch (err) {
//           throw new Error("Document Disconnecting Failed",err);
//         }

//       }
//     }
//     if(specificationDocument?.length > 0){
//       for(const item of specificationDocument){
//         const url = `${ENOVIA_BASE_URL}/resources/v1/modeler/documents?parentRelName=${item.documentType}&parentDirection=from&tenant=OI000186152`;
//         try {
//           const disconnectingResponse = await callEnoviaWebService(
//             "POST",
//             url,
//             item,
//             headers
//           );
//           console.log(
//             `disconnecting done for ${item.documentType}`,
//             disconnectingResponse
//           );
//         } catch (err) {
//           throw new Error("Document Disconnecting Failed",err);
//         }

//       }
//     }

//   }
//   return {
//     specificationDocument,
//     referenceDocument,
//     handleDocDisconnectingMassupload,
//     handleDocumentsDisconnect,
//     loading,
//   };
// };

// export default useRemoveDocConnection;

import { useState } from "react";
import { callEnoviaWebService } from "../../utils/helpers";
import { MSG_FETCH_CSRF_HEADERS_FAILED } from "../../utils/toastMessages";
import { fetchCsrfToken } from "../../services/api/PlantAssignment/fetchCsrfService";
import useToast from "../useToast";

// --------------------- Helper Functions -----------------------

const getAttachedDocumentIds = async (
  baseUrl,
  productId,
  headers,
  parentRelName
) => {
  try {
    const url = `${baseUrl}/resources/v1/modeler/documents/parentId/${productId}?parentRelName=${parentRelName}&tenant=OI000186152`;
    const response = await callEnoviaWebService("GET", url, "", headers);

    if (response?.status && response?.output?.data?.length) {
      return response.output.data.map((item) => item.id);
    }

    return [];
  } catch (error) {
    console.error("Error fetching document IDs:", error);
    return [];
  }
};

const buildDisconnectPayload = (docIds, parentId, docType) => {
  const data = docIds.map((id) => ({
    id,
    updateAction: "NONE",
    relateddata: {
      parents: [{ id: parentId, updateAction: "DISCONNECT" }],
    },
  }));
  return { data, documentType: docType };
};

const disconnectDocuments = async (docs, headers, baseUrl, showErrorToast) => {
  for (const item of docs) {
    const url = `${baseUrl}/resources/v1/modeler/documents?parentRelName=${item.documentType}&parentDirection=from&tenant=OI000186152`;
    try {
      const res = await callEnoviaWebService("POST", url, item, headers);
      console.log(`Disconnected ${item.documentType}`, res);
    } catch (err) {
      console.error("Error disconnecting documents:", err);
      showErrorToast("Failed to disconnect documents.");
    }
  }
};

// --------------------- Custom Hook -----------------------

const useRemoveDocConnection = () => {
  const [loading, setLoading] = useState(false);
  const [specificationDocument, setSpecificationDocument] = useState([]);
  const [referenceDocument, setReferenceDocument] = useState([]);
  const { showErrorToast, showSuccessToast, showWarningToast } = useToast();
  const ENOVIA_BASE_URL = process.env.REACT_APP_ENOVIA_BASE_URL;

  const handleDocDisconnectingMassupload = async (sheetData) => {
    setLoading(true);
    const specDocs = [];
    const refDocs = [];

    try {
      const headers = await fetchCsrfToken();
      if (!headers) return showErrorToast(MSG_FETCH_CSRF_HEADERS_FAILED);

      if (!sheetData?.length) {
        showErrorToast("No data to upload. Please check your sheet.");
        return;
      }

      for (const [index, row] of sheetData.entries()) {
        const searchStr = row["Item Title"];
        try {
          const searchUrl = `${ENOVIA_BASE_URL}/resources/v1/modeler/dseng/dseng:EngItem/search?$searchStr=${searchStr}`;
          const response = await callEnoviaWebService(
            "GET",
            searchUrl,
            "",
            headers
          );
          const match = response?.output?.member?.find(
            (item) => item?.title === searchStr
          );

          if (!match) {
            showWarningToast(
              `No match found for row ${index} with title ${searchStr}`
            );
            continue;
          }

          const specIds = await getAttachedDocumentIds(
            ENOVIA_BASE_URL,
            match.id,
            headers,
            "SpecificationDocument"
          );
          const refIds = await getAttachedDocumentIds(
            ENOVIA_BASE_URL,
            match.id,
            headers,
            "Reference%20Document"
          );

          if (!specIds.length && !refIds.length) {
            showWarningToast(
              `No documents found for row ${index} with title ${searchStr}`
            );
            continue;
          }

          if (specIds.length){
            specDocs.push(
              buildDisconnectPayload(specIds, match.id, "SpecificationDocument")
            );}
          if (refIds.length){
            refDocs.push(
              buildDisconnectPayload(refIds, match.id, "Reference%20Document")
            );}
        } catch (rowError) {
          console.error(`Row ${index} error:`, rowError);
        }
      }

      setSpecificationDocument(specDocs);
      setReferenceDocument(refDocs);
      console.log("Specification Docs:", specDocs);
      console.log("Reference Docs:", refDocs);
    } catch (mainError) {
      console.error("Mass upload error:", mainError);
      showErrorToast("An error occurred while processing the mass upload.");
    } finally {
      setLoading(false);
    }
  };

  // const handleDocumentsDisconnect = async (specDocs, refDocs) => {
  //   try {
  //     const headers = await fetchCsrfToken();
  //     if (!headers) return showErrorToast(MSG_FETCH_CSRF_HEADERS_FAILED);

  //     if (!specDocs.length && !refDocs.length) {
  //       showWarningToast("No documents found to disconnect. Please check your sheet.");
  //       return;
  //     }

  //     if (refDocs.length) await disconnectDocuments(refDocs, headers, ENOVIA_BASE_URL, showErrorToast);
  //     if (specDocs.length) await disconnectDocuments(specDocs, headers, ENOVIA_BASE_URL, showErrorToast);

  //     showSuccessToast("Documents disconnected successfully.");
  //   } catch (err) {
  //     console.error("Disconnect handler error:", err);
  //     showErrorToast("An error occurred while disconnecting documents.");
  //   }
  // };

  const handleDocumentsDisconnect = async (specDocs, refDocs) => {
    setLoading(true); // Start loader
    try {
      const headers = await fetchCsrfToken();
      if (!headers) {
        showErrorToast(MSG_FETCH_CSRF_HEADERS_FAILED);
        return;
      }

      if (!specDocs.length && !refDocs.length) {
        showWarningToast(
          "No documents found to disconnect. Please check your sheet."
        );
        return;
      }

      if (refDocs.length){
        await disconnectDocuments(
          refDocs,
          headers,
          ENOVIA_BASE_URL,
          showErrorToast
        )}
      if (specDocs.length){
        await disconnectDocuments(
          specDocs,
          headers,
          ENOVIA_BASE_URL,
          showErrorToast
        );}

      showSuccessToast("Documents disconnected successfully.");
    } catch (err) {
      console.error("Disconnect handler error:", err);
      showErrorToast("An error occurred while disconnecting documents.");
    } finally {
      setLoading(false); // Stop loader
    }
  };
  return {
    specificationDocument,
    referenceDocument,
    handleDocDisconnectingMassupload,
    handleDocumentsDisconnect,
    loading,
  };
};

export default useRemoveDocConnection;
