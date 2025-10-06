import { useEffect } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import InputFullDate from "@/components/common/Inputs/Input/InputFullDate";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import useLocationSelector from "@/hooks/useLocationSelector";
import { studentPersonalInfoValidationSchema } from "@/utilities/validationRules/schemas/studentCompletionSchema";
import UploadSvg from "@/components/helpers/storeAllSvgs/UploadSvg";
import CrossSvg from "@/components/helpers/storeAllSvgs/CrossSvg";

/**
 * Step 1: Student Information Component
 * Handles basic student information including name, date of birth, gender, and student status
 */
const Step1StudentInfo = ({
  formData,
  onFormDataUpdate,
  infoErrors,
  setInfoErrors,
  onNextStep,
  formDoc,
  isProcessingFile,
  docUploadInput,
  removeFormDoc,
  docUploadChangeHandler,
  className,
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

  // Handle student type change
  const handleStudentTypeChange = (value) => {
    onFormDataUpdate({ status: value });
  };

  // Handle gender change
  const handleGenderChange = (value) => {
    onFormDataUpdate({ gender: value });
  };

  // Handle next step with validation
  const handleNextStepWithValidation = async () => {
    try {
      // Validate step 1 data
      const step1Data = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        dob: formData.dob,
        gender: formData.gender,
        location: locationTypes,
        location_name: locationFormData.location_name,
        profile_picture: formDoc,
      };

      await studentPersonalInfoValidationSchema.validate(step1Data, {
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
      setInfoErrors(errors);
      setLocationErrors(errors);
    }
  };

  // location hook

  const {
    selectedCountry,
    formData: locationFormData,
    errors,
    setErrors: setLocationErrors,
    isFetching,
    locationTypes,
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
      location_parent_id:
        locationTypesObjItems.length > 0
          ? locationTypesObjItems[locationTypesObjItems.length - 1].id
          : null,
    });
  }, [locationTypesObjItems]);

  // useEffect to set location name
  useEffect(() => {
    onFormDataUpdate({
      location_name: locationFormData.location_name,
    });
  }, [locationFormData.location_name]);

  // In the docUploadChangeHandler in index.jsx, the profile picture is being set correctly
  // But let's also ensure it's being passed when the form data updates

  useEffect(() => {
    // Update the parent form data when profile picture changes
    if (formData?.profile_picture) {
      onFormDataUpdate({
        profile_picture: formData.profile_picture,
      });
    }
  }, [formData?.profile_picture]);

  return (
    <div className={`w-full ${className || ""}`}>
      <p className="font-bold uppercase mb-4 text-12">Student Information</p>

      {/* Profile Picture Upload */}

      {/* Hidden file input */}
      <input
        ref={docUploadInput}
        onChange={docUploadChangeHandler}
        accept="image/png, image/jpg, image/jpeg"
        type="file"
        name="profile-upload"
        className="hidden"
        id="profile-upload"
      />

      {/* Student Status */}
      <div>
        <p className="text-14 font-bold mb-2">Student Status</p>
        <div className="flex justify-start items-center gap-6 mb-4">
          <div className="flex justify-start items-center gap-3">
            <input
              type="radio"
              name="status"
              onChange={() => handleStudentTypeChange("new")}
              defaultChecked={formData?.status === "new"}
              id="stype1"
              className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
              style={{
                accentColor: "black",
              }}
            />
            <label
              htmlFor="stype1"
              className={`cursor-pointer ${
                formData?.status === "new" ? "text-black" : "text-gray-400"
              }`}
            >
              New Student
            </label>
          </div>
          <div className="flex justify-start items-center gap-3">
            <input
              type="radio"
              name="status"
              onChange={() => handleStudentTypeChange("old")}
              defaultChecked={formData?.status === "old"}
              id="stype2"
              className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
              style={{
                accentColor: "black",
              }}
            />
            <label
              htmlFor="stype2"
              className={`cursor-pointer ${
                formData?.status === "old" ? "text-black" : "text-gray-400"
              }`}
            >
              Existing student
            </label>
          </div>
        </div>
        <div className="md:col-span-2 mt-6">
          <label
            htmlFor="doc-upload"
            className={`py-6 md:px-12 px-6 flex w-full justify-center items-center flex-col rounded-[12px] border-2 border-dashed cursor-pointer  transition-colors ${
              infoErrors.profile_picture && !formDoc
                ? "border-red-500"
                : "border-[#AEB4BF] hover:border-[#22252B]"
            }`}
            onClick={(e) => {
              if (isProcessingFile) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <input
              ref={docUploadInput}
              type="file"
              name="doc-upload"
              className="hidden"
              id="doc-upload"
              accept=".pdf, .jpg, .png"
              onChange={docUploadChangeHandler}
            />

            <div className="flex justify-center items-center gap-2">
              <UploadSvg />
              <span className="font-bold">
                Upload Image Of Student <span className="text-red-600">*</span>
              </span>
            </div>
            <p className="text-12 text-center mt-3 text-gray-500">
              File formats - .pdf, .jpg, .png etc. <br />
              File should not be more then 3 MB.
            </p>
            {formDoc && (
              <div className="flex justify-center items-center gap-2 mt-2">
                <p className="text-sm text-green-600 font-semibold">
                  {formDoc.name}
                </p>{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFormDoc();
                  }}
                  className="text-red-500 hover:text-red-700 text-sm underline"
                >
                  <span className="text-red-500 hover:text-red-700 text-sm underline">
                    <CrossSvg width={16} height={16} />
                  </span>
                </button>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
      <p className="font-bold uppercase mb-4 text-12">Student's Name</p>
      {/* Name Fields */}
      <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-3 align-bottom text-primary-brand-default">
        <InputWithLabel
          label={"First Name"}
          placeholder={"First Name"}
          type={"text"}
          name="first_name"
          handler={handleInputChange}
          error={infoErrors?.first_name}
          isRequired
          value={formData?.first_name}
        />
        <InputWithLabel
          label={"Last Name"}
          placeholder={"Last Name"}
          type={"text"}
          name="last_name"
          handler={handleInputChange}
          error={infoErrors?.last_name}
          isRequired
          value={formData?.last_name}
        />
      </div>

      {/* Date of Birth & Gender */}
      <div className="grid 2xl:grid-cols-2 mt-3 lg:grid-cols-2 grid-cols-1 gap-3 align-bottom text-primary-brand-default">
        <InputFullDate
          defaultValue={formData?.dob}
          handler={(date) => onFormDataUpdate({ dob: date })}
          label={"Date of Birth"}
          isRequired
          className="!table"
          error={infoErrors.dob}
        />
        <div className="">
          <span className="text-sm font-bold ">
            Gender <span className="text-red-600">*</span>
          </span>
          <div className="flex justify-start items-center gap-3 mt-3 ">
            <div className="flex justify-start items-center gap-3">
              <input
                type="radio"
                name="gender"
                id="male"
                onChange={() => handleGenderChange("male")}
                checked={formData.gender === "male"}
                className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
                style={{
                  accentColor: "black",
                }}
              />
              <label
                htmlFor="male"
                className={`cursor-pointer ${
                  formData.gender === "male" ? "text-black" : "text-gray-400"
                }`}
              >
                Male
              </label>
            </div>
            <div className="flex justify-start items-center gap-3">
              <input
                type="radio"
                name="gender"
                id="female"
                onChange={() => handleGenderChange("female")}
                checked={formData.gender === "female"}
                className="w-4 h-4 text-black bg-white border-gray-300 checked:bg-black checked:border-black"
                style={{
                  accentColor: "black",
                }}
              />
              <label
                htmlFor="female"
                className={`cursor-pointer ${
                  formData.gender === "female" ? "text-black" : "text-gray-400"
                }`}
              >
                Female
              </label>
            </div>
          </div>
          {infoErrors.gender && (
            <p className="text-red-500 text-sm mt-1">{infoErrors.gender}</p>
          )}
        </div>
      </div>
      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
      <div className="w-full mt-4 text-primary-brand-default ">
        <p className="font-bold uppercase mb-4 text-12">
          Student's Home/Mailing Address
        </p>
        <div className="grid 2xl:grid-cols-2 mt-3 lg:grid-cols-2 grid-cols-1 gap-3 ">
          <div>
            <SelectBox
              defaultValue={selectedCountry?.location_name}
              handler={handleLocationSelection}
              loading={isFetching}
              list={getCountryOptions()}
              isRequired
              label="Country"
              error={errors && errors.location ? errors.location : null}
            />
            {errors && errors.location && (
              <p className="text-danger-700 text-sm">{errors.location}</p>
            )}
          </div>

          {/* Dynamic Location Layers */}
          {getFilteredInputGroups().map((group, index) => (
            <div className="w-full" key={index}>
              <SelectBox
                isRequired
                className="blur-anim"
                handler={handleLocationSelection}
                list={getLocationOptions(group.children)}
                label={group.type_name}
                error={errors && errors.location ? errors.location : null}
              />
              {errors && errors.location && (
                <p className="text-danger-700 text-sm">{errors.location}</p>
              )}
            </div>
          ))}

          {/* Street Address Input */}
          <InputWithLabel
            label="Street Address"
            placeholder="Enter street address"
            type="text"
            value={locationFormData.location_name}
            name="location_name"
            handler={handleFormChange}
            error={errors && errors.location_name ? errors.location_name : null}
            isRequired
          />
        </div>
      </div>

      {/* Navigation Button */}
      <button
        type="button"
        className="bg-black rounded-[8px] lg:px-[190px] px-[50px] py-3 text-white font-bold block mx-auto mt-10 w-full"
        onClick={handleNextStepWithValidation}
      >
        Next
      </button>
    </div>
  );
};

export default Step1StudentInfo;
