"use client";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SocialIconButton from "@/components/common/Inputs/Buttons/SocialIconButton";
import {
  useCheckEmailExistOrNotMutation,
  useCheckMobileExistOrNotMutation,
  useSignupMutation,
} from "@/store/features/auth/apiSlice";
import { signUpSchema } from "@/utilities/validationRules/schemas/authSchema";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { message } from "antd";
import { useRouter } from "next/navigation";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import countries from "./../../../data/CountryCodes";
import { DownArrowSvg } from "@/components/helpers/storeAllSvgs";

const SignUp = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const router = useRouter(); // Next.js router hook for navigation.
  // input data store state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile: "",
    email: "",
    password: "",
    confirm_password: "",
    verification_method: "code",
  });
  //   input state change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear specific field error when user starts typing
    if (errors && errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return Object.keys(newErrors).length > 0 ? newErrors : null;
      });
    }

    // Clear email exists error when user starts typing
    if (name === "email" && emailExists) {
      setEmailExists(false);
    }

    // Clear mobile exists error when user starts typing
    if (name === "mobile" && mobileExists) {
      setMobileExists(false);
    }
  };
  // errors store state
  const [errors, setErrors] = useState(null);
  // check email exists or not
  const [emailExists, setEmailExists] = useState(false);
  const [checkEmailExistOrNot] = useCheckEmailExistOrNotMutation();
  //  onBlur handler
  const checkEmail = async (value) => {
    if (!value) return; // Don't check if email is empty

    const { data: isEmailExist } = await checkEmailExistOrNot(value);
    if (isEmailExist?.success) {
      setEmailExists(true);
    } else {
      setEmailExists(false);
    }
  };
  // reset state
  const resetFrom = () => {
    setFormData(formData);
    setErrors(null);
  };
  // country states
  const [countryDropDowntoggle, setCountryDropDownToggle] = useState(false);
  const [getCountries, setGetCountries] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const selectCountryhandler = (value) => {
    setSelectedCountry(value);
    setCountryDropDownToggle(false);

    setFormData((prev) => ({
      ...prev,
      mobile: "",
    }));
  };
  useEffect(() => {
    if (!getCountries) {
      setGetCountries(countries && countries.countries);
      const findDefaultCountry =
        countries && countries.countries.length > 0
          ? countries.countries.find((country) => country.code === "US")
          : null;
      setSelectedCountry(findDefaultCountry);
    }
  }, [getCountries]);
  //   initialize signup slice
  const [signup, { isLoading, error }] = useSignupMutation();
  //   error watcher
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        const errorMsg = Array.isArray(error.data?.message)
          ? error.data?.message.join(", & ")
          : error.data?.message;

        message.error(errorMsg);
        // message.error(error.data.message);
      } else {
        message.error(error.data.message);
      }
    }
  }, [error]);
  //   redirect method for create when api request return 201 then redirect verify page
  const redirectToAnotherPage = () => {
    router.replace(`/email-verification?verify=${formData.email}`);
  };
  //  signup request
  const signupRequestHandler = async () => {
    if (!termsAccepted) {
      setTermsError("Please accept the terms & conditions.");
      return;
    } else {
      setTermsError("");
    }

    try {
      await signUpSchema.validate(
        {
          ...formData,
          mobile: formData.mobile,
        },
        { abortEarly: false }
      );
      await signup({
        data: {
          ...formData,
          mobile: selectedCountry.dial_code + formData.mobile,
        },
        resetHandler: resetFrom,
        redirectAnotherPage: redirectToAnotherPage,
      });
    } catch (validationErrors) {
      const formattedErrors = {};
      validationErrors.inner.forEach((error) => {
        formattedErrors[error.path] = error.message;
      });
      setErrors(formattedErrors);
    }
  };

  // check mobile exists or not
  const [mobileExists, setMobileExists] = useState(false);
  const [checkMobileExistOrNot] = useCheckMobileExistOrNotMutation();
  //  onBlur handler
  const checkMobile = async (value) => {
    if (!value || !selectedCountry) return;

    const { data: isMobileExist } = await checkMobileExistOrNot(
      selectedCountry.dial_code + value
    );
    if (isMobileExist?.success) {
      setMobileExists(true);
    } else {
      setMobileExists(false);
    }
  };

  return (
    <div className="card w-full md:p-[48px] shadow-authpage  p-8 rounded-[12px] relative z-50 bg-white">
      <div className="flex justify-between items-center">
        <h3 className="md:text-30 text-2xl font-bold my-0 p-0">Sign Up</h3>
        <p className="font-bold md:block hidden">Step 1/3</p>
      </div>

      <div className="line bg-[#e4e6ea] w-full h-[1px] my-6"></div>

      {/* sign up form */}
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
        <InputWithLabel
          label={"First Name"}
          placeholder={"First Name"}
          type={"text"}
          noNumbersAndSpecialChars={true}
          value={formData.first_name}
          name="first_name"
          handler={(e) => handleChange(e)}
          error={errors && errors.first_name ? errors.first_name : null}
          isRequired
        />
        <InputWithLabel
          label={"Last Name"}
          placeholder={"Last Name"}
          type={"text"}
          value={formData.last_name}
          noNumbersAndSpecialChars={true}
          name="last_name"
          handler={(e) => handleChange(e)}
          error={errors && errors.last_name ? errors.last_name : null}
          isRequired
        />
        <InputWithLabel
          onBlur={(e) => checkEmail(e.target.value)}
          label={"Email"}
          placeholder={"Email"}
          type={"email"}
          value={formData.email}
          name="email"
          handler={(e) => handleChange(e)}
          error={
            errors && errors.email
              ? errors.email
              : emailExists
              ? "Email already associate with another account"
              : null
          }
          isRequired
        />
        <div>
          <label className="text-14 font-bold flex">
            Phone Number<sup className="text-danger-700">*</sup>
          </label>
          <div
            className={`mt-1 rounded-[4px] border  w-full focus-within:outline focus-within:outline-2 focus-within:outline-blue-700 ${
              errors && errors.mobile ? "border-danger-700" : "border-[#798295]"
            }`}
          >
            <div className="relative">
              {/* country select button */}
              <div className="flex items-center">
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() =>
                      setCountryDropDownToggle(!countryDropDowntoggle)
                    }
                    type="button"
                    className="px-3 py-2 border-r border-[#798295]"
                  >
                    <div className="flex space-x-2 items-center">
                      <div className="w-[24px] h-[16px] ">
                        {selectedCountry && (
                          <img
                            src={`/assets/img/countries/${selectedCountry.code}.svg`}
                            alt="country"
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <span>
                        <DownArrowSvg />
                      </span>
                    </div>
                  </button>
                  <span className="text-base">
                    {selectedCountry && selectedCountry?.dial_code}
                  </span>
                </div>
                <input
                  className={`block px-2  w-full py-[9px] rounded focus:border-0 focus:ring-0 focus:outline-0`}
                  type={"number"}
                  placeholder={"Phone Number"}
                  value={formData.mobile}
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => checkMobile(e.target.value)}
                  name="mobile"
                />
              </div>
              {/* country select dropdown list */}
              {countryDropDowntoggle && (
                <div className="absolute left-0 z-10 top-full mt-1 h-[150px] border border-[#798295] bg-white rounded overflow-y-auto overflow-style-none">
                  <ul>
                    {getCountries &&
                      getCountries.length > 0 &&
                      getCountries.map((item, i) => (
                        <li
                          onClick={() => selectCountryhandler(item)}
                          key={i}
                          className="flex space-x-1.5 items-center px-3 py-1 cursor-pointer"
                        >
                          <span>
                            <img
                              width="25"
                              height="15"
                              src={`/assets/img/countries/${item.code}.svg`}
                              alt="country"
                              className="rounded"
                            />
                          </span>
                          <span className="text-sm text-qgray capitalize flex-1">
                            {item.dial_code}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          {errors && errors.mobile && (
            <p className="text-danger-700 text-sm">{errors.mobile}</p>
          )}
          {mobileExists && (
            <p className="text-danger-700 text-sm">
              Phone already associate with another account
            </p>
          )}
        </div>
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
        <InputWithLabel
          label={"Re-Enter Password"}
          placeholder={"Re-Enter Password"}
          type={"password"}
          value={formData.confirm_password}
          name="confirm_password"
          handler={(e) => handleChange(e)}
          isRequired
          error={
            errors && errors.confirm_password ? errors.confirm_password : null
          }
        />
      </div>

      <div className="flex mt-4 justify-start items-center gap-2">
        <input
          type="checkbox"
          name=""
          id="tocCheck"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="border-3 border-black h-[20px] w-[20px]"
        />
        <label htmlFor="tocCheck">
          I Accept the{" "}
          <Link
            href={"https://muallimedu.com/privacy-policy/"}
            className="underline"
          >
            terms & conditions
          </Link>
        </label>
      </div>
      {termsError && <p className="text-sm text-red-600 mt-1">{termsError}</p>}

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={signupRequestHandler}
          className="btn btn-black bg-black text-white common-transition rounded-[8px] md:w-auto w-full py-2 px-0 flex justify-center items-center md:py-[12px] md:px-[200px] text-lg font-bold  mx-auto"
        >
          {isLoading ? <SvgLoader className="text-white" /> : "Sign Up"}
        </button>
      </div>
      {/* login with social */}
      {/* <div className="my-6 text-center">
        <span className="text-14 font-bold">Or</span>
      </div>

      <div className="flex justify-center items-center gap-8 p-3">
        {loginData.map((data) => (
          <SocialIconButton link={data.link} key={data.id} icon={data.icon} />
        ))}
      </div> */}

      <div className="text-center mt-10">
        <Link href={"/"} className="flex gap-1 justify-center items-center">
          <div className="">Already have an account? </div>
          <span className="text-blue-600 underline font-bold">Sign In</span>
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
