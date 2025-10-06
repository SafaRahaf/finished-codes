"use client";
import AccessBtn from "@/components/ClassManagement/accessBtn";
import EventCard from "@/components/ClassManagement/eventCard";
import { Tooltip } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  useClassCountMatrixQuery,
  useGetClassesQuery,
} from "@/store/features/class-management/apiSlice";
import TeacherTopCard from "@/components/TeacherManagement/TeacherTopCard";
import Donut from "@/components/charts/donut";
import { examNotice, easyAccess, events } from "@/data/DashboardData";
import { FilterSvg, ThreeDotsSvg } from "@/components/helpers/storeAllSvgs";
import AllAttendanceSummeryChart from "@/components/attendance/AllAttendanceSummeryChart";
import { DashboardCountConstant } from "@/constants/dashboardCountConstant";
import { useDashboardUpdates } from "@/hooks/useDashboardUpdates";
const {
  TOTAL_COMPLETE_CLASSES,
  TOTAL_INCOMPLETE_CLASS,
  TOTAL_GIRL_STUDENTS,
  TOTAL_BOY_STUDENTS,
  TOTAL_TEACHER_ON_LEAVE,
  TOTAL_TEACHERS,
  TOTAL_STUDENTS,
  TOTAL_EMPLOYEES,
  TOTAL_STUFF,
} = DashboardCountConstant;

