import React, { useState, useEffect } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { bloodGroupTypes } from "@/constants/bloodGroupTypes";
import { useUpdateStudentMedicalInfoMutation } from "@/store/features/student-management/apiSlice";
import countryCodesFromJson from "../../../data/CountryCodes.json";
import { DownArrowSvg } from "@/components/helpers/storeAllSvgs";

const bloodGroupList = Object.values(bloodGroupTypes);

const MedicalInfoStep = ({ studentInfo }) => {
  const studentMedicalInfo = studentInfo?.people_medical_information;

  const [medicalInfo, setMedicalInfo] = useState({
    blood_group: studentMedicalInfo?.blood_group || null,
    allergies: studentMedicalInfo?.allergies || null,
    medical_problems: studentMedicalInfo?.medical_problems || null,
    regular_medications: studentMedicalInfo?.regular_medications || null,
    significant_medical_history:
      studentMedicalInfo?.significant_medical_history || null,
    physician_name: studentMedicalInfo?.physician_name || null,
    physician_mobile_no: studentMedicalInfo?.physician_mobile_no || null,
  });

  // Country code states
  const [countryDropDowntoggle, setCountryDropDownToggle] = useState(false);
  const [getCountries, setGetCountries] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [physicianPhone, setPhysicianPhone] = useState("");

  const [updateStudentMedicalInfo, { isLoading }] =
    useUpdateStudentMedicalInfoMutation();

  // Initialize countries data
  useEffect(() => {
    if (!getCountries) {
      setGetCountries(countryCodesFromJson && countryCodesFromJson.countries);
      const findDefaultCountry =
        countryCodesFromJson && countryCodesFromJson.countries.length > 0
          ? countryCodesFromJson.countries.find(
              (country) => country.code === "US"
            )
          : null;
      setSelectedCountry(findDefaultCountry);
    }
  }, [getCountries]);

  // Helper: detect country by dial code (longest first), return {country, local}
  const detectCountryByDialCode = (fullNumber) => {
    if (!fullNumber || !getCountries || getCountries.length === 0) return null;
    const sorted = [...getCountries].sort(
      (a, b) => b.dial_code.length - a.dial_code.length
    );
    const trimmed = String(fullNumber).replace(/\s+/g, "");
    for (const c of sorted) {
      if (trimmed.startsWith(c.dial_code)) {
        return {
          country: c,
          local: trimmed.slice(c.dial_code.length),
        };
      }
    }
    return null;
  };

  // Initialize physician phone data
  useEffect(() => {
    if (studentMedicalInfo?.physician_mobile_no) {
      const detected = detectCountryByDialCode(
        String(studentMedicalInfo.physician_mobile_no)
      );
      if (detected?.country) {
        setSelectedCountry(detected.country);
        setPhysicianPhone(detected.local);
      } else {
        setPhysicianPhone(studentMedicalInfo.physician_mobile_no);
      }
    }
  }, [studentMedicalInfo?.physician_mobile_no]);

  const selectCountryhandler = (value) => {
    setSelectedCountry(value);
    setCountryDropDownToggle(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBloodGroupChange = (value) => {
    setMedicalInfo((prev) => ({
      ...prev,
      blood_group: value,
    }));
  };

  const handlePhysicianPhoneChange = (e) => {
    const v = e.target.value;
    // If user pastes with code, auto-detect and strip prefix
    if (v?.trim().startsWith("+")) {
      const detected = detectCountryByDialCode(v.trim());
      if (detected?.country) {
        setSelectedCountry(detected.country);
        setPhysicianPhone(detected.local);
        return;
      }
    }
    setPhysicianPhone(v);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare the payload with country code
    const payload = {
      ...medicalInfo,
      physician_mobile_no:
        physicianPhone && selectedCountry?.dial_code
          ? selectedCountry.dial_code + physicianPhone
          : physicianPhone,
    };

    updateStudentMedicalInfo({
      peopleId: studentInfo?.id,
      payload: payload,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-3">
        <SelectBox
          defaultValue={medicalInfo.blood_group}
          list={bloodGroupList.map((item) => ({
            label: item,
            value: item,
          }))}
          label={"Blood Group"}
          handler={handleBloodGroupChange}
        />
        <InputWithLabel
          label="Allergies"
          placeholder="Allergies"
          type="text"
          name="allergies"
          value={medicalInfo.allergies}
          handler={handleChange}
        />
        <InputWithLabel
          label="Medical Problems"
          placeholder="Diabetes"
          type="text"
          name="medical_problems"
          value={medicalInfo.medical_problems}
          handler={handleChange}
        />
        <InputWithLabel
          label="Regular Medications"
          placeholder="Regular Medications"
          type="text"
          name="regular_medications"
          value={medicalInfo.regular_medications}
          handler={handleChange}
        />
        <InputWithLabel
          label="Significant Medical History (Surgery, injury, serious illness etc.)"
          placeholder="Surgery, injury, serious illness"
          type="text"
          name="significant_medical_history"
          value={medicalInfo.significant_medical_history}
          handler={handleChange}
        />
        <hr className="my-4" />
        <InputWithLabel
          label="Physician's Name"
          placeholder="David Ant"
          type="text"
          name="physician_name"
          value={medicalInfo.physician_name}
          handler={handleChange}
        />

        {/* Physician's Contact with Country Code */}
        <div>
          <label className="text-14 font-bold">
            Physician's Contact <sup className="text-danger-700 text-sm">*</sup>
          </label>
          <div className="mt-1 rounded-[4px] border w-full border-[#798295]">
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
                      <div className="w-[24px] h-[16px]">
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
                  className="block px-2 w-full py-[9px] rounded focus:border-0 focus:ring-0 focus:outline-0"
                  placeholder="Physician's Contact"
                  type="text"
                  value={physicianPhone}
                  onChange={handlePhysicianPhoneChange}
                />
              </div>
              {/* country code select dropdown list */}
              {countryDropDowntoggle && (
                <div className="absolute left-0 top-full z-10 mt-1 h-[150px] border border-[#798295] bg-white rounded overflow-y-auto overflow-style-none">
                  <ul>
                    {getCountries &&
                      getCountries.length > 0 &&
                      getCountries.map((item, i) => (
                        <li
                          onClick={() => selectCountryhandler(item)}
                          key={i}
                          className={`flex space-x-1.5 items-center px-3 py-1 cursor-pointer hover:bg-gray-100 ${
                            selectedCountry &&
                            selectedCountry.code === item.code
                              ? "bg-blue-50 text-blue-600"
                              : ""
                          }`}
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
      <div className="mb-3 text-right mt-20">
        <button
          type="submit"
          className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default MedicalInfoStep;
