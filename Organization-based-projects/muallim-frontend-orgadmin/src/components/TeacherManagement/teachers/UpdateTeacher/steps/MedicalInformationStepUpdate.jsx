import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import cleanObject from "@/components/helpers/cleanObject";
import isSame from "@/components/helpers/isSame";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { useTeacherProfileUpdateMutation } from "@/store/features/teacher-management/apiSlice";
import { message } from "antd";
import React, { useEffect, useState, useRef } from "react";
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
function MedicalInformationStepUpdate({ prevData, modalOpen }) {
  /*======== initilize apis ========*/

  const [teacherProfileUpdate, { isLoading, error }] =
    useTeacherProfileUpdateMutation();

  /*========= states & functions =========*/
  // general state
  const initialState = {
    bloodGroup: "",
    allergies: "",
    medicalHistory: "",
    medicalProblems: "",
    medication: "",
  };
  const [generalData, setGeneralData] = useState(initialState);
  const generalDataHandler = (e) => {
    setGeneralData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* Find Previous data and set data into available variable */
  useEffect(() => {
    if (prevData) {
      const data = prevData;
      setGeneralData({
        bloodGroup: data?.bloodGroup ?? "",
        allergies: data?.allergies ?? "",
        medicalHistory: data?.medicalHistory ?? "",
        medicalProblems: data?.medicalProblems ?? "",
        medication: data?.medication ?? "",
      });
    }
  }, [prevData]);
  // errors
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);
  //   ===============step handler
  const redirectToAnotherPage = () => {};
  const resetCookie = () => {};

  //   error watcher
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        message.error(error.data.message);
      } else {
        message.error(error.data.message);
      }
    }
  }, [error]);

  // main operation handler
  const stepHandler = async () => {
    const data = {
      ...generalData,
    };
    const readyData = {
      medical_information: {
        id: prevData?.id,
        allergies: isSame(data?.allergies, prevData?.allergies),
        blood_group: isSame(data?.bloodGroup, prevData?.bloodGroup),
        medical_problems: isSame(
          data?.medicalProblems,
          prevData?.medicalProblems
        ),
        significant_medical_history: isSame(
          data?.medicalHistory,
          prevData?.medicalHistory
        ),
        regular_medications: isSame(data?.medication, prevData?.medication),
      },
    };
    modalOpen(true);
    await teacherProfileUpdate({
      id: prevData?.teacherId,
      data: cleanObject(readyData),
      redirectAnotherPage: redirectToAnotherPage,
      resetCookie: resetCookie,
    });
  };

  return (
    <>
      <div className="grid items-center justify-center grid-cols-1 gap-x-8 gap-y-4">
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
          label="Blood Group"
        />
        <InputWithLabel
          label={"Allergies"}
          placeholder={"Hilsa Fish"}
          type={"text"}
          name="allergies"
          value={generalData?.allergies}
          handler={(e) => generalDataHandler(e)}
        />

        <InputWithLabel
          label={"Medical Problem"}
          placeholder={"Diabetes"}
          type={"text"}
          name="medicalProblems"
          value={generalData?.medicalProblems}
          handler={(e) => generalDataHandler(e)}
        />
        <InputWithLabel
          label={"Regular Medications"}
          placeholder={"Medication"}
          type={"text"}
          name="medication"
          value={generalData?.medication}
          handler={(e) => generalDataHandler(e)}
        />
        <InputWithLabel
          label={"Significant Medical History"}
          placeholder={"Surgery, injury, serious illness etc"}
          type={"text"}
          name="medicalHistory"
          value={generalData?.medicalHistory}
          handler={(e) => generalDataHandler(e)}
        />
      </div>
      <div className="mb-3 text-right mt-20">
        <button
          onClick={stepHandler}
          type="button"
          className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold"
        >
          {isLoading ? <SvgLoader className="text-white" /> : "Save Changes"}
        </button>
      </div>
    </>
  );
}

export default MedicalInformationStepUpdate;
