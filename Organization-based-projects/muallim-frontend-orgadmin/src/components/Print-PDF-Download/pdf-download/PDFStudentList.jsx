"use client";
import React from "react";
import nextConfig from "../../../../next.config.mjs";
import { getFullAddress } from "@/components/Location/GetFullLocation";
import { jwtDecode } from "jwt-decode";
import { getCookie } from "cookies-next";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const PDFStudentList = ({ data, orgData }) => {
  if (!data) return null;

  const Logo = orgData?.data?.organization?.logo;
  const OrgName = orgData?.data?.organization?.name;

  const token = getCookie("access_token");
  const decoded = jwtDecode(token);

  const getClassStats = (student) => {
    // If you want to support filtering by class, add a selectedClass prop and use it here
    // For now, just average all classes
    const classPeople =
      student.class_people?.filter(
        (cp) => typeof cp.attendance_percentage === "number"
      ) || [];
    if (classPeople.length === 0) {
      return { attendance: 0, performance: 0 };
    }
    const attendanceSum = classPeople.reduce(
      (sum, cp) => sum + (cp.attendance_percentage || 0),
      0
    );
    const performanceSum = classPeople.reduce(
      (sum, cp) => sum + (cp.performance_percentage || 0),
      0
    );
    return {
      attendance: Math.round(attendanceSum / classPeople.length),
      performance: Math.round(performanceSum / classPeople.length),
    };
  };

  return (
    <div className="print-content w-full max-w-[900px] mx-auto print:px-0">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div style={{ height: "80px", width: "80px", paddingTop: "12px" }}>
            <img
              src={`
              ${process.env.FILE_BROWSE_URL}${Logo}`}
              className="rounded-xl"
              alt="Logo"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">{OrgName}</h1>
            <div className="text-gray-500 text-sm">
              {new Date().toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold">Student List Sheet</h2>
          <div className="text-sm">
            Filtration: {data?.length || 0} Students |{" "}
          </div>
          <div className="text-sm">
            Print Date:{" "}
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-6 font-bold border-b py-2 text-sm">
          <div>Student</div>
          <div>Attendance</div>
          <div>Performance</div>
          <div>Status</div>
          <div>Address</div>
        </div>
        {data?.map((student, idx) => {
          const { attendance, performance } = getClassStats(student);
          const status = student.people_orgs?.[0]?.status || "--";
          const address = getFullAddress(student.location_id) || "--";

          return (
            <div
              key={idx}
              className="grid grid-cols-6 items-center border-b py-3 text-sm"
              style={{ breakInside: "avoid" }}
            >
              <div className="flex items-center gap-2">
                <img
                  src={
                    student?.profile_picture
                      ? `${process.env.FILE_BROWSE_URL}${student?.profile_picture}`
                      : DefaultProfile.src
                  }
                  alt={student?.first_name}
                  className="w-8 h-8 rounded-full"
                />
                <span>
                  {student?.first_name} {student?.last_name} |{" "}
                  {decoded?.org_short_name}
                  {student?.unique_id}
                </span>
              </div>
              <div className="flex justify-center">{attendance}%</div>
              <div className="flex justify-center">{performance}%</div>
              <div className={`text-white flex`}>
                <div
                  className={`w-[10px] h-[10px] rounded-full ${
                    status === "active"
                      ? "bg-[#60EC6E]"
                      : status === "inactive"
                      ? "bg-[#F95656]"
                      : status === "sick_leave"
                      ? "bg-orange-500"
                      : status === "sick_leave"
                      ? "bg-blue-500"
                      : ""
                  }`}
                ></div>
                {status === "active"
                  ? "Present"
                  : status === "inactive"
                  ? "Absent"
                  : status === "leave"
                  ? "Leave"
                  : status === "sick_leave"
                  ? "Sick"
                  : status === "casual_leave"
                  ? "Leave"
                  : status === "earned_leave"
                  ? "Leave"
                  : ""}
              </div>
              <div className="flex items-center" style={{ minWidth: "150px" }}>
                {address}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PDFStudentList;
