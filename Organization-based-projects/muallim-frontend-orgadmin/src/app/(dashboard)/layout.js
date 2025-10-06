"use client";
import OnboardingProfileSetup from "@/components/onboardingProfileSetup";
import DashboardHeader from "@/components/partials/DashboardHeader/DashboardHeader";
import DashboardSidebar from "@/components/partials/DashboardSidebar/DashboardSidebar";
import {
  setProfileToggle,
  setUserData,
  toggleProfile,
} from "@/store/features/auth/authSlice";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function layout({ children }) {
  // user onboarding
  const profileToggle = useSelector((state) => state.auth.profileToggle);
  // sidebar toggle options
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const sidebarConditionalClass = sidebarToggle
    ? "lg:translate-x-0"
    : "lg:translate-x-0 -translate-x-[295px]";
  // handler for sidebar toggle
  const sidebarToggleHandler = () => {
    setSidebarToggle(!sidebarToggle);
  };

  const dispatch = useDispatch();

  useEffect(() => {
    const newOrg = JSON.parse(localStorage.getItem("newOrg"));
    if (newOrg) {
      dispatch(setProfileToggle(true));
    } else {
      dispatch(setProfileToggle(false));
    }
    const token = getCookie("access_token");
    if (token) {
      const decoded = jwtDecode(token);
      dispatch(setUserData(decoded));
    }
  }, []);

  const pathname = usePathname();

  return (
    <>
      <div className="main-layout-wrapper w-full bg-[#FBFBFB]">
        <div className="w-full flex relative">
          {/* layout sidebar component  */}
          <aside
            className={` fixed z-[999999]  left-0 top-0 transform common-transition ${sidebarConditionalClass}`}
          >
            <DashboardSidebar />
          </aside>
          {/* outside sidebar layer for mobile */}
          {sidebarToggle && (
            <div
              onClick={sidebarToggleHandler}
              className="w-full h-full fixed top-0 left-0 z-[99999] bg-black bg-opacity-50"
            ></div>
          )}
          {/* layout body */}
          <div className="flex-1 lg:ml-[95px] 2xl:ml-[328px] min-w-0 ">
            {/* layout header */}
            <DashboardHeader
              toggleHandler={sidebarToggleHandler}
              pathname={pathname}
            />
            <main>
              <div className="w-full lg:px-8 lg:pt-[130px] px-3 pt-[110px] pb-10 ">
                {/* All dashboard pages mount here */}
                <div className="w-full ">{children}</div>
              </div>
            </main>
          </div>
        </div>
      </div>
      {/* onboarding profile modal */}
      {profileToggle && <OnboardingProfileSetup />}
      {/* onboarding profile modal */}
    </>
  );
}

export default layout;
