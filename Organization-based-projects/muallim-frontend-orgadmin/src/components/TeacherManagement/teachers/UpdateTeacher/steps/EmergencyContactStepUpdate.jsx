import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import cleanObject from "@/components/helpers/cleanObject";
import isSame from "@/components/helpers/isSame";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { GuardianType } from "@/constants/guardianPeopleType";
import { useTeacherProfileUpdateMutation } from "@/store/features/teacher-management/apiSlice";
import { message } from "antd";
import React, { useState, useEffect, useRef } from "react";

function EmergencyContactStepUpdate({ prevData, modalOpen }) {
  /*======== initilize apis ========*/

  const [teacherProfileUpdate, { isLoading, error }] =
    useTeacherProfileUpdateMutation();

  /*========= states & functions =========*/
  // general state
  const initialState = {
    emName: "",
    emNumber: "",
    emRelation: "",
    emPhysician: "",
    emPhone: "",
  };
  const [generalData, setGeneralData] = useState(initialState);
  const generalDataHandler = (e) => {
    setGeneralData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* Find Previous data and set data into available variable */
  useEffect(() => {
    if (prevData) {
      const data = prevData;
      setGeneralData(data);
    }
  }, [prevData]);

  // errors
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);

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

  const handleSelectChange = (name, value) => {
    setGeneralData((prev) => ({ ...prev, [name]: value }));
  };

  const redirectToAnotherPage = () => {};
  const resetCookie = () => {};

  // main operation handler
  const stepHandler = async () => {
    const data = {
      ...generalData,
    };
    const readyData = {
      emergency_contact: {
        id: prevData?.id,
        contact_person_name: isSame(data?.emName, prevData?.emName),
        contact_person_mobile_no: isSame(data?.emNumber, prevData?.emNumber),
        relation_with_contact_person: isSame(
          data?.emRelation,
          prevData?.emRelation
        ),
        physician_name: isSame(data?.emPhysician, prevData?.emPhysician),
        physician_mobile_no: isSame(data?.emPhone, prevData?.emPhone),
      },
      medical_information: {
        id: prevData?.medical_information_id,
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
        <InputWithLabel
          label={"Name (Contact person)"}
          placeholder={"Iqbal Jafrry"}
          type={"text"}
          name="emName"
          value={generalData?.emName}
          handler={(e) => generalDataHandler(e)}
        />

        <InputWithLabel
          label={"Phone"}
          placeholder={"+13 98754641"}
          type={"number"}
          name="emNumber"
          value={generalData?.emNumber}
          handler={(e) => generalDataHandler(e)}
        />
        {/* <InputWithLabel
          label={"Relation"}
          placeholder={"Brother"}
          type={"text"}
          name="emRelation"
          value={generalData?.emRelation}
          handler={(e) => generalDataHandler(e)}
        /> */}
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

      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

      <div className="grid items-center justify-center  grid-cols-1 gap-x-8 gap-y-4">
        <InputWithLabel
          label={"Physician (Name)"}
          placeholder={"David Ant"}
          type={"text"}
          name="emPhysician"
          value={generalData?.emPhysician}
          handler={(e) => generalDataHandler(e)}
        />
        <InputWithLabel
          label={"Physician's Contact"}
          placeholder={"+13 489371554"}
          type={"text"}
          name="emPhone"
          value={generalData?.emPhone}
          handler={(e) => generalDataHandler(e)}
        />
      </div>
      <div className="mb-3 text-right mt-20">
        <button
          type="button"
          onClick={stepHandler}
          className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold"
        >
          {isLoading ? <SvgLoader className="text-white" /> : "Save Changes"}
        </button>
      </div>
    </>
  );
}

export default EmergencyContactStepUpdate;
