"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  toggleProfile,
  setTourModalOpen,
} from "@/store/features/auth/authSlice";
import PersonalProfileStep from "./PersonalProfileStep";
import OrganizationProfileSetup from "./OrganizationProfileSetup";
import VerificationStep from "./VerificationStep";
import {
  useLazyOnboardingProfileSetupDataQuery,
  useOnboardingProfileSetupDataQuery,
} from "@/store/features/auth/apiSlice";
import SvgLoader from "../ui/loaders/SvgLoader";
import CrossSvg from "../helpers/storeAllSvgs/CrossSvg";

const OnboardingProfileSetup = () => {
  const dispatch = useDispatch();
  const handleToggle = () => {
    dispatch(toggleProfile());
    localStorage.removeItem("newOrg");

    // Check if this is the first time completing profile setup
    const hasCompletedTour = localStorage.getItem("hasCompletedTour");
    if (!hasCompletedTour) {
      // Open tour modal after profile setup completion
      setTimeout(() => {
        dispatch(setTourModalOpen(true));
      }, 500);
    }
  };
  const [step, setStep] = useState(1);
  const { data, isFetching, isError } = useOnboardingProfileSetupDataQuery();
  const [
    onboardingProfileSetupData,
    { data: reWriteProfileData, isFetching: reWriteProfileDataloader },
  ] = useLazyOnboardingProfileSetupDataQuery();
  // profile data state
  const [peopleData, setPeopleData] = useState(null);
  // organization data state
  const [orgData, setOrgData] = useState(null);
  useEffect(() => {
    if (data && !isFetching) {
      const { data: pdata } = data;
      setPeopleData({
        people: pdata.people,
        people_location: pdata?.people_location ? pdata?.people_location : null,
      });
      setOrgData({
        organization: pdata.organization,
        org_location: pdata.org_location,
      });
    }
  }, [data, isFetching]);
  useEffect(() => {
    if (reWriteProfileData && !reWriteProfileDataloader) {
      const { data: pdata } = reWriteProfileData;
      setPeopleData({
        people: pdata.people,
        people_location: pdata?.people_location ? pdata?.people_location : null,
      });
      setOrgData({
        organization: pdata.organization,
        org_location: pdata.org_location,
      });
    }
  }, [reWriteProfileData, reWriteProfileDataloader]);
  return (
    <>
      <div className="onboarding-profile-bg z-30"></div>
      <div className="w-full flex justify-center">
        <div className="onboarding-profile-setup z-30 max-h-[90vh] overflow-y-auto">
          <div className="header">
            <div className="w-full ">
              <div className="flex justify-between items-center">
                <h3 className="md:text-[30px] text-xl font-bold">
                  Profile Setup
                </h3>
                <button className="btn" onClick={handleToggle}>
                  <CrossSvg width="30" height="30" />
                  {/* <img src="/assets/img/logos/cross.svg" alt="close" /> */}
                </button>
              </div>

              <div className="line h-[1px] my-6 bg-[#E4E6EA]"></div>

              <div className="steps md:w-3/4 w-full mx-auto relative flex justify-between items-center">
                <div className="line absolute top-1/2 transform -translate-y-[50%] left-0 w-full h-[4px] rounded-[2px] bg-[#E4E6EA]">
                  <div
                    className={`inner ${
                      step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full"
                    } h-full bg-[#90C8AC]`}
                  ></div>
                </div>
                <div
                  className={`indicator relative z-20 w-[20px] h-[20px] rounded-full ${
                    step >= 1 ? "bg-[#90C8AC]" : "bg-[#E4E6EA]"
                  }`}
                ></div>
                <div
                  className={`indicator relative z-20 w-[20px] h-[20px] rounded-full ${
                    step >= 2 ? "bg-[#90C8AC]" : "bg-[#E4E6EA]"
                  }`}
                ></div>
                <div
                  className={`indicator relative z-20 w-[20px] h-[20px] rounded-full ${
                    step >= 3 ? "bg-[#90C8AC]" : "bg-[#E4E6EA]"
                  }`}
                ></div>
              </div>
              <div className="texts md:w-3/4 w-full mx-auto mt-2 flex justify-between items-center">
                <p className="text-[12px] font-medium text-[#6B7280]">
                  Personal
                </p>
                <p className="text-[12px] font-medium text-[#6B7280]">
                  Organization
                </p>
                <p className="text-[12px] font-medium text-[#6B7280]">
                  Verification
                </p>
              </div>
            </div>

            {step === 1 && (
              <>
                {!isFetching && data ? (
                  <>
                    {peopleData && (
                      <PersonalProfileStep
                        peopleData={peopleData}
                        step={step}
                        setStep={setStep}
                        refetchData={onboardingProfileSetupData}
                      />
                    )}
                  </>
                ) : !isFetching && isError ? (
                  <p className="text-center mt-10 text-danger-700 capitalize font-semibold">
                    Oops, something went wrong from server
                  </p>
                ) : (
                  <div className="flex justify-center items-center mt-10">
                    <SvgLoader />
                  </div>
                )}
              </>
            )}
            {step === 2 && (
              <>
                {!isFetching && data ? (
                  <>
                    {orgData && (
                      <OrganizationProfileSetup
                        orgData={orgData}
                        step={step}
                        setStep={setStep}
                        refetchData={onboardingProfileSetupData}
                      />
                    )}
                  </>
                ) : !isFetching && isError ? (
                  <p className="text-center mt-10 text-danger-700 capitalize font-semibold">
                    Oops, something went wrong from server
                  </p>
                ) : (
                  <div className="flex justify-center items-center mt-10">
                    <SvgLoader />
                  </div>
                )}
              </>
            )}
            {step === 3 && (
              <>
                {!isFetching && data ? (
                  <>
                    {peopleData && orgData && (
                      <VerificationStep
                        prevData={{
                          ein: orgData?.organization?.ein
                            ? orgData?.organization?.ein
                            : "",
                          ssn: peopleData?.people?.ssn_id
                            ? peopleData?.people?.ssn_id
                            : "",
                        }}
                        step={step}
                        handleToggle={handleToggle}
                        setStep={setStep}
                        refetchData={onboardingProfileSetupData}
                      />
                    )}
                  </>
                ) : !isFetching && isError ? (
                  <p className="text-center mt-10 text-danger-700 capitalize font-semibold">
                    Oops, something went wrong from server
                  </p>
                ) : (
                  <div className="flex justify-center items-center mt-10">
                    <SvgLoader />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingProfileSetup;
