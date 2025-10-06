import React, { useEffect } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import { LegalGuardianType } from "@/constants/guardianPeopleType";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import useLocationSelector from "@/hooks/useLocationSelector";
import { studentGuardianInfoValidationSchema } from "@/utilities/validationRules/schemas/studentCompletionSchema";
import { useCheckEmailExistOrNotForParentMutation } from "@/store/features/auth/apiSlice";
import InputBluePrint from "@/components/common/Inputs/Input/InputBluePrint";
import { DownArrowSvg } from "@/components/helpers/storeAllSvgs";

/**
 * Step 2: Guardian & Parents Component
 * Handles father and mother information including names, contact details, and address preferences
 */
const Step2GuardianParents = ({
  formData,
  onFormDataUpdate,
  onNextStep,
  onPrevStep,
  step,
  infoErrors,
  setInfoErrors,
  className,
  fatherCountryDropDownToggle,
  setFatherCountryDropDownToggle,
  motherCountryDropDownToggle,
  setMotherCountryDropDownToggle,
  getCountries,
  setGetCountries,
  fatherSelectedDialCountry,
  motherSelectedDialCountry,
  selectCountryhandler,
}) => {
  const [checkEmailExistOrNotForParent] =
    useCheckEmailExistOrNotForParentMutation();
  //  onBlur handler
  const checkEmail = async (value, parentType = "father") => {
    const { data: isEmailExist } = await checkEmailExistOrNotForParent(value);
    console.log(isEmailExist);
    if (parentType === "father") {
      if (isEmailExist?.success) {
        onFormDataUpdate({
          father_id: isEmailExist?.data?.id || null,
          father_first_name: isEmailExist?.data?.first_name || "",
          father_last_name: isEmailExist?.data?.last_name || "",
          father_mobile: isEmailExist?.data?.mobile_no || "",
        });
      } else {
        onFormDataUpdate({
          father_id: null,
          father_first_name: "",
          father_last_name: "",
          father_mobile: "",
        });
      }
    } else {
      if (isEmailExist?.success) {
        onFormDataUpdate({
          mother_id: isEmailExist?.data?.id || null,
          mother_first_name: isEmailExist?.data?.first_name || "",
          mother_last_name: isEmailExist?.data?.last_name || "",
          mother_mobile: isEmailExist?.data?.mobile_no || "",
        });
      } else {
        onFormDataUpdate({
          mother_id: null,
          mother_first_name: "",
          mother_last_name: "",
          mother_mobile: "",
        });
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormDataUpdate({ [name]: value });

    // Clear error when user starts typing
    if (infoErrors[name]) {
      setInfoErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    onFormDataUpdate({ [name]: value });

    // Clear error when user selects
    if (infoErrors[name]) {
      setInfoErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle father address preference
  const handleFatherAddressChange = (value) => {
    onFormDataUpdate({ father_address: value });
  };

  // Handle mother address preference
  const handleMotherAddressChange = (value) => {
    onFormDataUpdate({ mother_address: value });
  };

  // father location hook

  const {
    selectedCountry: fatherSelectedCountry,
    formData: fatherLocationFormData,
    errors: fatherErrors,
    setErrors: setFatherErrors,
    isFetching: fatherIsFetching,
    handleLocationSelection: fatherHandleLocationSelection,
    handleFormChange: fatherHandleFormChange,
    getCountryOptions: fatherGetCountryOptions,
    getLocationOptions: fatherGetLocationOptions,
    getFilteredInputGroups: fatherGetFilteredInputGroups,
    locationTypesObjItems: fatherLocationTypesObjItems,
  } = useLocationSelector();

  // useEffect to set location_parent_id
  useEffect(() => {
    onFormDataUpdate({
      father_location_parent_id:
        fatherLocationTypesObjItems.length > 0
          ? fatherLocationTypesObjItems[fatherLocationTypesObjItems.length - 1]
              .id
          : null,
    });
  }, [fatherLocationTypesObjItems]);

  // useEffect to set location name
  useEffect(() => {
    onFormDataUpdate({
      father_location_name: fatherLocationFormData.location_name,
    });
  }, [fatherLocationFormData.location_name]);

  // mother location hook

  const {
    selectedCountry: motherSelectedCountry,
    formData: motherLocationFormData,
    errors: motherErrors,
    setErrors: setMotherErrors,
    isFetching: motherIsFetching,
    handleLocationSelection: motherHandleLocationSelection,
    handleFormChange: motherHandleFormChange,
    getCountryOptions: motherGetCountryOptions,
    getLocationOptions: motherGetLocationOptions,
    getFilteredInputGroups: motherGetFilteredInputGroups,
    locationTypesObjItems: motherLocationTypesObjItems,
  } = useLocationSelector();

  // useEffect to set location_parent_id

  useEffect(() => {
    onFormDataUpdate({
      mother_location_parent_id:
        motherLocationTypesObjItems.length > 0
          ? motherLocationTypesObjItems[motherLocationTypesObjItems.length - 1]
              .id
          : null,
    });
  }, [motherLocationTypesObjItems]);

  // useEffect to set location name

  useEffect(() => {
    onFormDataUpdate({
      mother_location_name: motherLocationFormData.location_name,
    });
  }, [motherLocationFormData.location_name]);

  // Handle next step with validation
  const handleNextStepWithValidation = async () => {
    try {
      // Validate step 2 data
      const step2Data = {
        legalGuardianType: formData.legal_guardian_type,
        father_first_name: formData.father_first_name,
        father_last_name: formData.father_last_name,
        father_mobile: formData.father_mobile,
        father_email: formData.father_email,
        // Only validate father location if address is different
        ...(formData.father_address === "diff" && {
          father_location: fatherLocationTypesObjItems,
          father_location_name: fatherLocationFormData.location_name,
        }),
        isSameStudentAddressForFather: formData.father_address === "same",
        mother_first_name: formData.mother_first_name,
        mother_last_name: formData.mother_last_name,
        mother_mobile: formData.mother_mobile,
        mother_email: formData.mother_email,
        // Only validate mother location if address is different
        ...(formData.mother_address === "diff" && {
          mother_location: motherLocationTypesObjItems,
          mother_location_name: motherLocationFormData.location_name,
        }),
        isSameStudentAddressForMother: formData.mother_address === "same",
      };

      await studentGuardianInfoValidationSchema.validate(step2Data, {
        abortEarly: false,
      });

      // Clear any existing errors
      setInfoErrors({});

      // Proceed to next step
      onNextStep();
    } catch (validationErrors) {
      const errors = {};
      validationErrors.inner.forEach((error) => {
        errors[error.path] = error.message;
      });

      setMotherErrors(errors);
      setFatherErrors(errors);
      setInfoErrors(errors);
    }
  };

  return (
    <div className={`w-full ${className || ""}`}>
      <p className="font-bold uppercase mb-3 text-12 ">Guardian & Parents</p>

      {/* Legal Guardian Type */}
      <div className=" mb-3 md:w-[50%] text-primary-brand-default ">
        <div>
          <SelectBox
            label="Legal Guardian Type"
            name="legal_guardian_type"
            list={Object.values(LegalGuardianType).map((item) => ({
              label:
                item
                  .replace("_", " ")
                  .replace("_", " ")
                  .charAt(0)
                  .toUpperCase() +
                item.replace("_", " ").replace("_", " ").slice(1),
              value: item,
            }))}
            defaultValue={formData.legal_guardian_type}
            handler={(value) =>
              handleSelectChange("legal_guardian_type", value)
            }
            error={infoErrors.legalGuardianType}
            isRequired
          />
          {infoErrors.legalGuardianType && (
            <p className="text-red-500 text-sm mb-2">
              {infoErrors.legalGuardianType}
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-4">
        <InputWithLabel
          label={"Father's E-mail"}
          placeholder={"Email"}
          type={"email"}
          name="father_email"
          onBlur={(e) => checkEmail(e.target.value, "father")}
          handler={handleInputChange}
          isRequired
          value={formData.father_email}
          error={infoErrors.father_email}
        />
        {formData.father_id ? (
          <>
            <InputBluePrint
              label={"Phone Number"}
              value={formData.father_mobile}
            />
          </>
        ) : (
          <>
            {/* <InputWithLabel
            label={"Phone Number"}
            placeholder={"Phone Number"}
            type={"text"}
            name="father_mobile"
            handler={handleInputChange}
            isRequired
            value={formData.father_mobile}
            error={infoErrors.father_mobile}
          /> */}
            <div>
              <label className="text-14 font-bold flex">
                Phone Number<sup className="text-danger-700">*</sup>
              </label>
              <div
                className={`mt-1 rounded-[4px] border  w-full focus-within:outline focus-within:outline-2 focus-within:outline-blue-700 ${
                  infoErrors && infoErrors.father_mobile
                    ? "border-danger-700"
                    : "border-[#798295]"
                }`}
              >
                <div className="relative">
                  {/* country select button */}
                  <div className="flex items-center">
                    <div className="flex space-x-2 items-center">
                      <button
                        onClick={() =>
                          setFatherCountryDropDownToggle(
                            !fatherCountryDropDownToggle
                          )
                        }
                        type="button"
                        className="px-3 py-2 border-r border-[#798295]"
                      >
                        <div className="flex space-x-2 items-center">
                          <div className="w-[24px] h-[16px] ">
                            {fatherSelectedDialCountry && (
                              <img
                                src={`/assets/img/countries/${fatherSelectedDialCountry.code}.svg`}
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
                        {fatherSelectedDialCountry &&
                          fatherSelectedDialCountry?.dial_code}
                      </span>
                    </div>
                    <input
                      className={`block px-2  w-full py-[9px] rounded focus:border-0 focus:ring-0 focus:outline-0`}
                      type={"number"}
                      placeholder={"Phone Number"}
                      value={formData.father_mobile}
                      onChange={(e) => handleInputChange(e)}
                      name="father_mobile"
                    />
                  </div>
                  {/* country select dropdown list */}
                  {fatherCountryDropDownToggle && (
                    <div className="absolute left-0 z-10 top-full mt-1 h-[150px] border border-[#798295] bg-white rounded overflow-y-auto overflow-style-none">
                      <ul>
                        {getCountries &&
                          getCountries.length > 0 &&
                          getCountries.map((item, i) => (
                            <li
                              onClick={() =>
                                selectCountryhandler(item, "father")
                              }
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
              {infoErrors.father_mobile && (
                <p className="text-danger-700 text-sm">
                  {infoErrors.father_mobile}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Father's Information */}
      <p className="text-sm font-bold mb-1 mt-3 ">
        Father's Name <span className="text-red-500">*</span>
      </p>
      <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4 ">
        {formData.father_id ? (
          <>
            <InputBluePrint label={""} value={formData.father_first_name} />
            <InputBluePrint label={""} value={formData.father_last_name} />
          </>
        ) : (
          <>
            <InputWithLabel
              label={""}
              placeholder={"First Name"}
              type={"text"}
              name="father_first_name"
              handler={handleInputChange}
              value={formData.father_first_name}
              error={infoErrors.father_first_name}
            />
            <InputWithLabel
              label={""}
              placeholder={"Last Name"}
              type={"text"}
              name="father_last_name"
              handler={handleInputChange}
              value={formData.father_last_name}
              error={infoErrors.father_last_name}
            />
          </>
        )}
      </div>

      {/* Father's Address */}
      <p className="font-bold uppercase mb-3 mt-6 text-12 text-primary-brand-default">
        Fathers Home/Mailing Address
      </p>
      <div className="text-primary-brand-default">
        <div className="flex justify-start items-center gap-3">
          <div className="flex justify-start items-center gap-3">
            <input
              type="radio"
              name="address"
              id="same"
              onChange={() => handleFatherAddressChange("same")}
              checked={formData.father_address === "same"}
              className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
              style={{
                accentColor: "black",
              }}
            />
            <label
              htmlFor="same"
              className={`cursor-pointer ${
                formData.father_address === "same"
                  ? "text-black"
                  : "text-gray-400"
              }`}
            >
              Same as student's address
            </label>
          </div>
          <div className="flex justify-start items-center gap-3">
            <input
              type="radio"
              name="address"
              id="diff"
              onChange={() => handleFatherAddressChange("diff")}
              checked={formData.father_address === "diff"}
              className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
              style={{
                accentColor: "black",
              }}
            />
            <label
              htmlFor="diff"
              className={`cursor-pointer ${
                formData.father_address === "diff"
                  ? "text-black"
                  : "text-gray-400"
              }`}
            >
              Different than student's address
            </label>
          </div>
        </div>
      </div>

      {formData.father_address === "diff" && (
        <div className="w-full mt-4 ">
          <div className="grid 2xl:grid-cols-2 mt-3 lg:grid-cols-2 grid-cols-1 gap-3 ">
            <div>
              <SelectBox
                defaultValue={fatherSelectedCountry?.location_name}
                handler={fatherHandleLocationSelection}
                loading={fatherIsFetching}
                list={fatherGetCountryOptions()}
                isRequired
                label="Country"
                error={fatherErrors?.father_location}
              />
              {fatherErrors?.father_location && (
                <p className="text-danger-700 text-sm">
                  {fatherErrors.father_location}
                </p>
              )}
            </div>
            {/* Dynamic Location Layers */}
            {fatherGetFilteredInputGroups().map((group, index) => (
              <div className="w-full" key={index}>
                <SelectBox
                  isRequired
                  className="blur-anim"
                  handler={fatherHandleLocationSelection}
                  list={fatherGetLocationOptions(group.children)}
                  label={group.type_name}
                  error={fatherErrors?.father_location}
                />
                {fatherErrors?.location && (
                  <p className="text-danger-700 text-sm">
                    {fatherErrors.location}
                  </p>
                )}
              </div>
            ))}

            {/* Street Address Input */}
            <div className="w-full">
              <InputWithLabel
                label="Street Address"
                placeholder="Enter street address"
                type="text"
                value={fatherLocationFormData.location_name}
                name="location_name"
                handler={fatherHandleFormChange}
                error={fatherErrors?.father_location_name}
                isRequired
              />
            </div>
          </div>
        </div>
      )}

      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-3">
        <InputWithLabel
          label={"Mother's E-mail"}
          placeholder={"Email"}
          type={"email"}
          name="mother_email"
          onBlur={(e) => checkEmail(e.target.value, "mother")}
          handler={handleInputChange}
          isRequired
          value={formData.mother_email}
          error={infoErrors.mother_email}
        />

        {formData.mother_id ? (
          <>
            <InputBluePrint
              label={"Phone Number"}
              value={formData.mother_mobile}
            />
          </>
        ) : (
          <>
            {/* <InputWithLabel
              label={"Phone Number"}
              placeholder={"Phone Number"}
              type={"text"}
              name="mother_mobile"
              handler={handleInputChange}
              isRequired
              value={formData.mother_mobile}
              error={infoErrors.mother_mobile}
            /> */}

            <div>
              <label className="text-14 font-bold flex">
                Phone Number<sup className="text-danger-700">*</sup>
              </label>
              <div
                className={`mt-1 rounded-[4px] border  w-full focus-within:outline focus-within:outline-2 focus-within:outline-blue-700 ${
                  infoErrors && infoErrors.mother_mobile
                    ? "border-danger-700"
                    : "border-[#798295]"
                }`}
              >
                <div className="relative">
                  {/* country select button */}
                  <div className="flex items-center">
                    <div className="flex space-x-2 items-center">
                      <button
                        onClick={() =>
                          setMotherCountryDropDownToggle(
                            !motherCountryDropDownToggle
                          )
                        }
                        type="button"
                        className="px-3 py-2 border-r border-[#798295]"
                      >
                        <div className="flex space-x-2 items-center">
                          <div className="w-[24px] h-[16px] ">
                            {motherSelectedDialCountry && (
                              <img
                                src={`/assets/img/countries/${motherSelectedDialCountry.code}.svg`}
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
                        {motherSelectedDialCountry &&
                          motherSelectedDialCountry?.dial_code}
                      </span>
                    </div>
                    <input
                      className={`block px-2  w-full py-[9px] rounded focus:border-0 focus:ring-0 focus:outline-0`}
                      type={"number"}
                      placeholder={"Phone Number"}
                      value={formData.mother_mobile}
                      onChange={(e) => handleInputChange(e)}
                      name="mother_mobile"
                    />
                  </div>
                  {/* country select dropdown list */}
                  {motherCountryDropDownToggle && (
                    <div className="absolute left-0 z-10 top-full mt-1 h-[150px] border border-[#798295] bg-white rounded overflow-y-auto overflow-style-none">
                      <ul>
                        {getCountries &&
                          getCountries.length > 0 &&
                          getCountries.map((item, i) => (
                            <li
                              onClick={() =>
                                selectCountryhandler(item, "mother")
                              }
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
              {infoErrors.mother_mobile && (
                <p className="text-danger-700 text-sm">
                  {infoErrors.mother_mobile}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mother's Information */}
      <p className="text-sm font-bold mb-1 mt-3 text-primary-brand-default">
        Mother's Name <span className="text-red-500">*</span>
      </p>
      <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
        {formData.mother_id ? (
          <>
            <InputBluePrint label={""} value={formData.mother_first_name} />
            <InputBluePrint label={""} value={formData.mother_last_name} />
          </>
        ) : (
          <>
            <InputWithLabel
              label={""}
              placeholder={"First Name"}
              type={"text"}
              name="mother_first_name"
              handler={handleInputChange}
              value={formData.mother_first_name}
              error={infoErrors.mother_first_name}
            />
            <InputWithLabel
              label={""}
              placeholder={"Last Name"}
              type={"text"}
              name="mother_last_name"
              handler={handleInputChange}
              value={formData.mother_last_name}
              error={infoErrors.mother_last_name}
            />
          </>
        )}
      </div>

      {/* Mother's Address */}
      <p className="font-bold uppercase mb-3 mt-6 text-12 text-primary-brand-default">
        Mothers Home/Mailing Address
      </p>
      <div className=" mb-6">
        <div className="flex justify-start items-center gap-3">
          <div className="flex justify-start items-center gap-3">
            <input
              type="radio"
              name="address1"
              id="same1"
              onChange={() => handleMotherAddressChange("same")}
              checked={formData.mother_address === "same"}
              className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
              style={{
                accentColor: "black",
              }}
            />
            <label
              htmlFor="same1"
              className={`cursor-pointer ${
                formData.mother_address === "same"
                  ? "text-black"
                  : "text-gray-400"
              }`}
            >
              Same as student's address
            </label>
          </div>
          <div className="flex justify-start items-center gap-3">
            <input
              type="radio"
              name="address1"
              id="diff1"
              onChange={() => handleMotherAddressChange("diff")}
              checked={formData.mother_address === "diff"}
              className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
              style={{
                accentColor: "black",
              }}
            />
            <label
              htmlFor="diff1"
              className={`cursor-pointer ${
                formData.mother_address === "diff"
                  ? "text-black"
                  : "text-gray-400"
              }`}
            >
              Different than student's address
            </label>
          </div>
        </div>
      </div>

      {formData.mother_address === "diff" && (
        <div className="w-full mt-4">
          <div className="grid 2xl:grid-cols-2 mt-3 lg:grid-cols-2 grid-cols-1 gap-3 ">
            <div>
              <SelectBox
                defaultValue={motherSelectedCountry?.location_name}
                handler={motherHandleLocationSelection}
                loading={motherIsFetching}
                list={motherGetCountryOptions()}
                isRequired
                label="Country"
                error={motherErrors?.mother_location}
              />
              {motherErrors?.mother_location && (
                <p className="text-danger-700 text-sm">
                  {motherErrors.mother_location}
                </p>
              )}
            </div>

            {/* Dynamic Location Layers */}
            {motherGetFilteredInputGroups().map((group, index) => (
              <div className="w-full" key={index}>
                <SelectBox
                  isRequired
                  className="blur-anim"
                  handler={motherHandleLocationSelection}
                  list={motherGetLocationOptions(group.children)}
                  label={group.type_name}
                  error={motherErrors?.mother_location}
                />
                {motherErrors?.location && (
                  <p className="text-danger-700 text-sm">
                    {motherErrors.location}
                  </p>
                )}
              </div>
            ))}

            {/* Street Address Input */}
            <div className="w-full">
              <InputWithLabel
                label="Street Address"
                placeholder="Enter street address"
                type="text"
                value={motherLocationFormData.location_name}
                name="location_name"
                handler={motherHandleFormChange}
                error={motherErrors?.mother_location_name}
                isRequired
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={onPrevStep}
          className="bg-black border border-black rounded-[8px] py-3 text-white font-bold block mx-auto mt-4 w-full"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNextStepWithValidation}
          className="bg-black border border-black rounded-[8px] py-3 text-white font-bold block mx-auto mt-4 w-full"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2GuardianParents;
