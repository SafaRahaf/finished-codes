"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { message } from "antd";
import { emailVerificationSchema } from "@/utilities/validationRules/schemas/authSchema";
import {
  useEmailVerificationMutation,
  useResendOtpMutation,
} from "@/store/features/auth/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
const Page = () => {
  const router = useRouter(); // Next.js router hook for navigation.
  const searchParams = useSearchParams();
  const findVerifyEmail = searchParams.get("verify");
  // time function statue
  const [timer, setTimer] = useState(60);
  //   decrease time function
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);
  //   formate time for view like figma
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  //   6 digit otp
  const [code, setCode] = useState({
    one: "",
    two: "",
    three: "",
    four: "",
    five: "",
    six: "",
  });
  const resetValue = () => {
    setTimer(20);
    setCode({
      one: "",
      two: "",
      three: "",
      four: "",
      five: "",
      six: "",
    });
  };
  //   input handler
  const handleInput = (e) => {
    const index = e.target.getAttribute("data-index");

    if (e.key === "Backspace") {
      setCode((prev) => ({
        ...prev,
        [index]: "",
      }));

      if (e.target.previousElementSibling) {
        e.target.previousElementSibling.focus();
      }
      return;
    }

    if (!isNaN(Number(e.key)) && e.key !== " ") {
      setCode((prev) => ({
        ...prev,
        [index]: e.key,
      }));

      if (e.target.nextElementSibling) {
        e.target.nextElementSibling.focus();
      }
    }
  };
  // paste handler
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData("text");
    const numbers = pastedText.match(/\d/g);
    if (numbers && numbers.length === 6) {
      setCode((prev) => ({
        ...prev,
        one: numbers[0],
        two: numbers[1],
        three: numbers[2],
        four: numbers[3],
        five: numbers[4],
        six: numbers[5],
      }));
    }
  };
  //   initialize api slice for email varifications
  const [emailVerification, { isLoading, error }] =
    useEmailVerificationMutation();
  //   redirect method for create when api request return 201 then redirect login page
  const redirectToAnotherPage = (url) => {
    router.replace(url);
  };
  // send verify request
  const verifyRequestHandler = async () => {
    try {
      //formate data for validation and request
      const data = {
        otp:
          code.one + code.two + code.three + code.four + code.five + code.six,
        email: findVerifyEmail.split(" ").join("+"),
        purpose: "reset_password",
      };
      await emailVerificationSchema.validate(data, { abortEarly: false });
      await emailVerification({
        data: { ...data },
        redirectAnotherPage: redirectToAnotherPage,
      });
    } catch (validationErrors) {
      if (validationErrors) {
        message.error(error.data.message);
      }
    }
  };
  // resend opt request
  //   initialize api slice for resend opt
  const [resendOtp] = useResendOtpMutation();
  const resendOtpHandler = async () => {
    //formate data for validation and request
    const data = {
      method: "email",
      email: findVerifyEmail.split(" ").join("+"),
      purpose: "reset_password",
    };
    await resendOtp({
      data: { ...data },
      resetTime: resetValue,
    });
  };
  return (
    <div>
      {/* otp form */}
      <p className="text-14">
        We sent a verification code to{" "}
        <b>{findVerifyEmail.split(" ").join("+")}</b> Check your email and enter
        the code.
      </p>

      <div className="mt-8 mb-6">
        <div className="flex justify-center items-center sm:gap-6 gap-2">
          {["one", "two", "three", "four", "five", "six"].map(
            (digit, index) => (
              <input
                key={index}
                type="text"
                data-index={digit}
                value={code[digit]}
                pattern="/^[0-9]*$/"
                onKeyUp={handleInput}
                onPaste={handlePaste}
                maxLength="1"
                className="border-[1px] rounded-[4px] border-[#949BAA] sm:h-[60px] w-10 h-10 sm:w-[60px] text-center caret-transparent cursor-pointer"
              />
            )
          )}
        </div>
      </div>

      <div className="flex mt-4 justify-between items-center gap-2">
        <span className="text-14 font-bold">{formatTime(timer)}</span>
        {timer === 0 && (
          <button
            onClick={resendOtpHandler}
            type="button"
            className="underline text-14 font-bold"
          >
            Resend Code
          </button>
        )}
      </div>

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={verifyRequestHandler}
          className="btn btn-black bg-black text-white common-transition rounded-[8px] md:w-auto w-full py-2 px-0 flex justify-center items-center md:py-[12px] md:px-[200px] text-lg font-bold  mx-auto cursor-pointer"
        >
          {isLoading ? <SvgLoader className="text-white" /> : "Verify"}
        </button>
      </div>
    </div>
  );
};

export default Page;
