import React, { useEffect, useState } from "react";
import Popup from "../../components/Popup/Popup";
import useToast from "../../hooks/useToast";
import {
  MSG_SAVEPRODUCT_NOT_ALLOWED_ERROR,
  MSG_SAVEPRODUCT_RELEASED_ERROR,
  MSG_ADDPRODUCT_NOT_ALLOWED_ERROR,
  MSG_ADDPRODUCT_RELEASED_ERROR,
} from "../../utils/toastMessages";
import CustomModal from "../../components/Modal/customModal";
import AvailablePlant from "../../components/Popup/Popup";
import { useRef } from "react";

const PlantAssignmentToolbarNativeCta = ({
  onAddPlant,
  addedPlant,
  onSave,
  onRemove,
  uniquedata,
  uniqueColumn,
  CAName,
  state,
}) => {
  const { showWarningToast } = useToast();
  const [AddedItem, setAddedItem] = useState([]);
  const [addedItemData, setAddedItemData] = useState([]);
  const [addPlantPopup, setAddPlantPopup] = useState(false);
  const availablePlantRef = useRef();

  const handleSaveClick = () => {
    if (onSave && CAName) {
      onSave();
    } else if (state === "RELEASED") {
      // alert(
      //   "Change Action is required to update pLANTS, please assign Modify change Action and try again"
      // );
      showWarningToast(MSG_SAVEPRODUCT_RELEASED_ERROR);
    } else {
      // alert(
      //   "Change Action is required to update, please assign change Action and try again"
      // );
      showWarningToast(MSG_SAVEPRODUCT_NOT_ALLOWED_ERROR);
    }
    // When save button is clicked, call onSave passed as prop
    // onSave is passed with tableData from parent
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  console.log("[Unique Table Data]:", uniquedata);

  // useEffect(() => {
  //   onAddPlant(addedItemData);
  //   console.log("Data Passed");
  //   // addedPlant(AddedItem);
  // }, [addedItemData]);

  const handleData = (data) => {
    console.log(data);
    setAddedItem(data);
    if (data.length > 0) {
      const newItems = data.map((title) => ({
        title: title, // Use the title as Plant (or replace with actual data)
        Seq: "1",
        Status: "Current",
        "MFG Change": "N/A",
        "MFG Status": "N/A",
        Change: "N/A",
        "Change Status": "N/A",
        "Oracle Template": "N/A",
        "ERP Status": "Active",
        "ERP Export": "Yes",
        "Lead Plant": "false",
        MBom: "Buy",
        "Sort Value": "",
      }));
      onAddPlant(newItems);
      setAddedItemData(newItems);
      addedPlant(data);
    }
  };
  // useEffect(() => {
  //   // if (AddedItem.length > 0) {
  //   //   const newItems = AddedItem.map((title) => ({
  //   //     title: title, // Use the title as Plant (or replace with actual data)
  //   //     Seq: "1",
  //   //     Status: "Current",
  //   //     MFG_Change: "",
  //   //     MFG_Status: "",
  //   //     Change: "",
  //   //     Change_Status: "",
  //   //     Oracle_Template: "",
  //   //     "ERP Status": "Active",
  //   //     "ERP Export": "Yes",
  //   //     "Lead Plant": "false",
  //   //     MBom: "Buy",
  //   //     "Sort Value": "",
  //   //   }));
  //   //   onAddPlant(newItems);
  //   //   setAddedItemData(newItems);
  //   //   addedPlant(AddedItem);
  //   // }
  // }, [AddedItem]);

  console.log("Added item data:", addedItemData);

  return (
    <>
      <div className="d-flex cta-absolute">
        <button
          className="btn btn-outline-success btn-lg m-2"
          onClick={() => {
            if (CAName) {
              setAddPlantPopup(true); // Open the modal if CAName is present
            } else if (state === "RELEASED") {
              showWarningToast(MSG_ADDPRODUCT_RELEASED_ERROR); // Show warning if state is RELEASED
            } else {
              showWarningToast(MSG_ADDPRODUCT_NOT_ALLOWED_ERROR); // Show warning if CAName is missing
            }
          }}
        >
          Add Plant
        </button>
        <button
          className="btn btn-outline-success btn-lg m-2"
          onClick={handleSaveClick}
        >
          Save
        </button>
        <button
          className="btn btn-outline-danger btn-lg m-2"
          onClick={handleRemove}
        >
          Remove
        </button>
      </div>
      <CustomModal
        show={addPlantPopup}
        onHide={() => setAddPlantPopup(false)}
        title="Available Plant"
        footerButtons={[
          {
            label: "Add",
            variant: "primary",
            onClick: () => {
              availablePlantRef.current?.addPlant(); // Call addPlant
              setAddPlantPopup(false);
            },
          },
          {
            label: "Close",
            variant: "danger",
            onClick: () => setAddPlantPopup(false),
          },
        ]}
      >
        <div className="modal-body">
          <AvailablePlant
            ref={availablePlantRef} // Attach the ref
            data={uniquedata}
            columns={uniqueColumn}
            CAName={CAName}
            addedItem={handleData}
            state={state}
          />
        </div>
      </CustomModal>
    </>
  );
};

export default PlantAssignmentToolbarNativeCta;
