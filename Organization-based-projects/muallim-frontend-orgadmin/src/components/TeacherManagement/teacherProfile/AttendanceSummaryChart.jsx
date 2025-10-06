"use client";
import Donut from "@/components/charts/donut";
import { useState, useEffect } from "react";
import { useGetTeacherAttendanceChartQuery } from "@/store/features/teacher-management/apiSlice";
import moment from "moment";
import AttendanceFilterDropdown from "./AttendanceFilterDropdown";
import { ATTENDANCE_TYPE } from "@/constants/attendenceType";
const {
  EARLY_LEAVE,
  TARDY,
  ATTENDANCE,
  WORK_ON_WEEKEND,
  EARLY_IN,
  LATE_LEAVE,
  ABSENT,
  ON_TIME,
  EARNED_LEAVE,
  SICK_LEAVE,
  CASUAL_LEAVE,
  LEAVE,
  PRESENT,
} = ATTENDANCE_TYPE;

const AttendanceSummaryChart = ({ peopleId, summeryFor = "" }) => {
  // filter Option state
  const [startDateFilter, setStartDateFilter] = useState(""); //2025-01-01
  const [endDateFilter, setEndDateFilter] = useState(""); // "2022-06-17"
  const [startFulMonthFilter, setStartFullMonthFilter] = useState(""); //"January 2025"
  const [endFulMonthFilter, setEndFullMonthFilter] = useState(""); //"June 2022"
  const resetFilterHandler = () => {
    setStartDateFilter("");
    setEndDateFilter("");
    setStartFullMonthFilter("");
    setEndFullMonthFilter("");
  };
  // end filter option state
  const getDecemberDates = () => {
    const currentYear = moment().year(); // Automatically gets the current year
    const startDate = moment(`${currentYear}-01-01`).format("YYYY-MM"); // December 1st in 'YYYY-MM' format
    const endDate = moment(`${currentYear}-12`)
      .endOf("month")
      .format("YYYY-MM"); // Last day of December in 'YYYY-MM' format

    return {
      startDate,
      endDate,
    };
  };
  // pie chart
  const defaultPieData = [
    { type: ON_TIME, name: "On Time", value: 0, fill: "#90C8AC" },
    { type: CASUAL_LEAVE, name: "Casual Leave", value: 0, fill: "#FEC98D" },
    { type: SICK_LEAVE, name: "Sick Leave", value: 0, fill: "#7895B2" },
    { type: EARNED_LEAVE, name: "Earned Leave", value: 0, fill: "#C3B091" },
    { type: ABSENT, name: "Absent", value: 0, fill: "#F95656" },
    { type: TARDY, name: "Tardy", value: 0, fill: "#FDAE51" },
    { type: EARLY_LEAVE, name: "Early Leave", value: 0, fill: "#7F669D" },
  ];
  const [piData, setPieData] = useState(defaultPieData);

  const [startDateForChart, setStartDateForChart] = useState(
    getDecemberDates()?.startDate
  );
  const [endDateForChart, setEndDateForChart] = useState(
    getDecemberDates()?.endDate
  );
  // Add effect to update query dates when filters change
  useEffect(() => {
    if (startDateFilter && endDateFilter) {
      setStartDateForChart(moment(startDateFilter).format("YYYY-MM"));
      setEndDateForChart(moment(endDateFilter).format("YYYY-MM"));
    }
  }, [startDateFilter, endDateFilter]);

  const {
    data: teacherAttendenceChart,
    isFetching: teacherAttendenceLoaderChart,
  } = useGetTeacherAttendanceChartQuery(
    {
      startDateForChart,
      endDateForChart,
      peopleId,
      summeryFor,
    },
    {
      skip:
        !startDateForChart ||
        !endDateForChart ||
        moment(startDateForChart).year() !== moment(endDateForChart).year(),
    }
  );

  useEffect(() => {
    if (teacherAttendenceChart) {
      const gettingData = teacherAttendenceChart?.data;

      const findDataSet =
        gettingData?.length &&
        gettingData.find(
          (item) =>
            moment(item?.year_month).format("YYYY-MM") === startDateForChart ||
            moment(item?.year_month).format("YYYY-MM") === endDateForChart
        );
      if (findDataSet) {
        const updatedData = defaultPieData.map((item) => {
          const match = findDataSet.event_participation_aggregated_columns.find(
            (col) =>
              col.event_participation_aggregated_column_name_id &&
              col.event_participation_aggregated_column_name_id.name ===
                item.type
          );
          return {
            ...item,
            value: match ? match.value : 0,
          };
        });
        setPieData([...updatedData]);
      } else {
        setPieData([...defaultPieData]);
      }
    }
  }, [teacherAttendenceChart]);

  return (
    <div className="item bg-white shadow-custom-effect xl:px-6 xl:pt-8  xl:pb-4  p-3 rounded-[12px]">
      <div className="flex  justify-between  mb-3 ">
        <div>
          <h3 className="md:text-2xl text-lg mb-2 font-bold text-black">
            Attendance Summary
          </h3>
          <p className="font-bold text-14 md:text-16">
            {moment(startDateForChart).format("MMMM YYYY")} -{" "}
            {moment(endDateForChart).format("MMMM YYYY")}
          </p>
        </div>
        <div>
          <AttendanceFilterDropdown
            dynamicButtonText={false}
            setStartDate={setStartDateFilter}
            setEndDate={setEndDateFilter}
            setStartFullMonth={setStartFullMonthFilter}
            setEndFullMonth={setEndFullMonthFilter}
            resetFilterHandler={resetFilterHandler}
          />
        </div>
      </div>
      <div className="grid pi-grid lg:grid-cols-2 grid-cols-1 gap-3 items-center ">
        <div className="item flex flex-col ">
          {piData.map((item, index) => (
            <div
              key={index}
              className="flex  justify-start items-center gap-2 "
            >
              <div
                className={`indicator w-[12px] h-[12px] rounded-full `}
                style={{ background: item.fill }}
              ></div>
              <p className="text-10 text-[#080D1C] tracking-wide ">
                {item.name}
              </p>
              <p className="text-12 font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="item">
          <Donut
            data={piData}
            width={200}
            height={200}
            titleTop="Total"
            titleBottom="Work Days"
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummaryChart;
