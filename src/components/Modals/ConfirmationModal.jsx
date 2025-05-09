import React from "react";
import CustomModal from "../../components/Modal/customModal";
import ReusableAlert from "../../components/Alert/ReusableAlert";
import "./ConfirmationModal.css";

const ConfirmationModal = ({ show, onHide, onConfirm }) => {
  return (
    <CustomModal
      show={show}
      onHide={onHide}
      title="Confirm Submission"
      footerButtons={[
        {
          label: "Cancel",
          variant: "danger",
          onClick: onHide,
        },
        {
          label: "Submit",
          variant: "success",
          onClick: onConfirm,
        },
      ]}
    >
      <div className="confirmation-modal-content">
        <h4 className="confirmation-title">
          Are you sure you want to submit? This action cannot be undone.
        </h4>

        <ReusableAlert
          variant="info"
          className="mb-3"
          message={
            <span className="info-message-container">
              <span className="info-icon">i</span>

              <span className="info-text">
                Once submitted, your data will be processed by the system. You
                will receive a confirmation once its complete. Large uploads may
                take a few minutes.
              </span>
            </span>
          }
        />
      </div>
    </CustomModal>
  );
};

export default ConfirmationModal;
