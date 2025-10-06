"use client";
import React, { useState, useEffect, useRef } from "react";
import SelectBox from "../common/Inputs/Input/SelectBox";
import InputWithLabel from "../common/Inputs/Input/InputWithLabel";
import countryCodesFromJson from "./../../data/CountryCodes.json";
import SvgLoader from "../ui/loaders/SvgLoader";
import InputBluePrint from "../common/Inputs/Input/InputBluePrint";
import { message } from "antd";
import {
  useContactTypesQuery,
  useDeleteContactMutation,
  useOnboardingProfileSetupMutation,
  useOrgaizationTypesQuery,
} from "@/store/features/auth/apiSlice";
import Image from "next/image";
import { location_type_id } from "@/static/static";
import { uploadImageAndProcess } from "../helpers/uploadImageAndProcess";
import { useUploadPhotoMutation } from "@/store/features/file-upload/apiSlice";
import cleanObject from "../helpers/cleanObject";
import { orgUpdateSchema } from "@/utilities/validationRules/schemas/settingsProfileSchema";
import InputFullDate from "../common/Inputs/Input/InputFullDate";
import {
  BrowseProfileSvg,
  DownArrowSvg,
  EditSvg,
} from "@/components/helpers/storeAllSvgs";
import useLocationSelector from "@/hooks/useLocationSelector";
function OrganizationProfileSetup({ step, setStep, orgData, refetchData }) {
  // store input data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    logo: null,
    established_date: "",
    total_staff: "",
    total_student: "",
    street_address: "",
    email: "",
    phoneExist: false,
    phone: "",
    orgLocations: [],
    orgLocationParentId: null,
    website_url: "",
  });

  // reset data
  const resetDataHandler = () => {
    setFormData({
      name: "",
      email: "",
      logo: null,
      established_date: "",
      total_staff: "",
      street_address: "",
      phone: "",
      phoneExist: false,
      orgLocations: [],
      orgLocationParentId: null,
    });
  };

  // input data handler for change state value
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const establishedDateHandler = (value) => {
    setFormData((prev) => ({
      ...prev,
      established_date: value,
    }));
  };

  // contact type feature
  const { data: contactTypes, isFetching: contactTypesFetching } =
    useContactTypesQuery();
  const [addContactLinks, setAddContactLinks] = useState([
    {
      uid: null,
      id: null,
      type_name: "",
      value: "",
    },
  ]);

  // Delete responsibility api slice
  const [deleteContact, { isLoading: deleteLoading }] =
    useDeleteContactMutation();

  // delete addContactLinks
  const deleteContactLink = (index, uid = null) => {
    if (addContactLinks?.length === 1) {
      message.error("Atleast one contact link must remain");
      return;
    }

    const updatedLinks = addContactLinks.filter((link, i) => i !== index);
    setAddContactLinks(updatedLinks);
    if (uid) {
      deleteContact({
        id: uid,
      });
    }
  };
  // Function to add a new contact link
  const addNewLink = () => {
    setAddContactLinks([
      ...addContactLinks,
      { uid: null, id: null, type_name: "", value: "" },
    ]);
  };
  // function to handle select change
  const handleCtypeChangeChange = (value, option) => {
    const existOrNot = addContactLinks.some((item) => item.id === option.id);
    if (!existOrNot) {
      const updatedLinks = addContactLinks.map((link, i) =>
        i === option.parent_index ? { ...link, id: option.id } : link
      );
      setAddContactLinks(updatedLinks);
    } else {
      message.error(`${option.type_name} already added`);
      const filteredLinks = addContactLinks.filter(
        (item) => item.type_name !== ""
      );
      setAddContactLinks(filteredLinks);
    }
  };

  // Function to handle input change
  const handleInputChange = (index, field, value) => {
    const updatedLinks = addContactLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    setAddContactLinks(updatedLinks);
  };

  //   these feature work only for number input field
  const [countryDropDowntoggle, setCountryDropDownToggle] = useState(false);
  const [getCountries, setGetCountries] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const selectCountryhandler = (value) => {
    setSelectedCountry(value);
    setCountryDropDownToggle(false);
  };
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
            logo: event.target.result,
          }));
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

  // useEffect to set location_parent_id
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      orgLocationParentId:
        locationTypesObjItems.length > 0
          ? locationTypesObjItems[locationTypesObjItems.length - 1].id
          : null,
    }));
  }, [locationTypesObjItems]);
  // useEffect to set location name
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      street_address: locationFormData.location_name,
    }));
  }, [locationFormData.location_name]);

  // get all types
  const [selectedOrgaizationType, setSelectedOrgaizationType] = useState(null);
  const { data: typeData, isFetching: typeFetching } =
    useOrgaizationTypesQuery();
  const orgaizationTypesSelectHandler = (value, option) => {
    setSelectedOrgaizationType(option);
  };
  //  initialize request slice
  const [onboardingProfileSetup, { isLoading, error }] =
    useOnboardingProfileSetupMutation();

  useEffect(() => {
    if (error) {
      message.error(error.data.message);
    }
  }, [error]);

  // helper: detect country by dial code (longest first), return {country, local}
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

  const nextStepHandler = async () => {
    await refetchData();
    setStep(3);
  };

  // file upload handler
  const [uploadPhoto, { isLoading: photoUploadLoading, error: uploadError }] =
    useUploadPhotoMutation();

  // contact links validator
  const validateContactLinks = () => {
    if (addContactLinks && addContactLinks.length > 0) {
      const regex =
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      const invalidLinks = addContactLinks.filter(
        (link) => !regex.test(link.value)
      );

      if (invalidLinks.length > 0) {
        message.error("One or more social media links are invalid.");
        return false;
      }
      return true;
    }
  };

  // update profile request handler
  const updateOrganizationHandler = async () => {
    const data = {
      logo: formData?.logo,
      street_address: formData?.street_address,
      location_parent_id:
        locationTypesObjItems.length > 0
          ? locationTypesObjItems[locationTypesObjItems.length - 1].id
          : null,
      location_type_id: location_type_id,
      name: formData?.name,
      established_date: formData?.established_date,
      total_staff: Number(formData?.total_staff),
      total_student: Number(formData?.total_student),
      website_url: formData?.website_url,
      org_type_id: selectedOrgaizationType ? selectedOrgaizationType?.id : null,
      email: formData.email,
      mobile:
        formData.phoneExist && formData.phone
          ? formData.phone
          : formData.phone
          ? selectedCountry.dial_code + formData.phone
          : "",
    };

    try {
      await orgUpdateSchema.validate(
        {
          email: data.email,
          website_url: data.website_url,
          established_date: data.established_date,
          street_address: data.street_address,
          mobile: data.mobile,
        },
        { abortEarly: false }
      );
      const organization = {
        organization: {
          logo: data?.logo,
          name: data?.name,
          established_date: data?.established_date,
          total_employee: data?.total_staff,
          total_student: data?.total_student,
          website_url: data?.website_url,
          org_type_id: data?.org_type_id,
          email: data.email,
          mobile: data.mobile,
        },
      };
      const org_location =
        locationTypes.length > 0
          ? {
              location: {
                location_type_id: location_type_id,
                location_parent_id: data.location_parent_id,
                location_name: data.street_address,
              },
            }
          : formData?.orgLocations?.length
          ? {
              location: {
                location_type_id: location_type_id,
                location_parent_id:
                  formData?.orgLocations[formData?.orgLocations.length - 1].id,
                location_name: data.street_address,
              },
            }
          : null;

      const contact_type_list = addContactLinks
        .filter((item) => item.id && item.value)
        .map((item) => {
          const base = {
            contact_type_id: item.id,
            contact: item.value,
          };
          return item?.uid ? { id: item.uid, ...base } : base;
        });

      const checkData =
        organization && locationUpdateToggle && contact_type_list.length > 0
          ? {
              ...organization,
              organization_location: {
                ...org_location?.location,
              },
              organization_contacts: contact_type_list,
            }
          : organization && contact_type_list.length > 0
          ? { ...organization, organization_contacts: contact_type_list }
          : { ...organization };
      const sanitizedData = cleanObject(checkData);
      if (formImg) {
        await uploadImageAndProcess({
          uploadApi: uploadPhoto,
          imageFile: formImg,
          onSuccess: async (imageUrl) => {
            await onboardingProfileSetup({
              data: {
                ...sanitizedData,
                organization: {
                  ...sanitizedData.organization,
                  logo: imageUrl,
                },
              },
              reset: resetDataHandler,
              next: nextStepHandler,
            });
          }, // Dynamic API call
          onError: async (error) =>
            await onboardingProfileSetup({
              data: {
                ...sanitizedData,
                organization: {
                  ...sanitizedData.organization,
                  logo: undefined,
                },
              },
              reset: resetDataHandler,
              next: nextStepHandler,
            }),
        });
      } else {
        await onboardingProfileSetup({
          data: {
            ...sanitizedData,
            organization: {
              ...sanitizedData.organization,
              logo: undefined,
            },
          },
          reset: resetDataHandler,
          next: nextStepHandler,
        });
      }
    } catch (validationErrors) {
      const formattedErrors = {};
      validationErrors?.inner?.forEach((error) => {
        formattedErrors[error.path] = error.message;
      });

      setErrors(formattedErrors);
    }
  };

  // ==============================get previous data

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
  // get saved data
  useEffect(() => {
    if (orgData) {
      // people data
      setFormData({
        logo: orgData.organization?.logo,
        name: orgData.organization?.name,
        established_date: orgData.organization?.established_date,
        email: orgData.organization?.email,
        phone: orgData.organization?.mobile_no
          ? String(orgData.organization?.mobile_no)
          : "",
        phoneExist: false,
        website_url: orgData.organization?.website_url,
        total_staff: orgData.organization?.total_employee,
        total_student: orgData.organization?.total_student,
      });
      // detect country and strip dial code from existing mobile_no
      if (orgData.organization?.mobile_no) {
        const detected = detectCountryByDialCode(
          String(orgData.organization?.mobile_no)
        );
        if (detected?.country) {
          setSelectedCountry(detected.country);
          setFormData((prev) => ({
            ...prev,
            phone: detected.local,
            phoneExist: false, // ensure we re-append dial code on save
          }));
        }
      }
      if (orgData && orgData.org_location) {
        const locationsFormated = {
          ...orgData.org_location, // Spread the original properties first
          location_type_id: {
            ...orgData.org_location,
            type_name: "child_address", // Override type_name here
          },
        };
        // -----------
        const hierarchy = getLocationHierarchy(locationsFormated);
        if (hierarchy.length > 0) {
          setLocationFormData((prev) => ({
            ...prev,
            location_name: orgData.org_location?.location_name,
          }));
          setFormData((prev) => ({
            ...prev,
            street_address: orgData.org_location?.location_name,
          }));
          setFormData((prev) => ({
            ...prev,
            orgLocations: hierarchy ? hierarchy : [],
          }));
        }
      } else {
        setLocationUpdateToggle(true);
        setFormData((prev) => ({
          ...prev,
          orgLocations: [],
        }));
      }
      // org type manage
      if (orgData && orgData?.organization?.org_type_id) {
        setSelectedOrgaizationType(orgData.organization.org_type_id);
      } else {
        setSelectedOrgaizationType(null);
      }
      // org contact manage
      if (
        orgData &&
        orgData?.organization?.contact_id &&
        orgData?.organization?.contact_id.length > 0
      ) {
        setAddContactLinks(
          orgData?.organization?.contact_id.map((item) => ({
            uid: item?.id,
            id: item?.contact_type_id?.id,
            type_name: item?.contact_type_id?.type_name,
            value: item?.contact,
          }))
        );
      }
    }
  }, [orgData]);

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
                  formData?.logo
                    ? `${formData?.logo}`
                    : `/assets/img/logos/plus.svg`
                }
                alt="upload"
                className="w-[110px] h-[110px] rounded-full bg-[#E4E6EA]"
              />
            ) : (
              <img
                src={
                  formData?.logo
                    ? `${process.env.FILE_BROWSE_URL + formData?.logo}`
                    : `/assets/img/logos/plus.svg`
                }
                alt="upload"
                className="w-[110px] h-[110px] rounded-full bg-[#E4E6EA]"
                style={{ backgroundSize: "cover", objectFit: "cover" }}
              />
            )}
            <div
              onClick={browseprofileImg}
              className="w-[110px] h-[110px] rounded-full absolute left-0 top-0 z-10 cursor-pointer "
            ></div>
            {formData?.logo && (
              <div
                onClick={browseprofileImg}
                className="w-6 h-6 absolute bottom-[10px] right-0  bg-primary-brand-default rounded-full cursor-pointer"
              >
                <BrowseProfileSvg />
              </div>
            )}
          </div>
        </div>
        <div className="texts">
          <h4 className="text-[26px] font-bold mb-4">
            Upload Organization Logo
          </h4>
          <p>
            File formats - PNG, JPG, JPEG etc. <br />
            File should not be more then 3 MB.
          </p>
        </div>
      </div>
      <div className="w-full pb-[80px]">
        <div className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-10 items-baseline">
          <div className="col-span-full">
            <InputWithLabel
              label={"Organization Name"}
              maxlength={50}
              placeholder={"As it is in legal documents"}
              type={"text"}
              name="name"
              handler={(e) => handleChange(e)}
              value={formData?.name}
              isRequired
              info={"Organization name should be as it is legal documents."}
            />
          </div>
          <InputWithLabel
            label={"Organization Email"}
            placeholder={"Organization Email"}
            type={"email"}
            name="email"
            handler={(e) => handleChange(e)}
            value={formData.email}
            isRequired
            error={errors && errors.email ? errors.email : null}
          />
          {/* {!orgData?.organization?.mobile_no ? ( */}
          <div>
            <label className="text-14 font-bold">
              Organization Phone{" "}
              <sup className="text-danger-700 text-sm">*</sup>
            </label>
            <div
              className={`mt-1 rounded-[4px] border w-full ${
                errors?.mobile ? "border-red-600" : "border-[#798295]"
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
                  {/* {orgData?.organization?.mobile_no ? ( */}
                  {/* <input
                    className={`block px-2  w-full py-[9px] rounded focus:border-0 focus:ring-0 focus:outline-0`}
                    label={"Organization Phone"}
                    placeholder={"Organization Phone"}
                    type={"text"}
                    name="phone"
                    value={formData.phone}
                    handler={(e) => handleChange(e)}
                    isRequired
                    error={errors && errors.mobile ? errors.mobile : null}
                  /> */}
                  <input
                    className={`block px-2  w-full py-[9px] rounded focus:border-0 focus:ring-0 focus:outline-0`}
                    label={"Organization Phone"}
                    placeholder={"Organization Phone"}
                    type={"text"}
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const v = e.target.value;
                      // If user pastes with code, auto-detect and strip prefix
                      if (v?.trim().startsWith("+")) {
                        const detected = detectCountryByDialCode(v.trim());
                        if (detected?.country) {
                          setSelectedCountry(detected.country);
                          setFormData((prev) => ({
                            ...prev,
                            phone: detected.local,
                            phoneExist: false,
                          }));
                          return;
                        }
                      }
                      setFormData((prev) => ({ ...prev, phone: v }));
                    }}
                    isRequired
                    error={errors && errors.mobile ? errors.mobile : null}
                  />
                  {/* ) : null} */}
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
            <div className="text-red-600 text-sm">{errors?.mobile}</div>
          </div>
          {/* ) : ( */}
          {/* <InputWithLabel
            label={"Organization Phone"}
            placeholder={"Organization Phone"}
            type={"text"}
            name="phone"
            value={formData.phone}
            handler={(e) => handleChange(e)}
            isRequired
            error={errors && errors.mobile ? errors.mobile : null}
          /> */}
          {/* )} */}
        </div>

        <div className="mt-4">
          <div className="line h-[1px] mt-2 mb-4 bg-[#E4E6EA] md:col-span-2"></div>
          <div className="flex justify-between items-center md:col-span-2">
            <h4 className="text-lg font-bold">Organization Address</h4>
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
        ) : (
          <>
            <div className="col-span-full mt-4">
              <InputBluePrint
                label="Street Address"
                value={formData.street_address}
              />
            </div>
            <div
              // onClick={() => setLocationUpdateToggle(!locationUpdateToggle)}
              className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch"
            >
              {formData?.orgLocations &&
                formData?.orgLocations.length > 0 &&
                formData?.orgLocations.map((item, i) => (
                  <InputBluePrint
                    key={i}
                    label={item.type}
                    value={item.value}
                    isRequired
                  />
                ))}
            </div>
          </>
        )}

        <div className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-baseline">
          <div>
            <SelectBox
              defaultValue={
                selectedOrgaizationType
                  ? selectedOrgaizationType?.type_name
                  : null
              }
              handler={orgaizationTypesSelectHandler}
              list={
                typeData &&
                typeData.data &&
                typeData.data.length > 0 &&
                typeData.data.map((item) => ({
                  ...item,
                  label: item.type_name,
                  value: item.type_name,
                }))
              }
              label="Organization Type"
              loading={typeFetching}
            />
          </div>

          <div>
            <InputFullDate
              defaultValue={formData?.established_date}
              label={"Date Established"}
              futureDate={false}
              isRequired
              zIndexStyle={true}
              handler={(value) => establishedDateHandler(value)}
              error={
                errors && errors.established_date
                  ? errors.established_date
                  : null
              }
            />
          </div>

          <InputWithLabel
            label={"Total Employee"}
            placeholder={"Total Employee"}
            type={"number"}
            name="total_staff"
            handler={(e) => handleChange(e)}
            value={formData?.total_staff}
          />
          <InputWithLabel
            label={"Total Students"}
            placeholder={"Total Students"}
            type={"number"}
            name="total_student"
            handler={(e) => handleChange(e)}
            value={formData?.total_student}
          />
          <div className="col-span-full">
            <InputWithLabel
              label={"Website"}
              placeholder={"Ex. organization.com"}
              type={"url"}
              name="website_url"
              handler={(e) => handleChange(e)}
              value={formData?.website_url}
              error={errors && errors.website_url ? errors.website_url : null}
            />
          </div>
          <div className="col-span-full">
            <label className="text-14 font-bold capitalize">
              Social Media Links
            </label>
            {addContactLinks.map((item, i) => (
              <div key={i} className="flex space-x-4 items-center">
                <div className="w-[125px]">
                  <SelectBox
                    defaultValue={item?.type_name ? item?.type_name : null}
                    handler={handleCtypeChangeChange}
                    className="grid"
                    placeholder="Select"
                    list={
                      contactTypes &&
                      contactTypes.data &&
                      contactTypes.data.length > 0 &&
                      contactTypes.data.map((contactType) => ({
                        ...contactType,
                        parent_index: i,
                        label: contactType.type_name,
                        value: contactType.type_name,
                      }))
                    }
                    loading={contactTypesFetching}
                    onChange={(value) =>
                      handleInputChange(i, "type_name", value)
                    }
                    value={item.type_name}
                  />
                </div>
                <div className="flex-1">
                  <InputWithLabel
                    placeholder="Enter Link"
                    type="url"
                    name="social-media"
                    value={item.value}
                    handler={(e) =>
                      handleInputChange(i, "value", e.target.value)
                    }
                  />
                </div>
                <button
                  onClick={() =>
                    deleteContactLink(i, item?.uid ? item?.uid : null)
                  }
                  type="button"
                  className="w-[44px] h-[44px] rounded-lg flex justify-center items-center border border-primary-brand-700 hover:border-danger-700 text-primary-brand-700 hover:text-danger-700 "
                >
                  <span>
                    <svg
                      width="18"
                      height="20"
                      viewBox="0 0 18 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 4H13V3C13 2.20435 12.6839 1.44129 12.1213 0.87868C11.5587 0.316071 10.7956 0 10 0H8C7.20435 0 6.44129 0.316071 5.87868 0.87868C5.31607 1.44129 5 2.20435 5 3V4H1C0.734784 4 0.48043 4.10536 0.292893 4.29289C0.105357 4.48043 0 4.73478 0 5C0 5.26522 0.105357 5.51957 0.292893 5.70711C0.48043 5.89464 0.734784 6 1 6H2V17C2 17.7956 2.31607 18.5587 2.87868 19.1213C3.44129 19.6839 4.20435 20 5 20H13C13.7956 20 14.5587 19.6839 15.1213 19.1213C15.6839 18.5587 16 17.7956 16 17V6H17C17.2652 6 17.5196 5.89464 17.7071 5.70711C17.8946 5.51957 18 5.26522 18 5C18 4.73478 17.8946 4.48043 17.7071 4.29289C17.5196 4.10536 17.2652 4 17 4ZM7 3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2H10C10.2652 2 10.5196 2.10536 10.7071 2.29289C10.8946 2.48043 11 2.73478 11 3V4H7V3ZM14 17C14 17.2652 13.8946 17.5196 13.7071 17.7071C13.5196 17.8946 13.2652 18 13 18H5C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17V6H14V17Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            ))}

            {contactTypes &&
              contactTypes.data.length > 0 &&
              contactTypes.data.length > addContactLinks.length && (
                <div className="d-flex justify-start items-center gap-2 mt-4">
                  <button
                    type="button"
                    className="flex justify-start items-center gap-2"
                    onClick={addNewLink}
                  >
                    <Image
                      src="/assets/img/logos/add.svg"
                      alt="plus"
                      width={18}
                      height={18}
                    />
                    <label htmlFor="" className="font-bold">
                      Add another link
                    </label>
                  </button>
                </div>
              )}
          </div>
        </div>
        <div className="md:col-span-2 flex md:flex-row flex-col gap-5 justify-between items-center text-right mt-10 ">
          {/* <div className="w-full flex justify-between items-center mt-10 gap-3"> */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className=" border border-black text-black text-lg rounded-[8px] font-bold bg-[#fff] py-[13px] px-[24px]"
            // className="btn bg-[#fff] md:w-auto  border border-black py-[13px]  lg:px-[24px] px-2 font-bold text-lg rounded-[8px] text-black"
          >
            Previous Step
          </button>
          <button
            disabled={photoUploadLoading || isLoading}
            type="button"
            onClick={updateOrganizationHandler}
            className="  bg-[#22252B] disabled:cursor-not-allowed disabled:opacity-50  py-[13px] lg:px-[24px] px-3 font-bold text-lg rounded-[8px] text-white flex justify-center items-center"
          >
            {isLoading ? <SvgLoader className="text-white" /> : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrganizationProfileSetup;
