"use client";
import React, { useEffect, useState, Suspense, useRef } from "react";
import { message, Modal } from "antd";

// Import step components
import Step1StudentInfo from "./steps/Step1StudentInfo";
import Step2GuardianParents from "./steps/Step2GuardianParents";
import Step3EmergencyContact from "./steps/Step3EmergencyContact";
import Step4EducationBackground from "./steps/Step4EducationBackground";
import Step5MedicalInfo from "./steps/Step5MedicalInfo";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { useGetGroupsQuery } from "@/store/features/class-management/apiSlice";
import { location_type_id_eighteen } from "@/static/static";
import {
  useStudentCompletionGetQuery,
  useStudentCompletionMutation,
} from "@/store/features/student-management/apiSlice";
import { useUploadPhotoMutation } from "@/store/features/file-upload/apiSlice";
import { uploadImageAndProcess } from "@/components/helpers/uploadImageAndProcess";
import { useDispatch } from "react-redux";
import { getCookie, setCookie } from "cookies-next";
import { userLoggedIn } from "@/store/features/auth/authSlice";
import countries from "@/data/CountryCodes";

const AddNewStudentRegisterContent = ({ getBearerToken, getUUIDToken }) => {
  const people_token = getCookie("access_token");
  const [isToken, setIsToken] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const dispatch = useDispatch();

  // Handle header token and set it in cookies
  useEffect(() => {
    if (getBearerToken) {
      setCookie("access_token", getBearerToken, {
        maxAge: 60 * 60 * 24 * 7, // 1 week expiration
        path: "/",
      });
    }
  }, [getBearerToken]);

  // Handle user authentication state
  useEffect(() => {
    if (people_token) {
      dispatch(
        userLoggedIn({
          accessToken: people_token,
        })
      );
      setIsToken(people_token);
    }
  }, [people_token]);

  // Step management
  const [step, setStep] = useState(1);
  const [infoErrors, setInfoErrors] = useState({});

  // Main form state
  const [formData, setFormData] = useState({
    // Step 1: Student Information
    first_name: "",
    last_name: "",
    dob: "",
    gender: "male",
    student_type: 1,
    profile_picture: "",
    status: "new",
    // person location
    location_name: "",
    location_parent_id: "",

    // Step 2: Guardian & Parents
    father_id: null,
    father_first_name: "",
    father_last_name: "",
    father_dial_code: "",
    father_mobile: "",
    father_email: "",
    father_address: "same",
    father_location_name: "",
    father_location_parent_id: "",
    mother_id: null,
    mother_first_name: "",
    mother_last_name: "",
    mother_dial_code: "",
    mother_mobile: "",
    mother_email: "",
    mother_address: "same",
    mother_location_name: "",
    mother_location_parent_id: "",
    legal_guardian_type: "",

    // Step 3: Emergency Contact

    contact_person_first_name: "",
    contact_person_last_name: "",
    contact_person_dial_code: "",
    contact_person_mobile: "",
    contact_person_email: "",
    relation_with_contact_person: "",
    is_legal_guardian_emergency_contact: false,
    emergency_contact_person_location_name: "",
    emergency_contact_person_location_parent_id: "",

    // Step 4: Education Background
    studied_in_madrasa: true,
    attended_public_school: true,
    attended_home_school: true,
    attended_years_of_madrasa: "",
    to_grade: "",
    department_id: "",
    department_name: "",
    grade_id: "",
    grade_name: "",
    class_type_name: "",
    quran_recitation_level: "",
    current_sabaq_juz: "",
    madrasa_name: "",
    program_name: "",
    memorized_sabaq_juz: "",
    total_memorised_juzs: 0,
    memorised_juzs: [],
    organization_location_name: "",
    organization_location_parent_id: "",

    // Step 5: Medical Information
    allergies: "",
    blood_group: "",
    medical_problems: "",
    significant_medical_history: "",
    regular_medications: "",
    physician_name: "",
    physician_dial_code: "",
    physician_mobile_no: "",
  });

  // country states
  const [fatherCountryDropDownToggle, setFatherCountryDropDownToggle] =
    useState(false);
  const [motherCountryDropDownToggle, setMotherCountryDropDownToggle] =
    useState(false);
  const [getCountries, setGetCountries] = useState(null);
  const [fatherSelectedDialCountry, setFatherSelectedDialCountry] =
    useState(null);
  const [motherSelectedDialCountry, setMotherSelectedDialCountry] =
    useState(null);

  const [
    contactPersonCountryDropDownToggle,
    setContactPersonCountryDropDownToggle,
  ] = useState(false);
  const [
    contactPersonSelectedDialCountry,
    setContactPersonSelectedDialCountry,
  ] = useState(null);

  const [physicianCountryDropDownToggle, setPhysicianCountryDropDownToggle] =
    useState(false);
  const [physicianSelectedDialCountry, setPhysicianSelectedDialCountry] =
    useState(null);

  const selectCountryhandler = (value, type) => {
    if (type === "father") {
      setFormData((prev) => ({ ...prev, father_dial_code: value.dial_code }));
      setFatherSelectedDialCountry(value);
      setFatherCountryDropDownToggle(false);
    }
    if (type === "mother") {
      setFormData((prev) => ({ ...prev, mother_dial_code: value.dial_code }));
      setMotherSelectedDialCountry(value);
      setMotherCountryDropDownToggle(false);
    }
    if (type === "contact_person") {
      setFormData((prev) => ({
        ...prev,
        contact_person_dial_code: value.dial_code,
      }));
      setContactPersonSelectedDialCountry(value);
      setContactPersonCountryDropDownToggle(false);
    }
    if (type === "physician") {
      setFormData((prev) => ({
        ...prev,
        physician_dial_code: value.dial_code,
      }));
      setPhysicianSelectedDialCountry(value);
      setPhysicianCountryDropDownToggle(false);
    }
  };
  useEffect(() => {
    if (!getCountries) {
      setGetCountries(countries && countries.countries);
      const findDefaultCountry =
        countries && countries.countries.length > 0
          ? countries.countries.find((country) => country.code === "US")
          : null;
      setFatherSelectedDialCountry(findDefaultCountry);
      setMotherSelectedDialCountry(findDefaultCountry);
      setContactPersonSelectedDialCountry(findDefaultCountry);
      setPhysicianSelectedDialCountry(findDefaultCountry);
    }
  }, [getCountries]);

  // pre field data on load
  const { data: preFieldStudentData } = useStudentCompletionGetQuery({
    token: getUUIDToken,
    header_token: getBearerToken,
  });

  useEffect(() => {
    if (preFieldStudentData) {
      const data = preFieldStudentData.data;
      const studentProfile = data.student_profile_id || {};
      const studentPeople = data.student_people_id || {};

      // Only update parent-related fields
      const updatedFormData = {
        ...formData,
        // Step 1: Student Information - from main data and student_people_id
        ...(data.first_name && { first_name: data.first_name }),
        ...(data.last_name && { last_name: data.last_name }),
        ...(data.dob && { dob: data.dob }),
        ...(data.gender && { gender: data.gender }),
        ...(studentProfile.status && { status: studentProfile.status }),
        ...(studentPeople.profile_picture && {
          profile_picture: studentPeople.profile_picture,
        }),

        // Step 2: Guardian & Parents - from student_profile_id
        ...(studentProfile.legal_guardian_type && {
          legal_guardian_type: studentProfile.legal_guardian_type,
        }),

        // Step 4: Education Background - from student_profile_id
        ...(studentProfile.studied_in_madrasa !== undefined && {
          studied_in_madrasa: studentProfile.studied_in_madrasa,
        }),
        ...(studentProfile.attended_public_school !== undefined && {
          attended_public_school: studentProfile.attended_public_school,
        }),
        ...(studentProfile.attended_home_school !== undefined && {
          attended_home_school: studentProfile.attended_home_school,
        }),
        ...(studentProfile.attended_years_of_madrasa && {
          attended_years_of_madrasa: studentProfile.attended_years_of_madrasa,
        }),
        ...(studentProfile.to_grade && { to_grade: studentProfile.to_grade }),
        ...(studentProfile.department_id && {
          department_id: studentProfile.department_id,
        }),
        ...(studentProfile.grade_id && { grade_id: studentProfile.grade_id }),
        ...(studentProfile.quran_recitation_level && {
          quran_recitation_level: studentProfile.quran_recitation_level,
        }),
        ...(studentProfile.current_sabaq_juz && {
          current_sabaq_juz: studentProfile.current_sabaq_juz,
        }),
        ...(studentProfile.program_name && {
          program_name: studentProfile.program_name,
        }),
        ...(studentProfile.total_memorised_juzs !== undefined && {
          total_memorised_juzs: studentProfile.total_memorised_juzs,
        }),
        ...(studentProfile.memorised_juzs &&
          Array.isArray(studentProfile.memorised_juzs) && {
            memorised_juzs: studentProfile?.memorised_juzs?.map((item) =>
              Number(item)
            ),
          }),
      };

      setFormData(updatedFormData);
    }
  }, [preFieldStudentData]);

  // Add upload photo mutation
  const [uploadPhoto, { isLoading: photoUploadLoading }] =
    useUploadPhotoMutation();

  // file upload
  const [formDoc, setFormDoc] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const docUploadInput = useRef(null);

  const removeFormDoc = () => {
    if (formDoc) {
      setFormData((prev) => ({
        ...prev,
        document: null,
      }));
      setFormDoc(null);
    }
  };

  const docUploadChangeHandler = (e) => {
    const inputElement = e.target;

    if (inputElement.value !== "") {
      setIsProcessingFile(true);
      const file = inputElement.files[0];
      const validFileTypes = ["image/png", "image/jpg", "image/jpeg"];

      // Check if the file type is valid
      if (!validFileTypes.includes(file.type)) {
        message.error(
          "Invalid file type. Please upload a, PNG, JPG, or JPEG file."
        );
        inputElement.value = "";
        setIsProcessingFile(false);
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
        inputElement.value = "";
        setIsProcessingFile(false);
      } else {
        // Proceed with reading and setting the file
        const docReader = new FileReader();
        docReader.onload = (event) => {
          setFormData((prev) => ({
            ...prev,
            document: event.target.result,
          })); //store
          setIsProcessingFile(false);
        };
        docReader.readAsDataURL(file); //view
        setFormDoc(file);
        // Clear the input value after successful processing
        inputElement.value = "";
      }
    }
  };

  // get departments and classes from api
  const { data: depts, isFetching: loadingDepts } = useGetGroupsQuery(
    {
      page: 1,
      limit: 99999,
    },
    {
      skip: !preFieldStudentData,
    }
  );

  const [grades, setGrades] = useState([]);

  useEffect(() => {
    if (depts && preFieldStudentData) {
      const data = preFieldStudentData.data;
      const studentProfile = data.student_profile_id || {};

      const department = depts?.data?.find(
        (dept) => dept.id === studentProfile?.department_id
      );

      handleFormDataUpdate({
        department_name: department?.name || "",
      });

      const grades = department?.class_id || [];

      setGrades(grades);

      const grade = grades?.find(
        (grade) => grade.id === studentProfile?.grade_id
      );

      handleFormDataUpdate({
        grade_id: grade?.id || "",
        grade_name: grade?.class_name || "",
        class_type_name:
          grade?.class_type_org_id?.class_type_id?.type_name || "",
      });
    }
  }, [depts, preFieldStudentData]);

  const steps = [
    {
      key: 1,
      label: "Student Info",
      Component: Step1StudentInfo,
    },
    {
      key: 2,
      label: "Guardian & Parent",
      Component: Step2GuardianParents,
    },
    {
      key: 3,
      label: "Emergency Contact",
      Component: Step3EmergencyContact,
    },
    {
      key: 4,
      label: "Education Background",
      Component: Step4EducationBackground,
    },
    {
      key: 5,
      label: "Medical Info",
      Component: Step5MedicalInfo,
    },
  ];

  // Handle form data updates from step components
  const handleFormDataUpdate = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Handle step navigation
  const handleNextStep = (step) => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = (step) => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Helper function to remove empty values and conditional fields
  const removeEmptyValues = (obj) => {
    const cleaned = {};

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      // Special handling for profile_picture - don't remove it even if it's null
      if (key === "profile_picture") {
        cleaned[key] = value;
        return;
      }

      // Skip if value is null, undefined, or empty string
      if (value === null || value === undefined || value === "") {
        return;
      }

      // Handle arrays - only include if they have items
      if (Array.isArray(value)) {
        if (value.length > 0) {
          cleaned[key] = value;
        }
        return;
      }

      // Handle nested objects recursively
      if (typeof value === "object" && value !== null) {
        const nestedCleaned = removeEmptyValues(value);
        if (Object.keys(nestedCleaned).length > 0) {
          cleaned[key] = nestedCleaned;
        }
        return;
      }

      // Include non-empty values
      cleaned[key] = value;
    });

    return cleaned;
  };

  // Transform form data to API format with conditional logic
  const transformFormDataToAPIFormat = (data) => {
    const apiData = {
      people: {
        dob: data.dob,
        gender: data.gender,
        // Only include profile_picture if it exists
        ...(data.profile_picture && { profile_picture: data.profile_picture }),
      },
      student_profile: {
        status: data.status,
        studied_in_madrasa: data.studied_in_madrasa,
        legal_guardian_type: data.legal_guardian_type,
        attended_years_of_madrasa: data.attended_years_of_madrasa,
        to_grade: data.to_grade,
        department_id: data.department_id,
        grade_id: data.grade_id,
        quran_recitation_level: data.quran_recitation_level,
        program_name: data.program_name,
        ...(data.total_memorised_juzs !== "" && {
          total_memorised_juzs: Number(data.total_memorised_juzs),
        }),
        ...(data.current_sabaq_juz !== "" && {
          current_sabaq_juz: Number(data.current_sabaq_juz),
        }),
        ...(Array.isArray(data.memorised_juzs) &&
          data.memorised_juzs.length > 0 && {
            memorised_juzs: data.memorised_juzs.map(String),
          }),
        organization: {
          is_exist: false,
          name: data.madrasa_name,
        },
        organization_location: {
          location_name: data.organization_location_name,
          location_parent_id: data.organization_location_parent_id,
          location_type_id: location_type_id_eighteen,
        },
      },
      // Conditional emergency contact - only include if guardian is NOT the emergency contact
      ...(data.is_legal_guardian_emergency_contact === false
        ? {
            emergency_contact: {
              contact_person_name:
                `${data.contact_person_first_name} ${data.contact_person_last_name}`.trim(),
              contact_person_mobile_no: data.contact_person_dial_code
                ? data.contact_person_dial_code + data.contact_person_mobile
                : data.contact_person_mobile,
              contact_person_email: data.contact_person_email,
              relation_with_contact_person: data.relation_with_contact_person,
              physician_name: data.physician_name,
              physician_mobile_no: data.physician_dial_code
                ? data.physician_dial_code + data.physician_mobile_no
                : data.physician_mobile_no,
              is_legal_guardian_emergency_contact:
                data.is_legal_guardian_emergency_contact,
            },
            emergency_contact_person_location: {
              location_name: data.emergency_contact_person_location_name,
              location_parent_id:
                data.emergency_contact_person_location_parent_id,
              location_type_id: location_type_id_eighteen,
            },
          }
        : {
            emergency_contact: {
              is_legal_guardian_emergency_contact:
                data.is_legal_guardian_emergency_contact,
            },
          }),

      // if father id is there then only father id will go otherwise all the other informations
      ...(data.father_id
        ? {
            father_information: {
              id: data.father_id,
              same_address_as_student:
                data.father_address === "diff" ? false : true,
            },
          }
        : data.father_address === "diff"
        ? {
            father_information: {
              first_name: data.father_first_name,
              last_name: data.father_last_name,
              email: data.father_email,
              mobile_no: data.father_dial_code
                ? data.father_dial_code + data.father_mobile
                : data.father_mobile,
              same_address_as_student: false,
            },
            father_location: {
              location_name: data.father_location_name,
              location_parent_id: data.father_location_parent_id,
              location_type_id: location_type_id_eighteen,
            },
          }
        : data.father_address === "same"
        ? {
            father_information: {
              first_name: data.father_first_name,
              last_name: data.father_last_name,
              email: data.father_email,
              mobile_no: data.father_dial_code
                ? data.father_dial_code + data.father_mobile
                : data.father_mobile,
              same_address_as_student: true,
            },
          }
        : {}),

      // ...(data.father_address === "diff" && {
      //   father_information: {
      //     first_name: data.father_first_name,
      //     last_name: data.father_last_name,
      //     email: data.father_email,
      //     mobile_no: data.father_mobile,
      //     same_address_as_student: false,
      //   },
      //   father_location: {
      //     location_name: data.father_location_name,
      //     location_parent_id: data.father_location_parent_id,
      //     location_type_id: location_type_id_eighteen,
      //   },
      // }),

      // if mother id is there then only mother id will go otherwise all the other informations
      ...(data.mother_id
        ? {
            mother_information: {
              id: data.mother_id,
              same_address_as_student:
                data.mother_address == "diff" ? false : true,
            },
          }
        : // Conditional mother information - only include if address is different
        data.mother_address === "diff"
        ? {
            mother_information: {
              first_name: data.mother_first_name,
              last_name: data.mother_last_name,
              email: data.mother_email,
              mobile_no: data.mother_dial_code
                ? data.mother_dial_code + data.mother_mobile
                : data.mother_mobile,
              same_address_as_student: false,
            },
            mother_location: {
              location_name: data.mother_location_name,
              location_parent_id: data.mother_location_parent_id,
              location_type_id: location_type_id_eighteen,
            },
          }
        : data.mother_address === "same"
        ? {
            mother_information: {
              first_name: data.mother_first_name,
              last_name: data.mother_last_name,
              email: data.mother_email,
              mobile_no: data.mother_dial_code
                ? data.mother_dial_code + data.mother_mobile
                : data.mother_mobile,
              same_address_as_student: true,
            },
          }
        : {}),

      // ...(data.mother_address === "diff" && {
      //   mother_information: {
      //     first_name: data.mother_first_name,
      //     last_name: data.mother_last_name,
      //     email: data.mother_email,
      //     mobile_no: data.mother_mobile,
      //     same_address_as_student: false,
      //   },
      //   mother_location: {
      //     location_name: data.mother_location_name,
      //     location_parent_id: data.mother_location_parent_id,
      //     location_type_id: location_type_id_eighteen,
      //   },
      // }),

      medical_information: {
        allergies: data.allergies,
        blood_group: data.blood_group,
        medical_problems: data.medical_problems,
        significant_medical_history: data.significant_medical_history,
        regular_medications: data.regular_medications,
        physician_name: data.physician_name,
        physician_mobile_no: data.physician_dial_code
          ? data.physician_dial_code + data.physician_mobile_no
          : data.physician_mobile_no,
      },
      people_location: {
        location_name: data.location_name,
        location_parent_id: data.location_parent_id,
        location_type_id: location_type_id_eighteen,
      },
    };

    // Remove empty values from the API data
    return removeEmptyValues(apiData);
  };

  const [submitStudentForm, { isLoading, error }] =
    useStudentCompletionMutation();

  // Handle form submission
  const handleSubmit = async () => {
    const apiFormattedData = transformFormDataToAPIFormat(formData);

    // Now you can use the tokens for API calls
    if (getBearerToken && getUUIDToken) {
      await uploadImageAndProcess({
        uploadApi: uploadPhoto,
        imageFile: formDoc,
        onSuccess: async (imageUrl) => {
          await submitStudentForm({
            data: {
              ...apiFormattedData,
              people: {
                ...apiFormattedData.people,
                profile_picture: imageUrl,
              },
            },
            uuidSyntexToken: getUUIDToken,
            oneTimeStudentCompletionToken: getBearerToken,
            success: (data, status) => {
              console.log("Student form submitted successfully:", data);
              message.success("Student registration completed successfully!");
              setShowSuccessModal(true);
            },
            error: (error) => {
              console.error("Student form submission failed:", error);
              message.error(
                "Failed to complete student registration. Please try again."
              );
            },
          });
        },
        onError: (error) => {
          message.error("Failed to upload image. Please try again.");
        },
      });

      // console.log(apiFormattedData);
    } else {
      message.error("Missing authentication tokens. Please refresh the page.");
    }
  };

  // Render current step component
  const renderCurrentStep = () => {
    const stepProps = {
      formData, // inputs state
      formDoc,
      isProcessingFile,
      docUploadInput,
      removeFormDoc,
      docUploadChangeHandler,
      onFormDataUpdate: handleFormDataUpdate, // input, select, radio, checkbox, date, etc handler.
      depts,
      grades,
      setGrades,
      infoErrors,
      setInfoErrors,
      step,
      // setup phone dial code
      fatherCountryDropDownToggle,
      setFatherCountryDropDownToggle,
      motherCountryDropDownToggle,
      setMotherCountryDropDownToggle,
      contactPersonCountryDropDownToggle,
      setContactPersonCountryDropDownToggle,
      getCountries,
      setGetCountries,
      fatherSelectedDialCountry,
      motherSelectedDialCountry,
      contactPersonSelectedDialCountry,
      selectCountryhandler,
      physicianCountryDropDownToggle,
      setPhysicianCountryDropDownToggle,
      physicianSelectedDialCountry,
      onNextStep: step < steps.length ? () => handleNextStep(step) : undefined,
      onPrevStep: step > 1 ? () => handlePrevStep(step) : undefined,
      onSubmit: handleSubmit,
    };

    return (
      <>
        {steps.map((stepItem, i) => (
          <stepItem.Component
            key={i}
            {...stepProps}
            className={`${stepItem.key === step ? "block" : "hidden"}`}
            onNextStep={
              step < steps.length
                ? () => handleNextStep(stepItem.key)
                : undefined
            }
            onPrevStep={
              step > 1 ? () => handlePrevStep(stepItem.key) : undefined
            }
          />
        ))}
      </>
    );
  };

  if (isToken) {
    return (
      <>
        <div className="w-full ">
          <div className="card lg:w-[750px] w-[95%] max-w-[95%] lg:p-12 p-5 rounded-[12px] shadow-lg bg-white top-0 m-auto mt-8">
            <div className="flex justify-between items-center">
              <h2 className="lg:text-[30px] text-2xl font-bold">Add Student</h2>
              {/* <p className="font-bold">Step {step}/5</p> */}

              <p className="font-bold">
                Step {step}/{steps.length}
              </p>
            </div>
            <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

            {/* Steps indicator */}
            <div className="steps-indicator mb-6 ">
              <div className="steps-line h-[4px] rounded overflow-hidden bg-[#E4E6EA]">
                <div
                  className={`line-inner h-[4px] bg-[#90C8AC]`}
                  style={{ width: `${((step - 1) / 4) * 100}%` }}
                ></div>
              </div>
              <div className="steps flex justify-between items-center gap-3 relative top-[-12px]">
                {steps.map((stepItem, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`step-indicator rounded-full w-[20px] h-[20px] flex justify-center items-center ${
                        i + 1 <= step ? "bg-[#90C8AC]" : "bg-[#E4E6EA]"
                      }`}
                    ></div>
                    <span
                      className={`text-xs mt-2 font-medium text-primary-brand-default`}
                    >
                      {stepItem.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Render steps */}
            {renderCurrentStep()}
          </div>
        </div>
        <Modal
          open={showSuccessModal}
          onOk={() => setShowSuccessModal(false)}
          onCancel={() => setShowSuccessModal(false)}
          okText="OK"
          centered
          title="Success"
        >
          <p>Student registration completed successfully!</p>
        </Modal>
      </>
    );
  }
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="w-full h-screen flex justify-center items-center ">
    <div className="flex justify-center items-center">
      <span>
        <SvgLoader className="text-primary-brand-default" />
      </span>
    </div>
  </div>
);

// Main component with Suspense boundary
const AddNewStudentRegister = ({ getBearerToken, getUUIDToken }) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AddNewStudentRegisterContent
        getBearerToken={getBearerToken}
        getUUIDToken={getUUIDToken}
      />
    </Suspense>
  );
};

export default AddNewStudentRegister;
