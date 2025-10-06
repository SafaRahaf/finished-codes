"use client";
import React, { useEffect, useState } from "react";
import { useGetTeacherDetailsQuery } from "@/store/features/teacher-management/apiSlice";
import { useParams, useSearchParams } from "next/navigation";
import { MdKeyboardArrowRight } from "react-icons/md";
import Link from "next/link";
import {
  IdentificationDocumentStepUpdate,
  LocationStepUpdate,
  EducationExperienceStepUpdate,
  ResposibilitiesStepUpdate,
  ScheduleStepUpdate,
  MedicalInformationStepUpdate,
  InsuranceStepUpdate,
  EmergencyContactStepUpdate,
  PaymentInformationStepUpdate,
  PersonalInformation,
} from "./steps";
import Modal from "antd/es/modal/Modal";

// strings
const PERSONALINFORMATION = "personalInformation";
const IDENTIFICATIONDOCUMENTSTEPUPDATE = "identificationDocumentStepUpdate";
const LOCATIONSTEPUPDATE = "locationStepUpdate";
const EDUCATIONEXPERIENCESTEPUPDATE = "educationExperienceStepUpdate";
const RESPOSIBILITIESSTEPUPDATE = "resposibilitiesStepUpdate";
const SCHEDULESTEPUPDATE = "scheduleStepUpdate";
const MEDICALINFORMATIONSTEPUPDATE = "medicalInformationStepUpdate";
const INSURANCESTEPUPDATE = "insuranceStepUpdate";
const EMERGENCYCONTACTSTEPUPDATE = "emergencyContactStepUpdate";
const PAYMENTINFORMATIONSTEPUPDATE = "paymentInformationStepUpdate";
// strings end