// parent components
const Dashboard = () => {
  // Add this hook to enable automatic updates
  useDashboardUpdates();
  // dashboard matrix
  const [data, setData] = useState([
    {
      value: 0,
      title: "Total Class",
      // value1: 0,
      // title1: "Complete",
      // value2: 0,
      // title2: "Incomplete",
      // color1: "#60EC6E",
      // color2: "#C3B091",
    },
    {
      value: 0,
      title: "Total Student",
      value1: 0,
      title1: "Boy",
      value2: 0,
      title2: "Girl",
      color1: "#9CB4CC",
      color2: "#C3B091",
    },
    {
      value: 0,
      title: "Total Employee",
      value1: 0,
      title1: "Teacher",
      value2: 0,
      title2: "Staff",
      color1: "#9CB4CC",
      color2: "#C3B091",
    },
  ]);

  const { data: matrixData, isFetching: matrixDataFetching } =
    useClassCountMatrixQuery();
  useEffect(() => {
    if (!matrixDataFetching && matrixData) {
      const apiData = matrixData?.data;

      // Class stats
      const getValue = (name) =>
        apiData.find((item) => item.aggregated_column_name_id.name === name)
          ?.value || 0;

      const totalCompletedClass = getValue(TOTAL_COMPLETE_CLASSES);
      const totalIncompleteClass = getValue(TOTAL_INCOMPLETE_CLASS);
      const totalGirlStudent = getValue(TOTAL_GIRL_STUDENTS);
      const totalBoyStudent = getValue(TOTAL_BOY_STUDENTS);
      const teachersOnLeave = getValue(TOTAL_TEACHER_ON_LEAVE);
      const allTeachers = getValue(TOTAL_TEACHERS);
      const totalEmployee = getValue(TOTAL_EMPLOYEES);
      const totalStuff = getValue(TOTAL_STUFF);
      const totalStudents = getValue(TOTAL_STUDENTS);

      const totalClasses = totalCompletedClass + totalIncompleteClass;
      const totalEmployees = totalEmployee;
      const totalStuffs = totalStuff;

      // console.log(apiData);

      const updatedData = [
        {
          value: totalClasses,
          title: totalClasses > 1 ? "Total Classes" : "Total Class",
          // value1: totalCompletedClass,
          // title1: "Complete",
          // value2: totalIncompleteClass,
          // title2: "Incomplete",
          // color1: "#60EC6E",
          // color2: "#C3B091",
        },
        {
          value: totalStudents,
          title: totalStudents > 1 ? "Total Students" : "Total Student",
          value1: totalBoyStudent,
          title1: totalBoyStudent > 1 ? "Boys" : "Boy",
          value2: totalGirlStudent,
          title2: totalGirlStudent > 1 ? "Girls" : "Girl",
          color1: "#9CB4CC",
          color2: "#C3B091",
        },
        {
          value: totalEmployees,
          title: totalEmployees > 1 ? "Total Employees" : "Total Employee",
          value1: allTeachers,
          title1: Number(allTeachers) > 1 ? "Teachers" : "Teacher",
          value2: totalStuffs,
          title2: totalStuffs > 1 ? "Staffs" : "Staff",
          color1: "#9CB4CC",
          color2: "#C3B091",
        },
      ];
      setData(updatedData);
    }
  }, [matrixData, matrixDataFetching]);
  // search feature
  const [queryString, setQueryString] = useState("");
  // set default page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  // fetch data
  const [classes, setClasses] = useState([]);
  const { data: fetchClasses, isFetching: loadingClasses } = useGetClassesQuery(
    { page: currentPage, limit: limit, searchTerm: queryString }
  );

  useEffect(() => {
    if (!loadingClasses && fetchClasses) {
      setClasses(fetchClasses?.data);
      setTotalPages(fetchClasses?.meta?.total);
    }
  }, [fetchClasses, loadingClasses]);

  const piData = [
    { name: "Total Budget", value: 90, fill: "#E7F7FF" },
    { name: "Tuitions & Fees", value: 220, fill: "#90C8AC" },
    { name: "Monthly Sadaqah", value: 180, fill: "#7F669D" },
    { name: "Irregular Donation", value: 100, fill: "#C3B091" },
  ];

  let students = "student";
  let teachers = "teacher";

  return (
    <div>
      <div className="grid lg:grid-cols-12 grid-cols-1 lg:gap-4 gap-y-4 ">
        <div className="left top-cards lg:col-span-9 h-full">
          <div
            className="card bg-[#E7F7FF] h-full flex justify-center items-center w-full rounded-[12px] class-card"
            style={{ backgroundImage: "url(../assets/img/caligraphy.svg)" }}
          >
            <div className="flex xl:flex-row flex-col justify-between items-center w-full lg:p-0 py-10">
              <div className="w-full grid lg:grid-cols-3  grid-cols-1 gap-8 lg:gap-0 items-center  ">
                {data.map((item, index) => (
                  <TeacherTopCard key={index} data={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="left lg:col-span-3 ">
          <div className="card  rounded-[12px]   bg-[#E7F7FF] px-6 pt-6 pb-[6px]">
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

      {/* second grid */}
      {/* ----------Pie chart------ */}
      <div className="grid 2xl:grid-cols-3  lg:grid-cols-2 md:grid-cols-1 grid-cols-1 mt-8 xl:gap-4 gap-6  gap-y-4 ">
        <AllAttendanceSummeryChart summeryFor={students} totalPeople={true} />
        <AllAttendanceSummeryChart summeryFor={teachers} totalPeople={true} />

        {/* --------Events--------- */}

        <div className="item  shadow-custom-effect xl:px-6 xl:py-6  p-3 rounded-[12px] bg-[#E7F7FF] relative pointer-events-none">
          <div
            className="absolute inset-0 rounded-[12px] "
            style={{
              background:
                "linear-gradient(180deg, rgba(231,247,255,0) 0%, #E7F7FF 65.92%)",
            }}
          />
          <div className="flex justify-between items-center  ">
            <h3 className="text-2xl font-bold text-black">
              2024-25 School Year
            </h3>
            <button className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black text-white font-medium text-sm ">
              <span className="text-lg">
                <CalendarOutlined />
              </span>
              View Calendar
            </button>
          </div>
          <div className="line mt-6 mb-2 w-full h-[1px] bg-[#CBEEFF]"></div>
          <div className="flex xl:flex-row flex-col justify-between items-center">
            <p className="font-bold">Upcoming Events</p>
            <p className="text-xs font-semibold">
              Tue, 26 Mar 2024 | 13 Safar 1446 | 9:30 pm
            </p>
          </div>

          <div className="events mt-4 h-[140px] overflow-y-auto ">
            {events.map((item, index) => (
              <EventCard
                key={index}
                color={item.color}
                title={item.title}
                date={item.date}
                hijriDate={item.hijriDate}
                time={item.time}
              />
            ))}
          </div>

          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 text-center pointer-events-auto">
            <p className="text-2xl font-bold text-black flex items-center gap-1">
              Coming Soon
              <Tooltip
                title="This section is not functional yet. The academic calendar will launch soon, allowing you to plan your year effectively."
                color="white"
              >
                <img src="/assets/img/icons/help.svg" className="help" alt="" />
              </Tooltip>
            </p>
          </div>
        </div>
        {/*--------------Yearly Budget------------- */}
        <div className="item bg-white xl:px-8 xl:py-8 p-3 rounded-[12px] shadow-custom-effect relative pointer-events-none ">
          <div
            className="absolute inset-0 rounded-[12px] z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.00) 0%, #FFF 65.92%)",
            }}
          />
          <div className="grid pi-grid lg:grid-cols-2 grid-cols-1 gap-3 items-center ">
            <div className=" flex flex-col gap-1 ">
              <h3 className="text-2xl font-bold text-black mb-4 ">
                Yearly Budget
              </h3>
              {piData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-start items-center gap-3 "
                >
                  <div
                    className={`indicator w-[12px] h-[12px] rounded-full`}
                    style={{ background: item.fill }}
                  ></div>
                  <p className="text-10 tracking-wider">{item.name}</p>
                  <p className="text-10 font-bold">{item.value}%</p>
                </div>
              ))}
            </div>
            <div className="item ">
              <Donut
                width={180}
                height={180}
                data={piData}
                titleBottom="Deficit"
              />
            </div>
          </div>
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2  text-center pointer-events-auto z-10">
            <p className="text-2xl font-bold text-black flex items-center gap-1">
              Coming Soon
              <Tooltip
                title="This section is not yet functional. We anticipate launching the finance module soon, InshaAllah. After its launch, you will be able to budget your yearly finances."
                color="white"
              >
                <img
                  src="/assets/img/icons/help.svg"
                  className="help"
                  alt="Help"
                />
              </Tooltip>
            </p>
          </div>
        </div>
        <div className="item bg-white shadow-custom-effect xl:px-6 rounded-[12px] xl:py-8 p-3 relative pointer-events-none">
          <div
            className="absolute inset-0 rounded-[12px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.00) 0%, #FFF 60.92%)",
            }}
          />
          <div className="flex top-filter justify-between items-center ">
            <h3 className="text-2xl font-bold text-black">
              Income for This Month
            </h3>
            <FilterSvg />
          </div>

          <div className="py-10 text-center">
            <h1 className="text-4xl font-bold">$ 12,567</h1>
            <p className="text-[#60EC6E] text-sm font-bold pt-5">
              {" "}
              <span className="text-[#60EC6E]"> ↑ </span> 0%
            </p>
          </div>

          <p className="text-xs flex justify-start items-center gap-3 text-flex">
            <span>Tuition & Fees - $0</span>
            <span>Zakat - $0</span>
            <span>General Donation - $0</span>
          </p>
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 text-center pointer-events-auto ">
            <p className="text-2xl font-bold text-black flex items-center gap-1">
              Coming Soon
              <Tooltip
                title="This section is not functional yet. We expect to launch the finance module soon, InshaAllah. After launch, you will be able to view your monthly income here."
                color="white"
              >
                <img
                  src="/assets/img/icons/help.svg"
                  className="help"
                  alt="Help"
                />
              </Tooltip>
            </p>
          </div>
        </div>
        {/* ----------NoticeBoard---------- */}
        <div className="item bg-white shadow-custom-effect xl:px-6 rounded-[12px] xl:py-8 p-3 relative pointer-events-none">
          <div
            className="absolute inset-0 rounded-[12px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.00) 0%, #FFF 65.92%)",
            }}
          />
          <h3 className="text-2xl font-bold text-black mb-4">Noticeboard</h3>

          {/* events */}
          <div className=" overflow-y-auto h-[180px] mt-4 ">
            {examNotice.map((item, index) => (
              <div
                key={index}
                className={` px-4 py-2  ${
                  index % 2 === 0 ? "bg-[#F1F3F5]" : ""
                }`}
              >
                <p className="font-medium">{item.title}</p>
                <div className="flex  items-center">
                  <p className="text-xs my-1 mr-1"> {item.time}</p>
                  <span> | </span>
                  <p className="text-xs ml-1">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 text-center pointer-events-auto">
            <p className="text-2xl font-bold text-black flex items-center gap-1">
              Coming Soon
              <Tooltip
                title="This section is not yet functional. We anticipate launching the HR Management module soon, after which you can use the noticeboard for notices."
                color="white"
              >
                <img
                  src="/assets/img/icons/help.svg"
                  className="help"
                  alt="Help"
                />
              </Tooltip>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
