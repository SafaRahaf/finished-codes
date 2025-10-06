/**
 * MedicalInformation Component
 * This component handles the third step of the teacher registration form.
 * It manages medical information, insurance details, and emergency contact information.
 */

import InputDate from "@/components/common/Inputs/Input/InputDate";
import InputFullDate from "@/components/common/Inputs/Input/InputFullDate";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { GuardianType } from "@/constants/guardianPeopleType";
import { inviteTeacherStepThreeSchema } from "@/utilities/validationRules/schemas/inviteTeacherSchema";
import React, { useState, useRef, useEffect } from "react";

// ===================== Constants Section =====================
/**
 * Predefined options for blood groups, Used in the blood group selection dropdown
 */
const bloodGroupOptions = [
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
];

function MedicalInformation({
  nextStepHandler,
  prevStepHandler,
  storeHandler,
  locationSecondChildren,
  defaultData, // Add this prop
}) {
  // ===================== State Management Section =====================
  /**
   * Initial state for all form fields
   */
  const initialState = {
    bloodGroup: defaultData?.blood_group || "",
    allergies: defaultData?.allergies || "",
    medicalHistory: defaultData?.significant_medical_history || "",
    medicalProblems: defaultData?.medical_problems || "",
    medication: defaultData?.regular_medications || "",
    companyName: defaultData?.insurance_company || "",
    people_insurance_policy_no: defaultData?.people_insurance_policy_no || "",
    exDate: defaultData?.people_insurance_expiry_date || "",
    emName: defaultData?.emergency_contact_person_name || "",
    emNumber: defaultData?.contact_person_mobile_no || "",
    emRelation: defaultData?.emergency_contact_person_relation || "",
    emPhysician: defaultData?.physician_name || "",
    emPhone: defaultData?.physician_mobile_no || "",
    state: "",
  };

  // Form state management
  const [generalData, setGeneralData] = useState(initialState);
  const [states, setStates] = useState([]);
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);

  // Add useEffect to update form when defaultData changes
  useEffect(() => {
    if (defaultData) {
      setGeneralData({
        bloodGroup: defaultData?.blood_group || "",
        allergies: defaultData?.allergies || "",
        medicalHistory: defaultData?.significant_medical_history || "",
        medicalProblems: defaultData?.medical_problems || "",
        medication: defaultData?.regular_medications || "",
        companyName: defaultData?.insurance_company || "",
        people_insurance_policy_no:
          defaultData?.people_insurance_policy_no || "",
        exDate: defaultData?.people_insurance_expiry_date || "",
        emName: defaultData?.emergency_contact_person_name || "",
        emNumber: defaultData?.contact_person_mobile_no || "",
        emRelation: defaultData?.emergency_contact_person_relation || "",
        emPhysician: defaultData?.physician_name || "",
        emPhone: defaultData?.physician_mobile_no || "",
        state: "",
      });
    }
  }, [defaultData]);

  // ===================== Event Handlers Section =====================

  // Handles changes in form input fields, Updates the corresponding state value based on input name
  const generalDataHandler = (e) => {
    setGeneralData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Resets form data to initial state
  const resetGeneralData = () => {
    setGeneralData(initialState);
  };

  // ===================== Form Submission Section =====================
  /**
   * Handles form submission and validation
   * Stores data and moves to next step if valid
   */
  const stepHandler = async () => {
    const data = {
      ...generalData,
    };
    try {
      await inviteTeacherStepThreeSchema.validate(data, {
        abortEarly: false,
      });
      storeHandler({
        ...data,
      });
      nextStepHandler(4);
    } catch (err) {
      const allMessages = err.inner.map((error) => {
        return error.message;
      });
      setErrors(allMessages);
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSelectChange = (name, value) => {
    setGeneralData((prev) => ({ ...prev, [name]: value }));
  };

  // ===================== Render Section =====================
  return (
    <>
      {/* Error Display Section */}
      {errors && (
        <div
          ref={errorRef}
          className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-semibold text-lg">
            Please check your{" "}
            <span className="font-bold">Invalid Information</span>:
          </p>
          <ul className="list-disc ml-5 mt-2">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Medical Information Section */}
      <p className="font-bold uppercase mb-2">Medical Info</p>
      <div className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
        {/* Blood Group Selection */}
        <SelectBox
          defaultValue={generalData?.bloodGroup}
          list={
            bloodGroupOptions &&
            bloodGroupOptions.length > 0 &&
            bloodGroupOptions.map((item) => ({
              ...item,
              label: item.label,
              value: item.value,
            }))
          }
          handler={(value) =>
            setGeneralData((prev) => ({ ...prev, bloodGroup: value }))
          }
          inputHeight={"!h-[43px]"}
          className="mt-2"
          label="Blood Group"
        />

        {/* Medical Details Inputs */}
        <InputWithLabel
          label={"Allergies"}
          placeholder={"Allergies"}
          type={"text"}
          name="allergies"
          value={generalData?.allergies}
          handler={(e) => generalDataHandler(e)}
        />

        {/* Medical History Input */}
        <div className="lg:col-span-2 col-span-1">
          <InputWithLabel
            label={
              "Significant Medical History (Surgery, injury, serious illness etc.)"
            }
            placeholder={"Surgery, injury, serious illness etc"}
            type={"text"}
            name="medicalHistory"
            value={generalData?.medicalHistory}
            handler={(e) => generalDataHandler(e)}
          />
        </div>

        {/* Additional Medical Information */}
        <InputWithLabel
          label={"Medical Problem"}
          placeholder={"Medical Problem"}
          type={"text"}
          name="medicalProblems"
          value={generalData?.medicalProblems}
          handler={(e) => generalDataHandler(e)}
        />
        <InputWithLabel
          label={"Regular Medications"}
          placeholder={"Regular Medications"}
          type={"text"}
          name="medication"
          value={generalData?.medication}
          handler={(e) => generalDataHandler(e)}
        />
      </div>

      {/* Medical Insurance Section */}
      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
      <p className="font-bold uppercase mb-3">medical insurance details</p>
      <div className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
        {/* Insurance Company Details */}
        <InputWithLabel
          label={"Name of Insurance Company"}
          placeholder={"Insurance name"}
          type={"text"}
          name="companyName"
          value={generalData?.companyName}
          handler={(e) => generalDataHandler(e)}
        />

        {/* State Selection */}
        <SelectBox
          handler={(value, option) =>
            setGeneralData((prev) => ({
              ...prev,
              state: option.id,
            }))
          }
          list={
            locationSecondChildren?.children &&
            locationSecondChildren?.children.length > 0 &&
            locationSecondChildren?.children.map((item) => ({
              ...item,
              label: item?.location_name,
              value: item?.location_name,
            }))
          }
          label={
            locationSecondChildren?.location_type_id?.type_name
              ? locationSecondChildren?.location_type_id?.type_name
              : "state"
          }
        />

        {/* Policy Details */}
        <InputWithLabel
          label={"Policy Number"}
          placeholder={"Policy Number"}
          type={"text"}
          name="people_insurance_policy_no"
          value={generalData?.people_insurance_policy_no}
          handler={(e) => generalDataHandler(e)}
        />
        <InputFullDate
          defaultValue={generalData?.exDate}
          handler={(date) =>
            setGeneralData((prev) => ({ ...prev, exDate: date }))
          }
          label={"Expiry Date"}
          futureDate={false}
        />
      </div>

      {/* Emergency Contact Section */}
      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
      <p className="font-bold uppercase mb-3">Emergency Contact</p>
      <div className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
        {/* Emergency Contact Details */}
        <InputWithLabel
          label={"Name (Contact person)"}
          placeholder={"Insurance name"}
          type={"text"}
          name="emName"
          value={generalData?.emName}
          handler={(e) => generalDataHandler(e)}
        />
        {/* <div></div> */}
        <InputWithLabel
          label={"Phone"}
          placeholder={"Phone"}
          type={"number"}
          name="emNumber"
          value={generalData?.emNumber}
          handler={(e) => generalDataHandler(e)}
        />
        <SelectBox
          label="Relation"
          name="emRelation"
          list={Object.values(GuardianType).map((item) => ({
            label: item.replace("_", " "),
            value: item,
          }))}
          defaultValue={generalData?.emRelation}
          handler={(value) => handleSelectChange("emRelation", value)}
        />
      </div>

      {/* Physician Information Section */}
      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
      <div className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
        <InputWithLabel
          label={"Physician (Name)"}
          placeholder={"Physician (Name)"}
          type={"text"}
          name="emPhysician"
          value={generalData?.emPhysician}
          handler={(e) => generalDataHandler(e)}
        />
        <InputWithLabel
          label={"Physician's Contact"}
          placeholder={"Physician's Contact"}
          type={"number"}
          name="emPhone"
          value={generalData?.emPhone}
          handler={(e) => generalDataHandler(e)}
        />
      </div>

      {/* Navigation Buttons Section */}
      <div className="flex">
        <button
          className="bg-black rounded-[8px] mr-2 px-[50px] py-3 text-white font-bold block mx-auto mt-10 w-full"
          onClick={() => prevStepHandler(2)}
        >
          Previous
        </button>
        <button
          onClick={() => stepHandler()}
          className="bg-black rounded-[8px] mr-2 px-[50px] py-3 text-white font-bold block mx-auto mt-10 w-full"
        >
          Next
        </button>
      </div>
    </>
  );
}

export default MedicalInformation;
