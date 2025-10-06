"use client";
import React from "react";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import nextConfig from "../../../../next.config.mjs";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

const statusColor = (status) => {
  if (!status) return "#BDBDBD";
  if (status.toLowerCase().includes("active")) return "#18C629";
  if (status.toLowerCase().includes("casual")) return "#B6BFF0";
  if (status.toLowerCase().includes("sick")) return "#FDAE51";
  return "#BDBDBD";
};

const PDFTeacherList = ({ data, orgData }) => {
  if (!data) return null;

  const Logo = orgData?.data?.organization?.logo;
  const OrgName = orgData?.data?.organization?.name;

  const token = getCookie("access_token");
  const decoded = jwtDecode(token);

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
          <h2 className="text-lg font-bold">Teacher List</h2>
          <div className="text-sm">
            Filtration: {data?.length || 0} Teachers |{" "}
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
        <div className="grid grid-cols-5 font-bold border-b py-2 text-sm">
          <div>Teachers</div>
          <div>Teachers ID</div>
          <div>Designation</div>
          <div>Contact</div>
          <div>Status</div>
        </div>
        {data?.map((teacher, idx) => {
          const status =
            teacher?.people_orgs?.[0]?.status || teacher?.status || "Active";
          const contacts = [
            teacher?.user_id?.mobiles?.find((m) => m.mobile_type === "primary")
              ?.mobile_no,
            ...(teacher?.user_id?.mobiles
              ?.filter((m) => m.mobile_type !== "primary")
              .map((m) => m.mobile_no) || []),
          ].filter(Boolean);

          return (
            <div
              key={idx}
              className="grid grid-cols-5 items-center border-b py-3 text-sm"
              style={{ breakInside: "avoid" }}
            >
              <div className="flex items-center gap-2">
                <img
                  src={
                    teacher?.profile_picture
                      ? `${process.env.FILE_BROWSE_URL}${teacher?.profile_picture}`
                      : DefaultProfile.src
                  }
                  alt={teacher?.first_name}
                  className="w-8 h-8 rounded-full"
                />
                <span>
                  {teacher?.first_name} {teacher?.last_name}
                </span>
              </div>
              <div>
                {decoded?.org_short_name}
                {teacher?.unique_id || "-"}
              </div>
              <div>
                {teacher?.designation_employees
                  ?.map(
                    (d) => d.designation_org_id?.designation_id?.designation
                  )
                  .join(", ")}
              </div>
              <div>
                {contacts.map((c, i) => (
                  <div key={i}>{c}</div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: statusColor(status),
                  }}
                ></span>
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PDFTeacherList;
