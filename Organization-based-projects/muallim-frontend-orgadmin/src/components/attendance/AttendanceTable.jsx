"use client";
import { NextBtnSvg, PrevBtnSvg } from "@/components/helpers/storeAllSvgs";
import React from "react";
import AttendanceFilterDropdown from "../TeacherManagement/teacherProfile/AttendanceFilterDropdown";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { useState, useEffect } from "react";
import { useGetTeacherStudentAttendanceQuery } from "@/store/features/teacher-management/apiSlice";
import moment from "moment";
import { message } from "antd";
import PDFDownload from "@/components/Print-PDF-Download/pdf-download/downloadPDF";

// Format time to "hh:mm a"
const formatTime = (time) => (time ? moment(time).format("hh:mm a") : "");

// Format work hours (in minutes or seconds)
const formatWorkHours = (work_hours) => {
  if (!work_hours || work_hours === 0) return "";
  // If work_hours is in minutes
  const hours = Math.floor(work_hours / 60);
  const minutes = work_hours % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")} Hours`;
};

function AttendanceTable({ peopleId, summaryDetailsFor }) {
  // filter option data when user click on filter button
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [startFulMonthFilter, setStartFullMonthFilter] = useState("");
  const [endFulMonthFilter, setEndFullMonthFilter] = useState("");
  const resetFilterHandler = () => {
    setStartDateFilter("");
    setEndDateFilter("");
    setStartFullMonthFilter("");
    setEndFullMonthFilter("");
  };

  const [currentMonth, setCurrentMonth] = useState(0);
  const [endMonthForNextMonth, setEndMonthForNextMonth] = useState(11);
  const getDecemberDates = () => {
    const currentYear = moment().year();
    const startDate = moment(`${currentYear}-01-01`).format("YYYY-MM-DD");
    const endDate = moment(`${currentYear}-12-31`).format("YYYY-MM-DD");

    return {
      startDate,
      endDate,
    };
  };
  const [startDate, setStartDate] = useState(getDecemberDates()?.startDate);
  const [endDate, setEndDate] = useState(getDecemberDates()?.endDate);

  // Add effect to update query dates when filters change
  useEffect(() => {
    if (startDateFilter && endDateFilter) {
      setStartDate(moment(startDateFilter).format("YYYY-MM-DD"));
      setEndDate(moment(endDateFilter).format("YYYY-MM-DD"));
    }
  }, [startDateFilter, endDateFilter]);

  //   data array
  const currentYear = moment().year();
  const monthsWithDays = Array.from({ length: 12 }, (_, index) => {
    const month = moment().month(index).format("MMMM");
    const daysLength = moment().month(index).year(currentYear).daysInMonth();
    return {
      month,
      daysLength,
      tableData: [],
    };
  });
  const [monthData, setMonthData] = useState(monthsWithDays);

  // api call for attendance data
  const { data: teacherAttendence, isFetching: teacherAttendenceLoader } =
    useGetTeacherStudentAttendanceQuery(
      { startDate, endDate, peopleId, summaryDetailsFor },
      {
        skip:
          !startDate ||
          !endDate ||
          moment(startDate).year() !== moment(endDate).year(),
      }
    );

  const [records, setRecords] = useState([]);

  const generateMonthData = (startIndex = 0, endIndex = 12) => {
    // 1 year = 12 months so we need to generate 12 months data
    const monthsData = [];
    for (let monthIndex = startIndex; monthIndex < endIndex; monthIndex++) {
      const daysInMonth = moment(
        `${currentYear}-${monthIndex + 1}-01`,
        "YYYY-MM-DD"
      ).daysInMonth();
      monthsData.push({
        month: moment().month(monthIndex).format("MMMM"),
        daysLength: daysInMonth,
        tableData: Array.from({ length: daysInMonth }, () => []),
      });
    }
    return monthsData;
  };

  useEffect(() => {
    if (teacherAttendence && !teacherAttendenceLoader) {
      const newRecords = teacherAttendence?.data?.attendance || [];
      setRecords([...newRecords]);
    }
  }, [teacherAttendence, teacherAttendenceLoader]);

  useEffect(() => {
    if (records.length > 0) {
      const startIndex =
        startDateFilter && endDateFilter !== "" ? moment(startDate).month() : 0;
      const endIndex =
        startDateFilter && endDateFilter !== ""
          ? moment(endDate).month() + 1
          : 12;

      // Calculate number of months between start and end dates
      const monthsBetween =
        startDateFilter && endDateFilter !== ""
          ? moment(endDate).diff(moment(startDate), "months")
          : 11;

      // Set the end month for next button (subtract 1 because array is 0-based)
      setEndMonthForNextMonth(monthsBetween);

      const updatedMonthData = generateMonthData(startIndex, endIndex);

      // Initialize tableData with empty arrays instead of null
      if (updatedMonthData && updatedMonthData.length) {
        updatedMonthData.forEach((month) => {
          month.tableData = Array(month.daysLength)
            .fill()
            .map(() => []);
        });

        // Group records by date
        records.forEach((record) => {
          const date = moment(record.date);
          const monthName = date.format("MMMM");
          const dayOfMonth = date.date();

          const monthObject = updatedMonthData.find(
            (month) => month.month === monthName
          );
          if (monthObject) {
            monthObject.tableData[dayOfMonth - 1].push(record);
          }
        });

        setMonthData([...updatedMonthData]);
      }
    } else {
      if (startDateFilter && endDateFilter) {
        message.error("No data found");
      }
    }
  }, [records]);

  const [transformedMonthData, setTransformedMonthData] = useState([]);

  useEffect(() => {
    if (monthData && !teacherAttendenceLoader) {
      // Get all leave days
      const leaveMap = {};
      (teacherAttendence?.data?.leave || []).forEach((leave) => {
        const start = moment(leave.start_date);
        const end = moment(leave.end_date);
        for (
          let m = moment(start);
          m.diff(end, "days") <= 0;
          m.add(1, "days")
        ) {
          leaveMap[m.format("YYYY-MM-DD")] = {
            type: leave.leave_type_org_id?.leave_type_id?.type_name || "Leave",
            reason: leave.reason,
          };
        }
      });

      const filteredYear = moment(startDate).year();

      const data = monthData.map((month, i) => ({
        id: i + 1,
        month: month?.month,
        daysLength: month?.daysLength,
        tableData: month.tableData?.map((items, j) => {
          const dateStr = `${filteredYear}-${(i + 1)
            .toString()
            .padStart(2, "0")}-${(j + 1).toString().padStart(2, "0")}`;
          const leave = leaveMap[dateStr];

          if (items && items.length > 0) {
            // Multiple attendance records exist for this day
            const attendanceEntries = items.map((item) => {
              let note = item.admin_note || "";
              if (
                item.event_participant_adjustments &&
                item.event_participant_adjustments.length
              ) {
                note +=
                  (note ? ", " : "") +
                  item.event_participant_adjustments
                    .map(
                      (adj) =>
                        `${adj.adjustment_type.replace(/_/g, " ")}${
                          adj.reason ? ": " + adj.reason : ""
                        }`
                    )
                    .join(", ");
              }
              // If not attended, show "Absent"
              if (!item.is_attended && !note) note = "Absent";

              return {
                clockIn: formatTime(item.clock_in),
                clockOut: formatTime(item.clock_out),
                workHour: item.event_presence_summary_id?.work_hours,
                note,
                isAbsent: !item.is_attended,
                event_presence_summary_id: item.event_presence_summary_id,
              };
            });

            return {
              date: moment(items[0].date).format("DD MMM"),
              day: moment(items[0].date).format("ddd"),
              attendanceEntries,
              isLeave: false,
            };
          } else if (leave) {
            // Leave record exists for this day
            return {
              date: moment(dateStr).format("DD MMM"),
              day: moment(dateStr).format("ddd"),
              attendanceEntries: [
                {
                  clockIn: "",
                  clockOut: "",
                  workHour: "",
                  note: leave.type + (leave.reason ? `: ${leave.reason}` : ""),
                  isAbsent: false,
                },
              ],
              isLeave: true,
            };
          } else {
            // No attendance or leave
            return {
              date: moment(dateStr).format("DD MMM"),
              day: moment(dateStr).format("ddd"),
              attendanceEntries: [
                {
                  clockIn: "",
                  clockOut: "",
                  workHour: "",
                  note: "",
                  isAbsent: false,
                },
              ],
              isLeave: false,
            };
          }
        }),
      }));
      setTransformedMonthData([...data]);
    }
  }, [monthData, teacherAttendenceLoader]);

  // previous month
  const previousMonth = () => {
    setCurrentMonth((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // next month
  const nextMonth = () => {
    if (currentMonth < endMonthForNextMonth) {
      setCurrentMonth((prev) => prev + 1);
    } else {
      setCurrentMonth(0);
    }
  };

  return (
    <div className="w-full">
      <div className="card py-10 px-6 rounded-[15px] shadow-custom-effect">
        <div className="flex justify-between md:flex-wrap  items-center gap-2 ">
          <div className="flex justify-start items-center gap-3 select-none">
            <div className="flex gap-2">
              <button onClick={previousMonth}>
                <PrevBtnSvg />
              </button>
              <button onClick={nextMonth}>
                <NextBtnSvg />
              </button>
            </div>
            {teacherAttendenceLoader ? (
              <div className="flex justify-center items-center">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">
                  {transformedMonthData.length
                    ? transformedMonthData[currentMonth]?.month
                    : ""}
                </h2>
              </>
            )}
          </div>
          <div className="flex sm:flex-wrap justify-end gap-3 items-center mb-6">
            <div>
              <AttendanceFilterDropdown
                setStartDate={setStartDateFilter}
                setEndDate={setEndDateFilter}
                setStartFullMonth={setStartFullMonthFilter}
                setEndFullMonth={setEndFullMonthFilter}
                resetFilterHandler={resetFilterHandler}
              />
            </div>

            <PDFDownload
              data={transformedMonthData}
              viewType="teacherIndividualAttendanceSheet"
            />
          </div>
        </div>

        <div className="h-[510px] overflow-y-auto">
          <table className="table mb-0 border border-[#798295] w-full print-desktop">
            <thead>
              <tr className="sticky top-0">
                <th className="text-left p-3 text-white bg-[#7F669D] border border-[#798295]">
                  Date
                </th>
                <th className="text-left p-3 text-white bg-[#7F669D] border border-[#798295]">
                  Day
                </th>
                <th className="text-left p-3 text-white bg-[#7F669D] border border-[#798295]">
                  Clock In
                </th>
                <th className="text-left p-3 text-white bg-[#7F669D] border border-[#798295]">
                  Clock Out
                </th>
                <th className="text-left p-3 text-white bg-[#7F669D] border border-[#798295]">
                  {summaryDetailsFor === "teacher" ? "Work Hour" : "Class Hour"}
                </th>
                <th className="text-left p-3 text-white bg-[#7F669D] border border-[#798295]">
                  Note
                </th>
              </tr>
            </thead>
            {!teacherAttendenceLoader ? (
              <>
                {moment(startDate).year() !== moment(endDate).year() ? (
                  <tbody>
                    <tr>
                      <td
                        colSpan={6}
                        className="p-3 text-center text-sm font-medium text-gray-600 "
                      >
                        <b className="text-gray-800 underline">Start Year</b>{" "}
                        and <b className="text-gray-800 underline">End Year</b>{" "}
                        should be same!
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {transformedMonthData.length ? (
                      transformedMonthData[currentMonth]?.tableData?.map(
                        (item, index) => (
                          <React.Fragment key={index}>
                            {item?.attendanceEntries?.map(
                              (entry, entryIndex) => (
                                <tr
                                  key={`${index}-${entryIndex}`}
                                  className={`
                                  ${
                                    index % 2 === 0
                                      ? "bg-[#F7F8FA]"
                                      : "bg-white"
                                  }
                                  ${entry.isAbsent ? "bg-red-50" : ""}
                                  ${item.isLeave ? "bg-yellow-50" : ""}
                                `}
                                >
                                  {entryIndex === 0 ? (
                                    <>
                                      <td
                                        className="p-3 border border-[#798295]"
                                        rowSpan={item.attendanceEntries.length}
                                      >
                                        {item.date}
                                      </td>
                                      <td
                                        className="p-3 border border-[#798295]"
                                        rowSpan={item.attendanceEntries.length}
                                      >
                                        {item.day}
                                      </td>
                                    </>
                                  ) : null}
                                  <td className="p-3 border border-[#798295]">
                                    {entry.clockIn || "-"}
                                  </td>
                                  <td className="p-3 border border-[#798295]">
                                    {entry.clockOut || "-"}
                                  </td>
                                  <td className="p-3 border border-[#798295]">
                                    {entry.workHour > 1
                                      ? entry.workHour + " hours"
                                      : entry.workHour === 1
                                      ? entry.workHour + " hour"
                                      : entry.workHour > 0
                                      ? entry.workHour * 60 + " min"
                                      : "-"}
                                  </td>
                                  <td className="p-3 border border-[#798295]">
                                    <span
                                      className={
                                        entry.isAbsent
                                          ? "text-red-500"
                                          : item.isLeave
                                          ? "text-yellow-600"
                                          : // : item.earlyLeave
                                            // ? "text-yellow-600"
                                            ""
                                      }
                                    >
                                      {entry.note || "-"}
                                    </span>
                                  </td>
                                </tr>
                              )
                            )}
                          </React.Fragment>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-3 text-center text-sm font-medium text-gray-600 "
                        >
                          No data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                )}
              </>
            ) : (
              <>
                <tbody>
                  <tr>
                    <td
                      colSpan={6}
                      className="p-3 text-center text-sm font-medium text-gray-600"
                    >
                      <div className="flex justify-center items-center">
                        <SvgLoader />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

export default AttendanceTable;
