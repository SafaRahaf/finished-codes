"use client";
import { Tabs } from "antd";
import Link from "next/link";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import AttendanceTab from "./AttendanceTab";
import ProgressReportTab from "./ProgressReportTab";
import { EditOutlined } from "@ant-design/icons";
import MoreInfoTab from "./MoreInfoTab";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useGetStudentDetailsQuery } from "@/store/features/class-management/apiSlice";
import { daysOfWeekFull } from "@/constants/daysOfFullWeek";
import {
  getDecodedToken,
  getOrgShortName,
} from "@/utilities/helpers/getDecodedValus";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import { useSelector } from "react-redux";

// Main wrapper component for student details page
const WrapperStudentDetails = () => {
  // Get search params from URL (e.g., ?id=123)
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const decoded = getDecodedToken();
  const orgShortName =
    useSelector((state) => state.auth.orgShortName) || getOrgShortName();

  // Local state to store student data
  const [studentData, setStudentData] = useState(null);

  // Fetch student details from API using RTK Query
  const { data: fetchStudentDetails, isLoading: fetchLoadingStudentDetails } =
    useGetStudentDetailsQuery(studentId);

  // Update local state when API data is fetched
  useEffect(() => {
    if (fetchStudentDetails && fetchStudentDetails.data) {
      let student = fetchStudentDetails.data;
      setStudentData(student);
    }
  }, [fetchStudentDetails]);

  // Tab change handler (currently unused)
  const onChange = (key) => {
    // console.log(key);
  };

  // Helper: Capitalize first letter of a string
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Helper: Get unique class days for the student, sorted and capitalized
  const getUniqueClassDays = () => {
    if (!studentData?.class_people) return [];
    const allDays = studentData?.class_people
      .flatMap((cp) => cp.class_id?.class_days || [])
      .map((dayObj) => dayObj.day?.toLowerCase())
      .filter(Boolean);
    const uniqueDays = [...new Set(allDays)];
    // Sort according to daysOfWeekFull
    uniqueDays.sort(
      (a, b) => daysOfWeekFull.indexOf(a) - daysOfWeekFull.indexOf(b)
    );
    // Capitalize each day
    return uniqueDays.map(capitalize);
  };

  // Helper: Calculate average percentage from an array of numbers
  const getAveragePercentage = (arr) => {
    const valid = arr.filter((v) => typeof v === "number" && !isNaN(v));
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, curr) => acc + curr, 0);
    return (sum / valid.length).toFixed(2);
  };

  // Tab items for Ant Design Tabs
  const items = [
    {
      key: "1",
      label: <span className="text-black text-18 ">Progress Report</span>,
      children: <ProgressReportTab />,
    },
    {
      key: "2",
      label: <span className="text-black text-18 ">Attendance</span>,
      children: <AttendanceTab peopleId={studentId} data={studentData} />,
    },
    {
      key: "3",
      label: <span className="text-black text-18 ">More Information</span>,
      children: <MoreInfoTab studentData={studentData} studentId={studentId} />,
    },
  ];

  return (
    <div>
      {/* If student data is loaded, show details; else show loader */}
      {studentData ? (
        <>
          {/* Breadcrumb navigation */}
          <p className="text-[#798295] tracking-wider text-14 flex items-center font-bold">
            <Link href="/students">Student Management</Link>
            <span className="mx-3">
              <MdKeyboardArrowRight />
            </span>
            <Link href="/students/list">Students</Link>
            <span className="mx-3">
              <MdKeyboardArrowRight />
            </span>
            <span className="text-black font-bold">
              {studentData?.first_name} {studentData?.last_name}
            </span>
          </p>

          <div className="mt-8">
            <div className="grid mb-[60px] lg:grid-cols-10 w-full grid-cols-1 gap-4 items-start">
              {/* Profile Section */}
              <div className="flex gap-4 lg:col-span-3 justify-start lg:items-start 2xl:items-center">
                <div className="w-[144px] h-[144px] lg:w-20 lg:h-20 2xl:w-[144px] 2xl:h-[144px] overflow-hidden rounded-full bg-gray-50">
                  {/* Student profile picture */}
                  <img
                    src={
                      studentData?.profile_picture
                        ? `${process.env.FILE_BROWSE_URL}${studentData?.profile_picture}`
                        : DefaultProfile.src
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  {/* Student name */}
                  <h3 className="text-3xl lg:text-20 2xl:text-3xl font-bold">
                    {studentData?.first_name} {studentData?.last_name}
                  </h3>
                  {/* Classes student is enrolled in */}
                  <p className="text-[#626A7C] pt-3 lg:pt-0 ">
                    {studentData?.class_people
                      .map((item) => item?.class_id?.class_name)
                      .join(", ") || "Student"}
                  </p>
                  {/* Student unique ID - Updated to use Redux store */}
                  <p className="text-[#626A7C]">
                    ID - {orgShortName || decoded?.org_short_name}
                    {studentData?.unique_id || "N/A"}
                  </p>
                  {/* Status indicator */}
                  <div className="flex justify-start items-center gap-2 mt-2">
                    <div
                      className={
                        studentData?.people_orgs?.status === "active"
                          ? "bg-[#60EC6E] w-4 h-4 rounded-full"
                          : "bg-[#c0c4dd] w-4 h-4 rounded-full"
                      }
                    ></div>
                    <span>
                      {studentData?.people_orgs?.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Stats Section */}
              <div className="border-x-2 lg:col-span-3 border-[#C9CDD5] pl-6">
                <p className="text-[#626A7C]">
                  <span className="font-bold mr-2">Class Days</span>:{" "}
                  {getUniqueClassDays().join(", ") || "N/A"}
                </p>
                <p className="text-[#626A7C]">
                  <span className="font-bold mr-2">Attendance</span>:{" "}
                  {getAveragePercentage(
                    studentData?.class_people?.map(
                      (item) => item.attendance_percentage
                    ) || []
                  )}
                  %
                </p>
                <p className="text-[#626A7C]">
                  <span className="font-bold mr-2">Performance</span>:{" "}
                  {getAveragePercentage(
                    studentData?.class_people?.map(
                      (item) => item.performance_percentage
                    ) || []
                  )}
                  %
                </p>
                <p className="text-[#626A7C]">
                  <span className="font-bold mr-2">Behavior</span>: N/A
                </p>
              </div>
              {/* Contact Info  */}
              <div className="lg:col-span-2">
                <div>
                  <p className="text-[#626A7C]">
                    <span className="font-bold mr-2">Phone</span>
                    {studentData?.parent_details[0]?.user_id?.mobiles[0]
                      ?.mobile_no || "N/A"}
                  </p>
                  <p className="text-[#626A7C]">
                    <span className="font-bold mr-2">E-Mail</span>
                    {studentData?.parent_details[0]?.user_id?.emails[0]
                      ?.email || "N/A"}
                  </p>
                  <p className="text-[#626A7C]">
                    <span className="font-bold mr-2">DOB</span>
                    {studentData?.dob
                      ? new Date(studentData.dob).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
              {/* Actions Section */}
              <div className=" lg:col-span-2 flex justify-end ">
                {/* Edit profile button */}
                <Link
                  href={`./edit?id=${studentId}`}
                  className="btn btn-primary bg-[#22252B] px-[20px] py-[9px] rounded-[8px] flex justify-center items-center text-white gap-2"
                >
                  <EditOutlined />
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Tabs for Progress Report, Attendance, More Info */}
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
          </div>
        </>
      ) : (
        // Loader while fetching student data
        <div className="flex justify-center items-center">
          <span>
            <SvgLoader className="text-primary-brand-default" />
          </span>
        </div>
      )}
    </div>
  );
};

// Suspense wrapper for async loading
const StudentDetails = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex justify-center items-center ">
          <div className="flex justify-center items-center">
            <span>
              <SvgLoader className="text-primary-brand-default" />
            </span>
          </div>
        </div>
      }
    >
      <WrapperStudentDetails />
    </Suspense>
  );
};

export default StudentDetails;
