"use client";
import InputFullDate from "@/components/common/Inputs/Input/InputFullDate";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import cleanObject from "@/components/helpers/cleanObject";
import isSame from "@/components/helpers/isSame";
import { DeleteSvg, EditSvg } from "@/components/helpers/storeAllSvgs";
import { uploadImageAndProcess } from "@/components/helpers/uploadImageAndProcess";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import {
  useCheckEmailExistOrNotMutation,
  useContactTypesQuery,
} from "@/store/features/auth/apiSlice";
import { useUploadPhotoMutation } from "@/store/features/file-upload/apiSlice";
import { useTeacherProfileUpdateMutation } from "@/store/features/teacher-management/apiSlice";
import { updateTeacherStepOneSchema } from "@/utilities/validationRules/schemas/updateTeacherSchema";
import { message } from "antd";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import countries from "./../../../../../data/CountryCodes";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const genders = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];
function PersonalInformation({ prevData, modalOpen }) {
  /*======== initilize apis ========*/

  const [checkEmailExistOrNot] = useCheckEmailExistOrNotMutation();
  const { data: contactTypes, isFetching: contactTypesFetching } =
    useContactTypesQuery();
  const [uploadPhoto, { isLoading: photoUploadLoading, error: uploadError }] =
    useUploadPhotoMutation();
  const [teacherProfileUpdate, { isLoading, error }] =
    useTeacherProfileUpdateMutation();

  /*========= states & functions =========*/
  // general state

  const [bio, setBio] = useState("");
  const initialState = {
    name: "",
    designation: "",
    dob: "",
    gender: "",
    mobile: "",
    joiningDate: "",
    email: "",
    profile_picture: "",
    bio: "",
  };
  const [generalData, setGeneralData] = useState(initialState);
  const generalDataHandler = (e) => {
    setGeneralData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* 
   Hybrid Data: Image
  */

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
          setGeneralData((prev) => ({
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
  /* 
   Hybrid Data: Social Media
  */
  // contact type feature

  const [addContactLinks, setAddContactLinks] = useState([
    {
      updateId: null,
      id: null,
      type_name: "",
      value: "",
    },
  ]);

  // Function to add a new contact link
  const addNewLink = () => {
    setAddContactLinks([
      ...addContactLinks,
      { updateId: null, id: null, type_name: "", value: "" },
    ]);
  };
  // function to handle select change
  const handleCtypeChangeChange = (value, option) => {
    const existOrNot = addContactLinks?.some((item) => item.id === option.id);
    if (!existOrNot) {
      const updatedLinks = addContactLinks?.map((link, i) =>
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
            updateId: null,
            id: null,
            type_name: "",
            value: "",
          },
        ]);
      }
    }
  };

  // Function to handle input change
  const handleInputChange = (index, field, value) => {
    const updatedLinks = addContactLinks?.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    setAddContactLinks(updatedLinks);
  };

  /* 
    Find Previous data and set data into available variable
*/
  useEffect(() => {
    if (prevData) {
      setGeneralData(prevData);
      setBio(prevData.bio);
      const contactLinks = prevData?.addContactLinks?.map((item) => ({
        updateId: item?.id,
        id: item?.contact_type_id?.id,
        type_name: item?.contact_type_id?.type_name,
        value: item?.contact,
      }));
      setAddContactLinks(contactLinks);
    }
  }, [prevData]);

  // errors
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);

  // check email exists or not
  const [emailExists, setEmailExists] = useState(false);

  //  onBlur handler
  const checkEmail = async (value) => {
    const { data: isEmailExist } = await checkEmailExistOrNot(value);
    if (isEmailExist?.success) {
      setEmailExists(true);
    } else {
      setEmailExists(false);
    }
  };

  //   error watcher
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        message.error(error.data.message);
      } else {
        message.error(error.data.message);
      }
    }
  }, [error]);

  const redirectToAnotherPage = () => {};
  const resetCookie = () => {};

  // main operation handler
  const stepHandler = async () => {
    // Only validate, don't update yet
    try {
      const data = {
        ...generalData,
        gender: generalData.gender.toLowerCase(),
        profile_picture:
          generalData?.profile_picture === ""
            ? DefaultProfile.src
            : generalData?.profile_picture,
        addContactLinks: addContactLinks.filter(
          (link) => link.id && link.value
        ),
      };

      await updateTeacherStepOneSchema.validate(
        {
          ...data,
          bio: bio?.trim(),
        },
        {
          abortEarly: false,
          context: { emailExists },
        }
      );

      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];

      const combinedMobile = (
        selectedCountry?.dial_code
          ? `${selectedCountry.dial_code}${data?.mobile ?? ""}`
          : data?.mobile
      )?.replace(/\s+/g, "");

      const designationChanged = data?.designation !== prevData?.designation;

      const readyData = {
        people: {
          first_name: isSame(data?.firstName, prevData?.firstName),
          last_name: isSame(data?.lastName, prevData?.lastName),
          profile_picture: "",
          dob: isSame(data?.dob, prevData?.dob),
          designation: isSame(data?.designation, prevData?.designation),
          designation_date: designationChanged && formattedDate,
          gender: isSame(data?.gender, prevData?.gender),
          bio:
            bio?.trim() === ""
              ? null
              : isSame(bio?.trim(), prevData?.bio ?? null),
          joining_date: isSame(data?.joiningDate, prevData?.joiningDate),
          emailOptional: isSame(data?.emailOptional, prevData?.emailOptional),
          email: isSame(data?.email, prevData?.email),
          mobile_no: isSame(combinedMobile, prevData?.mobile),
        },
        people_contacts: data?.addContactLinks?.length
          ? data?.addContactLinks?.map((contact) => ({
              id: contact?.updateId,
              contact: contact.value,
              contact_type_id: contact.id,
            }))
          : null,
      };

      const sendData = cleanObject(readyData);

      if (formImg) {
        await uploadImageAndProcess({
          uploadApi: uploadPhoto,
          imageFile: formImg,
          onSuccess: async (imageUrl) => {
            await teacherProfileUpdate({
              id: prevData?.teacherId,
              data: {
                ...sendData,
                people: {
                  ...sendData?.people,
                  profile_picture: imageUrl,
                },
              },
              redirectAnotherPage: redirectToAnotherPage,
              resetCookie: resetCookie,
            });
          }, // Dynamic API call

          onError: async (error) =>
            await teacherProfileUpdate({
              id: prevData?.teacherId,
              data: {
                ...sendData,
                people: {
                  ...sendData?.people,
                  profile_picture: undefined,
                },
              },
              redirectAnotherPage: redirectToAnotherPage,
              resetCookie: resetCookie,
            }),
        });
      } else {
        await teacherProfileUpdate({
          id: prevData?.teacherId,
          data: {
            ...sendData,
            people: {
              ...sendData?.people,
              profile_picture: undefined,
            },
          },
          redirectAnotherPage: redirectToAnotherPage,
          resetCookie: resetCookie,
        });
      }

      modalOpen(true);
    } catch (err) {
      console.log(err);
      const allMessages = err.inner?.map((error, i) => {
        return error.message;
      });
      setErrors(allMessages);

      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth" });
      }
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

  // console.log(generalData.mobile)

  return (
    <>
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
            {errors?.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div className="w-[130px] h-[130px]">
          {generalData?.profile_picture ? (
            <div className="w-full h-full relative">
              {formImg ? (
                <img
                  src={
                    generalData?.profile_picture
                      ? `${process.env.NEXT_PUBLIC_FILE_BROWSE_URL}${generalData?.profile_picture}`
                      : DefaultProfile.src
                  }
                  alt="upload"
                  className="w-full h-full rounded-full bg-[#E4E6EA]"
                />
              ) : (
                <img
                  src={
                    generalData?.profile_picture
                      ? `${process.env.FILE_BROWSE_URL}${generalData?.profile_picture}`
                      : DefaultProfile.src
                  }
                  alt="upload"
                  className="w-full h-full rounded-full bg-[#E4E6EA]"
                />
              )}

              <div
                onClick={browseprofileImg}
                className="p-2 absolute bottom-[4px] right-0 bg-primary-brand-default flex items-center justify-center rounded-full cursor-pointer border-white border-2"
              >
                <EditSvg fill="white" width="20" height="20" />
              </div>
            </div>
          ) : (
            <div
              onClick={browseprofileImg}
              className="w-32 h-32 flex flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-400 bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
            >
              <span className="text-6xl font-bold text-gray-600">+</span>
              {/* <p className="text-sm text-gray-500 mt-1">Upload Image</p> */}
            </div>
          )}

          <input
            ref={profileImgInput}
            onChange={(e) => profileImgChangHandler(e)}
            type="file"
            className="hidden"
          />
        </div>
        {/* <div
          onClick={browseprofileImg}
          className="flex-1 uploader border border-dashed border-[#AEB4BF] py-4 px-6 rounded-[12px] w-full cursor-pointer"
        >
          <div className="flex mb-3 justify-center items-center gap-3">
            <span className="font-bold">Update A Formal Picture</span>
          </div>

          <p className="text-xs text-center">
            The picture should be a portrait and clear. It will be used for
            identification. File formats - PNG, JPG, JPEG etc. File should not
            be more then 3 MB.
          </p>
        </div> */}
      </div>

      <div className="grid grid-cols-1 gap-3 align-bottom">
        {/* name */}
        <InputWithLabel
          label={"First Name"}
          maxlength={30}
          placeholder={"First Name"}
          type={"text"}
          name="firstName"
          value={generalData?.firstName}
          handler={(e) => generalDataHandler(e)}
          noNumbersAndSpecialChars={true}
        />

        <InputWithLabel
          maxlength={30}
          label={"Last Name"}
          placeholder={"Last Name"}
          type={"text"}
          name="lastName"
          value={generalData?.lastName}
          handler={(e) => generalDataHandler(e)}
          noNumbersAndSpecialChars={true}
        />
        <InputWithLabel
          label={"Designation"}
          maxlength={30}
          placeholder={"Designation"}
          type={"text"}
          name="designation"
          value={generalData?.designation}
          handler={(e) => generalDataHandler(e)}
        />
        <InputFullDate
          defaultValue={generalData?.dob}
          handler={(date) => setGeneralData((prev) => ({ ...prev, dob: date }))}
          label={"Date of Birth"}
        />
        <div className="">
          <SelectBox
            defaultValue={generalData?.gender}
            list={
              genders?.length > 0 &&
              genders?.map((item) => ({
                ...item,
                label: item?.label,
                value: item?.value,
              }))
            }
            handler={(value) =>
              setGeneralData((prev) => ({ ...prev, gender: value }))
            }
            label="Gender"
          />
        </div>
        <InputWithLabel
          label={"Phone Number"}
          placeholder={"Phone Number"}
          type={"text"}
          name="mobile"
          value={generalData?.mobile}
          disabled={true}
          // handler={(e) => generalDataHandler(e)}
        />
        {/* <div>
          <label className="text-14 font-bold flex">Phone Number</label>
          <div
            className={`mt-1 rounded-[4px] border border-[#798295] w-full focus-within:outline focus-within:outline-2 focus-within:outline-blue-700`}
          >
            <div className="relative h-full">
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
                  type={"tel"}
                  placeholder={"Phone Number"}
                  value={generalData?.mobile ?? ""}
                  onChange={(e) =>
                    setGeneralData((prev) => ({
                      ...prev,
                      mobile: e.target.value,
                    }))
                  }
                  name="mobile"
                />
              </div>
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
        </div> */}
        <div className="">
          <InputFullDate
            defaultValue={generalData?.joiningDate}
            futureDate={false}
            handler={(date) =>
              setGeneralData((prev) => ({
                ...prev,
                joiningDate: date,
              }))
            }
            label={"Joining Date"}
          />
        </div>
        <InputWithLabel
          label={"E-Mail"}
          placeholder={"Email"}
          name="email"
          value={generalData?.email}
          disabled={true}
        />
        <InputWithLabel
          label={"Additional E-Mail"}
          placeholder={"Email optional"}
          type={"email"}
          name="email optional"
          value={generalData?.emailOptional}
          handler={(e) => generalDataHandler(e)}
          onBlur={(e) =>
            prevData?.emailOptional !== generalData?.emailOptional
              ? checkEmail(e.target.value)
              : () => {}
          }
          error={
            emailExists ? "Email already associate with another account " : ""
          }
        />
        <div className=" ">
          {addContactLinks?.map((item, i) => (
            <div key={i} className="flex space-x-4 items-center ">
              <div className="">
                <label className="text-14 font-bold capitalize">
                  Social Media
                </label>
                <div className="w-[125px] ">
                  <SelectBox
                    defaultValue={item?.type_name ? item?.type_name : null}
                    handler={handleCtypeChangeChange}
                    className="grid"
                    placeholder="Select"
                    list={
                      contactTypes?.data?.length > 0 &&
                      contactTypes?.data?.map((contactType) => ({
                        ...contactType,
                        parent_index: i,
                        label: contactType?.type_name,
                        value: contactType?.type_name,
                      }))
                    }
                    loading={contactTypesFetching}
                    onChange={(value) =>
                      handleInputChange(i, "type_name", value)
                    }
                    value={item.type_name}
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="text-14 font-bold capitalize">
                  Enter Link
                </label>
                <div>
                  <InputWithLabel
                    placeholder="https://www.example.com"
                    type="url"
                    name="social-media"
                    value={item.value}
                    handler={(e) =>
                      handleInputChange(i, "value", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex items-end justify-end  pt-8 ">
                <DeleteSvg className=" cursor-pointer" />
              </div>
            </div>
          ))}

          {contactTypes?.data?.length > 0 &&
            contactTypes?.data?.length > addContactLinks?.length && (
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
                  <label htmlFor="" className="font-bold">
                    Add Another Social Link
                  </label>
                </button>
              </div>
            )}
        </div>
        <div>
          <label htmlFor="" className="text-14 font-bold flex items-center">
            Short Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            name=""
            className="border w-full resize-none mt-2 rounded-[8px] border-[#798295] p-3"
            rows={3}
            placeholder="Type Your Bio"
            id=""
          ></textarea>
        </div>
      </div>

      <div className="mb-3 mt-[62px] text-right">
        <button
          disabled={photoUploadLoading || isLoading}
          onClick={stepHandler}
          type="button"
          className="bg-black text-white disabled:cursor-not-allowed disabled:opacity-50 py-[13px] px-[24px] rounded-[5px] font-bold"
        >
          {isLoading ? <SvgLoader className="text-white" /> : "Save Changes"}
        </button>
      </div>
    </>
  );
}

export default PersonalInformation;
