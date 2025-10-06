"use client";
import React, { useEffect } from "react";

const PDFTeacherAttendanceDailyView = ({ data, orgData }) => {
  // console.log("PDFTeacherAttendanceDailyView data:", data);

  if (!data) {
    console.error("No data provided to print component");
    return null;
  }

  const Logo = orgData?.data?.organization?.logo;
  const OrgName = orgData?.data?.organization?.name;

  // useEffect(() => {
  // console.log("Component mounted, data:", data);
  // const printContent = document.querySelector(".print-content");
  // if (printContent) {
  //   console.log("Print content element found:", printContent);
  // } else {
  //   console.error("Print content element not found");
  // }
  // }, [data]);

  return (
    <div className="print-content p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div style={{ height: "80px", width: "80px", paddingTop: "12px" }}>
            <img
              src={`
              ${process.env.FILE_BROWSE_URL}${Logo}`}
              className="rounded-xl"
              alt="Logo"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{OrgName}</h1>
            <div className="text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">Teacher Attendance Sheet</h2>
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
      {/* Date Row */}
      <div className="mb-2 text-lg font-semibold">
        {new Date().toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </div>
      {/* Table */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #E5E5E5" }}>
            <th
              style={{
                textAlign: "left",
                fontWeight: 600,
                color: "#798295",
                fontSize: 15,
                padding: "8px 0",
              }}
            >
              Teacher
            </th>
            <th
              style={{
                textAlign: "left",
                fontWeight: 600,
                color: "#798295",
                fontSize: 15,
                padding: "8px 0",
              }}
            >
              Clock In
            </th>
            <th
              style={{
                textAlign: "left",
                fontWeight: 600,
                color: "#798295",
                fontSize: 15,
                padding: "8px 0",
              }}
            >
              Late
            </th>
            <th
              style={{
                textAlign: "left",
                fontWeight: 600,
                color: "#798295",
                fontSize: 15,
                padding: "8px 0",
              }}
            >
              Reason
            </th>
            <th
              style={{
                textAlign: "left",
                fontWeight: 600,
                color: "#798295",
                fontSize: 15,
                padding: "8px 0",
              }}
            >
              Clock Out
            </th>
            <th
              style={{
                textAlign: "left",
                fontWeight: 600,
                color: "#798295",
                fontSize: 15,
                padding: "8px 0",
              }}
            >
              Early
            </th>
            <th
              style={{
                textAlign: "left",
                fontWeight: 600,
                color: "#798295",
                fontSize: 15,
                padding: "8px 0",
              }}
            >
              Reason
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: "1px solid #E5E5E5",
                verticalAlign: "top",
              }}
            >
              {/* Teacher cell with image, name, and admin note */}
              <td style={{ padding: "12px 0", minWidth: 180 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={row.TeacherImg}
                    alt={row.TeacherName}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <div
                      style={{ fontWeight: 600, fontSize: 15, color: "#222" }}
                    >
                      {row.TeacherName}
                    </div>
                    {row.Note && (
                      <div
                        style={{ fontSize: 13, color: "#798295", marginTop: 2 }}
                      >
                        <span style={{ fontWeight: 500 }}>Admin Note:</span>{" "}
                        {row.Note}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              {/* Clock In */}
              <td
                style={{
                  padding: "12px 0",
                  minWidth: 90,
                  fontSize: 15,
                  color: "#222",
                }}
              >
                {row.clockIn}
              </td>
              {/* Late */}
              <td
                style={{
                  padding: "12px 0",
                  minWidth: 80,
                  fontSize: 15,
                  fontWeight: 500,
                  color: row.Late && row.Late !== "0 Min" ? "#F44336" : "#222",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {row.Late}
                {row.Late && row.Late !== "0 Min" && (
                  <span
                    style={{ color: "#F44336", fontSize: 16, marginLeft: 2 }}
                  >
                    ✗
                  </span>
                )}
                {row.Late && row.Late.toLowerCase().includes("hour") && (
                  <span
                    style={{ color: "#F44336", fontSize: 16, marginLeft: 2 }}
                  >
                    ✗
                  </span>
                )}
              </td>
              {/* Late Reason / Leave */}
              <td
                style={{
                  padding: "12px 0",
                  minWidth: 120,
                  fontSize: 15,
                  color: row.LateReason?.toLowerCase().includes("leave")
                    ? "#F4A300"
                    : "#222",
                  fontWeight: row.LateReason?.toLowerCase().includes("leave")
                    ? 600
                    : 400,
                }}
              >
                {row.LateReason || row.Reason}
              </td>
              {/* Clock Out */}
              <td
                style={{
                  padding: "12px 0",
                  minWidth: 90,
                  fontSize: 15,
                  color: "#222",
                }}
              >
                {row.clockOut}
              </td>
              {/* Early */}
              <td
                style={{
                  padding: "12px 0",
                  minWidth: 80,
                  fontSize: 15,
                  fontWeight: 500,
                  color:
                    row.Early && row.Early !== "0 Min"
                      ? row.Early.includes("✓")
                        ? "#18C629"
                        : "#F44336"
                      : "#222",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {row.Early}
                {row.Early &&
                  row.Early !== "0 Min" &&
                  (row.Early.toLowerCase().includes("hour") ? (
                    <span
                      style={{ color: "#18C629", fontSize: 16, marginLeft: 2 }}
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      style={{ color: "#F44336", fontSize: 16, marginLeft: 2 }}
                    >
                      ✗
                    </span>
                  ))}
              </td>
              {/* Early Reason / Leave */}
              <td
                style={{
                  padding: "12px 0",
                  minWidth: 120,
                  fontSize: 15,
                  color: row.EarlyReason?.toLowerCase().includes("leave")
                    ? "#F4A300"
                    : "#222",
                  fontWeight: row.EarlyReason?.toLowerCase().includes("leave")
                    ? 600
                    : 400,
                }}
              >
                {row.EarlyReason || row.Reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PDFTeacherAttendanceDailyView;
