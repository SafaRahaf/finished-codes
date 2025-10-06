import React, { useState, useEffect, useRef } from "react";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import Image from "next/image";
import InputFullDate from "@/components/common/Inputs/Input/InputFullDate";
import InputBluePrint from "@/components/common/Inputs/Input/InputBluePrint";
import { useUpdateStudentPersonalInfoMutation } from "@/store/features/student-management/apiSlice";
import { useUploadPhotoMutation } from "@/store/features/file-upload/apiSlice";
import { message } from "antd";
import { uploadImageAndProcess } from "@/components/helpers/uploadImageAndProcess";
import { BrowseProfileSvg, EditSvg } from "@/components/helpers/storeAllSvgs";
import { jwtDecode } from "jwt-decode";
import { getCookie } from "cookies-next";
import useLocationSelector from "@/hooks/useLocationSelector";
import {
  getDecodedToken,
  getOrgShortName,
} from "@/utilities/helpers/getDecodedValus";
import { location_type_id_eighteen } from "@/static/static";
import { studentPersonalInfoValidationSchema } from "@/utilities/validationRules/schemas/studentCompletionSchema";
import { useSelector } from "react-redux";

// Location Hierarchy function
function getLocationHierarchy(location) {
  const result = [];

  // Recursive function to traverse and collect data
  function traverse(location) {
    if (!location) return;

    // Push the current location details to the result array
    if (
      location.location_type_id &&
      location.location_type_id.type_name !== "child_address"
    ) {
      result.push({
        value: location.location_name,
        type: location.location_type_id.type_name,
        id: location.id,
      });
    }

    // Recursively call for the next parent, if it exists
    traverse(location.parent_id);
  }

  // Start the recursion with the initial location
  traverse(location);

  // Reverse the result to show from top-level parent to the child
  return result.reverse();
}

