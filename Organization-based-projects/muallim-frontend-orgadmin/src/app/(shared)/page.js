"use client";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SocialIconButton from "@/components/common/Inputs/Buttons/SocialIconButton";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { signinSchema } from "@/utilities/validationRules/schemas/authSchema";
import { useSignInReqMutation } from "@/store/features/auth/apiSlice";
import { message } from "antd";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { useRouter } from "next/navigation";
// social icons
const socialIcons = [
  {
    id: 1,
    icon: "./assets/img/logos/google.svg",
    link: "/",
  },
  {
    id: 2,
    icon: "./assets/img/logos/fb.svg",
    link: "/",
  },
  {
    id: 3,
    icon: "./assets/img/logos/in.svg",
    link: "/",
  },
  {
    id: 4,
    icon: "./assets/img/logos/apple.svg",
    link: "/",
  },
];
const Signin = () => {
  const router = useRouter(); // Next.js router hook for navigation.
  // input data store state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setFormData(formData);
    setErrors(null);
  };
  //   initialize signin slice
  const [signInReq, { isLoading, error }] = useSignInReqMutation();
  //   error watcher
  useEffect(() => {
    if (error && error.status === 400) {
      // const errorMsg = Array.isArray(error.data?.message)
      //   ? error.data.message.join(", & ")
      //   : error.data?.message;

      // message.error(errorMsg);

      message.error("Invalid email or password. please check and try again");
      setErrors(null);
    }
  }, [error]);
  const redirecToDashboard = (url) => {
    router.replace(url);
  };
  //  login request
  const loginRequestHandler = async () => {
    try {
      await signinSchema.validate(formData, { abortEarly: false });
      await signInReq({
        data: { ...formData },
        resetHandler: resetFrom,
        redirecToDashboard: redirecToDashboard,
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        loginRequestHandler();
      }}
    >
      <div className="card w-full md:p-[48px] shadow-authpage  p-8 rounded-[12px] relative z-50 bg-white">
        <div className="flex justify-between items-center">
          <h3 className="md:text-30 text-2xl font-bold my-0 p-0">Log In</h3>
        </div>

        <div className="line bg-[#e4e6ea] w-full h-[1px] my-6"></div>

        {/* login form */}
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <InputWithLabel
              label={"Email"}
              placeholder={"Email"}
              type={"email"}
              value={formData.email}
              name="email"
              handler={(e) => handleChange(e)}
              error={errors && errors.email ? errors.email : null}
              isRequired
            />
          </div>
          <div>
            <InputWithLabel
              label={"Password"}
              placeholder={"Password"}
              type={"password"}
              value={formData.password}
              name="password"
              handler={(e) => handleChange(e)}
              error={errors && errors.password ? errors.password : null}
              isRequired
            />
          </div>
        </div>
        {/* submit request button */}
        <div className="md:mt-10 mt-3 text-center">
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              loginRequestHandler();
            }}
            className="btn btn-black bg-black text-white common-transition rounded-[8px] md:w-auto w-full py-2 px-0 flex justify-center items-center md:py-[12px] md:px-[200px] text-lg font-bold  mx-auto"
          >
            {isLoading ? <SvgLoader className="text-white" /> : "Log In"}
          </button>
        </div>

        {/* social login options */}

        {/* <div className="my-6 text-center">
        <span className="text-14 font-bold">Or</span>
      </div> */}

        {/* <div className="flex justify-center items-center gap-8 p-3">
        {socialIcons.map((data) => (
          <SocialIconButton link={data.link} key={data.id} icon={data.icon} />
        ))}
      </div> */}

        {/* button to create an account */}
        <div className="text-center flex flex-col mt-10 gap-2">
          <Link
            href={"/signup"}
            className="flex gap-1 justify-center items-center"
          >
            <div className="">Don’t have an account?</div>
            <span className="text-blue-600 underline font-bold">Sign Up</span>
          </Link>
          <span className="text-sm">
            Forgot Password?{" "}
            <Link
              href={"/forgot-password"}
              className="underline font-bold text-lg"
            >
              Reset
            </Link>
          </span>
        </div>
      </div>
    </form>
  );
};

export default Signin;
