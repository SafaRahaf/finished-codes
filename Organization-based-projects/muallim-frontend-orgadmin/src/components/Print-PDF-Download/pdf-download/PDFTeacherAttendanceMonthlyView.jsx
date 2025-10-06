"use client";
import React, { useEffect } from "react";

const PDFTeacherAttendanceMonthlyView = ({ data, orgData }) => {
  // console.log("PDFTeacherAttendanceMonthlyView data:", data);

  const Logo = orgData?.data?.organization?.logo;
  const OrgName = orgData?.data?.organization?.name;

  if (!data) {
    console.error("No data provided to print component");
    return null;
  }

  // const instituteLogo = data.instituteLogo || "/assets/img/logos/add.svg";
  // const filtration = data.filtration || "All";
  const printDate =
    data.printDate ||
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const statusColors = {
    P: { background: "#dcfce7", color: "#18C629" },
    CL: { background: "#fff3e7", color: "#DC7803" },
    WE: { background: "#e7f7ff", color: "#B6BFF0" },
    A: { background: "#fee2e2", color: "#dc2626" },
    SL: { background: "#fef9c3", color: "#eab308" },
  };

  return (
    <div className="pdf-page">
      <div className="print-content">
        {/* Header Section */}
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
            <h2 className="text-lg font-bold">Teacher Attendance Sheet</h2>
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

        {/* Table Section */}
        <div
          style={{
            width: "100%",
            maxWidth: 850,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 12px 0 #e5e7eb",
            overflow: "hidden",
          }}
        >
          <table
            className="monthly-attendance-print"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              borderSpacing: 0,
              fontSize: "10px",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th
                  rowSpan={2}
                  style={{
                    padding: "8px 4px",
                    fontWeight: "bold",
                    fontSize: "11px",
                    color: "#000",
                    minWidth: 120,
                    background: "#f5f5f5",
                    border: "1px solid #e5e7eb",
                    width: 120,
                  }}
                >
                  Teacher Name
                </th>
                <th
                  style={{
                    background: "#f5f5f5",
                    width: 60,
                  }}
                ></th>
                <th
                  style={{
                    background: "#f5f5f5",
                    width: 60,
                  }}
                ></th>
                <th
                  style={{
                    background: "#f5f5f5",
                    width: 60,
                  }}
                ></th>
                <th
                  style={{
                    background: "#f5f5f5",
                    width: 60,
                  }}
                ></th>
                <th
                  style={{
                    background: "#f5f5f5",
                    width: 60,
                  }}
                ></th>
                {data?.dates?.map((date, index) => (
                  <th
                    key={index}
                    style={{
                      padding: "1px",
                      background: "#f5f5f5",
                      fontWeight: "bold",
                      fontSize: "9px",
                      color: "#000",
                      textAlign: "center",
                      border: "1px solid #e5e7eb",
                      width: 19,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "8px" }}>{date.month}</div>
                      <div style={{ fontSize: "11px", color: "#4C5361" }}>
                        {date.day}
                      </div>
                      <div style={{ fontSize: "8px" }}>{date.weekday}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.teachers?.map((teacher, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td
                    style={{
                      padding: "6px 4px",
                      minWidth: "120px",
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      width: 120,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <img
                        src={teacher.image}
                        alt={teacher.name}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          objectFit: "cover",
                          background: "#f3f4f6",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 400,
                          color: "#222",
                          paddingLeft: "2px",
                        }}
                      >
                        {teacher.name}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      width: 40,
                    }}
                  >
                    <div
                      style={{
                        background: "#B6BFF0",
                        display: "flex",
                        width: 16,
                        height: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 4,
                      }}
                    >
                      <img
                        src="/assets/img/icons/clock.png"
                        alt="clock-img"
                        style={{ width: 10, height: 10 }}
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      width: 60,
                    }}
                  >
                    <p
                      style={{
                        background: "#F1F3F5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 20,
                        height: 16,
                        fontSize: 10,
                        fontWeight: "bold",
                        borderRadius: 4,
                        padding: 1,
                      }}
                    >
                      {teacher.attendanceCount}
                    </p>
                  </td>
                  {teacher.status?.map((status, statusIndex) => (
                    <td
                      key={statusIndex}
                      style={{
                        padding: "1px",
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        width: 19,
                      }}
                    >
                      <div
                        className="status-cell"
                        style={{
                          fontWeight: "bold",
                          borderRadius: 4,
                          background:
                            status === "P"
                              ? "#dcfce7"
                              : status === "CL"
                              ? "#fff3e7"
                              : status === "WE"
                              ? "#e7f7ff"
                              : status === "A"
                              ? "#fee2e2"
                              : "#f3f4f6",
                          color:
                            status === "P"
                              ? "#18C629"
                              : status === "CL"
                              ? "#DC7803"
                              : status === "WE"
                              ? "#B6BFF0"
                              : status === "A"
                              ? "#dc2626"
                              : "#9ca3af",
                        }}
                      >
                        {status}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 16,
            width: "100%",
            maxWidth: 850,
            textAlign: "right",
            fontSize: 12,
            color: "#888",
          }}
        >
          Powered by - <b>Muallim</b>
        </div>
      </div>
    </div>
  );
};

export default PDFTeacherAttendanceMonthlyView;
