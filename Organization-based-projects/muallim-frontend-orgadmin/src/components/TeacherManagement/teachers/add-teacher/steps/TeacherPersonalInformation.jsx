/**
 * TeacherPersonalInformation Component
 * This component handles the first step of the teacher registration form.
 * It manages personal information, contact details, social media links, and identification documents.
 */

"use client";
import InputFullDate from "@/components/common/Inputs/Input/InputFullDate";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import {
  DeleteSvg,
  DownArrowSvg,
  PlusSvg,
} from "@/components/helpers/storeAllSvgs";
import { uploadImageAndProcess } from "@/components/helpers/uploadImageAndProcess";
import {
  useCheckEmailExistOrNotMutation,
  useContactTypesQuery,
  useIdentificationTypesQuery,
} from "@/store/features/auth/apiSlice";
import { useUploadPhotoMutation } from "@/store/features/file-upload/apiSlice";
import { inviteTeacherStepOneSchema } from "@/utilities/validationRules/schemas/inviteTeacherSchema";
import { message } from "antd";
import { getCookie } from "cookies-next";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import countries from "./../../../../../data/CountryCodes";

// ===================== Constants Section =====================

// Predefined options for gender selection
const genders = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

function TeacherPersonalInformation({
  nextStepHandler,
  storeHandler,
  defaultData,
}) {
  // ===================== State Management Section =====================

  // Initial state for personal information form fields
  const initialState = {
    name: "",
    designation: "",
    dob: "",
    gender: "",
    mobile: "",
    joiningDate: "",
    email: "",
    profile_picture: "",
  };

  // Form state management
  const [generalData, setGeneralData] = useState(initialState);
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null); // Email existence check functionality

  // ===================== Effects Section =====================
  /**
   * Initialize form with default data if available
   * Updates when defaultData changes
   */
  useEffect(() => {
    if (defaultData) {
      setGeneralData({
        ...initialState,
        ...defaultData,
      });

      // Map contact details from the API response
      if (
        defaultData?.contact_details &&
        defaultData.contact_details.length > 0
      ) {
        const mappedContacts = defaultData.contact_details.map((contact) => ({
          id: contact.contact_type_id?.id || null,
          type_name: contact.contact_type_id?.type_name || "",
          value: contact.contact || "",
        }));

        // Filter out empty contacts and set the state
        const validContacts = mappedContacts.filter(
          (contact) => contact.id && contact.type_name && contact.value
        );

        if (validContacts.length > 0) {
          setAddContactLinks(validContacts);
        }
      }
    }
  }, [defaultData]);

  // ===================== Event Handlers Section =====================
  /**
   * Handles changes in form input fields
   * Updates the corresponding state value based on input name
   */

  // const generalDataHandler = (e) => {
  //   setGeneralData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  // };

  const generalDataHandler = (e) => {
    if (e.target.name === "email" && emailExists) setEmailExists(false);
    setGeneralData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Resets form data to initial state
  const resetGeneralData = () => {
    setGeneralData(initialState);
  };

  // ===================== Profile Image Section =====================

  // State and handlers for profile image upload
  const [formImg, setFormImag] = useState(null);
  const profileImgInput = useRef(null);

  // Triggers file input click for profile image upload
  const browseprofileImg = () => {
    profileImgInput.current.click();
  };

  /**
   * Handles profile image file selection and validation
   * Validates file type and size before processing
   */
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

      const fileSizeInMB = file.size / (1024 * 1024);

      if (fileSizeInMB > 3) {
        message.error("File size exceeds 3MB limit");
      } else {
        const imgReader = new FileReader();
        imgReader.onload = (event) => {
          setGeneralData((prev) => ({
            ...prev,
            profile_picture: event.target.result,
          }));
        };
        imgReader.readAsDataURL(file);
        setFormImag(file);
      }
    }
    inputElement.value = "";
  };

  // ===================== Social Media Links Section =====================

  // State and handlers for social media contact links

  const [contactTypes, setContactTypes] = useState(null);
  const {
    data: contactTypesData,
    isFetching: contactTypesFetching,
    refetch: reFetchContactTypesData,
  } = useContactTypesQuery();

  // Initialize contact types from API
  useEffect(() => {
    if (!contactTypesFetching && contactTypesData) {
      setContactTypes(contactTypesData);
    }
  }, [contactTypesFetching, contactTypesData]);

  // State for managing social media links
  const [addContactLinks, setAddContactLinks] = useState([
    {
      id: null,
      type_name: "",
      value: "",
    },
  ]);

  /**
   * Adds a new social media link field
   */
  const addNewLink = () => {
    setAddContactLinks([
      ...addContactLinks,
      { id: null, type_name: "", value: "" },
    ]);
  };

  /**
   * Handles contact type selection
   * Prevents duplicate contact types
   */
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
      if (filteredLinks.length > 0) {
        setAddContactLinks(filteredLinks);
      } else {
        setAddContactLinks([
          {
            id: null,
            type_name: "",
            value: "",
          },
        ]);
      }
    }
  };

  /**
   * Handles input changes for social media links
   */
  const handleInputChange = (index, field, value) => {
    const updatedLinks = addContactLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    setAddContactLinks(updatedLinks);
  };

  // ===================== Document Management Section =====================
  /**
   * State and handlers for identification documents
   */
  const [documentsData, setDocumentsData] = useState([
    {
      licenceNumber: "",
      type_name: "",
      type_id: null,
    },
  ]);

  /**
   * Adds a new document field
   */
  const addNewDocument = () => {
    if (documentsData?.length >= 6) {
      message.error("You cannot add more than 6 identification documents");
      return;
    }
    setDocumentsData([
      ...documentsData,
      { licenceNumber: "", type_name: "", type_id: null },
    ]);
  };

  /**
   * Handles document data changes
   * Manages both input and select type changes
   */
  const documentsDataHandler = (index, value, option, type = "input") => {
    if (type === "input") {
      setDocumentsData((prev) => {
        const updateItem = prev.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              licenceNumber: value,
            };
          } else {
            return item;
          }
        });
        return updateItem;
      });
    } else {
      setDocumentsData((prev) => {
        const updateItem = prev.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              type_name: value,
              type_id: option.id,
            };
          } else {
            return item;
          }
        });
        return updateItem;
      });
    }
  };

  // ===================== API Integration Section =====================
  /**
   * Fetch identification types from API
   */
  const [identificationTypesData, setIdentificationTypeData] = useState([]);
  const { data: identificationTypes, isFetching: loaderForIdentifications } =
    useIdentificationTypesQuery();

  useEffect(() => {
    if (identificationTypes) {
      setIdentificationTypeData(identificationTypes?.data);
    }
  }, [identificationTypes]);

  // Email existence check functionality
  const [emailExists, setEmailExists] = useState(false);
  const [checkEmailExistOrNot] = useCheckEmailExistOrNotMutation();

  // Checks if email already exists in the system
  const checkEmail = async (value) => {
    const { data: isEmailExist } = await checkEmailExistOrNot(value);
    if (isEmailExist?.success) {
      setEmailExists(true);
    } else {
      setEmailExists(false);
    }
  };

  // country states
  const [countryDropDowntoggle, setCountryDropDownToggle] = useState(false);
  const [getCountries, setGetCountries] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const selectCountryhandler = (value) => {
    setSelectedCountry(value);
    setCountryDropDownToggle(false);
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

  /**
   * Photo upload functionality
   */
  const [uploadPhoto, { isLoading: photoUploadLoading, error: uploadError }] =
    useUploadPhotoMutation();
  // step handler

  // ===================== Form Submission Section =====================
  /**
   * Handles form submission and validation
   * Processes all form data and moves to next step if valid
   */
  const stepHandler = async () => {
    const data = {
      ...generalData,
      gender: generalData?.gender?.toLowerCase(),
      profile_picture:
        generalData?.profile_picture === ""
          ? "no_img"
          : generalData?.profile_picture,
      documentsData: documentsData.filter(
        (doc) => doc.type_name && doc.type_id
      ),
      addContactLinks: addContactLinks?.filter((link) => link.id && link.value),
    };

    try {
      await inviteTeacherStepOneSchema.validate(
        {
          ...data,
        },
        {
          abortEarly: false,
          context: { emailExists },
        }
      );

      if (formImg) {
        await uploadImageAndProcess({
          uploadApi: uploadPhoto,
          imageFile: formImg,
          onSuccess: async (imageUrl) => {
            await storeHandler({
              ...data,
              profile_picture: imageUrl,
            });
            nextStepHandler(2);
          }, // Dynamic API call
          onError: async (error) => {
            await storeHandler({
              ...data,
            });
            nextStepHandler(2);
          },
        });
      } else {
        storeHandler({
          ...data,
        });
        nextStepHandler(2);
      }
    } catch (err) {
      // console.log(err.inner);
      const allMessages = err.inner.map((error) => {
        // Handle specific error messages for different fields
        if (error.path === "dob") {
          return error.message;
        }
        if (error.path === "joiningDate") {
          return error.message;
        }
        if (error.path.startsWith("documentsData")) {
          return "At least one valid document is required.";
        }
        return error.message;
      });

      // Remove duplicate error messages
      const uniqueMessages = [...new Set(allMessages)];
      setErrors(uniqueMessages);

      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const deleteSocialMediaLink = (index) => {
    const updatedLinks = addContactLinks?.filter((_, i) => i !== index);
    setAddContactLinks(updatedLinks);
  };

  const deleteDocument = (index) => {
    const updatedDocuments = documentsData?.filter((_, i) => i !== index);
    setDocumentsData(updatedDocuments);
  };

  // ===================== Render Section =====================
  return (
    <>
      {/* Error Display Section */}
      {errors && errors.length && (
        <div
          ref={errorRef}
          className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-semibold text-lg">
            Please check your{" "}
            <span className="font-bold">Invalid Information</span>:
          </p>
          <ul className="list-disc ml-5 mt-2">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Information Section */}
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-3 ">
        {/* Name Display */}
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">Your Name</p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {generalData?.name}
          </div>
        </div>

        {/* Designation Display */}
        <div className="w-full">
          <p className="text-14 font-bold flex items-center">Designation</p>
          <div className="border w-full h-[45px] px-4 mt-1 rounded-[4px] border-[#798295] bg-[#F2F3F5] flex items-center text-base leading-[26px] text-primary-brand-900">
            {generalData?.designation}
          </div>
        </div>
      </div>
      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

      <div className="flex justify-between items-center gap-4">
        <div>
          {generalData?.profile_picture ? (
            <>
              {formImg ? (
                <img
                  src={
                    generalData?.profile_picture
                      ? `${generalData?.profile_picture}`
                      : ``
                  }
                  className="w-[100px] h-[100px] rounded-full  overflow-hidden object-cover"
                  alt=""
                />
              ) : (
                <img
                  src={
                    generalData?.profile_picture
                      ? `${
                          process.env.FILE_BROWSE_URL +
                          generalData?.profile_picture
                        }`
                      : `/assets/img/logos/plus.svg`
                  }
                  className="w-[100px] h-[100px] rounded-full  overflow-hidden object-cover"
                  alt=""
                />
              )}
            </>
          ) : (
            <div className="w-[100px] h-[100px] rounded-full bg-[#D9D9D9]"></div>
          )}
        </div>
        <div
          onClick={browseprofileImg}
          className="flex-1 uploader border border-dashed border-[#AEB4BF] py-4 px-6 rounded-[12px] w-full cursor-pointer"
        >
          <div className="flex mb-3 justify-center items-center gap-3">
            {/*  svg here  */}
            <span className="font-bold">Upload A Formal Picture</span>
          </div>

          <p className="text-xs text-center">
            The picture should be a portrait and clear. It will be used for
            identification. File formats - PNG, JPG, JPEG etc. File should not
            be more then 3 MB.
          </p>
          <input
            ref={profileImgInput}
            onChange={(e) => profileImgChangHandler(e)}
            type="file"
            className="hidden"
            accept="image/png, image/jpg, image/jpeg"
          />
        </div>
      </div>

      <div className="line my-6 bg-[#E4E6EA]"></div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-3 align-bottom ">
        {/* Date of Birth */}
        <InputFullDate
          defaultValue={generalData?.dob}
          handler={(date) => setGeneralData((prev) => ({ ...prev, dob: date }))}
          label={"Date of Birth"}
          isRequired
          className="!table"
        />

        {/* Gender Selection */}
        <div className="mt-1">
          <SelectBox
            list={
              genders &&
              genders.length > 0 &&
              genders.map((item) => ({
                ...item,
                label: item.value,
                value: item.value,
              }))
            }
            handler={(value) =>
              setGeneralData((prev) => ({ ...prev, gender: value }))
            }
            defaultValue={generalData.gender}
            isRequired
            label="Gender"
            inputHeight="!h-[43px]"
            className="!grid w-full"
          />
        </div>

        <div>
          <label className="text-14 font-bold flex">
            Phone Number<sup className="text-danger-700">*</sup>
          </label>
          <div
            className={`mt-1 rounded-[4px] border border-[#798295] w-full focus-within:outline focus-within:outline-2 focus-within:outline-blue-700`}
          >
            <div className="relative h-full">
              {/* country select button */}
              <div className="flex items-center h-full">
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
                  className={`block px-2  w-full py-[9px] rounded focus:border-0 focus:ring-0 focus:outline-0 h-full`}
                  type={"number"}
                  placeholder={"Phone Number"}
                  value={generalData.mobile}
                  onChange={(e) => generalDataHandler(e)}
                  // defaultValue={generalData?.mobile}
                  // onBlur={(e) => checkMobile(e.target.value)}
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
          {/* {errors && errors.mobile && (
            <p className="text-danger-700 text-sm">{errors.mobile}</p>
          )}
          {mobileExists && (
            <p className="text-danger-700 text-sm">
              Phone already associate with another account
            </p>
          )} */}
        </div>

        {/* Joining Date */}
        <div className="">
          <InputFullDate
            futureDate={false}
            defaultValue={generalData?.joiningDate}
            handler={(date) =>
              setGeneralData((prev) => ({ ...prev, joiningDate: date }))
            }
            label={"Joining Date"}
            isRequired
          />
        </div>

        {/* Additional Email */}
        <InputWithLabel
          label={"Additional Email (Optional)"}
          placeholder={"Email"}
          type={"email"}
          name="email"
          value={generalData?.email}
          handler={(e) => generalDataHandler(e)}
          onBlur={(e) => checkEmail(e.target.value)}
          error={
            emailExists ? "Email already associate with another account " : ""
          }
        />

        {/* Social Media Links Section */}
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
                    contactTypes.data.length &&
                    contactTypes.data.map((contactType, i) => ({
                      ...contactType,
                      parent_index: i,
                      label: contactType.type_name,
                      value: contactType.type_name,
                    }))
                  }
                  onChange={(value) => handleInputChange(i, "type_name", value)}
                  value={item.type_name}
                />
              </div>
              <div className="flex-1">
                <InputWithLabel
                  placeholder="Enter Link"
                  type="url"
                  name="social-media"
                  value={item.value}
                  handler={(e) => handleInputChange(i, "value", e.target.value)}
                />
              </div>
              <div
                className="cursor-pointer border-b rounded-lg"
                onClick={() => deleteSocialMediaLink(i)}
              >
                <DeleteSvg />
              </div>
            </div>
          ))}

          {/* Add Social Media Link Button */}
          {contactTypes &&
            contactTypes.data.length > 0 &&
            contactTypes.data.length > addContactLinks.length && (
              <div className="d-flex justify-start items-center gap-2 mt-4">
                <button
                  type="button"
                  className="flex justify-start items-center gap-2 cursor-pointer"
                  onClick={addNewLink}
                >
                  <Image
                    src="/assets/img/logos/add.svg"
                    alt="plus"
                    width={18}
                    height={18}
                  />
                  <span className="font-bold">Add another link</span>
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Document Section */}
      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

      {/* Identification Documents */}
      {documentsData.map((document, i) => (
        <div
          key={i}
          className="flex cus-flex-2 lg:flex-cols-2 flex-cols-2 gap-3 align-bottom mb-3 justify-between items-center"
          // className="grid cus-grid-1 lg:grid-cols-2 grid-cols-1 gap-3 align-bottom mb-3"
        >
          <div className="w-full">
            <SelectBox
              list={
                identificationTypesData &&
                identificationTypesData.length > 0 &&
                identificationTypesData.map((item) => ({
                  ...item,
                  label: item?.type_name,
                  value: item?.type_name,
                }))
              }
              // isRequired={i === 0}
              label="ID Type"
              handler={(value, option) =>
                documentsDataHandler(i, value, option, "select")
              }
            />
          </div>
          <div className="w-full">
            {" "}
            <InputWithLabel
              value={documentsData[i].licenceNumber}
              label={"Number"}
              placeholder={"Number"}
              type={"text"}
              name="Id Number"
              handler={(e) => documentsDataHandler(i, e.target.value, null)}
              // isRequired={i === 0}
            />
          </div>
          <div
            onClick={() => deleteDocument(i)}
            className="pt-6 border-b rounded-lg contrast-pointer"
          >
            <DeleteSvg />
          </div>
        </div>
      ))}

      {/* Add Document Button */}
      <button
        onClick={() => addNewDocument()}
        className="flex justify-start items-center mt-4 gap-3"
      >
        <div className="border-2 border-[#22252B] p-[3px] font-bold">
          <PlusSvg BG={"black"} width={9} height={8} />
        </div>
        <span className="font-bold">Add another ID</span>
      </button>

      {/* Navigation Button */}
      <div className="flex">
        <button
          className="bg-black rounded-[8px] ml-2 px-[50px] py-3 text-white font-bold block mx-auto mt-10 w-full"
          onClick={stepHandler}
        >
          Next
        </button>
      </div>
    </>
  );
}

export default TeacherPersonalInformation;
