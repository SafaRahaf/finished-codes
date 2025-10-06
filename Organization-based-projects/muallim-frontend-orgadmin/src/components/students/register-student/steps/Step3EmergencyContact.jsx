import React, { useEffect } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import useLocationSelector from "@/hooks/useLocationSelector";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { studentEmergencyContactInfoValidationSchema } from "@/utilities/validationRules/schemas/studentCompletionSchema";
import { GuardianType } from "@/constants/guardianPeopleType";
import { DownArrowSvg } from "@/components/helpers/storeAllSvgs";

/**
 * Step 3: Emergency Contact Component
 * Handles emergency contact person information and guardian relationship
 */
const Step3EmergencyContact = ({
  formData,
  onFormDataUpdate,
  onNextStep,
  onPrevStep,
  infoErrors,
  setInfoErrors,
  className,
  contactPersonCountryDropDownToggle,
  setContactPersonCountryDropDownToggle,
  contactPersonSelectedDialCountry,
  selectCountryhandler,
  getCountries,
  setGetCountries,
}) => {
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormDataUpdate({ [name]: value });

    // Clear error when user starts typing
    if (infoErrors[name]) {
      setInfoErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name, value) => {
    onFormDataUpdate({ [name]: value });
  };

  // Handle guardian emergency contact preference
  const handleGuardianEmergencyContact = (value) => {
    onFormDataUpdate({ is_legal_guardian_emergency_contact: value });
  };

  // Handle next step with validation
  const handleNextStepWithValidation = async () => {
    try {
      // Only validate if guardian is NOT the emergency contact
      if (formData.is_legal_guardian_emergency_contact === false) {
        const step3Data = {
          emergency_contact_name:
            `${formData.contact_person_first_name} ${formData.contact_person_last_name}`.trim(),
          emergency_contact_mobile: formData.contact_person_mobile,
          emergency_contact_email: formData.contact_person_email,
          relation: formData.relation_with_contact_person,
          // Only validate location if guardian is not emergency contact
          emergency_contact_location: locationTypesObjItems,
          emergency_contact_location_name: locationFormData.location_name,
        };

        await studentEmergencyContactInfoValidationSchema.validate(step3Data, {
          abortEarly: false,
        });
      }

      // Clear any existing errors
      setInfoErrors({});

      // Proceed to next step
      onNextStep();
    } catch (validationErrors) {
      const errors = {};
      validationErrors.inner.forEach((error) => {
        // Map validation field names to form field names
        if (error.path === "emergency_contact_name") {
          errors.contact_person_first_name = "Contact person name is required";
        } else if (error.path === "emergency_contact_mobile") {
          errors.contact_person_mobile = error.message;
        } else if (error.path === "emergency_contact_email") {
          errors.contact_person_email = error.message;
        } else if (error.path === "relation") {
          errors.relation_with_contact_person = error.message;
        } else if (error.path === "emergency_contact_location") {
          errors.location = error.message;
        } else if (error.path === "emergency_contact_location_name") {
          errors.location_name = error.message;
        } else {
          errors[error.path] = error.message;
        }
      });
      setInfoErrors(errors);
    }
  };

  // location hook

  const {
    selectedCountry,
    formData: locationFormData,
    errors,
    isFetching,
    handleLocationSelection,
    handleFormChange,
    getCountryOptions,
    getLocationOptions,
    getFilteredInputGroups,
    locationTypesObjItems,
  } = useLocationSelector();

  // useEffect to set location_parent_id
  useEffect(() => {
    onFormDataUpdate({
      emergency_contact_person_location_parent_id:
        locationTypesObjItems.length > 0
          ? locationTypesObjItems[locationTypesObjItems.length - 1].id
          : null,
    });
  }, [locationTypesObjItems]);

  // useEffect to set location name
  useEffect(() => {
    onFormDataUpdate({
      emergency_contact_person_location_name: locationFormData.location_name,
    });
  }, [locationFormData.location_name]);

  return (
    <div className={`w-full ${className || ""}`}>
      <p className="font-bold uppercase mb-3 text-12 text-primary-brand-default">
        Emergency Contact Person
      </p>

      {/* Guardian Emergency Contact Question */}
      <div className="mb-3">
        <label
          htmlFor=""
          className="text-sm font-bold mb-2 text-primary-brand-default"
        >
          Is the legal guardian the emergency contact person also?
        </label>
        <div className="flex justify-start items-center gap-3 mt-2">
          <div className="flex justify-start items-center gap-3">
            <input
              type="radio"
              name="legal_guardian"
              id="yes"
              onChange={() => handleGuardianEmergencyContact(true)}
              checked={formData.is_legal_guardian_emergency_contact}
              className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
              style={{
                accentColor: "black",
              }}
            />
            <label
              htmlFor="yes"
              className={`cursor-pointer ${
                formData.is_legal_guardian_emergency_contact
                  ? "text-black"
                  : "text-gray-400"
              }`}
            >
              Yes
            </label>
          </div>
          <div className="flex justify-start items-center gap-3">
            <input
              type="radio"
              name="legal_guardian"
              id="no"
              onChange={() => handleGuardianEmergencyContact(false)}
              checked={!formData.is_legal_guardian_emergency_contact}
              className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
              style={{
                accentColor: "black",
              }}
            />
            <label
              htmlFor="no"
              className={`cursor-pointer ${
                !formData.is_legal_guardian_emergency_contact
                  ? "text-black"
                  : "text-gray-400"
              }`}
            >
              No
            </label>
          </div>
        </div>
      </div>

      {/* Contact Person Name */}
      {formData.is_legal_guardian_emergency_contact === false && (
        <>
          <p className="text-sm font-bold mb-1 mt-4 text-primary-brand-default">
            Contact Persons Name <span className="text-red-500">*</span>
          </p>
          <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
            <InputWithLabel
              label={""}
              placeholder={"Person Name"}
              type={"text"}
              name="contact_person_first_name"
              handler={handleInputChange}
              value={formData.contact_person_first_name}
              error={infoErrors.contact_person_first_name}
            />
            {/* <InputWithLabel
              label={""}
              placeholder={"Last Name"}
              type={"text"}
              name="contact_person_last_name"
              handler={handleInputChange}
              value={formData.contact_person_last_name}
            /> */}
          </div>
          {/* Contact Person Details */}
          <div className="grid mt-4 items-center justify-center lg:grid-cols-2 grid-cols-1 gap-4">
            {/* <InputWithLabel
              label={"Phone Number"}
              placeholder={"Phone Number"}
              type={"text"}
              name="contact_person_mobile"
              handler={handleInputChange}
              isRequired
              value={formData.contact_person_mobile}
              error={infoErrors.contact_person_mobile}
            /> */}
            <div>
              <label className="text-14 font-bold flex">
                Phone Number<sup className="text-danger-700">*</sup>
              </label>
              <div
                className={`mt-1 rounded-[4px] border  w-full focus-within:outline focus-within:outline-2 focus-within:outline-blue-700 ${
                  infoErrors && infoErrors.contact_person_mobile
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
                          setContactPersonCountryDropDownToggle(
                            !contactPersonCountryDropDownToggle
                          )
                        }
                        type="button"
                        className="px-3 py-2 border-r border-[#798295]"
                      >
                        <div className="flex space-x-2 items-center">
                          <div className="w-[24px] h-[16px] ">
                            {contactPersonSelectedDialCountry && (
                              <img
                                src={`/assets/img/countries/${contactPersonSelectedDialCountry.code}.svg`}
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
                        {contactPersonSelectedDialCountry &&
                          contactPersonSelectedDialCountry?.dial_code}
                      </span>
                    </div>
                    <input
                      className={`block px-2  w-full py-[9px] rounded focus:border-0 focus:ring-0 focus:outline-0`}
                      type={"number"}
                      placeholder={"Phone Number"}
                      value={formData.contact_person_mobile}
                      onChange={(e) => handleInputChange(e)}
                      name="contact_person_mobile"
                    />
                  </div>
                  {/* country select dropdown list */}
                  {contactPersonCountryDropDownToggle && (
                    <div className="absolute left-0 z-10 top-full mt-1 h-[150px] border border-[#798295] bg-white rounded overflow-y-auto overflow-style-none">
                      <ul>
                        {getCountries &&
                          getCountries.length > 0 &&
                          getCountries.map((item, i) => (
                            <li
                              onClick={() =>
                                selectCountryhandler(item, "contact_person")
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
              {infoErrors.contact_person_mobile && (
                <p className="text-danger-700 text-sm">
                  {infoErrors.contact_person_mobile}
                </p>
              )}
            </div>
            <InputWithLabel
              label={"E-mail"}
              placeholder={"E-mail"}
              type={"text"}
              name="contact_person_email"
              handler={handleInputChange}
              isRequired
              value={formData.contact_person_email}
              error={infoErrors.contact_person_email}
            />
            <div>
              <SelectBox
                label="Relation"
                name="relation_with_contact_person"
                list={Object.values(GuardianType).map((item) => ({
                  label: item,
                  value: item,
                }))}
                defaultValue={formData.relation_with_contact_person}
                handler={(value) =>
                  handleSelectChange("relation_with_contact_person", value)
                }
                isRequired
                error={infoErrors.relation_with_contact_person}
              />
              {infoErrors?.relation_with_contact_person && (
                <p className="text-danger-700 text-sm">
                  {infoErrors.relation_with_contact_person}
                </p>
              )}
            </div>
          </div>
          <div className="w-full mt-4">
            <div className="grid 2xl:grid-cols-2 mt-3 lg:grid-cols-2 grid-cols-1 gap-3 ">
              <SelectBox
                defaultValue={selectedCountry?.location_name}
                handler={handleLocationSelection}
                loading={isFetching}
                list={getCountryOptions()}
                // isRequired
                label="Country"
              />

              {/* Dynamic Location Layers */}
              {getFilteredInputGroups().map((group, index) => (
                <>
                  <SelectBox
                    key={index}
                    // isRequired
                    className="blur-anim"
                    handler={handleLocationSelection}
                    list={getLocationOptions(group.children)}
                    label={group.type_name}
                  />
                  {errors?.location && (
                    <p className="text-danger-700 text-sm">{errors.location}</p>
                  )}
                </>
              ))}

              {/* Street Address Input */}
              <InputWithLabel
                label="Street Address"
                placeholder="Enter street address"
                type="text"
                value={locationFormData.location_name}
                name="location_name"
                handler={handleFormChange}
                error={errors?.location_name}
                // isRequired
              />
            </div>
          </div>{" "}
        </>
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

export default Step3EmergencyContact;
