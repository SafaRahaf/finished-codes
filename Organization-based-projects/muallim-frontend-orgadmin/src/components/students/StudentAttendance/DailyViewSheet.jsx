"use client";
import { NextBtnSvg, PrevBtnSvg } from "@/components/helpers/storeAllSvgs";
import PDFDownload from "@/components/Print-PDF-Download/pdf-download/downloadPDF";
import {
  useUpdateAdminNoteMutation,
  useLazyGetAttendanceSheetQuery,
} from "@/store/features/teacher-management/apiSlice";
import { useState, useEffect, useRef, useCallback } from "react";
import moment from "moment";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import InputFullDate from "@/components/common/Inputs/Input/InputFullDate";
import { ATTENDANCE_TYPE } from "@/constants/attendenceType";
import { useClassDashboardCountFilteredQuery } from "@/store/features/dashboard/apiSlice";
const {
  EARLY_LEAVE,
  TARDY,
  EARLY_IN,
  ABSENT,
  EARNED_LEAVE,
  SICK_LEAVE,
  CASUAL_LEAVE,
  PRESENT,
} = ATTENDANCE_TYPE;

function mapDashboardData(dataArray) {
  const result = {};
  dataArray?.forEach((item) => {
    const key = item.aggregated_column_name_id?.name;
    if (key) result[key] = item.value;
  });
  return result;
}

