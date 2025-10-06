"use client";
import React, { useState, useEffect, useRef } from "react";
import SelectBox from "../common/Inputs/Input/SelectBox";
import InputWithLabel from "../common/Inputs/Input/InputWithLabel";
import InputDateMonth from "../common/Inputs/Input/InputDateMonth";
import SvgLoader from "../ui/loaders/SvgLoader";
import { message } from "antd";
import { profileUpdateSchema } from "@/utilities/validationRules/schemas/authSchema";
import InputBluePrint from "../common/Inputs/Input/InputBluePrint";
import {
  useOnboardingProfileSetupMutation,
  useUpdateUserInformationMutation,
} from "@/store/features/auth/apiSlice";
import { location_type_id_eighteen } from "@/static/static";
import moment from "moment";
import { useUploadPhotoMutation } from "@/store/features/file-upload/apiSlice";
import { uploadImageAndProcess } from "../helpers/uploadImageAndProcess";
import { BrowseProfileSvg, EditSvg } from "@/components/helpers/storeAllSvgs";
import useLocationSelector from "@/hooks/useLocationSelector";
import InputFullDate from "../common/Inputs/Input/InputFullDate";
import { updateProfileName } from "@/store/features/auth/authSlice";
import { useSelector, useDispatch } from "react-redux";

