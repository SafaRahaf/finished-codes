"use client";
import InputDateRangePicker from "@/components/common/Inputs/Input/InputDateRangePicker";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import {
  useDesignationListQuery,
  useEmployeeDegreeListQuery,
  useEmployeeInstituteListQuery,
} from "@/store/features/auth/apiSlice";
import {
  useDeleteEmployeeEducationMutation,
  useDeleteEmployeeExperienceMutation,
  useTeacherProfileUpdateMutation,
} from "@/store/features/teacher-management/apiSlice";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { message } from "antd";
import cleanObject from "@/components/helpers/cleanObject";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import InputYear from "@/components/common/Inputs/Input/InputYear";
import { DeleteSvg } from "@/components/helpers/storeAllSvgs";

function EducationExperienceStepUpdate({ prevData, modalOpen }) {
  /*======== initilize apis ========*/

  const { data: degreeListsData, isFetching: loadingDegreeListsData } =
    useEmployeeDegreeListQuery();
  const {
    data: designationListsData,
    isFetching: loadingDesignationListsData,
  } = useDesignationListQuery();
  const { data: instituteListsData, isFetching: loadingInstituteListsData } =
    useEmployeeInstituteListQuery();

  const [deleteEmployeeEducation, { isLoading: isDeletingEducation }] =
    useDeleteEmployeeEducationMutation();
  const [deleteEmployeeExperience, { isLoading: isDeletingExperience }] =
    useDeleteEmployeeExperienceMutation();

  /*========= states & functions =========*/

  /* Hybrid Data: Education */
  const [educations, setEducations] = useState([
    {
      updateId: null,
      id: null,
      degree: "",
      degree_exist: true,
      institute: "",
      institute_exist: true,
      year: "",
    },
  ]);

  const addNewEducation = () => {
    if (educations?.length >= 10) {
      message.warning("You can only add up to 10 degrees.");
      return;
    }
    setEducations([
      ...educations,
      {
        updateId: null,
        id: null,
        degree: "",
        degree_exist: true,
        institute: "",
        institute_exist: true,
        year: "",
      },
    ]);
  };

  // Delete education
  const deleteEducation = async (index) => {
    const educationToDelete = educations[index];

    if (educationToDelete.updateId) {
      try {
        await deleteEmployeeEducation({ id: educationToDelete.updateId });
        // Removing from local state after delete
        setEducations((prev) => prev.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Error deleting education:", error);
      }
    } else {
      // if a new education (no updateId), just remove from local state
      setEducations((prev) => prev.filter((_, i) => i !== index));
    }
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
        setEducations((prev) => {
          const updateItem = prev.map((item, i) => {
            if (i === index) {
              return {
                ...item,
                [name]: Number(option.id),
              };
            } else {
              return item;
            }
          });
          return updateItem;
        });
      }
      if (value && !option) {
        setEducations((prev) => {
          const updateItem = prev.map((item, i) => {
            if (i === index) {
              return {
                ...item,
                [name]: value,
                [`${name + "_exist"}`]: false,
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

  // list of degrees
  const [degreeList, setDegreeList] = useState([]);

  useEffect(() => {
    if (!loadingDegreeListsData && degreeListsData) {
      setDegreeList(degreeListsData?.data);
    }
  }, [degreeListsData, loadingDegreeListsData]);

  // list of institutions
  const [instituteList, setInstituteList] = useState([]);
  useEffect(() => {
    if (!loadingInstituteListsData && instituteListsData) {
      setInstituteList(instituteListsData?.data);
    }
  }, [instituteListsData, loadingInstituteListsData]);

  /* Hybrid Data: Experience */
  const [experience, setExperience] = useState([
    {
      updateId: null,
      id: null,
      organization: "",
      organization_exist: true,
      designation: "",
      designation_exist: true,
      year: [],
    },
  ]);

  const addNewExperience = () => {
    if (experience?.length >= 10) {
      message.warning("You can only add up to 10 experiences.");
      return;
    }
    setExperience([
      ...experience,
      {
        updateId: null,
        id: null,
        organization: "",
        organization_exist: true,
        designation: "",
        designation_exist: true,
        year: [],
      },
    ]);
  };

  // Delete experience
  const deleteExperience = async (index) => {
    const experienceToDelete = experience[index];

    // If it's an existing experience (has updateId), delete from API
    if (experienceToDelete.updateId) {
      try {
        await deleteEmployeeExperience({ id: experienceToDelete.updateId });
        // Remove from local state after successful deletion
        setExperience((prev) => prev.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Error deleting experience:", error);
      }
    } else {
      // If it's a new experience (no updateId), just remove from local state
      setExperience((prev) => prev.filter((_, i) => i !== index));
    }
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
        setExperience((prev) => {
          const updateItem = prev.map((item, i) => {
            if (i === index) {
              return {
                ...item,
                [name]: Number(option.id),
              };
            } else {
              return item;
            }
          });
          return updateItem;
        });
      }
      if (value && !option) {
        setExperience((prev) => {
          const updateItem = prev.map((item, i) => {
            if (i === index) {
              return {
                ...item,
                [name]: value,
                [`${name}_exist`]: false,
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

  // list of institutions
  const [designationList, setDesignationList] = useState([]);
  useEffect(() => {
    if (!loadingDesignationListsData && designationListsData) {
      setDesignationList(designationListsData?.data);
    }
  }, [designationListsData, loadingDesignationListsData]);

  useEffect(() => {
    if (prevData) {
      const gettingExperiences = prevData?.experience;
      const storePrevExperiences =
        gettingExperiences &&
        gettingExperiences.length &&
        gettingExperiences.map((experience, i) => ({
          updateId: experience.id,
          id: i + 1,
          organization: experience?.organization_id?.id,
          organization_exist: true,
          designation: experience?.designation_id?.id,
          designation_exist: true,
          year: [experience?.joining_date, experience?.ending_date],
        }));
      if (storePrevExperiences && storePrevExperiences.length) {
        setExperience(storePrevExperiences);
      } else {
        setExperience([
          {
            updateId: null,
            id: null,
            organization: "",
            organization_exist: true,
            designation: "",
            designation_exist: true,
            year: [],
          },
        ]);
      }

      const gettingEducation = prevData?.educations;
      const storePrevEducation =
        gettingEducation &&
        gettingEducation.length &&
        gettingEducation.map((education, i) => ({
          updateId: education.id,
          id: i + 1,
          degree: education?.degree_id?.id,
          degree_exist: true,
          institute: education?.organization_id?.id,
          institute_exist: true,
          year: education?.completion_year,
        }));
      if (storePrevEducation && storePrevEducation.length) {
        setEducations(storePrevEducation);
      } else {
        setEducations([
          {
            updateId: null,
            id: null,
            degree: "",
            degree_exist: true,
            institute: "",
            institute_exist: true,
            year: "",
          },
        ]);
      }
    }
  }, [prevData]);

  const [teacherProfileUpdate, { isLoading, error }] =
    useTeacherProfileUpdateMutation();
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
    const data = {
      educations: educations.filter(
        (edu) => edu.year && edu.degree && edu.institute
      ),
      experience: experience.filter(
        (ex) => ex.year && ex.organization && ex.designation
      ),
    };
    const readyData = {
      people_experiences: data?.experience?.length
        ? data?.experience.map((experience) => ({
            id: experience?.updateId,
            joining_date: experience.year.length ? experience.year[0] : null,
            ending_date: experience.year.length ? experience.year[1] : null,
            experience_year:
              experience.year.length === 2
                ? `${Math.max(
                    0,
                    moment(experience.year[0])
                      .diff(moment(experience.year[1]), "years", true)
                      .toFixed(1)
                  )}`
                : null,
            organization: experience?.organization
              ? {
                  is_exist: experience?.organization_exist,
                  id: experience?.organization_exist
                    ? experience?.organization
                    : null,
                  name: experience?.organization_exist
                    ? null
                    : experience?.organization,
                }
              : null,
            designation: experience?.designation
              ? {
                  is_exist: experience?.designation_exist,
                  id: experience?.designation_exist
                    ? experience?.designation
                    : null,
                  name: experience?.designation_exist
                    ? null
                    : experience?.designation,
                }
              : null,
          }))
        : null,
      people_education: data?.educations?.length
        ? data?.educations.map((education) => ({
            id: education?.updateId,
            completion_year: education.year,
            degree: {
              is_exist: education?.degree_exist,
              id: education?.degree_exist ? education?.degree : null,
              name: education?.degree_exist ? null : education?.degree,
            },
            organization: {
              is_exist: education?.institute_exist,
              id: education?.institute_exist ? education?.institute : null,
              name: education?.institute_exist ? null : education?.institute,
            },
          }))
        : null,
    };

    modalOpen(true);

    await teacherProfileUpdate({
      id: prevData?.teacherId,
      data: cleanObject(readyData),
      redirectAnotherPage: redirectToAnotherPage,
      resetCookie: resetCookie,
    });
  };

  return (
    <div className="text-[#22252B]">
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
                disabled={isDeletingEducation}
              >
                {isDeletingEducation ? (
                  <SvgLoader className="w-5 h-5" />
                ) : (
                  <DeleteSvg />
                )}
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
                  disabled={isDeletingExperience}
                >
                  {isDeletingExperience ? (
                    <SvgLoader className="w-5 h-5" />
                  ) : (
                    <DeleteSvg />
                  )}
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
      <div className="mb-3 text-right mt-20">
        <button
          onClick={stepHandler}
          type="button"
          className="bg-black text-white py-[13px] px-[24px] rounded-[5px] font-bold"
        >
          {isLoading ? <SvgLoader className="text-white" /> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default EducationExperienceStepUpdate;
