import React, { useEffect } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { GradeType } from "@/constants/GradeType";
import useLocationSelector from "@/hooks/useLocationSelector";
import { useGetGroupsQuery } from "@/store/features/class-management/apiSlice";
import { useGetAllAuthOrganizationsQuery } from "@/store/features/auth/apiSlice";
import InputBluePrint from "@/components/common/Inputs/Input/InputBluePrint";

/**
 * Step 4: Education Background Component
 * Handles educational history, madrasa information, and admission details
 */

const Step4EducationBackground = ({
  formData,
  onFormDataUpdate,
  depts,
  grades,
  setGrades,
  onNextStep,
  onPrevStep,
  className,
}) => {
  // Get organizations list
  const { data: organizationsData } = useGetAllAuthOrganizationsQuery();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormDataUpdate({ [name]: value });
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    onFormDataUpdate({ [name]: value });
  };

  const selectDepartmentHandler = (name, value, option) => {
    onFormDataUpdate({ [name]: value });
    setGrades(
      option?.class_id && option?.class_id.length > 0 ? option?.class_id : []
    );
  };

  const selectGradeHandler = (name, value, option) => {
    onFormDataUpdate({
      [name]: value,
      grade_name: option?.class_name,
      class_type_name: option?.class_type_org_id?.class_type_id?.type_name,
    });
  };

  // Handle radio button changes
  const handleRadioChange = (name, value) => {
    onFormDataUpdate({ [name]: value });
  };

  const handleJuzCheckbox = (value) => {
    const juzArr = formData?.memorised_juzs?.includes(Number(value))
      ? formData?.memorised_juzs?.filter((juz) => juz !== Number(value))
      : [...formData?.memorised_juzs, Number(value)];
    onFormDataUpdate({ memorised_juzs: juzArr });
  };

  // Handle organization change
  const handleOrganizationChange = (value, option) => {
    if (option) {
      onFormDataUpdate({
        organization: {
          is_exist: "true",
          id: option.value,
          name: option.label,
        },
      });
    }
    if (value && !option) {
      onFormDataUpdate({
        organization: {
          is_exist: "false",
          id: null,
          name: value,
        },
      });
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
      organization_location_parent_id:
        locationTypesObjItems.length > 0
          ? locationTypesObjItems[locationTypesObjItems.length - 1].id
          : null,
    });
  }, [locationTypesObjItems]);

  // useEffect to set location name
  useEffect(() => {
    onFormDataUpdate({
      organization_location_name: locationFormData.location_name,
    });
  }, [locationFormData.location_name]);

  return (
    <div className={`w-full ${className || ""}`}>
      <p className="font-bold uppercase mb-4 text-12 text-primary-brand-default">
        Education Background
      </p>
      {/* Madrasa/Islamic School Information */}
      <div className="mb-3">
        <label htmlFor="" className="text-sm font-bold mb-2">
          Has He/She Studied in A Madrasa/Islamic School Before?
        </label>
        <div className="flex justify-start items-center gap-3 mt-2">
          <div className="flex justify-start items-center gap-3">
            <input
              type="radio"
              name="studied_in_madrasa"
              id="yes"
              onChange={() => handleRadioChange("studied_in_madrasa", true)}
              checked={formData.studied_in_madrasa}
              className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
              style={{
                accentColor: "black",
              }}
            />
            <label
              htmlFor="yes"
              className={`cursor-pointer ${
                formData.studied_in_madrasa ? "text-black" : "text-gray-400"
              }`}
            >
              Yes
            </label>
          </div>
          <div className="flex justify-start items-center gap-3">
            <input
              type="radio"
              name="studied_in_madrasa"
              id="no"
              onChange={() => handleRadioChange("studied_in_madrasa", false)}
              checked={!formData.studied_in_madrasa}
              className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
              style={{
                accentColor: "black",
              }}
            />
            <label
              htmlFor="no"
              className={`cursor-pointer ${
                !formData.studied_in_madrasa ? "text-black" : "text-gray-400"
              }`}
            >
              No
            </label>
          </div>
        </div>
      </div>
      {/* Conditional: Madrasa/Islamic School Information if yes */}
      {formData.studied_in_madrasa && (
        <>
          <div className="grid mt-4 items-center justify-center lg:grid-cols-2 grid-cols-1 gap-4">
            {/* Organization Selection */}
            <div>
              <SelectBox
                defaultValue={
                  formData?.organization?.id
                    ? organizationsData?.data?.find(
                        (item) => item.id === formData?.organization?.id
                      )?.name
                    : formData?.organization?.name
                    ? formData?.organization?.name
                    : null
                }
                handler={(value, option) =>
                  handleOrganizationChange(value, option)
                }
                list={
                  organizationsData?.data?.map((item) => ({
                    label: item.name,
                    value: item.id,
                  })) || []
                }
                isAcceptstring
                label="Select Existing Madrasa/Islamic School"
              />
            </div>
            <InputWithLabel
              label={"How many years did he/she attend?"}
              placeholder={"1"}
              type={"text"}
              name="attended_years_of_madrasa"
              handler={handleInputChange}
              value={formData.attended_years_of_madrasa}
            />
          </div>

          {/* Conditional: Location fields for new organization */}
          {formData?.organization?.is_exist === "false" && (
            <div className="w-full mt-4">
              <div className="grid 2xl:grid-cols-2 mt-3 lg:grid-cols-2 grid-cols-1 gap-3 ">
                <SelectBox
                  defaultValue={selectedCountry?.location_name}
                  handler={handleLocationSelection}
                  loading={isFetching}
                  list={getCountryOptions()}
                  label="Country"
                />

                {/* Dynamic Location Layers */}
                {getFilteredInputGroups().map((group, index) => (
                  <SelectBox
                    key={index}
                    className="blur-anim"
                    handler={handleLocationSelection}
                    list={getLocationOptions(group.children)}
                    label={group.type_name}
                  />
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
                />
              </div>
            </div>
          )}
        </>
      )}

      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

      {/* Public School & Home School Information */}
      <p className="font-bold uppercase text-12 text-primary-brand-default">
        Public School & Home School Information
      </p>
      <div className="grid mt-4 items-start justify-center lg:grid-cols-2 grid-cols-1 gap-4">
        <div>
          <label htmlFor="" className="text-sm font-bold">
            Has He/She Ever Gone to Public School?
          </label>
          <div className="flex justify-start items-center gap-3 mt-2">
            <div className="flex justify-start items-center gap-3">
              <input
                type="radio"
                name="isPublic"
                id="pubYes"
                onChange={() =>
                  handleRadioChange("attended_public_school", true)
                }
                checked={formData.attended_public_school}
                className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
                style={{
                  accentColor: "black",
                }}
              />
              <label
                htmlFor="pubYes"
                className={`cursor-pointer ${
                  formData.attended_public_school
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
                name="isPublic"
                id="pubNo"
                onChange={() =>
                  handleRadioChange("attended_public_school", false)
                }
                checked={!formData.attended_public_school}
                className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
                style={{
                  accentColor: "black",
                }}
              />
              <label
                htmlFor="pubNo"
                className={`cursor-pointer ${
                  !formData.attended_public_school
                    ? "text-black"
                    : "text-gray-400"
                }`}
              >
                No
              </label>
            </div>
          </div>
        </div>
        {/* Conditional: Grade if public school yes */}
        {formData.attended_public_school && (
          <SelectBox
            label="To Grade"
            name="to_grade"
            list={Object.values(GradeType).map((item) => ({
              label: item,
              value: item,
            }))}
            defaultValue={formData.to_grade}
            handler={(value) => handleSelectChange("to_grade", value)}
          />
        )}
      </div>

      <div className="grid mt-4 items-start justify-center lg:grid-cols-2 grid-cols-1 gap-4">
        <div>
          <label htmlFor="" className="text-sm font-bold">
            Is He/She Doing Home Schooling?
          </label>
          <div className="flex justify-start items-center gap-3 mt-2">
            <div className="flex justify-start items-center gap-3">
              <input
                type="radio"
                name="isHomeSchool"
                id="homeYes"
                onChange={() => handleRadioChange("attended_home_school", true)}
                checked={formData.attended_home_school}
                className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
                style={{
                  accentColor: "black",
                }}
              />
              <label
                htmlFor="homeYes"
                className={`cursor-pointer ${
                  formData.attended_home_school ? "text-black" : "text-gray-400"
                }`}
              >
                Yes
              </label>
            </div>
            <div className="flex justify-start items-center gap-3">
              <input
                type="radio"
                name="isHomeSchool"
                id="homeNo"
                onChange={() =>
                  handleRadioChange("attended_home_school", false)
                }
                checked={!formData.attended_home_school}
                className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
                style={{
                  accentColor: "black",
                }}
              />
              <label
                htmlFor="homeNo"
                className={`cursor-pointer ${
                  !formData.attended_home_school
                    ? "text-black"
                    : "text-gray-400"
                }`}
              >
                No
              </label>
            </div>
          </div>
        </div>
        {/* Conditional: Program Name if home schooling yes */}
        {formData.attended_home_school && (
          <div>
            <InputWithLabel
              label="Home Schooling Program Name"
              name="program_name"
              placeholder="Ex. Hifz Program"
              type="text"
              value={formData.program_name}
              handler={handleInputChange}
            />
          </div>
        )}
      </div>

      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

      {/* Admission Information */}
      <p className="font-bold uppercase text-12 text-primary-brand-default mb-4">
        Admission Information (for this organization)
      </p>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">
            Select Department
          </p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {formData?.department_name}
          </div>
        </div>
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">Select Grade</p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {formData?.grade_name}
          </div>
        </div>
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">
            Quran Recitation Level
          </p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {formData.quran_recitation_level}
          </div>
        </div>
      </div>
      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
      {formData.class_type_name === "Hifz" && (
        // {formData.grade_name === "Hifz" && (
        <>
          <p className="font-bold uppercase mb-3 text-12 tracking-wider text-[#383838]">
            Hifz Information
          </p>

          <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 ">
            <div className="w-full">
              <p className="text-14 font-bold flex items-center">
                Number of Memorised Juzs
              </p>
              <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
                {formData.total_memorised_juzs}
              </div>
            </div>
            <div className="w-full">
              <p className="text-14 font-bold flex items-center">
                Current Sabaq Juz
              </p>
              <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
                {formData.current_sabaq_juz}
              </div>
            </div>
          </div>
          <p className="font-bold my-3 text-12 tracking-wider text-[#383838]">
            Select Memorised Juzs{" "}
          </p>
          <div className="flex flex-wrap gap-2 justify-start items-center">
            {Array.from({ length: 30 }, (_, index) => {
              const juzNumber = index + 1;
              return (
                <div className="juz-btn" key={juzNumber}>
                  <input
                    readOnly
                    type="checkbox"
                    name="juz"
                    value={juzNumber}
                    id={`j${juzNumber}`}
                    checked={formData?.memorised_juzs?.includes(juzNumber)}
                  />

                  <label htmlFor={`j${juzNumber}`}>
                    {juzNumber.toString().padStart(2, "0")}
                  </label>
                </div>
              );
            })}
          </div>
          <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
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
          onClick={onNextStep}
          className="bg-black border border-black rounded-[8px] py-3 text-white font-bold block mx-auto mt-4 w-full"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step4EducationBackground;
