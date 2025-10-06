"use client";

// ----------- Imports -----------
import React, { useState, useEffect, useRef, useCallback } from "react";
import { NextBtnSvg, PrevBtnSvg } from "@/components/helpers/storeAllSvgs";
import PDFDownload from "@/components/Print-PDF-Download/pdf-download/downloadPDF";
import { useLazyGetAttendanceSheetQuery } from "@/store/features/teacher-management/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { Tooltip } from "antd";
import moment from "moment";
import { formatMinutesToHourMin } from "@/components/helpers/formulaMinutesToHourMin";
import InputYearMonth from "@/components/common/Inputs/Input/InputYearMonth";
import { ATTENDANCE_TYPE } from "@/constants/attendenceType";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import { useClassDashboardCountFilteredQuery } from "@/store/features/dashboard/apiSlice";
const {
  EARLY_LEAVE,
  TARDY,
  EARLY,
  LATE,
  ABSENT,
  SICK_LEAVE,
  CASUAL_LEAVE,
  PRESENT,
} = ATTENDANCE_TYPE;

// ----------- Extra functions -----------
function mapDashboardData(dataArray) {
  const result = {};
  dataArray?.forEach((item) => {
    const key = item.aggregated_column_name_id?.name;
    if (key) result[key] = item.value;
  });
  return result;
}

