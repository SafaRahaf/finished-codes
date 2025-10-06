"use client";
import React, { useRef, useState } from "react";
import { message } from "antd";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import InputFullDate from "@/components/common/Inputs/Input/InputFullDate";
import { useGetGroupsQuery } from "@/store/features/class-management/apiSlice";
import { useAddNewStudentMutation } from "@/store/features/student-management/apiSlice";
import { studentInviteSchema } from "@/utilities/validationRules/schemas/studentCompletionSchema";

const AddNewStudent = () => {
  // Controlled state for all fields (all form data in one object)
  const [studentData, setStudentData] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    email: "",
    gender: "male",
    memorised_juzs: [],
    department_id: null,
    department_name: "",
    grade_id: null,
    grade_name: "",
    quran_recitation_level: "",
    num_of_mem_juzs: "",
    current_sabaq_juz: "",
    status: "new",
  });

  // reset form
  const resetForm = () => {
    setStudentData({
      first_name: "",
      last_name: "",
      dob: "",
      email: "",
      gender: "male",
      memorised_juzs: [],
      department_id: null,
      department_name: "",
      grade_id: null,
      grade_name: "",
      quran_recitation_level: "",
      num_of_mem_juzs: "",
      current_sabaq_juz: "",
      status: "new",
    });
    setGrades([]);
  };

  // get departments and classes from api
  const { data: depts, isFetching: loadingDepts } = useGetGroupsQuery({
    page: 1,
    limit: 99999999,
  });

  const [grades, setGrades] = useState([]); //classes

  // Handler for general input fields
  const handleInput = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for SelectBox fields
  const handleSelect = (name, value, option) => {
    if (name === "department_id" && option) {
      setStudentData((prev) => ({
        ...prev,
        [name]: value,
        department_name: option.label,
      }));
      setGrades(
        option?.class_id && option?.class_id.length > 0 ? option?.class_id : []
      );
    } else if (name === "grade_id" && option) {
      setStudentData((prev) => ({
        ...prev,
        [name]: value,
        grade_name: option?.class_type_org_id?.class_type_id?.type_name,
      }));
    } else {
      setStudentData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handler for gender radio
  const handleGender = (value) => {
    setStudentData((prev) => ({ ...prev, gender: value }));
  };

  // Handler for student status radio
  const handleStudentStatus = (value) => {
    setStudentData((prev) => ({ ...prev, status: value }));
  };

  // Handler for memorised juzs checkboxes
  const handleJuzCheckbox = (value) => {
    setStudentData((prev) => {
      const alreadySelected = prev.memorised_juzs.includes(value);
      const maxAllowed = Number(prev.num_of_mem_juzs) || 0;

      if (!alreadySelected && prev.memorised_juzs.length >= maxAllowed) {
        message.warning(
          `You can select up to ${maxAllowed} memorised Juzs only. cannont exceed number of memorised juzs`
        );
        return prev;
      }

      const juzArr = alreadySelected
        ? prev.memorised_juzs.filter((juz) => juz !== value)
        : [...prev.memorised_juzs, value];

      return { ...prev, memorised_juzs: juzArr };
    });
  };

  // Error handling
  const [errors, setErrors] = useState(null);
  const errorRef = useRef(null);

  /**
   * Invite New Student Functionality
   * @Initialization useAddNewStudentMutation @const addNewStudent
   * @func addNewStudentSuccessHandler @const addNewStudentSuccessHandler @params data, statusCode
   * @func addNewStudentErrorHandler @const addNewStudentErrorHandler @params error
   * @func addNewStudentHandler
   */

  const [addNewStudent, { isLoading: isAddingNewStudent }] =
    useAddNewStudentMutation();

  const addNewStudentSuccessHandler = (data, statusCode) => {
    if (statusCode === 200 || statusCode === 201) {
      message.success("Student added successfully");
      resetForm();
    } else {
      message.warning("Something went wrong");
    }
  };

  const addNewStudentErrorHandler = (error) => {
    if (error.status === 400) {
      message.error("Invalid Information");
    } else {
      message.error("Something went wrong");
    }
  };

  // Add DOB validation handler
  const handleDobChange = async (date) => {
    setStudentData((prev) => ({ ...prev, dob: date }));

    // Validate DOB
    try {
      await studentInviteSchema.validateAt("dob", { dob: date });
      setErrors(
        (prev) =>
          prev?.filter((error) => !error.includes("Date of birth")) || []
      );
    } catch (err) {
      // Add DOB error to errors array
      setErrors((prev) => {
        const filtered =
          prev?.filter((error) => !error.includes("Date of birth")) || [];
        return [...filtered, err.message];
      });
    }
  };

  const addNewStudentHandler = async () => {
    try {
      const data = {
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        dob: studentData.dob,
        gender: studentData.gender,
        email: studentData.email,
        status: studentData.status,
        department_id: studentData.department_id,
        grade_id: studentData.grade_id,
        // not required fields
        quran_recitation_level: studentData.quran_recitation_level || undefined,
        total_memorised_juzs: studentData.num_of_mem_juzs || undefined,
        current_sabaq_juz: studentData.current_sabaq_juz || undefined,
        memorised_juzs:
          studentData?.memorised_juzs?.length > 0
            ? studentData.memorised_juzs.map((juz) => `${juz}`)
            : undefined,
      };

      await studentInviteSchema.validate(data, { abortEarly: false });

      await addNewStudent({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          dob: data.dob,
          gender: data.gender,
          email: data.email,
          student_profile: {
            status: data.status,
            quran_recitation_level: data.quran_recitation_level,
            total_memorised_juzs: data.total_memorised_juzs,
            current_sabaq_juz: data.current_sabaq_juz,
            memorised_juzs: data.memorised_juzs,
            department_id: data.department_id,
            grade_id: data.grade_id,
          },
        },
        success: addNewStudentSuccessHandler,
        error: addNewStudentErrorHandler,
      });
    } catch (validationErrors) {
      const allMessages = validationErrors.inner.map((error) => error.message);
      setErrors(allMessages);
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  return (
    <>
      <div ref={errorRef} className="st-add-wrapper">
        <div className="w-full">
          <div className="card lg:w-[750px] w-[95%] max-w-[95%] lg:p-12 p-5 rounded-[12px] shadow-lg bg-white top-0 m-auto mt-8 shadow-custom-effect">
            <div className="flex justify-between items-center ">
              <h2 className="lg:text-[30px] text-2xl font-bold ">
                Add Student
              </h2>
            </div>
            <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
            {errors?.length ? (
              <div
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
            ) : (
              <></>
            )}
            <div className="w-full mt-6">
              {/* Student Status Section */}
              <div className=" mb-6">
                <label className="block text-[15px] font-bold text-[#22252B] mb-2">
                  Student Status{" "}
                  <sup className="text-danger-700 text-sm">*</sup>
                </label>
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-2 cursor-pointer text-[15px] font-medium text-[#22252B]">
                    <input
                      type="radio"
                      name="student_status"
                      value="new"
                      className="w-5 h-5 accent-[#22252B]"
                      defaultChecked={studentData.status === "new"}
                      onChange={() => handleStudentStatus("new")}
                    />
                    New student
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[15px] font-medium text-[#22252B]">
                    <input
                      type="radio"
                      name="student_status"
                      value="old"
                      className="w-5 h-5 accent-[#22252B]"
                      defaultChecked={studentData.status === "old"}
                      onChange={() => handleStudentStatus("old")}
                    />
                    Existing student
                  </label>
                </div>
              </div>
              {/* Name Fields */}
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 pb-2">
                <InputWithLabel
                  label={"First Name"}
                  placeholder={"First Name"}
                  type={"text"}
                  name="first_name"
                  value={studentData.first_name}
                  handler={handleInput}
                  noNumbersAndSpecialChars={true}
                  isRequired
                />
                <InputWithLabel
                  label={"Last Name"}
                  placeholder={"Last Name"}
                  type={"text"}
                  name="last_name"
                  noNumbersAndSpecialChars={true}
                  value={studentData.last_name}
                  handler={handleInput}
                  isRequired
                />
              </div>
              {/* Date of Birth & Gender */}
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-2">
                <InputFullDate
                  defaultValue={studentData?.dob}
                  handler={handleDobChange} // Updated to use validation handler
                  label={"Date of Birth"}
                  isRequired
                  className="!table"
                />
                <div>
                  <label className="text-[15px] font-bold text-[#22252B] mb-2 block">
                    Gender <sup className="text-danger-700 text-sm">*</sup>
                  </label>
                  <div className="flex items-center gap-10 mt-4 ">
                    <label className="flex items-center gap-2 cursor-pointer ">
                      <input
                        type="radio"
                        name="gender"
                        id="male"
                        className="w-5 h-5 accent-[#22252B]"
                        onChange={() => handleGender("male")}
                        checked={studentData.gender === "male"}
                      />
                      <span className="text-[16px] font-medium text-[#22252B]">
                        Male
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        id="female"
                        className="w-5 h-5 accent-[#22252B]"
                        onChange={() => handleGender("female")}
                        checked={studentData.gender === "female"}
                      />
                      <span className="text-[16px] font-medium text-[#22252B]">
                        Female
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
              <p className="font-bold mb-4 uppercase text-12 tracking-wider text-[#383838]">
                Admission Information
              </p>
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                <SelectBox
                  label="Department"
                  name="department_id"
                  list={
                    depts?.data?.length
                      ? depts?.data?.map((dept) => ({
                          ...dept,
                          label: dept.name,
                          value: dept.id,
                        }))
                      : []
                  }
                  defaultValue={studentData?.department_id}
                  handler={(value, option) =>
                    handleSelect("department_id", value, option)
                  }
                  isRequired={true}
                  inputHeight="!h-[44px]"
                />
                <SelectBox
                  label="Grade/Class"
                  name="grade_id"
                  list={
                    grades?.length
                      ? grades?.map((grade) => ({
                          ...grade,
                          label: grade?.class_name,
                          value: grade.id,
                        }))
                      : []
                  }
                  defaultValue={studentData?.grade_id}
                  handler={(value, option) =>
                    handleSelect("grade_id", value, option)
                  }
                  isRequired={true}
                  inputHeight="!h-[44px]"
                />
                <SelectBox
                  label="Quran Recitation Level"
                  name="quran_recitation_level"
                  list={[
                    { label: "Basic", value: "basic" },
                    { label: "Very Basic", value: "very_basic" },
                    { label: "Advanced", value: "advanced" },
                  ]}
                  defaultValue={studentData.quran_recitation_level}
                  handler={(value) =>
                    handleSelect("quran_recitation_level", value)
                  }
                  inputHeight="!h-[44px]"
                />
              </div>
              <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>
              {studentData.grade_name.toLowerCase().includes("hifz") && (
                <>
                  <p className="font-bold uppercase mb-3 text-12 tracking-wider text-[#383838]">
                    Hifz Information
                  </p>
                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 ">
                    <SelectBox
                      label="Number of Memorised Juzs"
                      name="num_of_mem_juzs"
                      list={[...Array(31).keys()].map((num) => ({
                        label: num.toString(),
                        value: num,
                      }))}
                      defaultValue={studentData.num_of_mem_juzs}
                      handler={(value) =>
                        handleSelect("num_of_mem_juzs", value)
                      }
                      inputHeight="!h-[44px]"
                    />
                    <SelectBox
                      label="Current Sabaq Juz"
                      name="current_sabaq_juz"
                      list={[...Array(31).keys()].map((num) => ({
                        label: num.toString(),
                        value: num,
                      }))}
                      defaultValue={studentData.current_sabaq_juz}
                      handler={(value) =>
                        handleSelect("current_sabaq_juz", value)
                      }
                      inputHeight="!h-[44px]"
                    />
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
                            type="checkbox"
                            name="juz"
                            value={juzNumber}
                            onChange={(e) => handleJuzCheckbox(juzNumber)}
                            id={`j${juzNumber}`}
                            checked={studentData.memorised_juzs.includes(
                              juzNumber
                            )}
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

              <div className="grid grid-cols-1 gap-3 align-bottom mt-4">
                <InputWithLabel
                  label={"Invitation E-Mail"}
                  placeholder={"Invitation E-Mail"}
                  type={"email"}
                  name="email"
                  value={studentData.email}
                  handler={handleInput}
                  isRequired
                />
                <p className="text-xs text-[#22252B]">
                  A link will be sent to this email address to collect more
                  information about the student.
                </p>
              </div>
              <button
                type="button"
                disabled={isAddingNewStudent}
                className="bg-black rounded-[8px] lg:px-[190px] px-[50px] py-3 text-white font-bold block mx-auto mt-10 disabled:cursor-not-allowed"
                onClick={addNewStudentHandler}
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewStudent;
