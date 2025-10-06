/**
 * AddNewTeacher Component
 * This component handles the multi-step form for adding a new teacher/employee profile.
 */

"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import TeacherPersonalInformation from "./steps/TeacherPersonalInformation";
import AddressAndEducationInformation from "./steps/AddressAndEducationInformation";
import MedicalInformation from "./steps/MedicalInformation";
import PaymentInformation from "./steps/PaymentInformation";
import {
  useGetTeacherDefaultDetailsQuery,
  useSubmitTeacherFormMutation,
} from "@/store/features/teacher-management/apiSlice";
import { message, Modal } from "antd";
import moment from "moment";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "@/store/features/auth/authSlice";

const AddNewTeacher = ({ token, header_token }) => {
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Router and authentication setup
  const router = useRouter();
  const people_token = getCookie("access_token");
  const [isToken, setIsToken] = useState(null);
  const dispatch = useDispatch();

  // Handle header token and set it in cookies
  useEffect(() => {
    if (header_token) {
      setCookie("access_token", header_token, {
        maxAge: 60 * 60 * 24 * 7, // 1 week expiration
        path: "/",
      });
    }
  }, [header_token]);

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

  // Form state management

  const [collectionOfData, setCollectionOfData] = useState({
    stepOne: null,
    stepTwo: null,
    stepThree: null,
    stepFour: null,
  });

  // save payloady each form handler
  const savePersonalPayload = (payload) => {
    setCollectionOfData((prev) => ({
      ...prev,
      stepOne: payload,
    }));
  };
  const saveAddressPayload = (payload) => {
    setCollectionOfData((prev) => ({
      ...prev,
      stepTwo: payload,
    }));
  };
  const saveMedicalPayload = (payload) => {
    setCollectionOfData((prev) => ({
      ...prev,
      stepThree: payload,
    }));
  };
  const savePaymentPayload = async (payload) => {
    setCollectionOfData((prev) => ({
      ...prev,
      stepFour: payload,
    }));
  };

  // Call submitData when stepFour is set
  useEffect(() => {
    if (
      collectionOfData.stepOne &&
      collectionOfData.stepTwo &&
      collectionOfData.stepThree &&
      collectionOfData.stepFour
    ) {
      submitData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionOfData.stepFour]);

  // Navigation handlers for form steps
  const nextStepHandler = (value) => {
    setStep(value);
  };

  const prevStepHandler = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Fetch default teacher details
  const [defaultData, setDefaultData] = useState(null);
  const { data, isFetching } = useGetTeacherDefaultDetailsQuery({
    token: token,
    header_token: header_token,
  });

  // Update the defaultData structure to include complete arrays
  useEffect(() => {
    if (data && !isFetching) {
      const {
        first_name,
        last_name,
        designation_id,
        access_to_admin_panel,
        people_id,
        employee_schedules,
        to,
      } = data?.data;

      setDefaultData({
        name: `${first_name} ${last_name}`,
        designation: designation_id?.designation_id?.designation || null,
        profile_picture: people_id?.profile_picture || null,
        dob: people_id?.dob || null,
        gender: people_id?.gender || null,
        bio: people_id?.bio || "",
        people_educations: people_id?.people_educations || [],
        people_experiences: people_id?.people_experiences || [],
        people_educations_instatute:
          people_id?.people_educations?.[0]?.organization_id?.name || null,
        educations_degree:
          people_id?.people_educations?.[0]?.degree_id?.degree || null,
        educations_complete_year:
          people_id?.people_educations?.[0]?.completion_year || null,
        experience_joinging_date:
          people_id?.people_experiences?.[0]?.joining_date || null,
        experience_ending_date:
          people_id?.people_experiences?.[0]?.ending_date || null,
        experience_organization:
          people_id?.people_experiences?.[0]?.organization_id?.name || null,
        blood_group:
          people_id?.people_medical_information?.[0]?.blood_group || null,
        allergies:
          people_id?.people_medical_information?.[0]?.allergies || null,
        significant_medical_history:
          people_id?.people_medical_information?.[0]
            ?.significant_medical_history || null,
        regular_medications:
          people_id?.people_medical_information?.[0]?.regular_medications ||
          null,
        medical_problems:
          people_id?.people_medical_information?.[0]?.medical_problems || null,
        physician_name:
          people_id?.people_medical_information?.[0]?.physician_name || null,
        physician_mobile_no:
          people_id?.people_medical_information?.[0]?.physician_mobile_no ||
          null,
        bank_name: people_id?.payment_infos?.[0]?.bank_name || null,
        account_no: people_id?.payment_infos?.[0]?.account_no || null,
        account_name: people_id?.payment_infos?.[0]?.account_name || null,
        account_type: people_id?.payment_infos?.[0]?.account_type || null,
        routing_number: people_id?.payment_infos?.[0]?.routing_number || null,
        emergency_contact_person_name:
          people_id?.emergency_contact?.[0]?.contact_person_name || null,
        emergency_contact_person_relation:
          people_id?.emergency_contact?.[0]?.relation_with_contact_person ||
          null,
        contact_person_mobile_no:
          people_id?.emergency_contact?.[0]?.contact_person_mobile_no || null,
        physician_name:
          people_id?.emergency_contact?.[0]?.physician_name || null,
        physician_mobile_no:
          people_id?.emergency_contact?.[0]?.physician_mobile_no || null,
        people_insurance_policy_no:
          people_id?.people_insurance_id?.[0]?.policy_number || null,
        people_insurance_expiry_date:
          people_id?.people_insurance_id?.[0]?.expiry_date || null,
        insurance_company:
          people_id?.people_insurance_id?.[0]?.organization_id?.name || null,
        access_to_admin_panel: access_to_admin_panel ? true : false,
        access_email: access_to_admin_panel && to ? to : null,
        contact_details: people_id?.contact_details || [],
        employee_schedules: employee_schedules || [],
      });
    }
  }, [data, isFetching]);

  /**
   * Utility function to clean object data
   * @param {object|array}
   * @returns {object|array}
   */
  const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
      // If the object is an array, clean each item and filter out empty objects
      return obj
        .map(cleanObject) // Recursively clean each array item
        .filter(
          (item) =>
            item !== null &&
            item !== undefined &&
            (typeof item !== "object" || Object.keys(item).length > 0)
        );
    } else if (obj !== null && typeof obj === "object") {
      // If the object is not an array, recursively clean its properties
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const cleanedValue = cleanObject(value); // Clean the value recursively
        if (
          cleanedValue !== null &&
          cleanedValue !== undefined &&
          (typeof cleanedValue !== "object" ||
            Object.keys(cleanedValue).length > 0) &&
          (!Array.isArray(cleanedValue) || cleanedValue.length > 0)
        ) {
          acc[key] = cleanedValue; // Keep the key-value pair
        }
        return acc;
      }, {});
    }
    // For non-objects, return the value itself if it's valid
    return obj !== "" && obj !== null && obj !== undefined ? obj : undefined;
  };

  // Form submission setup
  const [submitTeacherForm, { isLoading, error }] =
    useSubmitTeacherFormMutation();

  // Error handling
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        message.error(error.data.message);
      } else {
        message.error(error.data.message);
      }
    }
  }, [error]);

  // Navigation and cookie management
  const redirectToAnotherPage = () => {
    router.replace(`/`);
  };

  const resetCookie = () => {
    deleteCookie("access_token", { path: "/" });
  };

  // Form submission handler
  const submitData = () => {
    if (
      collectionOfData?.stepOne &&
      collectionOfData?.stepTwo &&
      collectionOfData?.stepThree &&
      collectionOfData?.stepFour
    ) {
      // Prepare form data for submission
      const stepOne = collectionOfData?.stepOne;
      const stepTwo = collectionOfData?.stepTwo;
      const stepThree = collectionOfData?.stepThree;
      const stepFour = collectionOfData?.stepFour;

      // Filter employee schedules for today's day and transform the data
      const today = moment().format("dddd").toLowerCase();
      const todaysSchedules =
        defaultData?.employee_schedules?.filter(
          (schedule) => schedule.day.toLowerCase() === today
        ) || [];

      const todayUTC = moment.utc().format("YYYY-MM-DD");

      const transformedSchedules = todaysSchedules.map((schedule) => {
        const checkInUTC = moment.utc(
          `${todayUTC} ${schedule.check_in}`,
          "YYYY-MM-DD HH:mm:ss"
        );
        const checkOutUTC = moment.utc(
          `${todayUTC} ${schedule.check_out}`,
          "YYYY-MM-DD HH:mm:ss"
        );

        const checkInLocal = checkInUTC.clone().local();
        const checkOutLocal = checkOutUTC.clone().local();

        // Clone the local moments to adjust if needed
        let adjustedCheckIn = checkInLocal.clone();
        let adjustedCheckOut = checkOutLocal.clone();

        if (adjustedCheckIn.isAfter(adjustedCheckOut)) {
          adjustedCheckIn.subtract(2, "day");
        }

        return {
          id: schedule.id,
          day: schedule.day,
          check_in_date: adjustedCheckIn.format("YYYY-MM-DD"),
          check_out_date: adjustedCheckOut.format("YYYY-MM-DD"),
          check_in: schedule.check_in,
          check_out: schedule.check_out,
        };
      });

      // Structure the data according to API requirements
      const readyData = {
        people: {
          profile_picture: stepOne?.profile_picture || null,
          dob: stepOne?.dob,
          gender: stepOne?.gender,
          bio: stepTwo?.bio,
          joining_date: stepOne?.joiningDate,
          additional_email: stepOne?.email,
          mobile_no: stepOne?.mobile,
        },
        people_identifications: stepOne?.documentsData.length
          ? stepOne?.documentsData.map((item) => ({
              identification_type_id: item.type_id,
              identification_code: item.licenceNumber,
            }))
          : null,
        emergency_contact: {
          contact_person_name: stepThree?.emName,
          contact_person_mobile_no: stepThree?.emNumber,
          relation_with_contact_person: stepThree?.emRelation,
          physician_name: stepThree?.emPhysician,
          physician_mobile_no: stepThree?.emPhone,
        },
        medical_information: {
          allergies: stepThree?.allergies,
          blood_group: stepThree?.bloodGroup,
          medical_problems: stepThree?.medicalProblems,
          significant_medical_history: stepThree?.medicalHistory,
          regular_medications: stepThree?.medication,
          medical_insurance: {
            organization: stepThree?.companyName
              ? {
                  is_exist: false,
                  name: stepThree?.companyName,
                }
              : null,
            location_id: stepThree?.state,
            policy_number: stepThree?.policyNumber,
            insurance_expiry_date: stepThree?.exDate,
          },
        },
        people_experiences: stepTwo?.experience?.length
          ? stepTwo.experience.map((experience) => {
              const startDate = experience.year?.[0]
                ? moment(experience.year[0])
                : null;
              const endDate = experience.year?.[1]
                ? moment(experience.year[1])
                : null;

              return {
                joining_date: startDate ? startDate.format("YYYY-MM-DD") : null,
                ending_date: endDate ? endDate.format("YYYY-MM-DD") : null,
                experience_year:
                  startDate && endDate
                    ? endDate
                        .diff(startDate, "years", true)
                        .toFixed(1)
                        .toString()
                    : null,
                designation: experience.designation
                  ? {
                      is_exist: experience.designation_exist,
                      ...(experience.designation_exist
                        ? { id: experience.designation }
                        : { name: experience.designation_name }),
                    }
                  : null,
                organization: experience.organization
                  ? {
                      is_exist: experience.organization_exist,
                      ...(experience.organization_exist
                        ? { id: experience.organization }
                        : { name: experience.organization_name }),
                    }
                  : null,
              };
            })
          : null,
        people_education: stepTwo?.educations?.length
          ? stepTwo?.educations.map((education) => ({
              completion_year: education.year,
              degree: {
                is_exist: education.degree_exist,
                ...(education.degree_exist
                  ? { id: education.degree }
                  : { name: education.degree_name }),
              },
              organization: {
                is_exist: education.institute_exist,
                ...(education.institute_exist
                  ? { id: education.institute }
                  : { name: education.institute_name }),
              },
            }))
          : null,
        people_location: {
          location_name: stepTwo?.street_address,
          location_parent_id:
            stepTwo?.locationTypesObjItems?.length > 0
              ? stepTwo?.locationTypesObjItems[
                  stepTwo?.locationTypesObjItems?.length - 1
                ].id
              : null,
          location_type_id: stepTwo?.location_type_id,
          lat: "0.0",
          long: "0.0",
        },
        payment_info: {
          bank_name: stepFour?.bank,
          account_no: stepFour?.accountNumber,
          account_name: stepFour?.accountName,
          account_type: stepFour?.accountType,
          routing_number: stepFour?.routingNumber,
        },
        login_information: {
          email: defaultData?.access_to_admin_panel ? stepFour?.email : null,
          password: defaultData?.access_to_admin_panel
            ? stepFour?.password
            : null,
        },
        people_contacts: stepOne?.addContactLinks?.length
          ? stepOne?.addContactLinks?.map((contact) => ({
              contact: contact.value,
              contact_type_id: contact.id,
            }))
          : null,
        employee_schedules:
          transformedSchedules.length > 0 ? transformedSchedules : null,
      };

      // Submit the form data
      submitTeacherForm({
        data: cleanObject(readyData),
        token: token,
        redirectAnotherPage: redirectToAnotherPage,
        resetCookie: resetCookie,
        success: (data, status) => {
          console.log("Teacher form submitted successfully:", data);
          message.success("Teacher registration completed successfully!");
          setShowSuccessModal(true);
        },
        error: (error) => {
          console.error("Teacher form submission failed:", error);
          message.error(
            "Failed to complete teacher registration. Please try again."
          );
        },
      });

      // console.log(readyData);
    }
  };

  return (
    <>
      <div>
        <div className="w-full">
          {/* Main form container */}
          <div className="card lg:w-[850px] w-[95%] max-w-[95%] lg:p-12 p-5 rounded-[12px] shadow-lg bg-white top-0 m-auto mt-8">
            {/* Form header */}
            <div className="flex justify-between items-center">
              <h2 className="lg:text-[30px] text-2xl font-bold">
                Teacher/Employee Profile Setting <br />
                <span className="text-sm font-light">
                  It will take just 4 steps
                </span>
              </h2>
              <p className="font-bold">Step {step}/4</p>
            </div>
            <div className=" line h-[1px] my-6 bg-[#E4E6EA]"></div>

            {/* Conditional rendering based on authentication and current step */}
            {isToken ? (
              <>
                <div className={step === 1 ? "block" : "hidden"}>
                  <TeacherPersonalInformation
                    defaultData={defaultData}
                    storeHandler={savePersonalPayload}
                    nextStepHandler={nextStepHandler}
                    prevStepHandler={prevStepHandler}
                  />
                </div>
                <div className={step === 2 ? "block" : "hidden"}>
                  <AddressAndEducationInformation
                    defaultData={defaultData}
                    storeHandler={saveAddressPayload}
                    nextStepHandler={nextStepHandler}
                    prevStepHandler={prevStepHandler}
                  />
                </div>
                <div className={step === 3 ? "block" : "hidden"}>
                  <MedicalInformation
                    defaultData={defaultData}
                    locationSecondChildren={
                      collectionOfData.stepTwo?.locationTypesObjItems?.length &&
                      collectionOfData.stepTwo?.locationTypesObjItems[0]
                    }
                    storeHandler={saveMedicalPayload}
                    nextStepHandler={nextStepHandler}
                    prevStepHandler={prevStepHandler}
                  />
                </div>
                <div className={step === 4 ? "block" : "hidden"}>
                  <PaymentInformation
                    finalLoading={isLoading}
                    defaultData={defaultData}
                    storeHandler={savePaymentPayload}
                    nextStepHandler={nextStepHandler}
                    prevStepHandler={prevStepHandler}
                  />
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center">
                <SvgLoader />
              </div>
            )}
          </div>
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
        <p>Teacher registration completed successfully!</p>
      </Modal>
    </>
  );
};

export default AddNewTeacher;
