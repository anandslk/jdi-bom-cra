import Popup from "../../components/Popup/Popup";
import useToast from "../../hooks/useToast";
import {
  MSG_SAVEPRODUCT_NOT_ALLOWED_ERROR,
  MSG_SAVEPRODUCT_RELEASED_ERROR,
} from "../../utils/toastMessages";
import MassUpdateDropdown from "./MassUpdateDropdown";

const BOSWidgetToolbarNativeCta = ({
  onSave,
  state,
  selectedRows,
  tableData,
  onMassUpdate,
  type,
  latestRevision,
  droppedRevision,
}) => {
  const { showWarningToast } = useToast();

  const handleSaveClick = () => {
    if (onSave) {
      onSave();
      // eslint-disable-next-line no-mixed-operators
    } else if (
      (type !== "Document" && !latestRevision) ||
      latestRevision === droppedRevision
    ) {
      showWarningToast(MSG_SAVEPRODUCT_RELEASED_ERROR);
    } else {
      showWarningToast(MSG_SAVEPRODUCT_NOT_ALLOWED_ERROR);
    }
    // When save button is clicked, call onSave passed as prop
    // onSave is passed with tableData from parent
  };
  const handleMassUpdate = (column, value, scope) => {
    if (
      (type !== "Document" && !latestRevision) ||
      latestRevision === droppedRevision
    ) {
      showWarningToast(MSG_SAVEPRODUCT_RELEASED_ERROR);
      return;
    }

    if (scope === "selected") {
      onMassUpdate(selectedRows, column, value);
    } else {
      onMassUpdate(tableData, column, value);
    }
  };

  return (
    <div className="d-flex cta-absolute">
      <button
        className="btn btn-outline-success btn-lg m-2"
        onClick={handleSaveClick}
      >
        Save
      </button>
      <MassUpdateDropdown
        editableColumns={[
          "Print On Purchase Order Required",
          "Print On Work Order Required",
          "Work Order Document Required",
          "Print On report Order Required",
          "SAP/JDE",
        ]}
        selectedRows={selectedRows} // Selected row IDs from table
        onApplyUpdate={handleMassUpdate} // Updated function with validation
        valueOptions={["Yes", "No"]}
      />
    </div>
  );
};

export default BOSWidgetToolbarNativeCta;
