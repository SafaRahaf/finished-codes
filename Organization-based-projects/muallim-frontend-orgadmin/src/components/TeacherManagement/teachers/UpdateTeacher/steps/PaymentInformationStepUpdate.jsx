import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import { useTeacherProfileUpdateMutation } from "@/store/features/teacher-management/apiSlice";
import { updateTeacherStepTenSchema } from "@/utilities/validationRules/schemas/updateTeacherSchema";
import { message } from "antd";
import React, { useState, useEffect, useRef } from "react";
import cleanObject from "@/components/helpers/cleanObject";
import isSame from "@/components/helpers/isSame";
import SvgLoader from "@/components/ui/loaders/SvgLoader";

function PaymentInformationStepUpdate({ prevData, modalOpen }) {
  /*======== initilize apis ========*/

  const [teacherProfileUpdate, { isLoading, error }] =
    useTeacherProfileUpdateMutation();

  /*========= states & functions =========*/

  // general state
  const initialState = {
    bank: "",
    accountNumber: "",
    accountName: "",
    accountType: "",
    routingNumber: "",
  };
  const [generalState, setGeneralState] = useState(initialState);
  const generalDataHandler = (e) => {
    setGeneralState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  // errors
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);
  //   error watcher
  useEffect(() => {
    if (error) {
      if (error?.status === 400) {
        message.error(error?.data?.message);
      } else {
        message.error(error?.data?.message);
      }
    }
  }, [error]);
  /* 
                Find Previous data and set data into available variable
            */
  useEffect(() => {
    if (prevData) {
      const data = prevData;
      setGeneralState(data);
    }
  }, [prevData]);
  //   redirect method for create when api request return 201 then redirect verify page
  const redirectToAnotherPage = () => {};
  // reset cookie
  const resetCookie = () => {};

  // main operation handler
  const stepHandler = async () => {
    const data = {
      ...generalState,
    };
    try {
      await updateTeacherStepTenSchema.validate(
        {
          ...data,
        },
        {
          abortEarly: false,
        }
      );
      const readyData = {
        payment_info: {
          id: prevData?.id,
          bank_name: isSame(data?.bank, prevData?.bank),
          account_no: isSame(data?.accountNumber, prevData?.accountNumber),
          account_name: isSame(data?.accountName, prevData?.accountName),
          account_type: isSame(data?.accountType, prevData?.accountType),
          routing_number: isSame(data?.routingNumber, prevData?.routingNumber),
        },
      };
      await teacherProfileUpdate({
        id: prevData?.teacherId,
        data: cleanObject(readyData),
        redirectAnotherPage: redirectToAnotherPage,
        resetCookie: resetCookie,
      });
      modalOpen(true);
    } catch (err) {
      console.log(err);
      const allMessages = err.inner?.map((error) => {
        return error.message;
      });
      setErrors(allMessages);
      if (errorRef?.current) {
        errorRef?.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  return (
    <>
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
            {errors?.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid items-center justify-center grid-cols-1 gap-x-8 gap-y-4">
        {/* <div className="w-full">
          <p className="text-14 font-bold flex items-center">Bank</p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {generalState?.bank}
          </div>
        </div>
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">Account Name</p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {generalState?.accountName}
          </div>
        </div>
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">Account Number</p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {generalState?.accountNumber}
          </div>
        </div>
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">Account type</p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {generalState?.accountType}
          </div>
        </div>
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">Routing Number</p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {generalState?.routingNumber}
          </div>
        </div> */}
        <InputWithLabel
          label={"Bank"}
          placeholder={"Bank"}
          type={"text"}
          name="bank"
          value={generalState?.bank}
          handler={(e) => generalDataHandler(e)}
        />
        <InputWithLabel
          label={"Account Type"}
          placeholder={"Account Type"}
          type={"text"}
          name="accountType"
          value={generalState?.accountType}
          handler={(e) => generalDataHandler(e)}
        />
        <InputWithLabel
          label={"Account Holder Name"}
          placeholder={"Account name"}
          type={"text"}
          name="accountName"
          value={generalState?.accountName}
          handler={(e) => generalDataHandler(e)}
        />

        <InputWithLabel
          label={"Account Number"}
          placeholder={"Account number is hidden!"}
          type={"number"}
          name="accountNumber"
          value={generalState?.accountNumber}
          handler={(e) => generalDataHandler(e)}
        />

        <InputWithLabel
          label={"Routing Number"}
          placeholder={"Routing number is hidden!"}
          type={"text"}
          name="routingNumber"
          value={generalState?.routingNumber}
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

export default PaymentInformationStepUpdate;
