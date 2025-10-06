"use client";
import OrganizationProfileUpdate from "@/components/OrganizationManagement/OrganizationProfileUpdate";
import PersonalProfileUpdate from "@/components/OrganizationManagement/PersonalProfileUpdate";
import { jwtDecode } from "jwt-decode";
import {
  useGetOrgProfileInfoQuery,
  useGetUserInformationQuery,
  useLazyGetOrgProfileInfoQuery,
} from "@/store/features/auth/apiSlice";
// import { getCookie } from "cookies-next";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const SettingsContainer = () => {
  const [activeSettings, setActiveSettings] = useState("profile");
  const profile = useSelector((state) => state?.auth?.authData);
  //get  user profile previous data
  const { data: userProfile, isFetching: userProfileFetching } =
    useGetUserInformationQuery();

  // profile data state
  const [peopleData, setPeopleData] = useState(null);
  useEffect(() => {
    if (userProfile && !userProfileFetching) {
      const { data: pdata } = userProfile;
      const getPhone =
        pdata?.mobiles?.length &&
        pdata?.mobiles?.find(
          (item) =>
            item.mobile_type === "primary" || item.mobile_type === "secondary"
        )?.mobile_no;
      setPeopleData({
        people: {
          ...pdata.people_id,
          email:
            pdata?.emails?.length &&
            pdata?.emails?.find((item) => item.email_type === "primary")?.email,
          phone: getPhone,
        },
        people_location: pdata?.people_id?.location_id
          ? pdata?.people_id?.location_id
          : null,
      });
    }
  }, [userProfile, userProfileFetching]);

  // get org profile user data
  const [getOrgProfileInfo, { data: orgProfile, isLoading: orgProfileFetch }] =
    useLazyGetOrgProfileInfoQuery();
  useEffect(() => {
    if (profile) {
      getOrgProfileInfo(profile?.org_id);
    }
  }, [profile]);
  // organization data state

  const [orgData, setOrgData] = useState(null);
  useEffect(() => {
    if (orgProfile && !orgProfileFetch) {
      const { data: orgData } = orgProfile;
      setOrgData({
        organization: orgData,
        org_location: orgData.location_id,
      });
    }
  }, [orgProfile, orgProfileFetch]);

  return (
    <div>
      {/* Breadcrumb */}
      <p className="text-[#798295] text-14 flex items-center mt-6 font-bold">
        <span
          className="cursor-pointer"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Dashboard
        </span>
        <span className="mx-3">/</span>
        <span
          className="cursor-pointer"
          onClick={() => (window.location.href = "/settings")}
        >
          Settings
        </span>
      </p>

      <div className="mt-8">
        <div className="lg:w-[872px] xl:w-[924px] 2xl:w-[1008px] shadow-custom-effect rounded-[12px] mx-auto">
          <div className="card-header sm:p-12 sm:pb-6 px-5 py-4">
            <h2 className="sm:text-2xl text-xl font-bold">Settings</h2>
          </div>

          <div className="w-full border-t-2 border-[#E4E6EA] lg:flex">
            <div className="item-left lg:w-[270px] xl:w-[332px] w-full bg-[#E7F7FF] py-6 xl:px-6 px-2">
              <ul className="flex lg:flex-col flex-row flex-wrap lg:gap-[20px] gap-1">
                <li>
                  <button
                    className={` ${
                      activeSettings === "profile"
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12 py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setActiveSettings("profile")}
                  >
                    Personal Settings
                  </button>
                </li>
                <li>
                  <button
                    className={` ${
                      activeSettings === "organization"
                        ? "bg-[#B6BFF0]"
                        : "bg-transparent"
                    } w-full text-12 py-3 text-left ls-7-2 font-bold px-6 rounded-[8px] uppercase`}
                    onClick={() => setActiveSettings("organization")}
                  >
                    Organization Settings
                  </button>
                </li>
              </ul>
            </div>
            <div className="item-right flex-1 h-full py-6 px-6 xl:px-12">
              <div className="w-full">
                {activeSettings === "profile" && (
                  <PersonalProfileUpdate peopleData={peopleData} />
                )}
                {activeSettings === "organization" && (
                  <OrganizationProfileUpdate
                    orgId={profile?.org_id}
                    orgData={orgData}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsContainer;
