"use client";
import {
  DownArrowSvg,
  NotificationSvg,
  SearchSvg,
} from "@/components/helpers/storeAllSvgs";
import { useOnboardingProfileSetupDataQuery } from "@/store/features/auth/apiSlice";
import {
  toggleProfile,
  setTourModalOpen,
  setCachedProfileData,
} from "@/store/features/auth/authSlice";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProfileDropdown } from "./ProfileDropdown";

function DashboardHeader({ toggleHandler, sidebarExpanded, pathname }) {
  const profile = useSelector((state) => state?.auth?.authData);
  const cachedProfileData = useSelector(
    (state) => state?.auth?.cachedProfileData
  );
  const dispatch = useDispatch();

  // Get organization ID from profile or auth state
  const orgId = profile?.organization_id || profile?.org_id;

  const { data, isLoading } = useOnboardingProfileSetupDataQuery(orgId, {
    skip: !orgId,
  });

  // const Logo = data?.data?.organization?.logo;
  // const OrgName = data?.data?.organization?.name;
  // const ProfileName = `${
  //   profile?.first_name !== undefined ? profile?.first_name : "..."
  // } ${profile?.last_name !== undefined ? profile?.last_name : "..."}`;
  // Update cached profile data when API data changes
  useEffect(() => {
    if (data && !isLoading) {
      dispatch(setCachedProfileData(data.data));
    }
  }, [data, isLoading, dispatch]);

  // Load cached data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && !cachedProfileData) {
      const storedProfileData = localStorage.getItem("cached_profile_data");
      if (storedProfileData) {
        try {
          const parsedData = JSON.parse(storedProfileData);
          dispatch(setCachedProfileData(parsedData));
        } catch (error) {
          console.error("Error parsing cached profile data:", error);
          localStorage.removeItem("cached_profile_data");
        }
      }
    }
  }, [cachedProfileData, dispatch]);

  const Logo =
    cachedProfileData?.organization?.logo || data?.data?.organization?.logo;
  const OrgName =
    cachedProfileData?.organization?.name || data?.data?.organization?.name;

  // Use cached profile data for name, fallback to token data, then to "..."
  const ProfileName = cachedProfileData?.people
    ? `${cachedProfileData.people.first_name || "..."} ${
        cachedProfileData.people.last_name || "..."
      }`
    : `${profile?.first_name !== undefined ? profile?.first_name : "..."} ${
        profile?.last_name !== undefined ? profile?.last_name : "..."
      }`;

  const handleToggle = () => {
    dispatch(toggleProfile());
  };

  // Check if tour modal should open automatically on component mount
  useEffect(() => {
    const newOrg = JSON.parse(localStorage.getItem("newOrg"));
    const hasCompletedTour = localStorage.getItem("hasCompletedTour");

    // If newOrg is removed (profile setup completed) and tour hasn't been completed yet
    if (!newOrg && !hasCompletedTour) {
      // Small delay to ensure the component is fully mounted
      setTimeout(() => {
        dispatch(setTourModalOpen(true));
      }, 1000);
    }
  }, [dispatch]);

  const createPathName = pathname.startsWith("/classes")
    ? "Class Management"
    : pathname.startsWith("/teachers/lists/")
    ? "Teacher Profile"
    : pathname.startsWith("/teachers/attendance")
    ? "Teachers Attendance"
    : pathname.startsWith("/teachers")
    ? "Teacher Management"
    : pathname.startsWith("/students/attendance")
    ? "Student Attendance"
    : pathname.startsWith("/students/details")
    ? "Student Details"
    : pathname.startsWith("/students/list")
    ? "Student List"
    : pathname.startsWith("/students")
    ? "Student Directory"
    : pathname.startsWith("/parents")
    ? "Parent Management"
    : pathname.startsWith("/settings")
    ? "Settings"
    : pathname.startsWith("/roles")
    ? "Settings"
    : pathname.startsWith("/users")
    ? "User Management"
    : pathname.startsWith("/finance")
    ? "Finance"
    : pathname.startsWith("/subscription")
    ? "Subscription"
    : pathname.startsWith("/branch")
    ? "Branch Management"
    : pathname.startsWith("/hr-management")
    ? "HR Management"
    : pathname.startsWith("/comming-soon")
    ? "Comming Soon"
    : "Dashboard";

  // const HeadTitle = pathname
  //   .split("/")
  //   .filter(
  //     (segment) =>
  //       segment && !/^\d+$/.test(segment) && !/^[a-f0-9-]{8,}$/.test(segment)
  //   )
  //   .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
  //   .join(" ");

  return (
    <>
      {/* Desktop Header */}
      <header
        className={`layout-header ${
          sidebarExpanded
            ? "left-[328px] w-[calc(100%-328px)] "
            : "left-[100px] w-[calc(100%-100px)] "
        } 2xl:left-[328px] 2xl:w-[calc(100%-328px)] px-[32px] lg:flex hidden bg-[#FBFBFB] z-20 `}
      >
        <div className="w-full flex justify-between items-center border-b border-primary-brand-100 ">
          {/* Page Title */}
          <p
            className="text-primary-brand-default font-bold"
            style={{ fontSize: "28px", lineHeight: "30px" }}
          >
            {createPathName}
          </p>
          <div className="flex space-x-4 items-center ">
            {/* Search Box */}
            <div className="w-[228px] h-[44px] md:block hidden rounded border border-[#798295] relative">
              <input
                placeholder="Coming Soon..."
                type="text"
                disabled
                className="w-full h-full pl-[50px] pr-5 text-[#AEB4BF] placeholder:text-primary-brand-300 text-16 tracking-wide rounded bg-white"
              />
              <span className="absolute left-[17px] top-1/2 transform -translate-y-1/2">
                <SearchSvg />
              </span>
            </div>

            {/* Language Dropdown */}
            <div>
              <button
                type="button"
                className="hidden w-[160px] h-[44px]  justify-between items-center px-[16px] py-2.5 border border-primary-brand-700 rounded"
              >
                <span className="text-16 tracking-wide">English</span>
                <DownArrowSvg width="12" height="12" />
              </button>
            </div>
            {/* Notification */}
            <div className="hidden">
              <button type="button" className="relative items-centerb">
                <NotificationSvg />
                <div className="w-4 h-4 rounded-full border-2 border-white bg-danger-500 absolute right-0 top-0" />
              </button>
            </div>
            <span className="border border-black-700 h-[40px]"></span>
            {/* ProfileDropdown */}
            <ProfileDropdown
              Logo={Logo}
              OrgName={OrgName}
              ProfileName={ProfileName}
              handleToggle={handleToggle}
            />
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="layout-header-mobile w-full h-[90px] flex justify-between items-center bg-[#FBFBFB] shadow px-5 lg:hidden relative">
        {/* Logo Area */}
        <div className="flex space-x-2.5 items-center">
          <button
            onClick={toggleHandler}
            type="button"
            className="text-primary-brand-default"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path d="M3 4H21V6H3V4ZM9 11H21V13H9V11ZM3 18H21V20H3V18Z" />
            </svg>
          </button>
          <a href="/dashboard">
            <img
              src="/assets/img/logos/logo-black.svg"
              alt="logo"
              className="w-[130px] h-[55px] object-contain"
            />
          </a>
        </div>

        {/* ProfileDropdown */}
        <ProfileDropdown
          Logo={Logo}
          OrgName={OrgName}
          ProfileName={ProfileName}
          handleToggle={handleToggle}
        />
      </header>
    </>
  );
}

export default DashboardHeader;
