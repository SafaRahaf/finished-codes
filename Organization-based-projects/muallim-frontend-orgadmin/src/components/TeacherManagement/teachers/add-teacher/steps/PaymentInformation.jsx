/**
 * PaymentInformation Component
 * This component handles the final step of the teacher registration form.
 * It manages payment details and optional admin panel login information.
 */

import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { inviteTeacherStepFourSchema } from "@/utilities/validationRules/schemas/inviteTeacherSchema";

import React, { useState, useRef, useEffect } from "react";
import { useIsExistingPeopleMutation } from "@/store/features/teacher-management/apiSlice";

function PaymentInformation({
  nextStepHandler,
  storeHandler,
  prevStepHandler,
  defaultData,
  finalLoading,
}) {
  // ===================== State Management Section =====================
  /**
   * Initial state for payment and login form fields
   * Contains empty values for all payment and authentication information
   */
  const initialState = {
    bank: defaultData?.bank_name || "",
    accountNumber: defaultData?.account_no || "",
    accountName: defaultData?.account_name || "",
    accountType: defaultData?.account_type || "",
    routingNumber: defaultData?.routing_number || "",
    email: defaultData?.access_email || "",
    password: "",
    confirmPassword: "",
  };

  const accountTypes = [
    { label: "Checking", value: "checking" },
    { label: "Savings", value: "savings" },
    { label: "Business", value: "business" },
    { label: "Other", value: "other" },
  ];

  // Form state management
  const [generalState, setGeneralState] = useState(initialState);
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);

  /**
   * Function to check if the email is already in the system
   * state management for isExistingPeople
   * @Initializing useIsExistingPeopleMutation @const isExistingPeople
   * @func checkPeopleEmailHandler
   * useEffect to check if the email is already in the system
   */
  const [isExistingPeople, { isLoading: isExistingPeopleLoading }] =
    useIsExistingPeopleMutation();

  const [isExistingPeopleResponse, setIsExistingPeopleResponse] =
    useState(true);

  const checkPeopleEmailHandler = async () => {
    const response = await isExistingPeople(defaultData?.access_email).unwrap();
    if (response.success) {
      setIsExistingPeopleResponse(true);
    } else {
      setIsExistingPeopleResponse(false);
    }
  };

  useEffect(() => {
    if (defaultData?.access_email) {
      checkPeopleEmailHandler();
    }
  }, [defaultData]);

  // ===================== Effects Section =====================
  /**
   * Initialize form with default data if available
   * Updates when defaultData changes
   */
  useEffect(() => {
    if (defaultData) {
      setGeneralState({
        bank: defaultData?.bank_name || "",
        accountNumber: defaultData?.account_no || "",
        accountName: defaultData?.account_name || "",
        accountType: defaultData?.account_type || "",
        routingNumber: defaultData?.routing_number || "",
        email: defaultData?.access_email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [defaultData]);

  // ===================== Event Handlers Section =====================
  /**
   * Handles changes in form input fields
   * Updates the corresponding state value based on input name
   */
  const generalDataHandler = (e) => {
    setGeneralState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Resets form data to initial state
  const resetPaymentData = () => {
    setGeneralState(initialState);
  };

  // ===================== Form Submission Section =====================
  /**
   * Handles form submission and validation
   * Validates payment and login information
   * Stores data if valid, displays errors if validation fails
   */
  const stepHandler = async () => {
    const data = {
      ...generalState,
    };
    try {
      await inviteTeacherStepFourSchema.validate(
        {
          ...data,
          access: defaultData?.access_to_admin_panel
            ? defaultData?.access_to_admin_panel
            : false,
        },
        {
          abortEarly: false,
        }
      );

      storeHandler({
        ...data,
      });
    } catch (err) {
      console.log(err);
      const allMessages = err.inner.map((error) => {
        return error.message;
      });
      setErrors(allMessages);
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
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

      {/* Payment Information Section */}
      <p className="font-bold uppercase mb-3">Payment Information</p>
      <div className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
        {/* Bank Details */}
        <InputWithLabel
          label={"Bank"}
          placeholder={"Bank"}
          type={"text"}
          name="bank"
          value={generalState?.bank}
          handler={(e) => generalDataHandler(e)}
          // isRequired
        />

        {/* Account Details */}
        <InputWithLabel
          label={"Account Number"}
          placeholder={"Account Number"}
          type={"number"}
          name="accountNumber"
          value={generalState?.accountNumber}
          handler={(e) => generalDataHandler(e)}
          // isRequired
        />
        <InputWithLabel
          label={"Account Name"}
          placeholder={"Account name"}
          type={"text"}
          name="accountName"
          value={generalState?.accountName}
          handler={(e) => generalDataHandler(e)}
          // isRequired
        />
        {/* <InputWithLabel
          label={"Account Type"}
          placeholder={"Account Type"}
          type={"text"}
          name="accountType"
          value={generalState?.accountType}
          handler={(e) => generalDataHandler(e)}
          isRequired
        /> */}
        <SelectBox
          label={"Account Type"}
          placeholder={"Account Type"}
          type={"text"}
          name="accountType"
          value={generalState?.accountType}
          defaultValue={generalState?.accountType}
          list={accountTypes}
          handler={(value, option) => {
            setGeneralState((prev) => ({
              ...prev,
              accountType: option.value,
            }));
          }}
          // isRequired
        />
        <InputWithLabel
          label={"Routing Number"}
          placeholder={"Routing Number"}
          type={"text"}
          name="routingNumber"
          value={generalState?.routingNumber}
          handler={(e) => generalDataHandler(e)}
          // isRequired
        />
      </div>

      {/* Admin Panel Access Section */}
      {defaultData?.access_to_admin_panel && (
        <div>
          <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
          <p className="font-bold uppercase mb-3">Login Information</p>

          {/* Access Information */}
          <p className="text-sm mb-4">
            You have been given access to the Muallim admin panel. Please check
            your sign in email and set the password for sign in.
          </p>

          {/* Login Form */}
          <div className="grid items-center justify-center lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-4">
            {/* Email Display */}
            <div className="w-full">
              <p className="text-14 font-bold flex items-center">
                Sign in Email
              </p>
              <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
                {defaultData?.access_email}
              </div>
            </div>
            <div></div>

            {!isExistingPeopleLoading && (
              <>
                {!isExistingPeopleResponse && (
                  <>
                    {/* Password Fields */}
                    <InputWithLabel
                      value={generalState?.password}
                      label={"Password"}
                      placeholder={"Password"}
                      type={"password"}
                      name="password"
                      handler={(e) => generalDataHandler(e)}
                      isRequired
                    />
                    <InputWithLabel
                      value={generalState?.confirmPassword}
                      label={"Re-Enter Password"}
                      placeholder={"Re-password"}
                      type={"password"}
                      name="confirmPassword"
                      handler={(e) => generalDataHandler(e)}
                      isRequired
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons Section */}
      <div className="flex">
        <button
          className="bg-black rounded-[8px] mr-2 px-[50px] py-3 text-white font-bold block mx-auto mt-10 w-full"
          onClick={() => prevStepHandler(3)}
        >
          Previous
        </button>
        <button
          disabled={finalLoading}
          onClick={stepHandler}
          className="bg-black rounded-[8px] disabled:cursor-not-allowed disabled:opacity-50 mr-2 px-[50px] py-3 text-white font-bold block mx-auto mt-10 w-full"
        >
          Submit
        </button>
      </div>
    </>
  );
}

export default PaymentInformation;
