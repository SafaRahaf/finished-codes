"use client";
import { Select } from "antd";
import { Option } from "antd/es/mentions";
import { NextBtnSvg, PrevBtnSvg } from "@/components/helpers/storeAllSvgs";
import PrintList from "@/components/Print-PDF-Download/print/PrintList";
import PDFDownload from "@/components/Print-PDF-Download/pdf-download/downloadPDF";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import {
  useGetAttendanceSheetQuery,
  useUpdateAdminNoteMutation,
  useLazyGetAttendanceSheetQuery,
} from "@/store/features/teacher-management/apiSlice";
import { useState, useEffect, useRef, useCallback } from "react";
import moment from "moment";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { DatePicker, Modal, message } from "antd";
import InputFullDate from "@/components/common/Inputs/Input/InputFullDate";
import { formatMinutesToHourMin } from "@/components/helpers/formulaMinutesToHourMin";
import { ATTENDANCE_TYPE } from "@/constants/attendenceType";
const {
  EARLY_LEAVE,
  TARDY,
  EARLY_IN,
  ABSENT,
  SICK_LEAVE,
  CASUAL_LEAVE,
  PRESENT,
} = ATTENDANCE_TYPE;

const DailyViewSheet = ({ currentDate, onDateChange }) => {
  // ----------- State Management -----------
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef();
  const [page, setPage] = useState(1);
  const [teacherList, setTeacherList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const observer = useRef();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    type: "",
    value: 0,
    reason: "",
    teacher: null,
    adjustmentId: null,
  });
  const [approval, setApproval] = useState("approved");
  const [filter, setFilter] = useState(null); // Change from filters object to single filter
  const [note, setNote] = useState("");
  const [updateAdminNote, { isLoading: isUpdating }] =
    useUpdateAdminNoteMutation();
  const [showFilter, setShowFilter] = useState(false);

  // ----------- API Queries -----------
  const [trigger, { data: attendanceData, isLoading, error, isFetching }] =
    useLazyGetAttendanceSheetQuery();

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
      setModalOpen(true);
    }
  };

  const handleFilterChange = (key) => {
    setFilter(key === filter ? null : key); // Toggle filter on/off
    setPage(1);
    setTeacherList([]);
    setHasMore(true);
    if (observer.current) observer.current.disconnect();
  };

  const handleModalSubmit = async () => {
    if (!modalData.adjustmentId) return;
    try {
      await updateAdminNote({
        id: modalData.adjustmentId,
        admin_note: note,
        status: approval,
      }).unwrap();

      setTeacherList((prevList) =>
        prevList.map((teacher) => ({
          ...teacher,
          attendances: teacher.attendances
            ? teacher.attendances?.map((attendance) =>
                attendance.id === modalData.adjustmentId
                  ? { ...attendance, admin_note: note, status: approval }
                  : attendance
              )
            : [],
        }))
      );

      setModalOpen(false);
      message.success("Attendance updated successfully");
    } catch (err) {
      message.error("Failed to update attendance");
    }
  };

  const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

  const dataType = "daily";

  // ----------- Use Effects -----------
  useEffect(() => {
    trigger({
      sheetFor: "teacher",
      dataType: dataType,
      startDate: formattedDate,
      endDate: formattedDate,
      page,
      limit,
      filters: filter ? { [filter]: true } : undefined, // Use single filter
    });
  }, [formattedDate, page, limit, filter, dataType]);

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
    { key: EARLY_LEAVE, label: "Earned Leave" },
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

  const getLeaveForDate = (teacher, date) => {
    if (!teacher.leave || teacher.leave.length === 0) return null;
    return teacher.leave.find(
      (leave) =>
        leave.status === "approved" &&
        moment(date).isBetween(leave.start_date, leave.end_date, null, "[]")
    );
  };

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
          <div>
            <h2 className="text-lg lg:text-2xl font-bold">
              Teacher Attendance Sheet
            </h2>
          </div>
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
                <div className="absolute bg-white border rounded shadow z-20 p-1">
                  {[
                    { key: PRESENT, label: "Fully Present" },
                    { key: ABSENT, label: "Absent" },
                    { key: SICK_LEAVE, label: "Sick Leave" },
                    { key: CASUAL_LEAVE, label: "Casual Leave" },
                    { key: EARLY_LEAVE, label: "Earned Leave" },
                  ].map((f) => (
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
                    <div className="text-[#798295] text-12">
                      {attendanceData?.meta?.total_people || 0} Teachers
                    </div>
                  </div>
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-20">
                  Clock In
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-20">
                  Late
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-48">
                  Reason
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-20">
                  Clock out
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-20">
                  Early
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-48">
                  Reason
                </th>
                <th className="text-left text-12 xl:text-16 font-bold text-[#4C5361] min-w-48">
                  Admin Note
                </th>
              </tr>
            </thead>
            <tbody className="text-12 xl:text-16">
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
                    <td className="whitespace-normal text-gray-500">
                      {getLeaveForDate(
                        teacher,
                        attendance?.date || formattedDate
                      ) ? (
                        <span style={{ color: "#F4A300" }}>
                          {getLeaveForDate(
                            teacher,
                            attendance?.date || formattedDate
                          ).leave_type_org_id?.leave_type_id?.type_name ||
                            "On Leave"}
                        </span>
                      ) : (
                        attendanceData?.lateReason || "--"
                      )}
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
                        ? `${formatMinutesToHourMin(attendanceData.early)} v`
                        : "0 Min"}
                    </td>
                    <td className="whitespace-normal text-gray-500">
                      {attendanceData?.earlyReason || "--"}
                    </td>
                    <td className="text-gray-500">
                      {attendance?.status === "approved"
                        ? "✅ "
                        : attendance?.status === "declined"
                        ? "❌ "
                        : attendance?.status === "pending" &&
                          attendance?.is_attended !== false
                        ? "Pending"
                        : ""}
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
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
        width={408}
      >
        <div className="flex flex-col gap-4 p-2">
          <h3 className="text-lg font-semibold">Attendance Approval</h3>
          <hr />
          <div className="flex gap-4">
            <label className="flex gap-2">
              <input
                type="radio"
                name="attendance"
                value="approved"
                checked={approval === "approved"}
                onChange={() => setApproval("approved")}
              />
              Approve
            </label>
            <label className="flex gap-2">
              <input
                type="radio"
                name="attendance"
                value="declined"
                checked={approval === "declined"}
                onChange={() => setApproval("declined")}
              />
              Decline
            </label>
          </div>
          <hr />
          <div>
            <label className="block mb-1 text-sm">Note</label>
            <textarea
              rows={4}
              maxLength={50}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded p-2"
            />
            <div className="text-right text-xs text-gray-400">
              {note.length}/50
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <button
              className="border border-gray-400 rounded px-4 py-1"
              onClick={() => setModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              className="bg-black text-white rounded px-4 py-1"
              onClick={handleModalSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DailyViewSheet;