function getMonthlyDates(year, monthIndex) {
  const dates = [];
  const date = new Date(year, monthIndex, 1);

  while (date.getMonth() === monthIndex) {
    dates.push({
      // key: date.toISOString().split("T")[0],
      key: date.toLocaleDateString("en-CA"),
      month: date.toLocaleString("en-US", { month: "short" }),
      day: String(date.getDate()).padStart(2, "0"),
      weekday: date.toLocaleString("en-US", { weekday: "short" }),
    });
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

const statusColors = {
  P: "bg-green-100 text-[#18C629]",
  L: "bg-[#FFF3E7] text-[#DC7803]",
  // WE: "bg-[#E7F7FF] text-[#B6BFF0]",
  A: "bg-red-100 text-red-700",
  S: "bg-[#FFF3E7] text-[#DC7803]",
  // SL: "bg-yellow-100 text-yellow-700",
};

function getLeaveTypeForDate(teacher, dateKey) {
  if (!teacher?.leave) return null;
  for (const leave of teacher.leave) {
    if (leave.start_date && leave.end_date) {
      if (dateKey >= leave.start_date && dateKey <= leave.end_date) {
        const type =
          leave.leave_type_org_id?.leave_type_id?.type_name?.toLowerCase();
        if (type === "casual leave")
          return {
            code: "L",
            name: "Casual leave",
            reason: leave.reason,
            start_date: leave.start_date,
            end_date: leave.end_date,
          };
        if (type === "sick leave")
          return {
            code: "S",
            name: "Sick leave",
            reason: leave.reason,
            start_date: leave.start_date,
            end_date: leave.end_date,
          };
        return {
          code: "L",
          name: leave.leave_type_org_id?.leave_type_id?.type_name || "Leave",
          reason: leave.reason,
          start_date: leave.start_date,
          end_date: leave.end_date,
        };
      }
    }
  }
  return null;
}

function groupAttendancesByDate(attendances) {
  const map = {};
  attendances.forEach((att) => {
    if (!map[att.date]) map[att.date] = [];
    map[att.date].push(att);
  });
  return map;
}

function getMaxAttendanceRows(dates, grouped) {
  return Math.max(
    1,
    ...dates.map((date) => (grouped[date.key] ? grouped[date.key].length : 0))
  );
}

// ----------- Component starts -----------
export default function MonthlyViewSheet({
  currentDate,
  onDateChange,
  className,
  classId,
}) {
  // ----------- State Management -----------
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [attendanceList, setAttendanceList] = useState([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const observer = useRef();
  const [filter, setFilter] = useState(null);
  let apiData = [];

  // ----------- Get Date info -----------
  const startDate = moment(new Date(selectedYear, selectedMonth, 1)).format(
    "YYYY-MM-DD"
  );
  const endDate = moment(new Date(selectedYear, selectedMonth + 1, 0)).format(
    "YYYY-MM-DD"
  );

  const dates = getMonthlyDates(selectedYear, selectedMonth);

  // ----------- API Queries -----------
  const [trigger, { data: attendanceData, isLoading, error, isFetching }] =
    useLazyGetAttendanceSheetQuery();

  const {
    data: classDashboardCount,
    isFetching: classDashboardCountDataFetching,
  } = useClassDashboardCountFilteredQuery({
    dataType: "monthly",
    startDate: startDate,
    endDate: endDate,
    filterByClass: classId,
  });

  if (
    classDashboardCount &&
    Array.isArray(classDashboardCount.data.attendance_aggregated_data)
  ) {
    apiData = mapDashboardData(
      classDashboardCount.data.attendance_aggregated_data
    );
  }

  const total =
    (apiData?.attendance || 0) +
    (apiData?.absent || 0) +
    (apiData?.leave || 0) +
    (apiData?.sick_leave || 0);

  const attendancePercent = total
    ? ((apiData?.attendance || 0) / total) * 100
    : 0;
  const absentPercent = total ? ((apiData?.absent || 0) / total) * 100 : 0;
  const leavePercent = total ? ((apiData?.leave || 0) / total) * 100 : 0;
  const sickLeavePercent = total
    ? ((apiData?.sick_leave || 0) / total) * 100
    : 0;

  const totalOrgAttendanceDay = apiData?.today_working_day_number;

  const dataType = "monthly";

  // ----------- Use Effects -----------
  useEffect(() => {
    trigger({
      sheetFor: "student",
      dataType: dataType,
      startDate,
      endDate,
      page,
      limit,
      filters: filter ? { [filter]: true } : undefined,
      filterByClass: classId,
    });
  }, [startDate, endDate, page, limit, filter, classId, dataType]);

  useEffect(() => {
    if (attendanceData?.data) {
      setAttendanceList((prev) => {
        if (page === 1) {
          return attendanceData.data;
        }

        const existingIds = new Set(prev.map((teacher) => teacher.id));
        const newTeachers = attendanceData.data.filter(
          (teacher) => !existingIds.has(teacher.id)
        );

        return [...prev, ...newTeachers];
      });

      if (
        attendanceData.data.length === 0 ||
        attendanceData.data.length < limit
      ) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }
  }, [attendanceData, page, limit]);

  // // Reset pagination when classId changes
  // useEffect(() => {
  //   setPage(1);
  //   setAttendanceList([]);
  //   setHasMore(true);
  //   if (observer.current) observer.current.disconnect();
  // }, [classId]);

  // ----------- Callbacks -----------
  const lastRowRef = useCallback(
    (node) => {
      if (isFetching || !hasMore) {
        if (observer.current) observer.current.disconnect();
        return;
      }

      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore]
  );

  // ----------- Handlers -----------
  const handlePreviousMonth = () => {
    const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

    setPage(1);
    setAttendanceList([]);
    setHasMore(true);

    if (observer.current) {
      observer.current.disconnect();
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    onDateChange(new Date(newYear, newMonth, 1));
  };

  const handleNextMonth = () => {
    const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;

    setPage(1);
    setAttendanceList([]);
    setHasMore(true);

    if (observer.current) {
      observer.current.disconnect();
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    onDateChange(new Date(newYear, newMonth, 1));
  };

  // ----------- Attendace -----------
  const getAttendanceStatus = (teacher, dateKey) => {
    // 1. Checking leave first
    const leave = getLeaveTypeForDate(teacher, dateKey);
    if (leave) return leave.code;

    // 2. attendance for the date
    const attendance = teacher.attendances?.find((att) => att.date === dateKey);

    if (attendance) {
      if (attendance.is_attended) return "P";
      return "A";
    }

    return "";
  };

  const getAttendanceCounts = (teacher) => {
    const statusArr = dates.map((date) =>
      getAttendanceStatus(teacher, date.key)
    );

    const actualAttendance = statusArr.filter(
      (s) => s === "P" || s === "L" || s === "S"
    ).length;

    const shouldAttend = statusArr.filter((s) => s !== "").length;

    return {
      actualAttendance,
      shouldAttend,
      presentCount: statusArr.filter((s) => s === "P").length,
      leaveCount: statusArr.filter((s) => s === "L" || s === "S").length,
      absentCount: statusArr.filter((s) => s === "A").length,
    };
  };

  const getAttendanceDetailsFromRecord = (attendance, teacher, dateKey) => {
    // 1. Check leave for this date
    const leave = getLeaveTypeForDate(teacher, dateKey);
    if (leave) {
      return {
        tooltip: (
          <div>
            <div>Leave: {leave.name}</div>
            <div>Start Date: {leave.start_date || "--"}</div>
            <div>End Date: {leave.end_date || "--"}</div>
            <div>Reason: {leave.reason || "--"}</div>
          </div>
        ),
        status: leave.code,
        hasAdjustment: false,
      };
    }

    // 2. Attendance info
    if (attendance) {
      if (attendance.is_attended) {
        let clockIn = attendance.event_presence_summary_id?.clock_in
          ? moment
              .utc(attendance.event_presence_summary_id?.clock_in)
              .local()
              .format("hh:mm A")
          : "--";
        let clockOut = attendance.event_presence_summary_id?.clock_out
          ? moment
              .utc(attendance.event_presence_summary_id?.clock_out)
              .local()
              .format("hh:mm A")
          : "--";

        let adjustmentInfo = null;
        const hasAdjustment =
          attendance.event_participant_adjustments?.length > 0;
        if (hasAdjustment) {
          adjustmentInfo = attendance.event_participant_adjustments.map(
            (adj, idx) => {
              const timeString = formatMinutesToHourMin(adj.time);
              return (
                <div key={idx}>
                  {adj.adjustment_type?.toLowerCase().includes(TARDY) && (
                    <div>Late in: {timeString}</div>
                  )}
                  {adj.adjustment_type?.toLowerCase().includes(EARLY_LEAVE) && (
                    <div>Early out: {timeString}</div>
                  )}
                  <div>Reason: {adj.reason || "--"}</div>
                </div>
              );
            }
          );
        }

        return {
          tooltip: (
            <div>
              <div>Present</div>
              <div>Clock In: {clockIn}</div>
              <div>Clock Out: {clockOut}</div>
              {adjustmentInfo}
            </div>
          ),
          status: "P",
          hasAdjustment,
        };
      } else {
        return {
          tooltip: <div>Absent</div>,
          status: "A",
          hasAdjustment: false,
        };
      }
    }

    return {
      tooltip: null,
      status: "",
      hasAdjustment: false,
    };
  };

  // ----------- Late & Early time -----------
  const getTotalLateEarlyMinutes = (teacher) => {
    let totalLate = 0;
    let totalEarly = 0;
    let totalHours = 0;

    dates.forEach((date) => {
      const attendance = teacher.attendances?.find(
        (att) => att.date === date.key
      );

      if (attendance) {
        if (attendance.event_presence_summary_id) {
          totalHours += attendance.event_presence_summary_id?.work_hours || 0;
        }
        if (attendance.event_participant_adjustments) {
          attendance.event_participant_adjustments.forEach((adj) => {
            if (adj.adjustment_type?.toLowerCase().includes(LATE)) {
              totalLate += adj.time || 0;
            }
            if (adj.adjustment_type?.toLowerCase().includes(EARLY)) {
              totalEarly += adj.time || 0;
            }
          });
        }
      }
    });

    return { totalLate, totalEarly, totalHours };
  };

  // ----------- Filtering -----------
  const filterOptions = [
    { key: PRESENT, label: "Fully Present" },
    { key: ABSENT, label: "Absent" },
    { key: SICK_LEAVE, label: "Sick Leave" },
    { key: CASUAL_LEAVE, label: "Casual Leave" },
    { key: EARLY_LEAVE, label: "Earned Leave" },
  ];

  const handleFilterChange = (key) => {
    setFilter(key === filter ? null : key);
    setPage(1);
    setAttendanceList([]);
    setHasMore(true);
    if (observer.current) observer.current.disconnect();
  };

  // ----------- PDF Data -----------
  const pdfData = {
    filtration: "All",
    printDate: moment(new Date(selectedYear, selectedMonth, 1)).format(
      "MMMM YYYY"
    ),
    dates,
    teachers:
      attendanceList?.map((teacher) => {
        const statusArr = dates.map((date) =>
          getAttendanceStatus(teacher, date.key)
        );
        const presentCount = statusArr.filter((s) => s === "P").length;
        const totalDays = statusArr.length;

        return {
          name: `${teacher.people_id?.first_name} ${teacher.people_id?.last_name}`,
          image: teacher?.people_id?.profile_picture
            ? `${process.env.FILE_BROWSE_URL}${teacher?.people_id?.profile_picture}`
            : DefaultProfile.src,
          attendanceCount: `${presentCount}/${totalDays}`,
          status: statusArr,
        };
      }) || [],
  };

  // ===== Debug =====
  // useEffect(() => {
  //   console.log("Debug :", {
  //     page,
  //     hasMore,
  //     isFetching,
  //     dataLength: attendanceData?.data?.length,
  //     totalCount: attendanceData?.meta?.total,
  //     hasNextPage: attendanceData?.meta?.hasNextPage,
  //   });
  // }, [page, hasMore, isFetching, attendanceData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SvgLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error loading attendance data</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center border-b pb-4 mb-2">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base lg:text-xl font-bold">{className}</h2>
          </div>{" "}
          |
          <div className="w-[600px] flex justify-start text-sm ">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="font-bold text-[#222]">
                {totalOrgAttendanceDay} Days Total Attendance
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-bold text-green-500">
                {attendancePercent.toFixed(1)}% Present
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-bold text-red-500">
                {absentPercent.toFixed(1)}% Absent
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-bold text-orange-500">
                {leavePercent.toFixed(1)}% Leave
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-bold text-orange-500">
                {sickLeavePercent.toFixed(1)}% Sick
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex sm:flex-wrap justify-end gap-3 items-center no-print">
            <div>
              <button
                className="flex items-center gap-11 border-gray-600 border rounded px-2 py-[6px]"
                onClick={() => setShowFilter((prev) => !prev)}
              >
                Filter by{" "}
                {filter && (
                  <>{filterOptions.find((f) => f.key === filter)?.label}</>
                )}
                <span>
                  <img src="/assets/img/icons/filter.svg" alt="" />
                </span>
              </button>
              {showFilter && (
                <div className="absolute bg-white border rounded shadow p-1 z-[9999]">
                  {filterOptions.map((f) => (
                    <button
                      key={f.key}
                      className="block hover:bg-slate-100 p-1 px-3 w-full text-start"
                      onClick={() => handleFilterChange(f.key)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <PDFDownload data={pdfData} viewType="monthly" />
          </div>
        </div>
      </div>
      <div className="w-full overflow-x-auto h-[666px]">
        <table className="table-auto w-full">
          {/* Table Header */}
          <thead className="bg-[#FBFBFB] sticky top-0 z-20 border-b-2 borde-[#AEB4BF]">
            <tr className="">
              <th
                className="bg-[#FBFBFB] text-left sticky left-0 z-10 py-2"
                rowSpan={4}
              >
                <div className="flex flex-col items-start gap-2 p-1">
                  <div className="flex items-center gap-2 min-w-[204px] 2xl:min-w-0">
                    <InputYearMonth
                      defaultValue={new Date(selectedYear, selectedMonth, 1)}
                      handler={(year, month) => {
                        setSelectedYear(year);
                        setSelectedMonth(month - 1);
                        setPage(1);
                        setAttendanceList([]);
                        setHasMore(true);
                        if (observer.current) observer.current.disconnect();
                        onDateChange(new Date(year, month - 1, 1));
                      }}
                    />
                    {/* <h2 className="text-base font-bold">
                      {moment(new Date(selectedYear, selectedMonth, 1)).format(
                        "MMMM YYYY"
                      )}
                    </h2> */}
                    <div className="flex gap-1">
                      <button onClick={handlePreviousMonth}>
                        <PrevBtnSvg height={20} />
                      </button>
                      <button onClick={handleNextMonth}>
                        <NextBtnSvg height={20} />
                      </button>
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs pt-1	">
                    {attendanceData?.meta?.total_people || 0} Students
                  </div>
                </div>
              </th>

              <th className="bg-[#FBFBFB] sticky left-[200px]"></th>
              <th className="bg-[#FBFBFB] sticky left-[225px]"></th>

              {dates?.map((d, i) => (
                <th
                  key={`month-${i}`}
                  className="text-center text-gray-500 text-10 font-bold p-1 hover:bg-[#E7F7FF]"
                >
                  <div className="">
                    <div>{d?.month}</div>
                    <div className="text-14 text-[#4C5361]">{d?.day}</div>
                    <div>{d?.weekday}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {attendanceList.map((teacher, i) => {
              const grouped = groupAttendancesByDate(teacher.attendances || []);
              const maxRows = getMaxAttendanceRows(dates, grouped);

              return (
                <React.Fragment key={teacher.id}>
                  {[...Array(maxRows)].map((_, rowIdx) => {
                    const isLastTeacher = i === attendanceList.length - 1;
                    const isLastRow = rowIdx === maxRows - 1;
                    return (
                      <tr
                        key={rowIdx}
                        className="border-b"
                        ref={isLastTeacher && isLastRow ? lastRowRef : null}
                      >
                        {/* Only show teacher info in the first row */}
                        {rowIdx === 0 ? (
                          <>
                            <td
                              rowSpan={maxRows}
                              className="p-3 min-w-[204px] sticky left-0 bg-[#FBFBFB] z-10 shadow"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    teacher?.people_id?.profile_picture
                                      ? `${process.env.FILE_BROWSE_URL}${teacher?.people_id?.profile_picture}`
                                      : DefaultProfile.src
                                  }
                                  alt={teacher?.people_id.first_name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <Tooltip
                                  title={(() => {
                                    const {
                                      totalLate,
                                      totalEarly,
                                      totalHours,
                                    } = getTotalLateEarlyMinutes(teacher);
                                    return (
                                      <div>
                                        <div>
                                          <b>Total working hours:</b>{" "}
                                          {formatMinutesToHourMin(totalHours)}
                                        </div>
                                        <div>
                                          <b>Late:</b>{" "}
                                          {formatMinutesToHourMin(totalLate)}
                                        </div>
                                        <div>
                                          <b>Early:</b>{" "}
                                          {formatMinutesToHourMin(totalEarly)}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  color="#fff"
                                >
                                  <span className="text-sm sm:text-base font-medium cursor-pointer">
                                    {teacher?.people_id.first_name}{" "}
                                    {teacher?.people_id.last_name}
                                  </span>
                                </Tooltip>
                              </div>
                            </td>
                            <td
                              rowSpan={maxRows}
                              className="sticky bg-[#FBFBFB] z-10 left-[200px]"
                            >
                              <div className="bg-[#B6BFF0] flex w-6 h-6 items-center justify-center rounded-sm">
                                <img
                                  src="/assets/img/icons/clock.png"
                                  alt="clock-img"
                                />
                              </div>
                            </td>
                            <td
                              rowSpan={maxRows}
                              className="sticky bg-[#FBFBFB] z-10 left-[225px] px-1"
                            >
                              <p className="bg-[#F1F3F5] flex items-center justify-center w-12 h-6 text-12 font-bold rounded-sm px-[2px]">
                                {(() => {
                                  const counts = getAttendanceCounts(teacher);
                                  return counts.actualAttendance;
                                })()}
                                <span className="text-[#798295]">
                                  /
                                  {(() => {
                                    const counts = getAttendanceCounts(teacher);
                                    return counts.shouldAttend;
                                  })()}
                                </span>
                              </p>
                            </td>
                          </>
                        ) : null}
                        {/* Attendance cells */}
                        {dates.map((date, j) => {
                          const records = grouped[date.key] || [];
                          const attendance = records[rowIdx];
                          const { tooltip, status, hasAdjustment } =
                            getAttendanceDetailsFromRecord(
                              attendance,
                              teacher,
                              date.key
                            );
                          let statusColor =
                            statusColors[status] || "bg-gray-200 text-gray-400";
                          return (
                            <td key={j} className="text-black">
                              <Tooltip title={tooltip} color="#fff">
                                <div
                                  className={`h-[36px] flex w-[36px] items-center justify-center text-[11px] md:text-14 font-bold rounded-sm relative ${statusColor}`}
                                >
                                  {status}
                                  {status === "P" && hasAdjustment && (
                                    <span
                                      className="absolute bottom-2 right-1 w-[5px] h-[5px] rounded-full bg-orange-400"
                                      title="Has adjustment"
                                    ></span>
                                  )}
                                </div>
                              </Tooltip>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {isFetching && (
          <div className="flex justify-center items-center h-64">
            <SvgLoader />
          </div>
        )}
      </div>
    </>
  );
}