function PersonalProfileUpdate({ peopleData }) {
  const genders = ["male", "female"];
  const dispatch = useDispatch();
  const cachedProfileData = useSelector(
    (state) => state?.auth?.cachedProfileData
  );

  // store input data
  const [formData, setFormData] = useState({
    profile_picture: null,
    yy: "",
    mm: "",
    dd: "",
    gender: "",
    first_name: "",
    last_name: "",
    street_address: "",
    email: "",
    phone: "",
    peopleLocations: [],
    peopleLocationParentId: null,
  });

  // Location Hierarchy
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

  // input data handler for change state value
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // dob handler
  const dobHandler = (type, e) => {
    if (!type) {
      setFormData({
        ...formData,
        [e.target.name]:
          e.target.name === "dd"
            ? e.target.value.slice(0, 2)
            : e.target.value.slice(0, 4),
      });
    } else {
      setFormData({
        ...formData,
        mm: e,
      });
    }
  };

  // image options
  const [formImg, setFormImag] = useState(null);
  const profileImgInput = useRef(null);
  const browseprofileImg = () => {
    profileImgInput.current.click();
  };

  const profileImgChangHandler = (e) => {
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

      // Convert to kilobytes (optional)
      const fileSizeInKB = fileSizeInBytes / 1024;

      // Convert to megabytes (optional)
      const fileSizeInMB = fileSizeInKB / 1024;

      // You can add a file size check if needed
      if (fileSizeInMB > 3) {
        message.error("File size exceeds 3MB limit");
      } else {
        // Proceed with reading and setting the file
        const imgReader = new FileReader();
        imgReader.onload = (event) => {
          setFormData((prev) => ({
            ...prev,
            profile_picture: event.target.result,
          })); //store
        };
        imgReader.readAsDataURL(file); //view
        setFormImag(file);
      }
    }

    // Reset the input value to ensure the onChange event fires again on subsequent uploads
    inputElement.value = "";
  };

  //   store all error this state client/server
  const [errors, setErrors] = useState(null);

  // location option
  const [locationUpdateToggle, setLocationUpdateToggle] = useState(false);
  useEffect(() => {
    if (locationUpdateToggle) {
      setLocationFormData((prev) => ({
        ...prev,
        location_name: "",
      }));
    } else {
      setLocationFormData((prev) => ({
        ...prev,
        location_name: locationFormData.location_name,
      }));
    }
  }, [locationUpdateToggle]);
  const {
    selectedCountry: locationSelectedCountry,
    formData: locationFormData,
    setFormData: setLocationFormData,
    errors: locationErrors,
    setErrors: setLocationErrors,
    isFetching,
    locationTypes,
    setLocationTypes,
    handleLocationSelection,
    handleFormChange,
    getCountryOptions,
    getLocationOptions,
    getFilteredInputGroups,
    locationTypesObjItems,
  } = useLocationSelector();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      peopleLocationParentId:
        locationTypesObjItems.length > 0
          ? locationTypesObjItems[locationTypesObjItems.length - 1].id
          : null,
    }));
  }, [locationTypesObjItems]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      street_address: locationFormData.location_name,
    }));
  }, [locationFormData.location_name]);

  /* 

    this part we have manage server side communication for update profile request

  */

  //  initialize request slice
  const [updateUserInformation, { isLoading, error }] =
    useUpdateUserInformationMutation();

  //   error watcher
  useEffect(() => {
    if (error) {
      message.error(error.data.message);
    }
  }, [error]);

  // file upload handler
  const [uploadPhoto, { isLoading: photoUploadLoading, error: uploadError }] =
    useUploadPhotoMutation();

  // update profile request handler
  const updateProfileHandler = async () => {
    const dobFormate =
      formData?.yy && formData?.mm && formData?.dd
        ? formData?.yy + "-" + formData?.mm + "-" + formData?.dd
        : null;
    const data = {
      profile_picture: formData?.profile_picture,
      dob: moment(dobFormate, "YYYY-M-D").format("YYYY-MM-DD"),
      gender: formData?.gender,
      street_address: formData?.street_address,
      location_parent_id:
        locationTypesObjItems.length > 0
          ? locationTypesObjItems[locationTypesObjItems.length - 1].id
          : null,
      location_type_id: location_type_id_eighteen,
      first_name: formData?.first_name,
      last_name: formData?.last_name,
      phone_number: formData?.phone_number,
    };
    try {
      await profileUpdateSchema.validate(data, { abortEarly: false });
      const people = {
        people: {
          profile_picture: data.profile_picture,
          dob: data.dob,
          gender: data.gender.toLowerCase(),
          first_name: data.first_name,
          last_name: data.last_name,
        },
      };
      const people_location =
        locationTypes.length > 0
          ? {
              people_location: {
                location_type_id: location_type_id_eighteen,
                location_parent_id: data.location_parent_id,
                location_name: data.street_address,
              },
            }
          : formData?.peopleLocations.length > 0
          ? {
              people_location: {
                location_type_id: location_type_id_eighteen,
                location_parent_id:
                  formData?.peopleLocations[
                    formData?.peopleLocations.length - 1
                  ].id,
                location_name: data.street_address,
              },
            }
          : null;

      // send people location when people location true and people location not same with previos location
      const checkPeopleLocationDiffOrNot =
        peopleData &&
        peopleData?.people_location &&
        people_location?.people_location?.location_name ===
          peopleData?.people_location?.location_name;
      const checkData =
        people && !checkPeopleLocationDiffOrNot
          ? { ...people, ...people_location }
          : { ...people };
      // request api

      if (formImg) {
        await uploadImageAndProcess({
          uploadApi: uploadPhoto,
          imageFile: formImg,
          onSuccess: async (imageUrl) => {
            await updateUserInformation({
              data: {
                ...checkData,
                people: {
                  ...checkData.people,
                  profile_picture: imageUrl,
                },
              },
            });

            // Update cached profile data with new name
            dispatch(
              updateProfileName({
                first_name: data.first_name,
                last_name: data.last_name,
              })
            );
          }, // Dynamic API call
          onError: async (error) =>
            await updateUserInformation({
              data: {
                ...checkData,
                people: {
                  ...checkData.people,
                  profile_picture: undefined,
                },
              },
            }),
        });
      } else {
        await updateUserInformation({
          data: {
            ...checkData,
            people: {
              ...checkData.people,
              profile_picture: undefined,
            },
          },
        });

        // Update cached profile data with new name
        dispatch(
          updateProfileName({
            first_name: data.first_name,
            last_name: data.last_name,
          })
        );
      }
    } catch (validationErrors) {
      console.log(validationErrors);
      const formattedErrors = {};
      validationErrors.inner.forEach((error) => {
        formattedErrors[error.path] = error.message;
      });
      setErrors(formattedErrors);
    }
  };

  // get saved data - prioritize cached data over peopleData prop
  useEffect(() => {
    // Use cached data if available, otherwise fall back to peopleData prop
    const dataSource = cachedProfileData || peopleData;

    if (dataSource) {
      const getPhone =
        dataSource.people?.user_id?.mobiles?.length &&
        dataSource.people?.user_id?.mobiles?.find(
          (item) =>
            item.mobile_type === "primary" || item.mobile_type === "secondary"
        )?.mobile_no;

      // people data
      setFormData({
        profile_picture: dataSource.people?.profile_picture,
        first_name: dataSource.people?.first_name,
        email: dataSource.people?.email,
        last_name: dataSource.people?.last_name,
        email:
          dataSource?.people?.user_id?.emails?.length &&
          dataSource?.people?.user_id?.emails?.find(
            (item) => item.email_type === "primary"
          )?.email,
        phone: getPhone || dataSource.people?.phone,
        gender: dataSource.people?.gender,
      });

      // for people location
      if (dataSource && dataSource.people_location) {
        const locationsFormated = {
          ...dataSource.people_location, // Spread the original properties first
          location_type_id: {
            ...dataSource.people_location.location_type_id,
            type_name: "child_address", // Override type_name here
          },
        };
        const hierarchy = getLocationHierarchy(locationsFormated);
        if (hierarchy.length > 0) {
          setLocationFormData((prev) => ({
            ...prev,
            location_name: dataSource.people_location?.location_name,
          }));
          setFormData((prev) => ({
            ...prev,
            peopleLocations: hierarchy ? hierarchy : [],
          }));
        }
      } else {
        setLocationUpdateToggle(true);
        setFormData((prev) => ({
          ...prev,
          peopleLocations: [],
        }));
      }

      // people dob manage
      if (dataSource.people?.dob) {
        const dob = new Date(dataSource.people?.dob);
        setFormData((prev) => ({
          ...prev,
          dob: dob.toISOString().substring(0, 10),
          yy: dob.getFullYear(),
          mm: dob.getMonth() + 1,
          dd: dob.getDate(),
        }));
      }
    }
  }, [peopleData, cachedProfileData]); // Add cachedProfileData as dependency

  return (
    <div className="w-full">
      <div className="upload-profile mt-8 flex md:flex-row flex-col justify-start items-center gap-8">
        <div>
          <input
            ref={profileImgInput}
            onChange={(e) => profileImgChangHandler(e)}
            accept="image/png, image/jpg, image/jpeg"
            type="file"
            name="profile-upload"
            className="hidden"
            id="profile-upload"
          />
          <div className="profile-img  cursor-pointer flex justify-center items-center relative">
            {formImg ? (
              <img
                src={
                  formData?.profile_picture
                    ? `${formData?.profile_picture}`
                    : `/assets/img/logos/plus.svg`
                }
                alt="upload"
                className="w-[110px] h-[110px] rounded-full bg-[#E4E6EA]"
              />
            ) : (
              <img
                src={
                  formData?.profile_picture
                    ? `${
                        process.env.FILE_BROWSE_URL + formData?.profile_picture
                      }`
                    : `/assets/img/logos/plus.svg`
                }
                alt="upload"
                className="w-[110px] h-[110px] rounded-full bg-[#E4E6EA]"
              />
            )}
            <div
              onClick={browseprofileImg}
              className="w-[110px] h-[110px] rounded-full absolute left-0 top-0 z-10 cursor-pointer"
            ></div>
            {formData?.profile_picture && (
              <div
                onClick={browseprofileImg}
                className="w-6 h-6 absolute bottom-[10px] right-0  bg-primary-brand-default rounded-full cursor-pointer"
              >
                <BrowseProfileSvg />
              </div>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-[26px] font-bold mb-4">Upload Admin Photo</h4>
          <p>
            File formats - PNG, JPG, JPEG etc. <br />
            File should not be more then 3 MB.
          </p>
        </div>
      </div>
      <div className="w-full scrollable">
        <div className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-10 items-stretch ">
          <InputWithLabel
            label={"First Name"}
            placeholder={"First name"}
            type={"text"}
            name="first_name"
            noNumbersAndSpecialChars={true}
            value={formData?.first_name}
            handler={(e) => handleChange(e)}
            isRequired
            error={errors && errors.first_name ? errors.first_name : null}
          />
          <InputWithLabel
            label={"Last Name"}
            placeholder={"Last name"}
            type={"text"}
            name="last_name"
            value={formData?.last_name}
            noNumbersAndSpecialChars={true}
            handler={(e) => handleChange(e)}
            isRequired
            error={errors && errors.last_name ? errors.last_name : null}
          />
          <div>
            <SelectBox
              defaultValue={formData?.gender}
              handler={(value, option) =>
                setFormData((prev) => ({ ...prev, gender: option.value }))
              }
              list={
                genders &&
                genders.length > 0 &&
                genders.map((item) => ({
                  label: item,
                  value: item,
                }))
              }
              isRequired
              label="Gender"
              error={errors && errors.gender ? errors.gender : null}
            />
            {errors && errors.gender && (
              <p className="text-danger-700 text-sm">{errors.gender}</p>
            )}
          </div>
          <div>
            <label className="text-14 font-bold">
              Date of Birth <sup className="text-danger-700">*</sup>
            </label>
            <div className="grid grid-cols-3 gap-[9px]">
              <InputDateMonth
                defaultValue={formData?.mm}
                handler={dobHandler}
                className="min-w-20"
              />
              <InputWithLabel
                placeholder={"DD"}
                type={"number"}
                name="dd"
                value={formData.dd}
                handler={(e) => dobHandler(undefined, e)}
              />
              <InputWithLabel
                placeholder="YY"
                type={"number"}
                name="yy"
                value={formData.yy}
                handler={(e) => dobHandler(undefined, e)}
              />
            </div>
            {errors && errors.dob && (
              <p className="text-danger-700 text-sm">{errors.dob}</p>
            )}
          </div>
          <div>
            <InputBluePrint
              label={"Email"}
              value={formData.email ? formData.email : ""}
              info="Your primary email address cannot be changed."
            />
          </div>
          <InputBluePrint
            label={"Phone"}
            value={formData.phone}
            info="Your primary Number cannot be changed."
          />
        </div>
        <div className="col-span-full mt-4">
          <div className="line h-[1px] mt-2 mb-4 bg-[#E4E6EA] md:col-span-2"></div>
          <div className="flex justify-between items-center md:col-span-2">
            <h4 className="text-lg font-bold">Address</h4>
          </div>
        </div>

        {locationUpdateToggle ? (
          <div className="col-span-full">
            <div className="w-full grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch">
              <div>
                <SelectBox
                  defaultValue={locationSelectedCountry?.location_name}
                  isRequired
                  handler={handleLocationSelection}
                  loading={isFetching}
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

              {/* Street Address Input */}
              <InputWithLabel
                label="Street Address"
                placeholder="Enter street address"
                type="text"
                value={locationFormData?.location_name}
                name="location_name"
                handler={(e) => handleFormChange(e)}
                error={
                  locationErrors && locationErrors.location
                    ? locationErrors.location
                    : null
                }
                isRequired
              />
            </div>
          </div>
        ) : (
          <>
            <div
              className="col-span-full mt-4"
              onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
            >
              <InputBluePrint
                label="Street Address"
                value={locationFormData?.location_name}
              />
            </div>
            <div
              onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
              className="col-span-full grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch"
            >
              {formData?.peopleLocations &&
                formData?.peopleLocations.length > 0 &&
                formData?.peopleLocations.map((item, i) => (
                  <InputBluePrint
                    key={i}
                    label={item.type}
                    value={item.value}
                  />
                ))}
            </div>
          </>
        )}
        <div className="w-full text-right mt-10">
          <button
            type="button"
            disabled={photoUploadLoading || isLoading}
            onClick={updateProfileHandler}
            className="btn bg-[#22252B] disabled:cursor-not-allowed disabled:opacity-50 py-[13px] px-[24px] font-bold text-lg rounded-[8px] text-white"
          >
            {isLoading ? <SvgLoader className="text-white" /> : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonalProfileUpdate;
