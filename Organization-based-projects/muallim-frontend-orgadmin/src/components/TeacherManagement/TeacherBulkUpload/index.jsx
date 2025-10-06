import React, { useState } from "react";
import AddSingleOrMultiple from "./AddSingleOrMultiple";
import AddMultipleTeacher from "./AddMultipleTeacher";

const TeacherBulkUpload = ({ onCancel }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    setStep(step + 1);
  };

  if (step === 0) {
    return <AddSingleOrMultiple onNext={handleNext} onCancel={onCancel} />;
  }

  if (step === 1) {
    return (
      <AddMultipleTeacher onBack={() => setStep(0)} onComplete={onCancel} />
    );
  }

  return null;
};

export default TeacherBulkUpload;
