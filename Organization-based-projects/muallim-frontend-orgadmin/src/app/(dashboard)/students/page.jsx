"use client";
import AccessBtn from "@/components/ClassManagement/accessBtn";
import "./students.css";
import { debounce } from "lodash";
import { Pagination, Tooltip } from "antd";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  useGetAllStudentsQuery,
  useClassCountMatrixQuery,
  useLazyGetAllStudentsQuery,
  useGetClassesQuery,
} from "@/store/features/class-management/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import TeacherTopCard from "@/components/TeacherManagement/TeacherTopCard";
import Donut from "@/components/charts/donut";
import { easyAccess } from "@/data/DashboardData";
import LeaderCard from "@/components/students/LeaderCard";
import { FilterSvg, ThreeDotsSvg } from "@/components/helpers/storeAllSvgs";
import StudentListDashborad from "../../../components/students/StudentDashboard/StudentListDashborad";
import AllAttendanceSummeryChart from "@/components/attendance/AllAttendanceSummeryChart";
import { useStudentDashboardCountQuery } from "@/store/features/dashboard/apiSlice";
import { DashboardCountConstant } from "@/constants/dashboardCountConstant";
import Link from "next/link";
import { PiBookOpenUserBold } from "react-icons/pi";
import StudentBulkUploadModal from "@/components/students/StudentBulkUpload";
const {
  TOTAL_COMPLETE_CLASSES,
  TOTAL_INCOMPLETE_CLASS,
  TOTAL_BOY_STUDENTS,
  TOTAL_GIRL_STUDENTS,
  TOTAL_STUDENTS,
  TOTAL_STUDNETS_ON_LEAVE,
} = DashboardCountConstant;

const piData = [
  { name: "Total Budget", value: 560, fill: "#90C8AC" },
  { name: "Tuitions & Fees", value: 220, fill: "#FEC98D" },
  { name: "Monthly Sadaqah", value: 150, fill: "#7895B2" },
  { name: "Irregular Donation", value: 20, fill: "#C3B091" },
];

