"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import { useSentOtpByEmailMutation } from "@/store/features/auth/apiSlice";
import { sentOtpByEmailSchma } from "@/utilities/validationRules/schemas/authSchema";
import { message } from "antd";
import SvgLoader from "@/components/ui/loaders/SvgLoader";

function page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  //   input state change handler
  const handleChange = (e) => {
    setEmail(e.target.value);
  };
  // errors store state
  const [errors, setErrors] = useState(null);
  // reset state
  const resetFrom = () => {
    setEmail("");
  };
  //   initialize signin slice
  const [sentOtpByEmail, { isLoading, error }] = useSentOtpByEmailMutation();
  //error watcher
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        message.error("Invalid credentials");
      } else {
        message.error(error?.data?.message);
      }
    }
  }, [error]);
  // direction handler
  const redirecToAnotherPage = () => {
    router.replace(`/forgot-password/email?verify=${email}`);
  };
  // send otp handler
  const sendOtpHandler = async () => {
    try {
      await sentOtpByEmailSchma.validate({ email }, { abortEarly: false });
      await sentOtpByEmail({
        data: { email: email, method: "email", purpose: "reset_password" },
        resetHandler: resetFrom,
        redirect: redirecToAnotherPage,
      });
    } catch (validationErrors) {
      const formattedErrors = {};
      validationErrors.inner.forEach((error) => {
        formattedErrors[error.path] = error.message;
      });
      setErrors(formattedErrors);
    }
  };
  return (
    <div>
      <p className="text-14">
        Set your new password. You will have to sign-in again.
      </p>

      {/* password change option chooser */}
      <div className="mt-8 mb-6">
        <InputWithLabel
          label={"Your Email"}
          placeholder={"Your Email"}
          type={"email"}
          value={email}
          name="email"
          handler={(e) => handleChange(e)}
          error={errors && errors.email ? errors.email : null}
          isRequired
        />
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={sendOtpHandler}
          type="button"
          className="btn btn-black bg-black text-white common-transition rounded-[8px] md:w-auto w-full py-2 px-0 flex justify-center items-center md:py-[12px] md:px-[200px] text-lg font-bold  mx-auto"
        >
          {isLoading ? <SvgLoader className="text-white" /> : "Next"}
        </button>
      </div>
    </div>
  );
}

export default page;
