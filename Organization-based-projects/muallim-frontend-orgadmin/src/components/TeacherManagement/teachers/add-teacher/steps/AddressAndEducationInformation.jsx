"use client";
import InputDateRangePicker from "@/components/common/Inputs/Input/InputDateRangePicker";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import InputYear from "@/components/common/Inputs/Input/InputYear";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { location_type_id_eighteen } from "@/static/static";
import { message } from "antd";
import {
  useDesignationListQuery,
  useEmployeeDegreeListQuery,
  useEmployeeInstituteListQuery,
} from "@/store/features/auth/apiSlice";
import { DeleteSvg } from "@/components/helpers/storeAllSvgs";
import { inviteTeacherStepTwoSchema } from "@/utilities/validationRules/schemas/inviteTeacherSchema";
import React, { useState, useEffect, useRef } from "react";
import useLocationSelector from "@/hooks/useLocationSelector";

function AddressAndEducationInformation({
  nextStepHandler,
  prevStepHandler,
  storeHandler,
  defaultData,
}) {
  // ===================== Error Handling Section =====================
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);

  // ===================== Bio Information Section =====================
  const [bio, setBio] = useState("");
  const characterLimit = 250;
  const handleChange = (e) => {
    const { value } = e.target;
    if (value.length <= characterLimit) {
      setBio(value);
    }
  };
  const [street_address, setStreetAddress] = useState("");

  /* 
  Hybrid Data: Education
   */
  const [educations, setEducations] = useState([
    {
      id: null,
      degree: "",
      degree_exist: true,
      degree_name: "",
      institute: "",
      institute_exist: true,
      institute_name: "",
      year: "",
    },
  ]);

  useEffect(() => {
    if (defaultData) {
      // Check if we have education data in defaultData
      if (
        defaultData.people_educations &&
        defaultData.people_educations.length > 0
      ) {
        // Map all education entries from defaultData
        const defaultEducations = defaultData.people_educations.map((edu) => ({
          id: edu.id || null,
          degree: edu.degree_id?.degree || "",
          degree_exist: true,
          institute: edu.organization_id?.name || "",
          institute_exist: true,
          year: edu.completion_year || "",
        }));
        setEducations(defaultEducations);
      } else if (
        defaultData.educations_degree ||
        defaultData.educations_complete_year ||
        defaultData.people_educations_instatute
      ) {
        // Fallback to single education (existing logic)
        setEducations([
          {
            id: null,
            degree: defaultData.educations_degree || "",
            degree_exist: true,
            institute: defaultData.people_educations_instatute || "",
            institute_exist: true,
            year: defaultData.educations_complete_year || "",
          },
        ]);
      }
    }
  }, [defaultData]);

  const addNewEducation = () => {
    if (educations?.length >= 10) {
      message.warning("You can only add up to 10 degrees.");
      return;
    }

    setEducations([
      ...educations,
      {
        id: null,
        degree: "",
        degree_exist: true,
        degree_name: "",
        institute: "",
        institute_exist: true,
        institute_name: "",
        year: "",
      },
    ]);
  };
  const deleteEducation = (index) => {
    const updatedEducations = educations?.filter((item, i) => i !== index);
    setEducations(updatedEducations);
  };
  const educationDataHandler = (index, value, option, type = "input", name) => {
    if (type === "input") {
      setEducations((prev) => {
        const updateItem = prev.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              year: value,
            };
          } else {
            return item;
          }
        });
        return updateItem;
      });
    } else {
      if (option) {
        // When selecting from dropdown
        setEducations((prev) => {
          const updateItem = prev.map((item, i) => {
            if (i === index) {
              return {
                ...item,
                [name]: Number(option.id),
                [`${name}_exist`]: true,
                [`${name}_name`]: option.label || option.degree || option.name, // Store the display name
              };
            } else {
              return item;
            }
          });
          return updateItem;
        });
      }
      if (value && !option) {
        // When typing custom text
        setEducations((prev) => {
          const updateItem = prev.map((item, i) => {
            if (i === index) {
              return {
                ...item,
                [name]: value,
                [`${name}_exist`]: false,
                [`${name}_name`]: value, // Store the typed value as name
              };
            } else {
              return item;
            }
          });
          return updateItem;
        });
      }
    }
  };

  // ===================== Education Data Fetching Section =====================
  /**
   * Fetch and manage degree list data
   */
  const [degreeList, setDegreeList] = useState([]);
  const { data: degreeListsData, isFetching: loadingDegreeListsData } =
    useEmployeeDegreeListQuery();
  useEffect(() => {
    if (!loadingDegreeListsData && degreeListsData) {
      setDegreeList(degreeListsData?.data);
    }
  }, [degreeListsData, loadingDegreeListsData]);

  /**
   * Fetch and manage institute list data
   */
  const [instituteList, setInstituteList] = useState([]);
  const { data: instituteListsData, isFetching: loadingInstituteListsData } =
    useEmployeeInstituteListQuery();
  useEffect(() => {
    if (!loadingInstituteListsData && instituteListsData) {
      setInstituteList(instituteListsData?.data);
    }
  }, [instituteListsData, loadingDegreeListsData]);

  /* 
  Hybrid Data: Experience
   */
  const [experience, setExperience] = useState([
    {
      id: null,
      organization: "",
      organization_exist: true,
      organization_name: "",
      designation: "",
      designation_exist: true,
      designation_name: "",
      year: [],
    },
  ]);

  useEffect(() => {
    if (defaultData) {
      // Check if we have experience data in defaultData
      if (
        defaultData.people_experiences &&
        defaultData.people_experiences.length > 0
      ) {
        // Map all experience entries from defaultData
        const defaultExperiences = defaultData.people_experiences.map(
          (exp) => ({
            id: exp.id || null,
            organization: exp.organization_id?.name || "",
            organization_exist: true,
            designation: exp.designation_id?.designation || "",
            designation_exist: true,
            year: [
              exp.joining_date ? new Date(exp.joining_date) : null,
              exp.ending_date ? new Date(exp.ending_date) : null,
            ].filter(Boolean), // Filter out null values
          })
        );
        setExperience(defaultExperiences);
      } else if (
        defaultData.designation ||
        defaultData.experience_organization ||
        defaultData.experience_joinging_date ||
        defaultData.experience_ending_date
      ) {
        // Fallback to single experience (existing logic)
        setExperience([
          {
            id: null,
            organization: defaultData.experience_organization || "",
            organization_exist: true,
            designation: defaultData.designation || "",
            designation_exist: true,
            year: [
              defaultData.experience_joinging_date
                ? new Date(defaultData.experience_joinging_date)
                : null,
              defaultData.experience_ending_date
                ? new Date(defaultData.experience_ending_date)
                : null,
            ].filter(Boolean),
          },
        ]);
      }
    }
  }, [defaultData]);

  const addNewExperience = () => {
    if (experience?.length >= 10) {
      message.warning("You can only add up to 10 experiences.");
      return;
    }
    setExperience([
      ...experience,
      {
        id: null,
        organization: "",
        organization_exist: true,
        organization_name: "",
        designation: "",
        designation_exist: true,
        designation_name: "",
        year: [],
      },
    ]);
  };

  const experienceDataHandler = (
    index,
    value,
    option,
    type = "input",
    name
  ) => {
    if (type === "input") {
      setExperience((prev) => {
        const updateItem = prev.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              year: value,
            };
          } else {
            return item;
          }
        });
        return updateItem;
      });
    } else {
      if (option) {
        // When selecting from dropdown
        setExperience((prev) => {
          const updateItem = prev.map((item, i) => {
            if (i === index) {
              return {
                ...item,
                [name]: Number(option.id),
                [`${name}_exist`]: true,
                [`${name}_name`]:
                  option.label || option.designation || option.name, // Store the display name
              };
            } else {
              return item;
            }
          });
          return updateItem;
        });
      }
      if (value && !option) {
        // When typing custom text
        setExperience((prev) => {
          const updateItem = prev.map((item, i) => {
            if (i === index) {
              return {
                ...item,
                [name]: value,
                [`${name}_exist`]: false,
                [`${name}_name`]: value, // Store the typed value as name
              };
            } else {
              return item;
            }
          });
          return updateItem;
        });
      }
    }
  };

  const deleteExperience = (index) => {
    const updatedExperience = experience.filter((item, i) => i !== index);
    setExperience(updatedExperience);
  };

  // ===================== Designation Data Fetching Section =====================
  /**
   * Fetch and manage designation list data
   */
  const [designationList, setDesignationList] = useState([]);
  const {
    data: designationListsData,
    isFetching: loadingDesignationListsData,
  } = useDesignationListQuery();
  useEffect(() => {
    if (!loadingDesignationListsData && designationListsData) {
      setDesignationList(designationListsData?.data);
    }
  }, [designationListsData, loadingDesignationListsData]);

  //================= location feature
  /**
   * initialize location hook
   * set location parent id
   * set location name
   * if i have location from api then update location hook
   * add proper jsx
   */

  const {
    selectedCountry,
    formData: locationFormData,
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

  // useEffect to set location name
  useEffect(() => {
    setStreetAddress(locationFormData.location_name);
  }, [locationFormData.location_name]);

  // === === === end location feature
  const stepHandler = async () => {
    try {
      await inviteTeacherStepTwoSchema.validate(
        {
          bio: bio,
          street_address: street_address,
        },
        {
          abortEarly: false,
        }
      );
      const data = {
        bio: bio,
        street_address: street_address,
        educations: educations?.filter(
          (edu) => edu.year && edu.degree && edu.institute
        ),
        experience: experience.filter(
          (ex) => ex.year && ex.organization && ex.designation
        ),
        locationTypesObjItems: locationTypesObjItems,
        location_type_id: location_type_id_eighteen,
      };
      storeHandler({
        ...data,
      });
      nextStepHandler(3);
    } catch (err) {
      const allMessages = err.inner.map((error) => {
        return error.message;
      });
      setErrors(allMessages);
      setLocationErrors(allMessages);
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (defaultData) {
      setBio(defaultData.bio || "");
      setStreetAddress(defaultData.street_address || "");
    }
  }, [defaultData]);

  return (
    <>
      {errors && (
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
      <div className="inp">
        <label htmlFor="" className="text-14 font-bold flex items-center">
          Short Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => handleChange(e)}
          name=""
          className="border w-full resize-none mt-2 rounded-[8px] border-[#798295] p-3"
          rows={3}
          placeholder="Type medical history here"
          id=""
        ></textarea>
        <p className="text-xs text-[#798295] text-end">{bio.length}/250</p>
      </div>

      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

      <p className="font-bold uppercase mb-3">Home Address</p>

      <div className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-x-8 gap-y-4 mt-4 items-stretch">
        <div>
          <SelectBox
            defaultValue={selectedCountry?.location_name}
            handler={handleLocationSelection}
            loading={isFetching}
            list={getCountryOptions()}
            isRequired
            label="Country"
            error={
              locationErrors && locationErrors.location
                ? locationErrors.location
                : null
            }
          />
          {locationErrors && locationErrors.location && (
            <p className="text-danger-700 text-sm">{locationErrors.location}</p>
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

        {locationTypes && locationTypes.length > 0 && (
          <InputWithLabel
            label="Street Address"
            placeholder="Enter street address"
            type="text"
            value={locationFormData.location_name}
            name="location_name"
            handler={(e) => handleFormChange(e)}
            maxlength={50}
            error={
              locationErrors && locationErrors.location
                ? locationErrors.location
                : null
            }
            isRequired
          />
        )}
      </div>

      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
      <p className="font-bold uppercase mb-3">education</p>

      {educations &&
        educations.length > 0 &&
        educations.map((education, i) => (
          <div
            key={i}
            className="flex flex-col lg:flex-row gap-4 lg:items-end mb-5 "
          >
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 ">
              <SelectBox
                defaultValue={
                  typeof educations[i].degree === "string"
                    ? educations[i].degree
                    : typeof educations[i].degree === "number"
                    ? degreeList.find(
                        (degree) => degree.id === educations[i].degree
                      )?.degree
                    : null
                }
                isAcceptstring
                handler={(value, option) =>
                  educationDataHandler(i, value, option, "select", "degree")
                }
                list={
                  degreeList?.length > 0
                    ? degreeList.map((item) => ({
                        ...item,
                        label: item.degree,
                        value: item.degree,
                      }))
                    : []
                }
                label="Degree"
              />

              <SelectBox
                defaultValue={
                  typeof educations[i].institute === "string"
                    ? educations[i].institute
                    : typeof educations[i].institute === "number"
                    ? instituteList.find(
                        (institute) => institute.id === educations[i].institute
                      )?.name
                    : null
                }
                isAcceptstring
                handler={(value, option) =>
                  educationDataHandler(i, value, option, "select", "institute")
                }
                list={
                  instituteList?.length > 0
                    ? instituteList.map((item) => ({
                        ...item,
                        label: item.name,
                        value: item.name,
                      }))
                    : []
                }
                label="Institute"
              />

              <InputYear
                label="Year Of Completion"
                handler={(value) => educationDataHandler(i, value, null)}
                defaultValue={educations[i].year}
              />
            </div>

            <div className="flex-shrink-0 flex items-end mb-2">
              <button
                onClick={() => deleteEducation(i)}
                className="w-[44px] h-[44px] flex items-center justify-center hover:text-red-500 transition-colors pt-3"
                title="Delete this education"
              >
                <DeleteSvg />
              </button>
            </div>
          </div>
        ))}

      <button
        onClick={addNewEducation}
        type="button"
        className="flex justify-start mt-4 items-center gap-2"
      >
        <img src="/assets/img/icons/plus-square.svg" className="plus" alt="" />
        <span className="text-sm font-bold">Add another Degree</span>
      </button>

      <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

      <p className="font-bold uppercase mb-3">Experience</p>

      {experience &&
        experience.length > 0 &&
        experience.map((expart, i) => (
          <div
            key={i}
            className={`flex lg:flex-row flex-col gap-4 lg:items-center mb-5 lg:mb-0 border-b border-dashed border-gray-500 py-5 ${
              i === experience.length - 1 ? "border-b-0" : ""
            } ${i === 0 ? "pt-0" : ""}`}
          >
            <div className="flex-1 grid lg:grid-cols-2 grid-cols-1 gap-2 ">
              <div className="lg:col-span-2 col-span-1">
                <SelectBox
                  defaultValue={
                    typeof experience[i].organization === "string"
                      ? experience[i].organization
                      : typeof experience[i].organization === "number"
                      ? instituteList.find(
                          (institute) =>
                            institute.id === experience[i].organization
                        )?.name
                      : null
                  }
                  isAcceptstring
                  handler={(value, option) =>
                    experienceDataHandler(
                      i,
                      value,
                      option,
                      "select",
                      "organization"
                    )
                  }
                  list={
                    instituteList &&
                    instituteList.length > 0 &&
                    instituteList.map((item) => ({
                      ...item,
                      label: item.name,
                      value: item.name,
                    }))
                  }
                  label="Organization"
                />
              </div>
              <div>
                <SelectBox
                  defaultValue={
                    typeof experience[i].designation === "string"
                      ? experience[i].designation
                      : typeof experience[i].designation === "number"
                      ? designationList.find(
                          (designation) =>
                            designation.id === experience[i].designation
                        )?.designation
                      : null
                  }
                  isAcceptstring
                  handler={(value, option) =>
                    experienceDataHandler(
                      i,
                      value,
                      option,
                      "select",
                      "designation"
                    )
                  }
                  list={
                    designationList &&
                    designationList.length > 0 &&
                    designationList.map((item) => ({
                      ...item,
                      label: item.designation,
                      value: item.designation,
                    }))
                  }
                  label="Designation"
                />
              </div>
              <div className="w-full flex items-end gap-5">
                <div className="flex-1">
                  <InputDateRangePicker
                    defaultValue={
                      experience[i].year ? experience[i].year : null
                    }
                    label={"Time Period"}
                    handler={(value) => experienceDataHandler(i, value, null)}
                  />
                </div>
                <button
                  onClick={() => deleteExperience(i)}
                  className="w-[44px] h-[44px] flex items-center justify-center hover:text-red-500 transition-colors"
                  title="Delete this experience"
                >
                  <DeleteSvg />
                </button>
              </div>
            </div>
          </div>
        ))}

      <button
        onClick={addNewExperience}
        type="button"
        className="flex justify-start mt-4 items-center gap-2"
      >
        <img src="/assets/img/icons/plus-square.svg" className="plus" alt="" />
        <span className="text-sm font-bold">Add another Experience</span>
      </button>

      {/* <div className="text-center md:w-[60%] mx-auto mt-10"> */}
      <div className="flex">
        <button
          className="bg-black rounded-[8px] mr-2 px-[50px] py-3 text-white font-bold block mx-auto mt-10 w-full"
          onClick={() => prevStepHandler(1)}
        >
          Previous
        </button>
        <button
          onClick={stepHandler}
          className="bg-black rounded-[8px] mr-2 px-[50px] py-3 text-white font-bold block mx-auto mt-10 w-full"
        >
          Next
        </button>
      </div>
    </>
  );
}

export default AddressAndEducationInformation;