const UpdateTeacher = () => {
  // ===== states for modal ====
  const [
    teacherPersonalInfoUpdateConfirmModal,
    setTeacherPersonalInfoUpdateConfirmModal,
  ] = useState(false);
  const [
    teacherOrganizationInfoUpdateConfirmModal,
    setTeacherOrganizationInfoUpdateConfirmModal,
  ] = useState(false);

  /*===== general ========*/

  // teacher id
  const params = useParams();
  const { id } = params;

  /*======== initilize apis ========*/

  // fetch teacher information
  const { data: teacherFetch, isFetching } = useGetTeacherDetailsQuery(id);

  /*========= states & functions =========*/

  const [currentStep, setCurrentStep] = useState(PERSONALINFORMATION);

  // store teahcer data
  const [teacherInfo, setTeacherInfo] = useState({
    [PERSONALINFORMATION]: null,
    [IDENTIFICATIONDOCUMENTSTEPUPDATE]: null,
    [LOCATIONSTEPUPDATE]: null,
    [EDUCATIONEXPERIENCESTEPUPDATE]: null,
    [RESPOSIBILITIESSTEPUPDATE]: null,
    [SCHEDULESTEPUPDATE]: null,
    [MEDICALINFORMATIONSTEPUPDATE]: null,
    [INSURANCESTEPUPDATE]: null,
    [EMERGENCYCONTACTSTEPUPDATE]: null,
    [PAYMENTINFORMATIONSTEPUPDATE]: null,
  });

  useEffect(() => {
    if (teacherFetch && !isFetching) {
      // teacherFetch?.data
      const data = teacherFetch?.data;
      // console.log(data);
      setTeacherInfo((prev) => ({
        ...prev,
        [PERSONALINFORMATION]: {
          teacherId: id,
          firstName: data?.first_name,
          lastName: data?.last_name,
          designation:
            data?.designation_employees?.designation_org_id?.designation_id
              ?.designation,
          designation_date: data?.designation_date,
          dob: data?.dob,
          gender: data?.gender,
          mobile:
            data?.user_id?.mobiles?.length &&
            data?.user_id?.mobiles?.find(
              (item) => item.mobile_type === "primary"
            )?.mobile_no,
          joiningDate: data?.designation_employees?.joining_date,
          email:
            data?.user_id?.emails?.length &&
            data?.user_id?.emails?.find(
              (item) => item?.email_type === "primary"
            )?.email,
          emailOptional:
            data?.user_id?.emails?.length &&
            data?.user_id?.emails?.find(
              (item) => item.email_type === "secondary"
            )?.email,
          profile_picture: data?.profile_picture,
          bio: data?.bio,
          addContactLinks: data?.contact_details || [],
        },
        [IDENTIFICATIONDOCUMENTSTEPUPDATE]: {
          teacherId: id,
          documentsData: data?.people_identification,
        },
        [LOCATIONSTEPUPDATE]: {
          teacherId: id,
          id: data?.location?.id,
          location: data?.location,
        },
        [EDUCATIONEXPERIENCESTEPUPDATE]: {
          teacherId: id,
          experience: data?.people_experiences,
          educations: data?.people_educations,
        },
        [RESPOSIBILITIESSTEPUPDATE]: {
          teacherId: id,
          responsibilities: data?.employee_responsibilities,
        },
        [SCHEDULESTEPUPDATE]: {
          teacherId: id,
          classDays: data?.employee_schedules,
        },
        [MEDICALINFORMATIONSTEPUPDATE]: {
          teacherId: id,
          id: data?.people_medical_information?.id,
          bloodGroup: data?.people_medical_information?.blood_group,
          allergies: data?.people_medical_information?.allergies,
          medicalHistory:
            data?.people_medical_information?.significant_medical_history,
          medicalProblems: data?.people_medical_information?.medical_problems,
          medication: data?.people_medical_information?.regular_medications,
        },
        [INSURANCESTEPUPDATE]: {
          teacherId: id,
          id: data?.medical_insurance?.id,
          companyName: data?.medical_insurance?.organization_id?.name,
          state: data?.medical_insurance?.organization_id?.location_id,
          policyNumber: data?.medical_insurance?.policy_number,
          insurance_expiry_date: data?.medical_insurance?.expiry_date,
        },
        [EMERGENCYCONTACTSTEPUPDATE]: {
          teacherId: id,
          id:
            data?.emergency_contact?.length &&
            data?.emergency_contact?.find((em) => em?.is_default)?.id,
          medical_information_id: data?.people_medical_information?.id,
          emName:
            data?.emergency_contact?.length &&
            data?.emergency_contact?.find((em) => em?.is_default)
              ?.contact_person_name,
          emNumber:
            data?.emergency_contact?.length &&
            data?.emergency_contact?.find((em) => em?.is_default)
              ?.contact_person_mobile_no,
          emRelation:
            data?.emergency_contact?.length &&
            data?.emergency_contact?.find((em) => em?.is_default)
              ?.relation_with_contact_person,
          emPhysician:
            data?.emergency_contact?.length &&
            data?.emergency_contact?.find((em) => em?.is_default)
              ?.physician_name,
          emPhone:
            data?.emergency_contact?.length &&
            data?.emergency_contact?.find((em) => em?.is_default)
              ?.physician_mobile_no,
        },
        [PAYMENTINFORMATIONSTEPUPDATE]: {
          teacherId: id,
          id: data?.payment_infos?.[0]?.id ?? null,
          bank: data?.payment_infos?.[0]?.bank_name ?? null,
          accountNumber: data?.payment_infos?.[0]?.account_no ?? null,
          accountName: data?.payment_infos?.[0]?.account_name ?? null,
          accountType: data?.payment_infos?.[0]?.account_type ?? null,
          routingNumber: data?.payment_infos?.[0]?.routing_number ?? null,
        },
      }));
    }
  }, [teacherFetch, isFetching]);

  const searchParams = useSearchParams();
  const editSchedule = searchParams.get("editSchedule");
  useEffect(() => {
    if (editSchedule) {
      setCurrentStep(SCHEDULESTEPUPDATE);
    }
  }, [editSchedule]);

  return (
    <div>
      <p className="text-[#798295] text-14 flex items-center mt-6  font-bold">
        <Link href="/teachers">Teacher Management</Link>
        <span className="mx-3">
          <MdKeyboardArrowRight />
        </span>
        <Link href="/teachers/lists">Teachers</Link>

        <span className="mx-3">
          <MdKeyboardArrowRight />
        </span>
        <span className="text-black font-bold"> Edit Profile</span>
      </p>

      <div className="mt-8">
        <div className="lg:w-[872px] xl:w-[924px]  2xl:w-[1008px]   shadow-custom-effect rounded-[12px] mx-auto  ">
          <div className="card-header sm:p-12  sm:pb-6 px-5 py-4">
            <h2 className="sm:text-2xl text-xl font-bold">
              Edit Teacher Profile
            </h2>
          </div>

          <div className="w-full  border-t-2 border-[#E4E6EA] lg:flex  ">
            <div className="item-left lg:w-[270px] xl:w-[300px] w-full  bg-[#E7F7FF] py-6 xl:px-6  px-2 ">
              <ul className="flex lg:flex-col flex-row flex-wrap lg:gap-[20px] gap-1 ">
                <li>
                  <button
                    className={` ${
                      currentStep === PERSONALINFORMATION
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12  py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase `}
                    onClick={() => setCurrentStep(PERSONALINFORMATION)}
                  >
                    Personal Information
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === IDENTIFICATIONDOCUMENTSTEPUPDATE
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12  py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() =>
                      setCurrentStep(IDENTIFICATIONDOCUMENTSTEPUPDATE)
                    }
                  >
                    Identification Documents
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === LOCATIONSTEPUPDATE
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12  py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(LOCATIONSTEPUPDATE)}
                  >
                    Address
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === EDUCATIONEXPERIENCESTEPUPDATE
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12  py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() =>
                      setCurrentStep(EDUCATIONEXPERIENCESTEPUPDATE)
                    }
                  >
                    Education & Experience
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === RESPOSIBILITIESSTEPUPDATE
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12  py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(RESPOSIBILITIESSTEPUPDATE)}
                  >
                    Responsibilities
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === SCHEDULESTEPUPDATE
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12  py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(SCHEDULESTEPUPDATE)}
                  >
                    Schedule
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === MEDICALINFORMATIONSTEPUPDATE
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12  py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(MEDICALINFORMATIONSTEPUPDATE)}
                  >
                    Medical Information
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === INSURANCESTEPUPDATE
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12  py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(INSURANCESTEPUPDATE)}
                  >
                    Medical Insurance
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === PAYMENTINFORMATIONSTEPUPDATE
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12  py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(PAYMENTINFORMATIONSTEPUPDATE)}
                  >
                    Payment Information
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === EMERGENCYCONTACTSTEPUPDATE
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12  py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(EMERGENCYCONTACTSTEPUPDATE)}
                  >
                    Emergency contact
                  </button>
                </li>
              </ul>
            </div>
            <div className="item-right flex-1 h-full py-6 px-6 xl:px-12 ">
              <div className="w-full">
                {currentStep === PERSONALINFORMATION && (
                  <>
                    <PersonalInformation
                      modalOpen={(open) => {
                        setTeacherPersonalInfoUpdateConfirmModal(open);
                      }}
                      prevData={teacherInfo?.[PERSONALINFORMATION]}
                    />
                  </>
                )}

                {currentStep === IDENTIFICATIONDOCUMENTSTEPUPDATE && (
                  <>
                    <IdentificationDocumentStepUpdate
                      modalOpen={(open) => {
                        setTeacherPersonalInfoUpdateConfirmModal(open);
                      }}
                      prevData={teacherInfo?.[IDENTIFICATIONDOCUMENTSTEPUPDATE]}
                    />
                  </>
                )}

                {currentStep === LOCATIONSTEPUPDATE && (
                  <>
                    <LocationStepUpdate
                      modalOpen={(open) => {
                        setTeacherPersonalInfoUpdateConfirmModal(open);
                      }}
                      prevData={teacherInfo?.[LOCATIONSTEPUPDATE]}
                    />
                  </>
                )}

                {currentStep === EDUCATIONEXPERIENCESTEPUPDATE && (
                  <>
                    <EducationExperienceStepUpdate
                      modalOpen={(open) => {
                        setTeacherPersonalInfoUpdateConfirmModal(open);
                      }}
                      prevData={teacherInfo?.[EDUCATIONEXPERIENCESTEPUPDATE]}
                    />
                  </>
                )}

                {currentStep === RESPOSIBILITIESSTEPUPDATE && (
                  <>
                    <ResposibilitiesStepUpdate
                      modalOpen={(open) => {
                        setTeacherOrganizationInfoUpdateConfirmModal(open);
                      }}
                      prevData={teacherInfo?.[RESPOSIBILITIESSTEPUPDATE]}
                    />
                  </>
                )}

                {currentStep === SCHEDULESTEPUPDATE && (
                  <>
                    <ScheduleStepUpdate
                      modalOpen={(open) => {
                        setTeacherOrganizationInfoUpdateConfirmModal(open);
                      }}
                      prevData={teacherInfo?.[SCHEDULESTEPUPDATE]}
                    />
                  </>
                )}

                {currentStep === MEDICALINFORMATIONSTEPUPDATE && (
                  <>
                    <MedicalInformationStepUpdate
                      modalOpen={(open) => {
                        setTeacherPersonalInfoUpdateConfirmModal(open);
                      }}
                      prevData={teacherInfo?.[MEDICALINFORMATIONSTEPUPDATE]}
                    />
                  </>
                )}

                {currentStep === INSURANCESTEPUPDATE && (
                  <>
                    <InsuranceStepUpdate
                      modalOpen={(open) => {
                        setTeacherPersonalInfoUpdateConfirmModal(open);
                      }}
                      prevData={teacherInfo?.[INSURANCESTEPUPDATE]}
                    />
                  </>
                )}

                {currentStep === EMERGENCYCONTACTSTEPUPDATE && (
                  <>
                    <EmergencyContactStepUpdate
                      modalOpen={(open) => {
                        setTeacherPersonalInfoUpdateConfirmModal(open);
                      }}
                      prevData={teacherInfo?.[EMERGENCYCONTACTSTEPUPDATE]}
                    />
                  </>
                )}

                {currentStep === PAYMENTINFORMATIONSTEPUPDATE && (
                  <>
                    <PaymentInformationStepUpdate
                      modalOpen={(open) => {
                        setTeacherPersonalInfoUpdateConfirmModal(open);
                      }}
                      prevData={teacherInfo?.[PAYMENTINFORMATIONSTEPUPDATE]}
                    />
                  </>
                )}
              </div>

              {/* Teacher mail notify confirmation modal */}
              <Modal
                open={teacherPersonalInfoUpdateConfirmModal}
                onOk={() => setTeacherPersonalInfoUpdateConfirmModal(false)}
                okText="Okay, Understood"
                closable={false}
                cancelButtonProps={{ style: { display: "none" } }}
                footer={null}
              >
                <div className="flex flex-col items-start text-start p-1">
                  <div className="flex items-center gap-1 text-[#DC7803] font-semibold text-lg mb-2">
                    <span className="text-xl">⚠️</span>
                    <span>Email Has Been Sent</span>
                  </div>
                  <hr className="w-full border-gray-200 mb-4" />
                  <p className="text-gray-700 mb-4">
                    An email regarding the information change has been sent to
                    the teacher. Updates will occur upon agreement.
                  </p>
                  <button
                    onClick={() =>
                      setTeacherPersonalInfoUpdateConfirmModal(false)
                    }
                    className="bg-gray-900 hover:bg-gray-800 text-white py-2 px-6 rounded-lg text-base font-medium w-full"
                  >
                    Okay, Understood
                  </button>
                </div>
              </Modal>
              <Modal
                open={teacherOrganizationInfoUpdateConfirmModal}
                onOk={() => setTeacherOrganizationInfoUpdateConfirmModal(false)}
                okText="Okay, Understood"
                closable={false}
                cancelButtonProps={{ style: { display: "none" } }}
                footer={null}
              >
                <div className="flex flex-col items-start text-start p-1">
                  <div className="flex items-center gap-1 text-[#DC7803] font-semibold text-lg mb-2">
                    <span className="text-xl">⚠️</span>
                    <span>Email Has Been Sent</span>
                  </div>
                  <hr className="w-full border-gray-200 mb-4" />
                  <p className="text-gray-700 mb-4">
                    An email regarding the information change has been sent to
                    the teacher.
                  </p>
                  <button
                    onClick={() =>
                      setTeacherOrganizationInfoUpdateConfirmModal(false)
                    }
                    className="bg-gray-900 hover:bg-gray-800 text-white py-2 px-6 rounded-lg text-base font-medium w-full"
                  >
                    Okay, Understood
                  </button>
                </div>
              </Modal>
            </div>
          </div>
        </div>
      </div>

      {/* edit card */}
    </div>
  );
};

export default UpdateTeacher;
