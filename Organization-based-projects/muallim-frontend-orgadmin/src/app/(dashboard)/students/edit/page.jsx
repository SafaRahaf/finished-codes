"use client";
import "./edit.css";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { MdKeyboardArrowRight } from "react-icons/md";
import Link from "next/link";
import { StudentEdit } from "@/components/students/StudentEdit";
import { useGetStudentDetailsQuery } from "@/store/features/class-management/apiSlice";
import { useGetAllAuthOrganizationsQuery } from "@/store/features/auth/apiSlice";

const {
  PersonalInfoStep,
  DepartmentGradeStep,
  EducationBackgroundStep,
  GuardianParentsStep,
  EmergencyContactStep,
  MedicalInfoStep,
} = StudentEdit;

const WrapperEditStudent = () => {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const studentId = searchParams.get("id");
  const editGuardian = searchParams.get("editGuardian");
  useEffect(() => {
    if (editGuardian) {
      setCurrentStep(4);
    }
  }, [editGuardian]);

  const [studentInfo, setStudentInfo] = useState(null);
  const [depts, setDepts] = useState([]);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [grades, setGrades] = useState([]);

  const { data: fetchStudentDetails, isLoading: fetchLoadingStudentDetails } =
    useGetStudentDetailsQuery(studentId);

  const {
    data: fetchAllOrganizations,
    isLoading: fetchLoadingAllOrganizations,
  } = useGetAllAuthOrganizationsQuery();

  useEffect(() => {
    if (fetchAllOrganizations && fetchAllOrganizations.data) {
      setAllOrganizations(fetchAllOrganizations.data);
    }
  }, [fetchAllOrganizations]);

  useEffect(() => {
    if (fetchStudentDetails && fetchStudentDetails.data) {
      let student = fetchStudentDetails.data;
      setStudentInfo(student);
    }
  }, [fetchStudentDetails]);

  return (
    <div>
      <p className="text-[#798295] text-14 flex items-center mt-6 font-bold">
        <Link href="/students">Student Directory</Link>
        <span className="mx-3">
          <MdKeyboardArrowRight />
        </span>
        <Link href="/students/list">Students</Link>
        <span className="mx-3">
          <MdKeyboardArrowRight />
        </span>
        <span className="text-black font-bold"> Edit Profile</span>
      </p>

      <div className="mt-8">
        <div className="lg:w-[872px] xl:w-[924px] 2xl:w-[1008px] shadow-custom-effect rounded-[12px] mx-auto">
          <div className="card-header sm:p-12 sm:pb-6 px-5 py-4">
            <h2 className="sm:text-2xl text-xl font-bold">
              Edit Student Profile
            </h2>
          </div>

          <div className="w-full border-t-2 border-[#E4E6EA] lg:flex">
            <div className="item-left lg:w-[270px] xl:w-[332px] w-full bg-[#E7F7FF] py-6 xl:px-6 px-2">
              <ul className="flex lg:flex-col flex-row flex-wrap lg:gap-[20px] gap-1">
                <li>
                  <button
                    className={` ${
                      currentStep === 1 ? "bg-[#B6BFF0]" : "bg-transparent"
                    } w-full text-12 py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(1)}
                  >
                    Personal Information
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === 2 ? "bg-[#B6BFF0]" : "bg-transparent"
                    } w-full text-12 py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(2)}
                  >
                    Department and Grade
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === 3 ? "bg-[#B6BFF0]" : "bg-transparent"
                    } w-full text-12 py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(3)}
                  >
                    Education Background
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === 4 ? "bg-[#B6BFF0]" : "bg-transparent"
                    } w-full text-12 py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(4)}
                  >
                    Guardian and Parents
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === 5 ? "bg-[#B6BFF0]" : "bg-transparent"
                    } w-full text-12 py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(5)}
                  >
                    Emergency Contact
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      currentStep === 6 ? "bg-[#B6BFF0]" : "bg-transparent"
                    } w-full text-12 py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setCurrentStep(6)}
                  >
                    Medical Information
                  </button>
                </li>
              </ul>
            </div>
            <div className="item-right flex-1 h-full py-6 px-6 xl:px-12">
              <div className="w-full">
                {fetchLoadingStudentDetails ? (
                  <div className="flex justify-center items-center h-full">
                    <SvgLoader className="text-primary-brand-default" />
                  </div>
                ) : (
                  <div>
                    {currentStep === 1 && (
                      <PersonalInfoStep
                        studentInfo={studentInfo}
                        genders={genders}
                      />
                    )}

                    {currentStep === 2 && (
                      <DepartmentGradeStep
                        studentProfileInfo={studentInfo?.student_profile_id}
                      />
                    )}
                    {currentStep === 3 && (
                      <EducationBackgroundStep
                        grades={grades}
                        allOrganizations={allOrganizations}
                        studentInfo={studentInfo}
                      />
                    )}
                    {currentStep === 4 && (
                      <GuardianParentsStep studentInfo={studentInfo} />
                    )}
                    {currentStep === 5 && (
                      <EmergencyContactStep studentInfo={studentInfo} />
                    )}
                    {currentStep === 6 && (
                      <MedicalInfoStep studentInfo={studentInfo} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const EditStudent = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex justify-center items-center">
          <span>
            <SvgLoader className="text-primary-brand-default" />
          </span>
        </div>
      }
    >
      <WrapperEditStudent />
    </Suspense>
  );
};

export default EditStudent;
