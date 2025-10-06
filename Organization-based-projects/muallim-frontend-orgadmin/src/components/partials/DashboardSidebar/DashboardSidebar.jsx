"use client";
import React, { useState, useEffect } from "react";
import Navigations from "./Navigations";

function DashboardSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      setIsCollapsible(width >= 1024 && width < 1536);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Only enable hover if not locked and in collapsible range
  const handleMouseEnter = () => {
    if (isCollapsible && !isLocked) setIsSidebarOpen(true);
    if (!isCollapsible) setIsSidebarOpen(true); // for 2xl and above
  };
  const handleMouseLeave = () => {
    if (isCollapsible && !isLocked) setIsSidebarOpen(false);

    if (!isCollapsible) setIsSidebarOpen(false); // for 2xl and above
  };
  const handleArrowClick = () => {
    if (isLocked) {
      setIsLocked(false);
      setIsSidebarOpen(false);
    } else {
      setIsLocked(true);
      setIsSidebarOpen(true);
    }
  };

  return (
    <div>
      <div className="bg-primary-brand-default z-50 lg:w-[100px]  2xl:w-[328px] relative rounded-tr-[18px] rounded-br-[18px] h-screen ">
        <div>
          <Navigations isSidebarOpen={isSidebarOpen} />
        </div>
        {/* Arrow button only in collapsible situation */}
        {isCollapsible && (
          <button
            type="button"
            onClick={handleArrowClick}
            className="absolute top-[80px] right-[-20px] transform -translate-y-1/2 bg-primary-brand-default text-white rounded-lg  py-2 px-1 transition-all duration-200 hidden lg:block 2xl:hidden"
            aria-label={isLocked ? "Close sidebar" : "Open sidebar"}
            style={{ zIndex: 100 }}
          >
            <svg
              className={`transition-transform duration-200 ${
                isLocked ? "rotate-180" : ""
              }`}
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      <div
        className={`hidden lg:block bg-primary-brand-default z-50 fixed top-0 left-0  h-screen  rounded-tr-[18px] rounded-br-[18px] transform transition-all duration-75 shadow ease-in-out   2xl:hidden ${
          isSidebarOpen ? "w-[328px]" : "w-[100px] "
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div>
          <Navigations isSidebarOpen={isSidebarOpen} />
        </div>
        {/* Arrow button only in collapsible situation */}
        {isCollapsible && (
          <button
            type="button"
            onClick={handleArrowClick}
            className="absolute top-[80px] right-[-20px] transform -translate-y-1/2 bg-primary-brand-default text-white rounded-lg  py-2 px-1 transition-all duration-200 hidden lg:block 2xl:hidden"
            aria-label={isLocked ? "Close sidebar" : "Open sidebar"}
            style={{ zIndex: 100 }}
          >
            <svg
              className={`transition-transform duration-200 ${
                isLocked ? "rotate-180" : ""
              }`}
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardSidebar;
