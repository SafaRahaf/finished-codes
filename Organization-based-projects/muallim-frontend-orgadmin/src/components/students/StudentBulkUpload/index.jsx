import React, { useState } from "react";
import AddSingleOrMultiple from "./AddSingleOrMultiple";
import AddMultipleStudent from "./AddMultipleStudent";

const StudentBulkUploadModal = ({ handleModal }) => {
  const [step, setStep] = useState(1);

  return (
    <div
      onClick={handleModal}
      className="fixed inset-0 z-50  flex items-center justify-center bg-black bg-opacity-10 "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl p-8 mx-3"
      >
        {step == 1 ? (
          <AddSingleOrMultiple onNext={() => setStep(2)} onCancel={handleModal}>
            {" "}
          </AddSingleOrMultiple>
        ) : step == 2 ? (
          <AddMultipleStudent
            onNext={() => setStep(3)}
            onCancel={handleModal}
          />
        ) : (
          <div>not found </div>
        )}
      </div>
    </div>
  );
};

export default StudentBulkUploadModal;
