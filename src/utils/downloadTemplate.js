import { MSG_DROPDOWN_NOT_SELECTED } from "./toastMessages";

export const downloadTemplate = (showErrorToast) => (operationChoice) => {
  let url = "";
  switch (operationChoice) {
    case "1": // Physical Product/Raw Material
      url =
        "https://khanfarzan17.github.io/mass-upload-testing/PhysicalProductSpreadSheetTemplate.xlsx";
      break;
    case "2": // Physical Product Structure
      url =
        "https://khanfarzan17.github.io/mass-upload-testing/PhysicalProductStructureSpreadSheetTemplate.xlsx";
      break;
    case "3": // Document
      url =
        "https://khanfarzan17.github.io/mass-upload-testing/DocumentSpreadSheetTemplate.xlsx";
      break;
    case "4": // Physical Product-Document
      url =
        "https://khanfarzan17.github.io/mass-upload-testing/PhysicalProduct-DocumentSpreadSheetTemplate.xlsx";
      break;
    case "5": // Manufacturing Equalent Product
      url =
        "https://theWhiteChamaleon.github.io/mep_massupload/mep-template.xlsx";
      break;
    case "6": // Disconnecting Docs from Physical Product
      url =
        "https://theWhiteChamaleon.github.io/mep_massupload/remove-doc-connection-template.xlsx";
      break;
    default:
      showErrorToast(MSG_DROPDOWN_NOT_SELECTED);
      return;
  }
  window.open(url, "_blank");
};
