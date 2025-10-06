"use client";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/store/features/auth/apiSlice";
import { resetPasswordSchema } from "@/utilities/validationRules/schemas/authSchema";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { message } from "antd";

function page() {
  const router = useRouter(); // Next.js router hook for navigation.
  const searchParams = useSearchParams();
  const findVerifyEmail = searchParams.get("email");
  const findSecretOtp = searchParams.get("secret");
  // input data store state
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_new_password: "",
  });
  //   input state change handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  // errors store state
  const [errors, setErrors] = useState(null);
  // reset state
  const resetFrom = () => {
    setFormData({
      new_password: "",
      confirm_new_password: "",
    });
  };
  //   initialize signin slice
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();
  //   error watcher
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        message.error(error?.data?.message);
      } else {
        message.error(error?.data?.message);
      }
    }
  }, [error]);
  const redirecToAnotherPage = () => {
    router.replace("/");
  };
  // set new passowd request
  const resetNewPassowrdHandler = async () => {
    try {
      await resetPasswordSchema.validate(
        {
          new_password: formData.new_password,
          confirm_new_password: formData.confirm_new_password,
        },
        { abortEarly: false }
      );
      if (findVerifyEmail && findSecretOtp) {
        await resetPassword({
          data: {
            new_password: formData.new_password,
            otp_support_pin: findSecretOtp,
            email: findVerifyEmail.split(" ").join("+"),
          },
          resetHandler: resetFrom,
          redirect: redirecToAnotherPage,
        });
      }
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
      <p className="text-14 mb-4">
        Set your new password. You will have to sign-in again.
      </p>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <InputWithLabel
            label={"New Password"}
            placeholder={"New Password"}
            type={"password"}
            value={formData.new_password}
            name="new_password"
            handler={(e) => handleChange(e)}
            error={errors && errors.new_password ? errors.new_password : null}
            isRequired
          />
        </div>
        <div>
          <InputWithLabel
            label={"Re-Enter Password"}
            placeholder={"Re-Enter Password"}
            type={"password"}
            value={formData.confirm_new_password}
            name="confirm_new_password"
            handler={(e) => handleChange(e)}
            error={
              errors && errors.confirm_new_password
                ? errors.confirm_new_password
                : null
            }
            isRequired
          />
        </div>
      </div>

      <div className="md:mt-10 mt-3 text-center">
        <button
          type="button"
          onClick={resetNewPassowrdHandler}
          className="btn btn-black bg-black text-white common-transition rounded-[8px] md:w-auto w-full py-2 px-0 flex justify-center items-center md:py-[12px] md:px-[200px] text-lg font-bold  mx-auto"
        >
          {isLoading ? <SvgLoader className="text-white" /> : "Set Password"}
        </button>
      </div>
    </div>
  );
}

export default page;