const Students = () => {
  /**
   * student dashboard count for Student top card
   * default state  studentDashboardHeaderData
   * @param {object|array} studentDashboardHeaderData
   * @returns {object|array} studentDashboardHeaderData
   */
  const [studentDashboardHeaderData, setStudentDashboardHeaderData] = useState([
    {
      value: 0,
      title: "Total Classes",
      value1: 0,
      title1: "Complete",
      value2: 0,
      title2: "Incomplete",
      color1: "#60EC6E",
      color2: "#C3B091",
    },
    {
      value: 0,
      title: "Total Students",
      value1: 0,
      title1: "Boys",
      value2: 0,
      title2: "Girls",
      color1: "#9CB4CC",
      color2: "#C3B091",
    },
    {
      value: 0,
      title: "Teachers",
      value1: 0,
      title1: "Active",
      value2: 0,
      title2: "On Leave",
      color1: "#9CB4CC",
      color2: "#C3B091",
    },
  ]);

  const {
    data: studentDashboardCount,
    isFetching: studentDashboardCountLoading,
  } = useStudentDashboardCountQuery();

  useEffect(() => {
    if (!studentDashboardCountLoading && studentDashboardCount) {
      const apiData = studentDashboardCount?.data?.aggregated_metrics || [];

      const getValue = (name) =>
        apiData.find((item) => item.aggregated_column_name_id.name === name)
          ?.value || 0;

      const totalCompletedClass = getValue(TOTAL_COMPLETE_CLASSES);
      const totalIncompleteClass = getValue(TOTAL_INCOMPLETE_CLASS);
      const totalClasses = totalCompletedClass + totalIncompleteClass;

      const totalBoyStudent = getValue(TOTAL_BOY_STUDENTS);
      const totalGirlStudent = getValue(TOTAL_GIRL_STUDENTS);

      const activeStudents = getValue(TOTAL_STUDENTS);
      const studentsOnLeave = getValue(TOTAL_STUDNETS_ON_LEAVE);
      const totalStudentsForLeave = activeStudents + studentsOnLeave;

      setStudentDashboardHeaderData([
        {
          value: totalClasses,
          title: "Total Classes",
          value1: totalCompletedClass,
          title1: "Complete",
          value2: totalIncompleteClass,
          title2: "Incomplete",
          color1: "#60EC6E",
          color2: "#C3B091",
        },
        {
          value: activeStudents,
          title: "Total Students",
          value1: totalBoyStudent,
          title1: "Boys",
          value2: totalGirlStudent,
          title2: "Girls",
          color1: "#9CB4CC",
          color2: "#C3B091",
        },
        {
          value: 0,
          title: "New Applications",
        },
        {
          value: "$0",
          title: "October Tuition",
          value1: 0,
          title1: "Paid",
          value2: 0,
          title2: "Unpaid",
          color1: "green",
          color2: "red",
        },
      ]);
    }
  }, [studentDashboardCount, studentDashboardCountLoading]);

  const [queryString, setQueryString] = useState("");
  // set default page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  // fetch data
  const [StudentsByClass, setStudentsByClass] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const observer = useRef(null);

  const { data: matrixData, isFetching: matrixDataFetching } =
    useClassCountMatrixQuery();

  const { data: fetchClasses, isFetching: loadingClasses } = useGetClassesQuery(
    {
      page: 1,
      limit: 100,
    }
  );

  useEffect(() => {
    if (fetchClasses?.data) {
      setClasses(
        fetchClasses.data.map((cls) => ({
          label: cls.class_name,
          value: cls.id,
        }))
      );
    }
  }, [fetchClasses]);

  useEffect(() => {
    if (!matrixDataFetching && matrixData) {
      const apiData = matrixData?.data;
    }
  }, [matrixData, matrixDataFetching]);

  const { data: fetchStudents, isFetching: loadingStudents } =
    useGetAllStudentsQuery({
      page: currentPage,
      limit: limit,
      searchTerm: queryString,
      selectedClass,
    });
  const [
    getClassStudents,
    { data: queryDataStudents, isFetching: queryStudentsLoading },
  ] = useLazyGetAllStudentsQuery();

  useEffect(() => {
    if (fetchStudents && !loadingStudents) {
      if (pageRef.current === 1) {
        setStudentsByClass(fetchStudents?.data);
      } else {
        setStudentsByClass((prev) => [...prev, ...fetchStudents?.data]);
      }
      setHasMore(fetchStudents?.meta?.hasNextPage !== false);
    }
  }, [fetchStudents, loadingStudents]);

  useEffect(() => {
    if (queryDataStudents && !queryStudentsLoading) {
      // console.log("API Response:", {
      //   data: queryDataStudents?.data,
      //   meta: queryDataStudents?.meta,
      //   currentPage: pageRef.current,
      //   limit,
      //   hasNextPage: queryDataStudents?.meta?.hasNextPage,
      //   total: queryDataStudents?.meta?.total,
      // });

      if (pageRef.current === 1) {
        setStudentsByClass(queryDataStudents?.data);
      } else {
        setStudentsByClass((prev) => [...prev, ...queryDataStudents?.data]);
      }

      // Check if there are more pages based on data length and total
      const hasMoreData =
        queryDataStudents?.data?.length === limit &&
        queryDataStudents?.meta?.total > pageRef.current * limit;
      // console.log("HasMore calculation:", {
      //   dataLength: queryDataStudents?.data?.length,
      //   limit,
      //   total: queryDataStudents?.meta?.total,
      //   currentPage: pageRef.current,
      //   hasMoreData,
      // });

      setHasMore(hasMoreData);
      setTotalPages(queryDataStudents?.meta?.total);
    }
  }, [queryDataStudents, queryStudentsLoading, limit]);

  // change page
  const handleChangePage = (page) => {
    setCurrentPage(page);
  };
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      pageRef.current = 1;
      setHasMore(true);
      setStudentsByClass([]);
      getClassStudents({ searchTerm: query, page: 1, limit, selectedClass });
    }, 500),
    [limit, selectedClass]
  );

  // Handle input change
  const searchHandler = (e) => {
    const newQuery = e.target.value;
    setQueryString(newQuery);
    debouncedSearch(newQuery);
  };
  const handleModal = () => {
    setShowModal(!showModal);
  };

  const lastItemRef = useCallback(
    (node) => {
      if (loadingStudents || queryStudentsLoading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingStudents &&
          !queryStudentsLoading
        ) {
          pageRef.current += 1;
          getClassStudents({
            page: pageRef.current,
            limit,
            searchTerm: queryString,
            selectedClass,
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingStudents, queryStudentsLoading, hasMore, queryString, selectedClass]
  );

  useEffect(() => {
    pageRef.current = 1;
    setHasMore(true); // This is fine for initial load
    setStudentsByClass([]);
    getClassStudents({
      searchTerm: queryString,
      page: 1,
      limit,
      selectedClass,
    });
  }, [selectedClass]);

  // Add initial load effect
  useEffect(() => {
    // Initial load when component mounts
    pageRef.current = 1;
    setHasMore(true);
    setStudentsByClass([]);
    getClassStudents({
      searchTerm: "",
      page: 1,
      limit,
      selectedClass: "",
    });
  }, []); // Empty dependency array for initial load only

  let peopleId = "";
  let students = "student";

  return (
    <div>
      <div className="grid lg:grid-cols-12 grid-cols-1 lg:gap-4 gap-y-4 ">
        <div className=" lg:col-span-9 h-full">
          <div
            className=" bg-[#E7F7FF] h-full flex justify-center items-center w-full rounded-[12px] class-card"
            style={{ backgroundImage: "url(../assets/img/caligraphy.svg)" }}
          >
            <div className="flex xl:flex-row flex-col justify-between items-center w-full lg:p-0 py-10">
              <div className="w-full grid lg:grid-cols-4 grid-cols-1 gap-8 lg:gap-0 items-center  ">
                {studentDashboardHeaderData.map((item, index) => (
                  <TeacherTopCard key={index} data={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 ">
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
      {/* <div className=" justify-center md:justify-end gap-3 mt-4 flex  ">
        <Link href="/students/add">
          <button className=" border border-black  py-2 px-6  rounded-[8px] flex items-center justify-center  gap-center gap-2 cursor-pointer">
            <img src="../../../../assets/img/icons/acc-plus.svg" alt="" />
            <span className="text-black font-bold text-16">
              Add New Student
            </span>
          </button>
        </Link>
        <Link href="/students/list">
          <button className=" bg-black py-2 px-6  rounded-[8px] flex items-center justify-center  gap-center gap-2 cursor-pointer">
            <PiBookOpenUserBold className="text-white text-16" />
            <span className="text-white font-bold">Student List</span>
          </button>
        </Link>
      </div> */}

      {/* second panel */}
      <div className="grid grid-cols-1   lg:grid-cols-12 gap-y-4 lg:gap-4 mt-4 ">
        {/* -------Attendance & Behavior */}
        <div className="2xl:col-span-4 lg:col-span-12 ">
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-1 gap-4 h-full ">
            {/* Attendance Chart */}
            <AllAttendanceSummeryChart
              totalPeople={true}
              peopleId={peopleId}
              summeryFor={students}
            />
            {/* Behavior Chart */}
            <div className="item bg-white shadow-md xl:px-6  xl:py-6 p-3 rounded-[12px] relative">
              <div
                className="absolute inset-0 rounded-[12px] z-10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.00) 0%, #FFF 65.92%)",
                }}
              />
              <div className="flex top-filter justify-between items-center">
                <div>
                  <h3 className="text-2xl mb-2 font-bold text-black">
                    Students Behavior
                  </h3>
                  <p className="font-bold ">December 2023 - June 2024</p>
                </div>
                <FilterSvg />
              </div>
              <div className="grid pi-grid lg:grid-cols-2 grid-cols-1 gap-3 items-center ">
                <div className="item flex flex-col gap-1 ">
                  {piData.map((item, index) => (
                    <div
                      key={index}
                      className="flex  justify-start items-center gap-3"
                    >
                      <div
                        className={`indicator w-[12px] h-[12px] rounded-full `}
                        style={{ background: item.fill }}
                      ></div>
                      <p className="text-10 tracking-wider">{item.name}</p>
                      <p className="text-10 font-bold">{item.value}%</p>
                    </div>
                  ))}
                  <p className="m-2">
                    Total Students - <span className="font-bold">32</span>
                  </p>
                </div>

                <div className="item">
                  <div style={{ width: "200px", height: "200px" }}>
                    <Donut
                      data={piData}
                      titleTop="Total"
                      titleBottom="Class Days"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 z-10 text-center pointer-events-auto w-full ">
                <p className="text-2xl font-bold text-black flex items-center gap-1 justify-center">
                  Coming Soon
                  <Tooltip
                    title="This section is not functional yet. The Students Behavior will launch soon."
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

        {/* ------------Student Leader Card----------- */}
        <div className="2xl:col-span-3  xl:col-span-4 lg:col-span-5 relative pointer-events-none">
          <div
            className="absolute inset-0 rounded-[12px] z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.00) 0%, #FFF 65.92%)",
            }}
          />
          <div className="h-full shadow-md rounded-xl">
            {loadingStudents && !fetchStudents ? (
              <div className="flex justify-center mt-4">
                <SvgLoader />
              </div>
            ) : (
              <LeaderCard />
            )}
          </div>
          <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 z-10 text-center pointer-events-auto w-full ">
            <p className="text-2xl font-bold text-black flex items-center gap-1 justify-center">
              Coming Soon
              <Tooltip
                title="This section is not functional yet. Student Leader Card  will launch soon."
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

        {/* ------------Student List Table----------- */}
        <div className="2xl:col-span-5 xl:col-span-8 lg:col-span-7 w-full h-full">
          {/* ---------Student Bulk Upload Modal----------- */}
          <div className="flex justify-center md:justify-end gap-3 mb-2">
            <button
              onClick={handleModal}
              className="  px-4  rounded-[8px] border border-black flex items-center justify-center  gap-center gap-2 cursor-pointer "
            >
              <img src="../../../../assets/img/icons/acc-plus.svg" alt="" />
              <span className="text-black font-bold text-16">
                Add New Student
              </span>
            </button>
            <Link href="/students/list">
              <button className=" bg-black py-2 px-6  rounded-[8px] flex items-center justify-center  gap-center gap-2 cursor-pointer">
                <PiBookOpenUserBold className="text-white text-16" />
                <span className="text-white font-bold">Student List</span>
              </button>
            </Link>

            {showModal && (
              <StudentBulkUploadModal
                handleModal={handleModal}
              ></StudentBulkUploadModal>
            )}
          </div>
          <StudentListDashborad
            StudentsByClass={StudentsByClass}
            searchHandler={searchHandler}
            fetchStudents={fetchStudents}
            loadingStudents={loadingStudents}
            queryString={queryString}
            lastItemRef={lastItemRef}
            hasMore={hasMore}
            classes={classes}
            setSelectedClass={setSelectedClass}
            queryStudentsLoading={queryStudentsLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Students;
