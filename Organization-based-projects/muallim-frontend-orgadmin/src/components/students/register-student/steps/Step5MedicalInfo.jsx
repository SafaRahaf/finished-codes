import React, { useState } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { DownArrowSvg } from "@/components/helpers/storeAllSvgs";

/**
 * Step 5: Medical Information Component
 * Handles medical information, rules acknowledgment, and parent signature
 */
const Step5MedicalInfo = ({
  formData,
  onFormDataUpdate,
  onPrevStep,
  onSubmit,
  className,
  physicianCountryDropDownToggle,
  setPhysicianCountryDropDownToggle,
  physicianSelectedDialCountry,
  selectCountryhandler,
  getCountries,
  setGetCountries,
}) => {
  // Add state for checkbox validation
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormDataUpdate({ [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    onFormDataUpdate({ [name]: value });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    onFormDataUpdate({ [name]: checked });

    // Clear error when checkbox is checked
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!formData.rules) {
      newErrors.rules = "You must agree to the rules & regulations";
    }

    if (!formData.acknowledge) {
      newErrors.acknowledge = "You must acknowledge the information";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with validation
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <div className={`${className || ""}`}>
      <p className="font-bold uppercase mb-3 mt-4 text-12 text-primary-brand-default">
        Medical Info
      </p>

      {/* Medical Information Fields */}
      <div className="grid mt-4 items-start justify-center lg:grid-cols-2 grid-cols-1 gap-4">
        <SelectBox
          label="Blood Group"
          name="blood_group"
          list={[
            { label: "A+", value: "A+" },
            { label: "A-", value: "A-" },
            { label: "B+", value: "B+" },
            { label: "B-", value: "B-" },
            { label: "AB+", value: "AB+" },
            { label: "AB-", value: "AB-" },
            { label: "O+", value: "O+" },
            { label: "O-", value: "O-" },
          ]}
          defaultValue={formData.blood_group}
          handler={(value) => handleSelectChange("blood_group", value)}
          inputHeight="!h-[44px]"
        />

        <InputWithLabel
          label={"Allergies"}
          placeholder={"Allergies"}
          type={"text"}
          name="allergies"
          handler={handleInputChange}
          value={formData.allergies}
        />

        <div className="lg:col-span-2 col-span-1">
          <InputWithLabel
            label={
              "Significant Medical History (Surgery, injury, serious illness etc.)"
            }
            placeholder={"Surgery, injury, serious illness etc."}
            type={"text"}
            name="significant_medical_history"
            handler={handleInputChange}
            value={formData.significant_medical_history}
          />
        </div>

        <InputWithLabel
          label={"Medical Problems"}
          placeholder={"Medical Problems"}
          type={"text"}
          name="medical_problems"
          handler={handleInputChange}
          value={formData.medical_problems}
        />

        <InputWithLabel
          label={"Regular Medications"}
          placeholder={"Regular Medications"}
          type={"text"}
          name="regular_medications"
          handler={handleInputChange}
          value={formData.regular_medications}
        />

        <InputWithLabel
          label={"Physician (Name)"}
          placeholder={"Physician (Name)"}
          type={"text"}
          name="physician_name"
          handler={handleInputChange}
          value={formData.physician_name}
        />
        <div>
          <label className="text-14 font-bold flex">
            Physicians' Mobile No
          </label>
          <div
            className={`mt-1 rounded-[4px] border  w-full focus-within:outline focus-within:outline-2 focus-within:outline-blue-700 border-[#798295]`}
          >
            <div className="relative">
              {/* country select button */}
              <div className="flex items-center">
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() =>
                      setPhysicianCountryDropDownToggle(
                        !physicianCountryDropDownToggle
                      )
                    }
                    type="button"
                    className="px-3 py-2 border-r border-[#798295]"
                  >
                    <div className="flex space-x-2 items-center">
                      <div className="w-[24px] h-[16px] ">
                        {physicianSelectedDialCountry && (
                          <img
                            src={`/assets/img/countries/${physicianSelectedDialCountry.code}.svg`}
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
                    {physicianSelectedDialCountry &&
                      physicianSelectedDialCountry?.dial_code}
                  </span>
                </div>
                <input
                  className={`block px-2  w-full py-[9px] rounded focus:border-0 focus:ring-0 focus:outline-0`}
                  type={"number"}
                  placeholder={"Phone Number"}
                  value={formData.physician_mobile_no}
                  onChange={(e) => handleInputChange(e)}
                  name="physician_mobile_no"
                />
              </div>
              {/* country select dropdown list */}
              {physicianCountryDropDownToggle && (
                <div className="absolute left-0 z-10 top-full mt-1 h-[150px] border border-[#798295] bg-white rounded overflow-y-auto overflow-style-none">
                  <ul>
                    {getCountries &&
                      getCountries.length > 0 &&
                      getCountries.map((item, i) => (
                        <li
                          onClick={() =>
                            selectCountryhandler(item, "physician")
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
        </div>
      </div>

      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

      {/* Rules & Regulations */}
      <p className="font-bold mt-4 mb-3 uppercase underline text-primary-brand-default">
        Read Rules & Regulations
      </p>

      <div className="flex justify-start items-start gap-3">
        <input
          type="checkbox"
          checked={formData.rules || false}
          name="rules"
          id="rules"
          className="mt-1"
          onChange={handleCheckboxChange}
        />
        <label
          htmlFor="rules"
          className="font-bold text-sm text-primary-brand-default"
        >
          I, the parent and the student have read, understood, agree to all
          rules & regulations of "organization name".
        </label>
      </div>
      {errors.rules && (
        <p className="text-red-500 text-sm mt-1 ml-6">{errors.rules}</p>
      )}

      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

      {/* Acknowledgment */}
      <div className="flex justify-start items-start gap-3">
        <input
          type="checkbox"
          checked={formData.acknowledge || false}
          name="acknowledge"
          id="acknowledge"
          className="mt-1"
          onChange={handleCheckboxChange}
        />
        <label
          htmlFor="acknowledge"
          className="font-bold text-sm text-primary-brand-default"
        >
          I acknowledge that all the above information is true and up to date.
        </label>
      </div>
      {errors.acknowledge && (
        <p className="text-red-500 text-sm mt-1 ml-6">{errors.acknowledge}</p>
      )}

      {/* Parent Signature */}
      <label
        htmlFor=""
        className="text-sm font-bold mt-6 block text-primary-brand-default"
      >
        Parents Signature
      </label>
      <textarea
        name=""
        className="lg:w-1/2 w-full border rounded-[5px] mt-2 border-[#798295]"
        rows={4}
        id=""
      ></textarea>

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
          onClick={handleSubmit}
          className="bg-black border border-black rounded-[8px] py-3 text-white font-bold block mx-auto mt-4 w-full"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Step5MedicalInfo;
