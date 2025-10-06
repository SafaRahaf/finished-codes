"use client";
import Donut from "@/components/charts/donut";
import { useState, useEffect } from "react";
import { useGetAllAttendanceChartQuery } from "@/store/features/teacher-management/apiSlice";
import moment from "moment";
import AttendanceFilterDropdown from "../TeacherManagement/teacherProfile/AttendanceFilterDropdown";
import { ATTENDANCE_TYPE } from "@/constants/attendenceType";
const {
  EARLY_LEAVE,
  TARDY,
  ATTENDANCE,
  WORK_ON_WEEKEND,
  EARLY_IN,
  LATE_LEAVE,
  ABSENT,
  EXCUSED_ABSENT,
  UNEXCUSED_ABSENT,
  ON_TIME,
  EARNED_LEAVE,
  SICK_LEAVE,
  CASUAL_LEAVE,
} = ATTENDANCE_TYPE;

const AllAttendanceSummeryChart = ({
  peopleId,
  summeryFor = "teacher",
  totalPeople = false,
  studentCount,
  studentAttendanceDate,
}) => {
  // filter Option state
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

  const getDecemberDates = () => {
    const currentYear = moment().year();
    const startDate = moment(`${currentYear}-01-01`).format("YYYY-MM-DD");
    const endDate = moment(`${currentYear}-12-31`)
      .endOf("month")
      .format("YYYY-MM-DD");

    return {
      startDate,
      endDate,
    };
  };
  // pie chart
  const defaultPieData = [
    // { type: CASUAL_LEAVE, name: "Casual Leave", value: 0, fill: "#FEC98D" },
    { type: ON_TIME, name: "On Time", value: 0, fill: "#90C8AC" },
    {
      type: ATTENDANCE,
      name: "Attendance",
      value: 0,
      fill: "#7895B2",
    },
    // { type: SICK_LEAVE, name: "Sick Leave", value: 0, fill: "#7895B2" },
    ...(summeryFor === "teacher"
      ? [
          {
            type: CASUAL_LEAVE,
            name: "Casual Leave",
            value: 0,
            fill: "#FEC98D",
          },
          { type: SICK_LEAVE, name: "Sick Leave", value: 0, fill: "#7895B2" },
          {
            type: EARNED_LEAVE,
            name: "Earned Leave",
            value: 0,
            fill: "#C3B091",
          },
          { type: ABSENT, name: "Absent", value: 0, fill: "#F95656" },
        ]
      : []),
    ...(summeryFor === "student"
      ? [
          {
            type: EXCUSED_ABSENT,
            name: "Excused Absence",
            value: 0,
            fill: "#FEC98D",
          },
          {
            type: UNEXCUSED_ABSENT,
            name: "Unexcused Absent",
            value: 0,
            fill: "#F95656",
          },
        ]
      : []),
    { type: TARDY, name: "Tardy", value: 0, fill: "#FDAE51" },
    { type: EARLY_LEAVE, name: "Early Leave", value: 0, fill: "#7F669D" },
    ,
  ];
  const [piData, setPieData] = useState(defaultPieData);
  const [totalAttendance, setTotalAttendance] = useState(0);

  const [startDateForChart, setStartDateForChart] = useState(
    getDecemberDates()?.startDate
  );
  const [endDateForChart, setEndDateForChart] = useState(
    getDecemberDates()?.endDate
  );

  useEffect(() => {
    if (startDateFilter && endDateFilter) {
      setStartDateForChart(moment(startDateFilter).format("YYYY-MM-DD"));
      setEndDateForChart(moment(endDateFilter).format("YYYY-MM-DD"));
    }
  }, [startDateFilter, endDateFilter]);

  const { data: allAttendenceChart, isFetching: teacherAttendenceLoaderChart } =
    useGetAllAttendanceChartQuery(
      {
        startDateForChart,
        endDateForChart,
        summeryFor,
        studentAttendanceDate,
        peopleId,
      },
      {
        skip:
          !startDateForChart ||
          !endDateForChart ||
          moment(startDateForChart).year() !== moment(endDateForChart).year(),
      }
    );

  useEffect(() => {
    if (allAttendenceChart) {
      let gettingData = allAttendenceChart?.data;

      if (summeryFor === "student") {
        const seen = new Set();
        const stData = [];
        gettingData.forEach((item) => {
          const day = moment(item.created_at).format("YYYY-MM-DD");
          const key = `${item.class_id}_${day}`;
          if (!seen.has(key)) {
            stData.push(item);
            seen.add(key);
          }
        });
        gettingData = stData;
      }

      const typeTotals = {};
      defaultPieData.forEach((item) => {
        typeTotals[item.type] = 0;
      });

      const apiToTypeMap = {
        on_time: ON_TIME,
        attendance: ATTENDANCE,
        early_leave: EARLY_LEAVE,
        tardy: TARDY,
        excused_absence: EXCUSED_ABSENT,
        unexcused_absence: UNEXCUSED_ABSENT,
        sick_leave: SICK_LEAVE,
        casual_leave: CASUAL_LEAVE,
        earned_leave: EARNED_LEAVE,
        absent: ABSENT,
      };

      gettingData?.forEach((person) => {
        person?.event_participation_aggregated_columns?.forEach((col) => {
          const apiName =
            col?.event_participation_aggregated_column_name_id?.name;
          if (!apiName) return;
          const mappedType = apiToTypeMap[apiName];
          if (mappedType && typeTotals.hasOwnProperty(mappedType)) {
            typeTotals[mappedType] += col.value;
          }
        });
      });

      const totalAttendance = Object.values(typeTotals).reduce(
        (acc, val) => acc + val,
        0
      );

      setTotalAttendance(totalAttendance);

      const updatedData = defaultPieData?.map((item) => ({
        ...item,
        value: typeTotals[item.type] || 0,
      }));

      setPieData(updatedData);
    } else {
      setPieData([...defaultPieData]);
      setTotalAttendance(0);
    }
  }, [allAttendenceChart]);

  const allAttendenceTotalPeople = allAttendenceChart?.meta?.total_people;
  // const totalDay = allAttendenceChart?.data[0].total_day;
  // const totalDay = allAttendenceChart?.data?.reduce((sum, item) => {
  //   return sum + (item.total_day || 0);
  // }, 0);

  function getUniqueClassMonthTotalDays(data) {
    const seen = new Set();
    const unique = [];
    data.forEach((item) => {
      const key = `${item.class_id}_${item.year_month}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });
    return unique;
  }

  const uniqueClassMonthData = allAttendenceChart?.data
    ? getUniqueClassMonthTotalDays(allAttendenceChart.data)
    : [];

  const totalDay = uniqueClassMonthData.reduce(
    (sum, item) => sum + (item.total_day || 0),
    0
  );

  const peopleTotalDay = allAttendenceChart?.data?.reduce(
    (sum, item) => sum + (item.total_day || 0),
    0
  );

  const totalWorkDay = allAttendenceChart?.meta?.total_org_working_day;

  return (
    <div className="item bg-white shadow-md xl:px-6 xl:pt-8  xl:pb-4  p-3 rounded-[12px]">
      <div className="flex justify-between">
        <div>
          <h3 className="md:text-2xl text-lg mb-2 font-bold text-black">
            {peopleId
              ? "Attendance Summary"
              : summeryFor === "teacher"
              ? "Teachers Attendance"
              : summeryFor === "student"
              ? "Students Attendance"
              : "Attendance Summary"}
          </h3>
          {!studentAttendanceDate && (
            <p className="font-bold text-14 md:text-16">
              {moment(startDateForChart).format("MMMM YYYY")} -{" "}
              {moment(endDateForChart).format("MMMM YYYY")}
            </p>
          )}
        </div>
        <div>
          {studentCount ? (
            <></>
          ) : (
            <AttendanceFilterDropdown
              dynamicButtonText={false}
              setStartDate={setStartDateFilter}
              setEndDate={setEndDateFilter}
              setStartFullMonth={setStartFullMonthFilter}
              setEndFullMonth={setEndFullMonthFilter}
              resetFilterHandler={resetFilterHandler}
            />
          )}
        </div>
      </div>
      <div className="grid pi-grid lg:grid-cols-2 grid-cols-1 gap-3 items-center ">
        <div className="item flex flex-col ">
          {piData?.map((item, index) => {
            const percent =
              totalAttendance > 0
                ? ((item.value / totalAttendance) * 100).toFixed(1)
                : 0;
            return (
              <div
                key={index}
                className="flex  justify-start items-center gap-2 "
              >
                <div
                  className={`indicator w-[12px] h-[12px] rounded-full `}
                  style={{ background: item?.fill }}
                ></div>
                <p className="text-10 text-[#080D1C] tracking-wide ">
                  {item?.name}
                </p>
                <p className="text-12 font-bold text-gray-700">{percent} %</p>
                {/* <p className="text-12 text-gray-500 ml-1">({item.value})</p> */}
              </div>
            );
          })}

          {totalPeople && (
            <div className="pt-2">
              Total {summeryFor === "teacher" ? "Teachers" : "Students"} :{" "}
              {allAttendenceTotalPeople}
            </div>
          )}
        </div>

        <div className="item">
          <Donut
            studentCount={studentCount}
            totalWorkDay={peopleId ? peopleTotalDay : totalWorkDay}
            totalDay={totalDay}
            data={piData}
            width={200}
            height={200}
            titleTop="Total"
            titleBottom={
              summeryFor === "teacher"
                ? "Work Days"
                : summeryFor === "student" && !studentCount
                ? "Class Days"
                : studentCount
                ? "Students"
                : ""
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AllAttendanceSummeryChart;
