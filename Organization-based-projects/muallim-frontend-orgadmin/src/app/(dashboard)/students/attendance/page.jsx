"use client";
import AccessBtn from "@/components/ClassManagement/accessBtn";
import ClassTopCard from "@/components/ClassManagement/classTopCard";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { easyAccess, events } from "@/data/DashboardData";
import AllAttendanceSummeryChart from "@/components/attendance/AllAttendanceSummeryChart";
import ClassListTable from "@/components/students/StudentAttendance/ClassListTable";
import InputFullDate from "@/components/common/Inputs/Input/InputFullDate";
import {
  useClassDashboardCountFilteredQuery,
  useClassDashboardCountQuery,
} from "@/store/features/dashboard/apiSlice";
import StudentAbsentList from "@/components/students/StudentAttendance/StudentAbsentList";
import { NextBtnSvg, PrevBtnSvg } from "@/components/helpers/storeAllSvgs";
import moment from "moment";

function mapDashboardData(dataArray) {
  const result = {};
  dataArray?.forEach((item) => {
    const key = item.aggregated_column_name_id?.name;
    if (key) result[key] = item.value;
  });
  return result;
}

function sumByName(dataArray, name) {
  return dataArray
    ?.filter((item) => item.aggregated_column_name_id?.name === name)
    .reduce((sum, item) => sum + Number(item.value || 0), 0);
}

// parent components
const StudentAttendance = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState([
    {
      value: 0,
      title: "Total Student",
      color1: "#60EC6E",
      value1: 0 + " Boys",
      color2: "#C3B091",
      value2: 0 + " Girls",
    },
    {
      value: 0,
      title: "Present",
    },
    {
      value: 0,
      title: "Absent",
    },
    {
      value: 0,
      title: "On Leave",
    },
    {
      value: 0,
      title: "Sick",
    },
  ]);

  const [totalStudents, setTotalStudents] = useState(0);

  const formattedDate = moment(currentDate).format("YYYY-MM-DD");

  const startDate = formattedDate;
  const endDate = formattedDate;

  const {
    data: classDashboardCount,
    isFetching: classDashboardCountDataFetching,
  } = useClassDashboardCountFilteredQuery({
    dataType: "daily",
    startDate: startDate,
    endDate: endDate,
  });

  useEffect(() => {
    if (classDashboardCount?.data?.aggregated_metrics) {
      const metrics = classDashboardCount.data.aggregated_metrics;
      const attendance =
        classDashboardCount.data.attendance_aggregated_data || [];

      // Total students
      const total_boy_student = sumByName(metrics, "total_boy_student");
      const total_girl_student = sumByName(metrics, "total_girl_student");
      const totalStudents = total_boy_student + total_girl_student;

      setTotalStudents(totalStudents);

      // Attendance states (use attendance array if exists, else default [])
      const present = sumByName(attendance, "attendance");
      const absent = sumByName(attendance, "absent");
      const onLeave =
        sumByName(attendance, "leave") +
        sumByName(metrics, "total_student_on_leave");
      const sick = sumByName(attendance, "sick_leave");

      const updatedData = [
        {
          value: totalStudents,
          title: totalStudents > 1 ? "Total Students" : "Total Student",
          value1: total_girl_student,
          title1: total_girl_student > 1 ? "Girls" : "Girl",
          value2: total_boy_student,
          title2: total_boy_student > 1 ? "Boys" : "Boy",
          color1: "#60EC6E",
          color2: "#C3B091",
        },
        { value: present, title: "Present" },
        { value: absent, title: "Absent" },
        { value: onLeave, title: "On Leave" },
        { value: sick, title: "Sick" },
      ];
      setData(updatedData);
    }
  }, [classDashboardCount, classDashboardCountDataFetching]);

  const handleDateChangeAndReset = (newDate) => {
    setCurrentDate(newDate);
  };

  const handlePreviousDay = () => {
    const newDate = moment(formattedDate).subtract(1, "day").toDate();
    handleDateChangeAndReset(newDate);
  };

  const handleNextDay = () => {
    const newDate = moment(formattedDate).add(1, "day").toDate();
    handleDateChangeAndReset(newDate);
  };

  return (
    <div className="">
      <div className="grid lg:grid-cols-12 grid-cols-1 lg:gap-3 gap-y-3">
        <div className=" lg:col-span-9 h-full">
          <div
            className=" bg-[#E7F7FF] h-full w-full rounded-[12px] class-card"
            style={{ backgroundImage: "url(../assets/img/caligraphy.svg)" }}
          >
            <div className="p-6 w-72 flex gap-2">
              <InputFullDate
                dailyView={true}
                defaultValue={formattedDate}
                handler={(date) => {
                  if (date) {
                    handleDateChangeAndReset(date);
                  }
                  setShowDatePicker(false);
                }}
              />{" "}
              <div className="flex pr-1 gap-2">
                <button onClick={handlePreviousDay}>
                  <PrevBtnSvg height={28} />
                </button>

                <button onClick={handleNextDay}>
                  <NextBtnSvg height={28} />
                </button>
              </div>
            </div>
            <div className="flex xl:flex-row flex-col justify-between items-center w-full lg:p-0 py-8 mt-3">
              <div className="w-full grid lg:grid-cols-5 grid-cols-1 gap-8 lg:gap-0 items-center">
                {data.map((item, index) => (
                  <ClassTopCard key={index} data={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="left lg:col-span-3 ">
          <div className="card  rounded-[12px] bg-[#E7F7FF] px-6 pt-6 pb-[6px]">
            <p className="font-bold text-14 tracking-wider  ">Easy Access</p>

            <div className="mt-[10px] mb-4   bg-[#CBEEFF] h-[1px] w-full "></div>

            <div className=" overflow-y-scroll h-[190px] pr-1 custom-scrollbar mb-1 ">
              {easyAccess.map((item, index) => (
                <AccessBtn
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  link={item.link}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid 2xl:grid-cols-12  grid-cols-1 mt-8 2xl:gap-4 gap-y-4 ">
        <div className="col-span-4">
          <AllAttendanceSummeryChart
            studentAttendanceDate={startDate}
            summeryFor="student"
            studentCount={totalStudents}
          />
          <StudentAbsentList startDate={startDate} endDate={endDate} />
        </div>
        <div className="col-span-8 h-full">
          <ClassListTable attendanceDetailsDate={startDate} />
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