const PersonalInfoStep = ({ studentInfo, genders }) => {
  const [updateStudentPersonalInfo, { isLoading: isUpdating }] =
    useUpdateStudentPersonalInfoMutation();
  const [uploadPhoto, { isLoading: photoUploadLoading }] =
    useUploadPhotoMutation();
  const decoded = getDecodedToken();
  const orgShortName =
    useSelector((state) => state.auth.orgShortName) || getOrgShortName();

  const [formImg, setFormImg] = useState(null);
  const profileImgInput = useRef(null);

  // Location-related states
  const [locationUpdateToggle, setLocationUpdateToggle] = useState(false);
  useEffect(() => {
    if (locationUpdateToggle) {
      setStreetAddress("");
    } else {
      setStreetAddress(locationFormData.location_name);
    }
  }, [locationUpdateToggle]);
  const [getLocations, setGetLocation] = useState([]);
  const [street_address, setStreetAddress] = useState("");

  const [personalInfo, setPersonalInfo] = useState({
    first_name: "",
    last_name: "",
    profile_picture: null,
    dob: "",
    gender: "",
    unique_id: "",
  });

  // Location feature using useLocationSelector hook
  const {
    selectedCountry: locationSelectedCountry,
    formData: locationFormData,
    errors: locationErrors,
    setFormData: setLocationFormData,
    setErrors: setLocationErrors,
    isFetching: isFetchingLocation,
    locationTypes,
    setLocationTypes,
    handleLocationSelection,
    handleFormChange,
    getCountryOptions,
    getLocationOptions,
    getFilteredInputGroups,
    locationTypesObjItems,
  } = useLocationSelector();

  // Add validation state
  const [errors, setErrors] = useState({});

  // Add validation handler for DOB
  const handleDobChange = async (date) => {
    setPersonalInfo((prev) => ({ ...prev, dob: date }));

    // Validate DOB
    try {
      await studentPersonalInfoValidationSchema.validateAt("dob", {
        dob: date,
      });
      setErrors((prev) => ({ ...prev, dob: null }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, dob: err.message }));
    }
  };

  // useEffect to update state when studentInfo changes
  useEffect(() => {
    if (studentInfo) {
      setPersonalInfo({
        first_name: studentInfo?.first_name || "",
        last_name: studentInfo?.last_name || "",
        profile_picture: studentInfo?.profile_picture || null,
        dob: studentInfo?.dob || "",
        gender: studentInfo?.gender || "",
        unique_id: studentInfo?.unique_id || "",
      });

      // Set up location hierarchy for display
      if (studentInfo?.location) {
        const location = studentInfo.location;

        const locationsFormated = {
          ...location,
          location_type_id: {
            ...location.location_type_id,
            type_name: "child_address",
          },
        };

        const hierarchy = getLocationHierarchy(locationsFormated);

        if (hierarchy.length > 0) {
          setStreetAddress(location.location_name);
          setLocationFormData((prev) => ({
            ...prev,
            location_name: location.location_name,
          }));
          setGetLocation(hierarchy);
        }
      }
    }
  }, [studentInfo, setLocationFormData]);

  const isLocationEqual = (loc1, loc2) => {
    if (!loc1 || !loc2) return false;
    return (
      loc1.location_name === loc2.location_name &&
      loc1.post_code === loc2.post_code &&
      loc1.location_parent_id === loc2.location_parent_id &&
      loc1.location_type_id === loc2.location_type_id
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form before submission
    try {
      await studentPersonalInfoValidationSchema.validate(
        {
          first_name: personalInfo.first_name,
          last_name: personalInfo.last_name,
          dob: personalInfo.dob,
          location_name: street_address,
          location: locationTypesObjItems,
          profile_picture: personalInfo.profile_picture,
        },
        { abortEarly: false }
      );

      setErrors({});
    } catch (validationErrors) {
      const formattedErrors = {};
      validationErrors.inner.forEach((error) => {
        formattedErrors[error.path] = error.message;
      });
      setErrors(formattedErrors);
      // return;
    }

    const payload = { ...personalInfo };

    // Handle location data
    if (
      locationUpdateToggle &&
      locationTypesObjItems &&
      locationTypesObjItems.length > 0
    ) {
      payload.location = {
        location_name: street_address,
        location_parent_id:
          locationTypesObjItems[locationTypesObjItems.length - 1]?.id || null,
        location_type_id: location_type_id_eighteen,
        lat: "0.0",
        long: "0.0",
      };
    }

    if (payload.gender === "") payload.gender = null;
    if (payload.dob === "") payload.dob = null;

    if (
      isLocationEqual({ location_name: street_address }, studentInfo.location)
    ) {
      delete payload.location;
    }

    try {
      if (formImg) {
        await uploadImageAndProcess({
          uploadApi: uploadPhoto,
          imageFile: formImg,
          onSuccess: async (imageUrl) => {
            await updateStudentPersonalInfo({
              peopleId: studentInfo?.id,
              payload: { ...payload, profile_picture: imageUrl },
            }).unwrap();

            // ✅ Success toast
            message.success("Student updated successfully!");
          },
          onError: async () => {
            await updateStudentPersonalInfo({
              peopleId: studentInfo?.id,
              payload: { ...payload, profile_picture: undefined },
            }).unwrap();

            // ✅ Success toast
            message.success("Student updated successfully!");
          },
        });
      } else {
        // No new image, just update
        await updateStudentPersonalInfo({
          peopleId: studentInfo?.id,
          payload,
        }).unwrap();

        message.success("Student updated successfully!");
      }
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Failed to update student.");
    }
  };

  const handleChange = (e) => {
    if (e?.target) {
      const { name, value } = e.target;
      setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    } else if (typeof e === "object" && !Array.isArray(e)) {
      setPersonalInfo((prev) => ({ ...prev, ...e }));
    }
  };

  const browseProfileImg = () => {
    profileImgInput.current.click();
  };

  const removeFormProfileImage = () => {
    if (formImg) {
      setPersonalInfo((prev) => ({
        ...prev,
        profile_picture: null,
      }));
      setFormImg(null);
    }
  };

  const profileImgChangeHandler = (e) => {
    const inputElement = e.target;

    if (inputElement.value !== "") {
      const file = inputElement.files[0];
      const validFileTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is valid
      if (!validFileTypes.includes(file.type)) {
        message.error(
          "Invalid file type. Please upload a PNG, JPG, or JPEG image."
        );
        return;
      }

      // Get file size in bytes
      const fileSizeInBytes = file.size;
      const fileSizeInMB = fileSizeInBytes / 1024 / 1024;

      // Check file size
      if (fileSizeInMB > 3) {
        message.error("File size exceeds 3MB limit");
        return;
      }

      // Proceed with reading and setting the file
      const imgReader = new FileReader();
      imgReader.onload = (event) => {
        setPersonalInfo((prev) => ({
          ...prev,
          profile_picture: event.target.result,
        }));
      };
      imgReader.readAsDataURL(file);
      setFormImg(file);
    }

    inputElement.value = "";
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={profileImgInput}
        onChange={(e) => profileImgChangeHandler(e)}
        accept="image/png, image/jpg, image/jpeg"
        type="file"
        name="profile-upload"
        className="hidden"
        id="profile-upload"
      />

      {/* Enhanced profile image section */}
      <div className="upload-profile mt-8 flex md:flex-row flex-col justify-start items-center gap-8 mb-6">
        <div>
          <div className="profile-img cursor-pointer flex justify-center items-center relative">
            {formImg ? (
              personalInfo?.profile_picture ? (
                <div className="w-[120px] h-[120px] relative group">
                  <img
                    src={
                      process.env.FILE_BROWSE_URL +
                      personalInfo?.profile_picture
                    }
                    alt="upload"
                    className="w-full h-full rounded-full bg-[#E4E6EA] border"
                  />
                  <div
                    onClick={() => removeFormProfileImage()}
                    className="w-full h-full absolute left-0 top-0 p-5 group-hover:block hidden"
                  >
                    <div className="bg-black rounded-full w-full h-full bg-opacity-70 flex justify-center items-center">
                      <span className="text-xs text-red-500 font-semibold">
                        Delete
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={browseProfileImg}
                  className="w-[120px] h-[120px] rounded-full bg-[#E4E6EA] flex items-center justify-center"
                >
                  <img
                    src="/assets/img/logos/plus.svg"
                    alt="upload"
                    className="w-[50px] h-[50px]"
                  />
                </div>
              )
            ) : personalInfo?.profile_picture ? (
              <img
                src={
                  process.env.FILE_BROWSE_URL + personalInfo?.profile_picture
                }
                alt="upload"
                className="w-[120px] h-[120px] rounded-full bg-[#E4E6EA] border"
                style={{ backgroundSize: "cover", objectFit: "cover" }}
              />
            ) : (
              <div
                onClick={browseProfileImg}
                className="w-[120px] h-[120px] rounded-full bg-[#E4E6EA] flex items-center justify-center"
              >
                <img
                  src="/assets/img/logos/plus.svg"
                  alt="upload"
                  className="w-[40px] h-[40px]"
                />
              </div>
            )}

            {personalInfo?.profile_picture && (
              <div
                onClick={browseProfileImg}
                className="w-6 h-6 absolute bottom-[10px] right-0 bg-primary-brand-default rounded-full cursor-pointer"
              >
                <BrowseProfileSvg />
              </div>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-[20px] font-bold mb-4">Upload Profile Photo</h4>
          <p>
            File formats - PNG, JPG, JPEG etc. <br />
            File should not be more then 3 MB.
          </p>
        </div>
      </div>

      <div className="mb-3 mt-3 grid lg:grid-cols-2 grid-cols-1 gap-4">
        <InputWithLabel
          label={"First Name"}
          placeholder={studentInfo?.first_name || "Name"}
          type="text"
          name="first_name"
          value={personalInfo?.first_name}
          noNumbersAndSpecialChars={true}
          handler={handleChange}
          error={errors.first_name}
        />
        <InputWithLabel
          label={"Last Name"}
          placeholder={studentInfo?.last_name || "Name"}
          type={"text"}
          value={personalInfo?.last_name}
          name="last_name"
          noNumbersAndSpecialChars={true}
          handler={handleChange}
          error={errors.last_name}
        />
      </div>
      <div className="mb-3">
        <InputWithLabel
          label={"Student ID (Auto Generated)"}
          placeholder={studentInfo?.unique_id || "UQ05475687"}
          type={"text"}
          value={
            orgShortName && personalInfo?.unique_id
              ? orgShortName + personalInfo?.unique_id
              : decoded?.org_short_name && personalInfo?.unique_id
              ? decoded?.org_short_name + personalInfo?.unique_id
              : personalInfo?.unique_id
          }
          name="unique_id"
          disabled={true}
          handler={handleChange}
        />
      </div>
      <div className="mb-3">
        <InputFullDate
          defaultValue={personalInfo?.dob}
          name="dob"
          handler={handleDobChange}
          label={"Date of Birth"}
          error={errors.dob}
        />
      </div>
      <div className="label-none">
        <SelectBox
          defaultValue={personalInfo?.gender}
          list={genders}
          label={"Gender"}
          name="gender"
          handler={(value) => handleChange({ gender: value })}
        />
      </div>
      <hr className="my-4" />

      {/* Location Section - Replaced with LocationStepUpdate functionality */}
      <div className="mt-4">
        <div className="flex justify-between items-center md:col-span-2">
          <h4 className="text-lg font-bold">Address</h4>
          <button
            onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
            type="button"
            className="flex space-x-1 items-center"
          >
            <span>
              <EditSvg />
            </span>
            <span className="text-sm text-primary-brand-900 font-bold">
              Edit
            </span>
          </button>
        </div>
      </div>

      {locationUpdateToggle ? (
        <div className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch">
          <div>
            <SelectBox
              defaultValue={locationSelectedCountry?.location_name}
              isRequired
              handler={handleLocationSelection}
              loading={isFetchingLocation}
              list={getCountryOptions()}
              label="Country"
              error={
                locationErrors && locationErrors.location
                  ? locationErrors.location
                  : null
              }
            />
            {locationErrors && locationErrors.location && (
              <p className="text-danger-700 text-sm">
                {locationErrors.location}
              </p>
            )}
          </div>

          {/* Dynamic Location Layers */}
          {getFilteredInputGroups().map((group, index) => (
            <div className="w-full" key={index}>
              <SelectBox
                className="blur-anim"
                isRequired
                handler={handleLocationSelection}
                list={getLocationOptions(group.children)}
                label={group.type_name}
                error={
                  locationErrors && locationErrors.location
                    ? locationErrors.location
                    : null
                }
              />
              {locationErrors && locationErrors.location && (
                <p className="text-danger-700 text-sm">
                  {locationErrors.location}
                </p>
              )}
            </div>
          ))}

          {locationTypes && locationTypes.length > 0 && (
            <InputWithLabel
              label="Street Address"
              placeholder="Enter street address"
              type="text"
              value={street_address}
              name="street_address"
              handler={(e) => setStreetAddress(e.target.value)}
              error={
                locationErrors && locationErrors.location
                  ? locationErrors.location
                  : null
              }
              isRequired
            />
          )}
        </div>
      ) : (
        <>
          <div
            className="col-span-full mt-4"
            onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
          >
            <InputBluePrint label="Street Address" value={street_address} />
          </div>
          <div
            onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
            className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch"
          >
            {getLocations &&
              getLocations.length > 0 &&
              getLocations.map((item, i) => (
                <InputBluePrint key={i} label={item.type} value={item.value} />
              ))}
          </div>
        </>
      )}

      <div className="mb-3 mt-8 text-right">
        <button
          type="submit"
          disabled={isUpdating || photoUploadLoading}
          className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating || photoUploadLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default PersonalInfoStep;
