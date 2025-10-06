import React from "react";
import moment from "moment";

const PDFTeacherIndividualAttendanceSheet = ({ data, orgData }) => {
  if (!data || !Array.isArray(data)) return null;

  // console.log(data);

  const Logo = orgData?.data?.organization?.logo;
  const OrgName = orgData?.data?.organization?.name;

  return (
    <div
      className="print-content w-full mx-auto print:px-0"
      style={{ background: "white", padding: "20px" }}
    >
      {" "}
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
          {/* <div className="text-sm">
            Filtration: {data?.length || 0} Teachers
          </div> */}
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
      {data.map((monthData, idx) => (
        <div key={monthData.id || idx} className="pdf-page">
          <div
            className="font-bold text-lg"
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              marginBottom: "24px",
              color: "#000",
            }}
          >
            {monthData.month}
          </div>

          <table
            className="w-full individual-attendance-print"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              border: "1px solid #ddd",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th
                  className="bg-zinc-50 font-bold text-sm"
                  style={{
                    padding: "5px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f5f5f5",
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: "#000",
                  }}
                >
                  Date
                </th>
                <th
                  className="bg-zinc-50 font-bold text-sm"
                  style={{
                    padding: "5px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f5f5f5",
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: "#000",
                  }}
                >
                  Day
                </th>
                <th
                  className="bg-zinc-50 font-bold text-sm"
                  style={{
                    padding: "5px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f5f5f5",
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: "#000",
                  }}
                >
                  Check In
                </th>
                <th
                  className="bg-zinc-50 font-bold text-sm"
                  style={{
                    padding: "5px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f5f5f5",
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: "#000",
                  }}
                >
                  Check Out
                </th>
                <th
                  className="bg-zinc-50 font-bold text-sm"
                  style={{
                    padding: "5px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f5f5f5",
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: "#000",
                  }}
                >
                  Work Hour
                </th>
                <th
                  className="bg-zinc-50 font-bold text-sm"
                  style={{
                    padding: "5px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f5f5f5",
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: "#000",
                  }}
                >
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {monthData?.tableData?.map((row, i) =>
                row.attendanceEntries.map((entry, entryIndex) => (
                  <tr key={`${i}-${entryIndex}`}>
                    {entryIndex === 0 && (
                      <>
                        <td
                          rowSpan={row.attendanceEntries.length}
                          style={{ border: "1px solid #ddd", padding: "5px" }}
                        >
                          {row.date}
                        </td>
                        <td
                          rowSpan={row.attendanceEntries.length}
                          style={{ border: "1px solid #ddd", padding: "5px" }}
                        >
                          {row.day}
                        </td>
                      </>
                    )}
                    <td style={{ border: "1px solid #ddd", padding: "5px" }}>
                      {entry.clockIn || "-"}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "5px" }}>
                      {entry.clockOut || "-"}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "5px" }}>
                      {entry.workHour || "-"}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "5px" }}>
                      {entry.note || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default PDFTeacherIndividualAttendanceSheet;