const DailyViewSheet = ({ currentDate, onDateChange, className, classId }) => {
  // ----------- State Management -----------
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef();
  const [page, setPage] = useState(1);
  const [teacherList, setTeacherList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const observer = useRef();
  let apiData = [];
  let overAllData = [];

  const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

  // const getStartDate = moment(selectedDate)
  //   .startOf("month")
  //   .format("YYYY-MM-DD");
  // const getEndDate = moment(selectedDate).endOf("month").format("YYYY-MM-DD");

  // const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    type: "",
    value: 0,
    reason: "",
    teacher: null,
    adjustmentId: null,
  });
  const [approval, setApproval] = useState("approved");
  const [filters, setFilters] = useState({
    present: false,
    absent: false,
    sick_leave: false,
    casual_leave: false,
    earned_leave: false,
  });
  const [note, setNote] = useState("");
  const [updateAdminNote, { isLoading: isUpdating }] =
    useUpdateAdminNoteMutation();
  const [showFilter, setShowFilter] = useState(false);

  // ----------- API Queries -----------
  const [trigger, { data: attendanceData, isLoading, error, isFetching }] =
    useLazyGetAttendanceSheetQuery();
  const {
    data: classDashboardCount,
    isFetching: classDashboardCountDataFetching,
  } = useClassDashboardCountFilteredQuery({
    dataType: "daily",
    startDate: formattedDate,
    endDate: formattedDate,
    filterByClass: classId,
  });

  // ----------- Handlers -----------
  const handleCellClick = (type, value, reason, teacher, attendance) => {
    if (parseInt(value) > 0) {
      setModalData({
        type,
        value,
        reason,
        teacher,
        adjustmentId: attendance?.id || null,
      });
      setApproval(attendance?.status || "approved");
      setNote(attendance?.admin_note || "");
    }
  };

  const [activeFilter, setActiveFilter] = useState(null);

  const handleFilterChange = (filterName) => {
    setActiveFilter((prev) => (prev === filterName ? null : filterName));
    setPage(1);
    setTeacherList([]);
    setHasMore(true);
  };

  if (
    classDashboardCount &&
    Array.isArray(classDashboardCount.data.attendance_aggregated_data)
  ) {
    apiData = mapDashboardData(
      classDashboardCount.data.attendance_aggregated_data
    );
  }

  if (
    classDashboardCount &&
    Array.isArray(classDashboardCount.data.aggregated_metrics)
  ) {
    overAllData = mapDashboardData(classDashboardCount.data.aggregated_metrics);
  }

  const dataType = "daily";

  // ----------- Use Effects -----------
  useEffect(() => {
    trigger({
      sheetFor: "student",
      dataType,
      startDate: formattedDate,
      endDate: formattedDate,
      page,
      filterByClass: classId,
      limit,
      filters: activeFilter ? { [activeFilter]: true } : {},
    });
  }, [formattedDate, page, limit, classId, activeFilter]);

  useEffect(() => {
    if (attendanceData?.data) {
      setTeacherList((prev) =>
        page === 1 ? attendanceData.data : [...prev, ...attendanceData.data]
      );
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

  // ----------- Handlers -----------
  const handleDateChangeAndReset = (newDate) => {
    setSelectedDate(newDate);
    setPage(1);
    setTeacherList([]);
    setHasMore(true);
    if (observer.current) observer.current.disconnect();
    onDateChange(newDate);
  };

  const handlePreviousDay = () => {
    const newDate = moment(selectedDate).subtract(1, "day").toDate();
    handleDateChangeAndReset(newDate);
  };

  const handleNextDay = () => {
    const newDate = moment(selectedDate).add(1, "day").toDate();
    handleDateChangeAndReset(newDate);
  };

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

  // ----------- Filtering -----------
  const filterOptions = [
    { key: PRESENT, label: "Fully Present" },
    { key: ABSENT, label: "Absent" },
    { key: SICK_LEAVE, label: "Sick Leave" },
    { key: CASUAL_LEAVE, label: "Casual Leave" },
    { key: EARNED_LEAVE, label: "Earned Leave" },
  ];

  const flattenedRows = teacherList.flatMap((teacher) => {
    if (!teacher.attendances || teacher.attendances.length === 0) {
      return [
        {
          teacher,
          attendance: null,
          isFirst: true,
          rowSpan: 1,
        },
      ];
    }
    return teacher.attendances.map((attendance, idx) => ({
      teacher,
      attendance,
      isFirst: idx === 0,
      rowSpan: teacher.attendances.length,
    }));
  });

  // ----------- Attendace -----------
  const getTeacherAttendanceData = (teacher) => {
    if (!teacher?.attendances) return null;

    const dayAttendance = teacher.attendances.find(
      (att) => att.date === formattedDate
    );

    if (!dayAttendance) {
      return null;
    }

    const clockIn =
      dayAttendance.event_presence_summary_id?.clock_in ||
      dayAttendance.clock_in;
    const clockOut =
      dayAttendance.event_presence_summary_id?.clock_out ||
      dayAttendance.clock_out;

    const formattedClockIn = clockIn
      ? moment.utc(clockIn).local().format("hh:mm A")
      : "--";
    const formattedClockOut = clockOut
      ? moment.utc(clockOut).local().format("hh:mm A")
      : "--";

    const adjustments = dayAttendance.event_participant_adjustments || [];
    const tardy = adjustments.find((adj) => adj.adjustment_type === TARDY);
    const earlyIn = adjustments.find((adj) => adj.adjustment_type === EARLY_IN);
    const earlyLeave = adjustments.find(
      (adj) => adj.adjustment_type === EARLY_LEAVE
    );

    return {
      clockIn: formattedClockIn,
      clockOut: formattedClockOut,
      late: tardy?.time || "",
      lateReason: tardy?.reason || "",
      early: earlyLeave?.time || "",
      earlyReason: earlyLeave?.reason || "",
      earlyIn: earlyIn?.time || "",
      earlyInReason: earlyIn?.reason || "",
      note:
        tardy?.admin_note ||
        earlyLeave?.admin_note ||
        earlyIn?.admin_note ||
        "--",
      isAttended: dayAttendance.is_attended || false,
    };
  };

  // ----------- PDF Data -----------
  const pdfData =
    attendanceData?.data?.map((teacher) => {
      const attendance = getTeacherAttendanceData(teacher);

      return {
        TeacherImg: teacher?.people_id?.profile_picture
          ? `${process.env.FILE_BROWSE_URL}${teacher?.people_id?.profile_picture}`
          : DefaultProfile.src,
        TeacherName: `${teacher?.people_id?.first_name} ${teacher?.people_id?.last_name}`,
        clockIn: attendance?.clockIn || "--",
        clockOut: attendance?.clockOut || "--",
        Late: attendance?.late ? `${attendance.late} min` : "0 min",
        Early: attendance?.early ? `${attendance.early} min` : "0 min",
        LateReason: attendance?.lateReason || "--",
        EarlyReason: attendance?.earlyReason || "--",
        Note: attendance?.note || "--",
        Approval: attendance?.isAttended ? "Approved" : "Declined",
      };
    }) || [];

  // ------------ Attendance count calculation -------------------

  const totalGirls = Number(overAllData?.total_girl_student) || 0;
  const totalBoys = Number(overAllData?.total_boy_student) || 0;
  const totalStudents = Number(overAllData?.total_student) || 0;
  const TotalStudent = totalGirls + totalBoys;

  const getAttendanceCount = Number(apiData?.attendance) || 0;
  const leave = Number(apiData?.leave) || 0;
  const getSickLeaveCount = Number(apiData?.sick_leave) || 0;

  const getAbsent = totalStudents - (getAttendanceCount + leave);
  const getLeave = leave - getSickLeaveCount;

  // ----------- return -----------
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
    <div className="">
      <div className="w-full">
        <div className="flex justify-between items-center border-b pb-4 mb-2">
          <div className="flex items-center gap-5">
            <div>
              <h2 className="text-lg lg:text-2xl font-bold">{className}</h2>
            </div>{" "}
            |
            <div className="flex items-center gap-2 text-[12px]">
              <span className="font-bold text-[#222]">
                {totalStudents} Students
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-bold text-green-500">
                {getAttendanceCount} Present
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-bold text-red-500">{getAbsent} Absent</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-bold text-orange-500">
                {getLeave} On Leave
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="font-bold text-orange-500">
                {getSickLeaveCount} Sick
              </span>
            </div>
          </div>
          <div className="flex sm:flex-wrap justify-end gap-3 items-center no-print">
            <div>
              <button
                className="flex items-center gap-11 border-gray-600 border rounded px-2 py-[6px]"
                onClick={() => setShowFilter((prev) => !prev)}
              >
                Filter by{" "}
                {activeFilter
                  ? filterOptions.find((f) => f.key === activeFilter)?.label
                  : "All"}
                {/* {filters && (
                  <>{filterOptions.find((f) => f.key === filters)?.key}</>
                )} */}
                <span>
                  <img src="/assets/img/icons/filter.svg" alt="" />
                </span>
              </button>
              {showFilter && (
                <div className="absolute bg-white border rounded shadow z-20 p-1">
                  {[
                    { key: PRESENT, label: "Fully Present" },
                    { key: ABSENT, label: "Absent" },
                    { key: SICK_LEAVE, label: "Sick Leave" },
                    { key: CASUAL_LEAVE, label: "Casual Leave" },
                    { key: EARNED_LEAVE, label: "Earned Leave" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      className={`block hover:bg-slate-100 p-1 px-3 w-full text-start ${
                        activeFilter === f.key ? "bg-slate-200 font-bold" : ""
                      }`}
                      onClick={() => handleFilterChange(f.key)}
                    >
                      {f.label}
                    </button>
                    // <button
                    //   key={f.key}
                    //   className="block hover:bg-slate-100 p-1 px-3 w-full text-start"
                    //   onClick={() => handleFilterChange(f.key)}
                    // >
                    //   {f.label}
                    // </button>
                  ))}
                </div>
              )}
            </div>
            <PDFDownload data={pdfData} viewType="daily" />
          </div>
        </div>
        <div className="w-full h-[500px] overflow-y-auto">
          <table className="w-full overflow-x-auto divide-y divide-[#AEB4BF] daily-attendance-print">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th className="py-3 text-left font-bold min-w-44 gap-1">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <InputFullDate
                        defaultValue={selectedDate}
                        dailyView={true}
                        handler={(date) => {
                          if (date) {
                            handleDateChangeAndReset(date);
                          }
                          setShowDatePicker(false);
                        }}
                      />
                      <div className="flex pr-1">
                        <button onClick={handlePreviousDay}>
                          <PrevBtnSvg height={20} />
                        </button>
                        <button onClick={handleNextDay}>
                          <NextBtnSvg height={20} />
                        </button>
                      </div>
                    </div>
                    <div className="text-[#4C5361] text-16 font-bold">
                      Student
                    </div>
                  </div>
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-20">
                  Clock In
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-20">
                  Late
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-20">
                  Clock out
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-20">
                  Early
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-48">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="text-12 xl:text-16 ">
              {flattenedRows.map((row, idx) => {
                const { teacher, attendance, isFirst, rowSpan } = row;
                const attendanceData = attendance
                  ? {
                      ...getTeacherAttendanceData({
                        ...teacher,
                        attendances: [attendance],
                      }),
                    }
                  : {};

                return (
                  <tr
                    className="border-b border-[#F1F3F5]"
                    key={
                      attendance
                        ? attendance.id
                        : `no-attendance-${teacher.id}-${idx}`
                    }
                    ref={idx === flattenedRows.length - 1 ? lastRowRef : null}
                  >
                    {isFirst ? (
                      <td className="py-3" rowSpan={rowSpan}>
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              teacher?.people_id?.profile_picture
                                ? `${process.env.FILE_BROWSE_URL}${teacher?.people_id?.profile_picture}`
                                : DefaultProfile.src
                            }
                            alt="pic"
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-16">
                            {teacher?.people_id?.first_name}{" "}
                            {teacher?.people_id?.last_name}
                          </span>
                        </div>
                      </td>
                    ) : null}
                    <td
                      className={
                        attendanceData?.isAttended === false
                          ? "text-gray-600"
                          : attendanceData?.late
                          ? "text-gray-600"
                          : ""
                      }
                    >
                      {attendanceData?.clockIn || "--"}
                    </td>
                    <td
                      className={
                        attendanceData?.isAttended === false
                          ? "text-red-500"
                          : attendanceData?.late
                          ? "text-red-500 cursor-pointer"
                          : "cursor-pointer"
                      }
                      onClick={() =>
                        handleCellClick(
                          "Late",
                          attendanceData?.late,
                          attendanceData?.lateReason,
                          teacher,
                          attendance
                        )
                      }
                    >
                      {attendanceData?.isAttended === false
                        ? "Absent!"
                        : attendanceData?.late
                        ? `${formatMinutesToHourMin(attendanceData.late)}`
                        : "0 Min"}
                    </td>
                    <td
                      className={
                        attendanceData?.isAttended === false
                          ? "text-gray-600"
                          : attendanceData?.early
                          ? "text-gray-600"
                          : ""
                      }
                    >
                      {attendanceData?.clockOut || "--"}
                    </td>
                    <td
                      className={
                        attendanceData?.isAttended === false
                          ? "text-red-500"
                          : attendanceData?.early
                          ? "text-red-500 cursor-pointer"
                          : "cursor-pointer"
                      }
                      onClick={(e) =>
                        handleCellClick(
                          "Early",
                          attendanceData?.early,
                          attendanceData?.earlyReason,
                          teacher,
                          attendance
                        )
                      }
                    >
                      {attendanceData?.isAttended === false
                        ? "Absent!"
                        : attendanceData?.early
                        ? `${formatMinutesToHourMin(attendanceData.early)}`
                        : "0 Min"}
                    </td>
                    <td className="whitespace-normal text-gray-500">
                      {attendance?.admin_note || "--"}
                    </td>
                  </tr>
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
      </div>
    </div>
  );
};

export default DailyViewSheet;
