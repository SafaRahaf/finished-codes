import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import { useTeacherProfileUpdateMutation } from "@/store/features/teacher-management/apiSlice";
import { message } from "antd";
import React, { useState, useEffect, useRef } from "react";
import cleanObject from "@/components/helpers/cleanObject";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import InputFullDate from "@/components/common/Inputs/Input/InputFullDate";

function InsuranceStepUpdate({ prevData, modalOpen }) {
  /*======== initilize apis ========*/

  const [teacherProfileUpdate, { isLoading, error }] =
    useTeacherProfileUpdateMutation();

  /*========= states & functions =========*/

  // general state
  const initialState = {
    companyName: "",
    policyNumber: "",
    exDate: "",
    state: "",
  };
  const [generalData, setGeneralData] = useState(initialState);
  const generalDataHandler = (e) => {
    setGeneralData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* Find Previous data and set data into available variablen */
  useEffect(() => {
    if (prevData) {
      const data = prevData;
      setGeneralData({
        companyName: data?.companyName,
        policyNumber: data?.policyNumber,
        exDate: data?.insurance_expiry_date,
        state: data?.state,
      });
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
  //   redirect method for create when api request return 201 then redirect verify page
  const redirectToAnotherPage = () => {};
  // reset cookie
  const resetCookie = () => {};

  // main operation handler
  const stepHandler = async () => {
    const data = {
      ...generalData,
    };
    const readyData = {
      medical_insurance: {
        id: prevData?.id,
        organization: data?.companyName
          ? {
              is_exist: false,
              name: data?.companyName,
            }
          : null,
        location_id: data?.state,
        policy_number: data?.policyNumber,
        insurance_expiry_date: data?.exDate,
      },
    };
    const reformateCode = cleanObject(readyData);

    modalOpen(true);

    await teacherProfileUpdate({
      id: prevData?.teacherId,
      data: {
        medical_insurance: {
          ...reformateCode?.medical_insurance,
          organization: reformateCode?.medical_insurance?.organization?.name
            ? {
                is_exist: false,
                name: reformateCode?.medical_insurance?.organization?.name,
              }
            : null,
        },
      },

      redirectAnotherPage: redirectToAnotherPage,
      resetCookie: resetCookie,
    });
  };
  return (
    <>
      <div className="grid items-center justify-center grid-cols-1 gap-x-8 gap-y-4">
        {/* <div className="w-full">
          <p className="text-14 font-bold flex items-center">
            Name of Insurance Company
          </p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {generalData?.companyName}
          </div>
        </div>
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">Policy Number</p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {generalData?.policyNumber}
          </div>
        </div>
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">Expiry Date</p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {generalData?.exDate}
          </div>
        </div> */}
        <InputWithLabel
          label={"Name of Insurance Company"}
          placeholder={"Insurance name"}
          type={"text"}
          name="companyName"
          value={generalData?.companyName}
          handler={(e) => generalDataHandler(e)}
        />
        <InputWithLabel
          label={"Policy Number"}
          placeholder={"Policy Number"}
          type={"text"}
          name="policyNumber"
          value={generalData?.policyNumber}
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

export default InsuranceStepUpdate;
