"use client";
import AccessBtn from "@/components/ClassManagement/accessBtn";
import ClassTopCard from "@/components/ClassManagement/classTopCard";
import EventCard from "@/components/ClassManagement/eventCard";
import { Dropdown, Input, Pagination, Space, Tooltip } from "antd";
import { IoSearch } from "react-icons/io5";
import { debounce } from "lodash";
import { MdKeyboardArrowDown } from "react-icons/md";
import { BookOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  useGetClassesQuery,
  useGetGroupsQuery,
  useLazyGetClassesQuery,
} from "@/store/features/class-management/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import ClassListItem from "@/components/ClassManagement/ClassListItem";
import { easyAccess, events } from "@/data/DashboardData";
import { ThreeDotsSvg } from "@/components/helpers/storeAllSvgs";
import InputDropdown from "@/components/common/Inputs/Input/InputDropdown";
import Link from "next/link";
import { useClassDashboardCountQuery } from "@/store/features/dashboard/apiSlice";
import { DashboardCountConstant } from "@/constants/dashboardCountConstant";
const {
  TOTAL_COMPLETE_CLASSES,
  TOTAL_INCOMPLETE_CLASS,
  TOTAL_GIRL_STUDENTS,
  TOTAL_BOY_STUDENTS,
  TOTAL_STUDENTS,
  TOTAL_TEACHER_ON_LEAVE,
  TOTAL_TEACHERS,
} = DashboardCountConstant;

// parent components
const Classes = () => {
  // search feature
  const [queryString, setQueryString] = useState("");
  const [filterByClass, setfilterByClass] = useState("");
  // set default page
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const observer = useRef(null);
  // class states
  const [classes, setClasses] = useState([]);

  const limit = 50;

  // dashboard dummy datamatrix
  const [data, setData] = useState([
    {
      value: 0,
      title: "Total Class",
      value1: 0,
      title1: "Complete",
      value2: 0,
      title2: "Incomplete",
      color1: "#60EC6E",
      color2: "#C3B091",
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
      title: "Teacher",
      value1: 0,
      title1: "Active",
      value2: 0,
      // title2: "On Leave",
      color1: "#9CB4CC",
      // color2: "#C3B091",
    },
  ]);

  const { data: fetchClasses, isFetching: loadingClasses } = useGetClassesQuery(
    {
      page: pageRef.current,
      limit: limit,
      searchTerm: queryString,
      filter: filterByClass,
    }
  );

  useEffect(() => {
    if (!loadingClasses && fetchClasses) {
      // console.log(fetchClasses?.data);
      setClasses((prev) =>
        pageRef.current === 1
          ? fetchClasses?.data
          : [...prev, ...fetchClasses?.data]
      );
      setHasMore(
        fetchClasses?.data?.length > 0 &&
          pageRef.current * limit < fetchClasses?.meta?.total
      );
    }
  }, [fetchClasses, loadingClasses]);

  // Get count matrix data
  const { data: matrixData, isFetching: matrixDataFetching } =
    useClassDashboardCountQuery();
  // Get all data
  const { data: fetchGroups } = useGetGroupsQuery({
    page: 1,
    limit: 999,
  });
  // Get all classes data
  const [getClass, { data: queryData, isFetching: queryLoading }] =
    useLazyGetClassesQuery();

  // useEffect to set data for class top card
  useEffect(() => {
    if (!matrixDataFetching && matrixData) {
      const apiData = matrixData?.data?.aggregated_metrics || [];

      const getValue = (name) =>
        apiData.find((item) => item.aggregated_column_name_id.name === name)
          ?.value || 0;

      const totalCompletedClass = getValue(TOTAL_COMPLETE_CLASSES);
      const totalIncompleteClass = getValue(TOTAL_INCOMPLETE_CLASS);
      const totalClasses = totalCompletedClass + totalIncompleteClass;

      const totalBoyStudent = getValue(TOTAL_BOY_STUDENTS);
      const totalGirlStudent = getValue(TOTAL_GIRL_STUDENTS);
      const totalStudents = getValue(TOTAL_STUDENTS);

      const totalTeachers = getValue(TOTAL_TEACHERS);
      const teachersOnLeave = getValue(TOTAL_TEACHER_ON_LEAVE);
      const activeTeachers = Math.max(0, totalTeachers - teachersOnLeave);
      const totalTeachersForDisplay = activeTeachers + teachersOnLeave;

      const updatedData = [
        {
          value: totalClasses,
          title: totalClasses > 1 ? "Total Classes" : "Total Class",
          value1: totalCompletedClass,
          title1: "Complete",
          value2: totalIncompleteClass,
          title2: "Incomplete",
          color1: "#60EC6E",
          color2: "#C3B091",
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
          value: totalTeachers,
          title: totalTeachers > 1 ? "Teachers" : "Teacher",
          value1: activeTeachers - teachersOnLeave,
          title1: "Active",
          value2: teachersOnLeave,
          title2: "On Leave",
          color1: "#9CB4CC",
          color2: "#C3B091",
        },
      ];

      setData(updatedData);
    }
  }, [matrixData, matrixDataFetching]);

  // Add the intersection observer callback
  const lastItemRef = useCallback(
    (node) => {
      if (loadingClasses || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingClasses) {
          if (classes.length < fetchClasses?.meta?.total) {
            pageRef.current += 1;
            getClass({
              page: pageRef.current,
              limit,
              searchTerm: queryString,
              filter: filterByClass,
            });
          } else {
            setHasMore(false);
          }
        }
      });

      if (node) observer.current.observe(node);
    },
    [
      loadingClasses,
      hasMore,
      queryString,
      filterByClass,
      classes.length,
      fetchClasses?.meta?.total,
    ]
  );

  // Modify the search handler
  const debouncedSearch = useCallback(
    debounce((query) => {
      pageRef.current = 1;
      setHasMore(true);
      setClasses([]);
      getClass({
        searchTerm: query,
        page: 1,
        limit,
        filter: filterByClass,
      });
    }, 500),
    [filterByClass]
  );

  // Modify the filter handler
  const handleFilterByDepartment = (value) => {
    setfilterByClass(value);
    pageRef.current = 1;
    setHasMore(true);
    setClasses([]);
    getClass({
      page: 1,
      limit,
      searchTerm: queryString,
      filter: value,
    });
  };

  // Handle input change
  const searchHandler = (e) => {
    const newQuery = e.target.value;
    setQueryString(newQuery);
    debouncedSearch(newQuery);
  };

  const getAttendanceValue = (columns, type) => {
    const found = columns?.find(
      (col) => col.event_participation_aggregated_column_name_id?.name === type
    );
    return found ? found.value : 0;
  };

  return (
    <>
      <div className="grid lg:grid-cols-12 grid-cols-1 lg:gap-4 gap-y-4 ">
        <div className=" lg:col-span-9 h-full">
          <div
            className=" bg-[#E7F7FF] h-full flex justify-center items-center w-full rounded-[12px] class-card"
            style={{ backgroundImage: "url(../assets/img/caligraphy.svg)" }}
          >
            <div className="flex xl:flex-row flex-col justify-between items-center w-full lg:p-0 py-10">
              <div className="w-full grid lg:grid-cols-3  grid-cols-1 gap-8 lg:gap-0 items-center  ">
                {data.map((item, index) => (
                  <ClassTopCard key={index} data={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 ">
          <div className="card  rounded-[12px]   bg-[#E7F7FF] px-6 pt-6 pb-[6px]">
            <p className="font-bold text-14 tracking-wider">Easy Access</p>

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
      <div className="grid 2xl:grid-cols-12  grid-cols-1 mt-8 2xl:gap-4  gap-y-4 ">
        <div className="col-span-4 h-full order-2 2xl:order-1  mb-6">
          <div className="card h-full py-8 lg:px-10 px-4 bg-[#E7F7FF] rounded-[12px] relative overflow-hidden ">
            <div
              className="absolute inset-0 rounded-[12px] "
              style={{
                background:
                  "linear-gradient(180deg, rgba(231,247,255,0) 0%, #E7F7FF 65.92%)",
              }}
            />
            <p className="text-2xl lg:text-left text-center font-bold">
              2024-25 School Year
            </p>

            <div className="line mt-6 mb-2 w-full h-[1px] bg-[#CBEEFF]"></div>
            <div className="flex lg:flex-row flex-col justify-between items-center">
              <p className="font-bold">Upcoming Events</p>
              <p className="text-xs">
                Tue, 26 Mar 2024 | 13 Safar 1446 | 9:30 pm
              </p>
            </div>

            {/* events */}
            <div className="events mt-4 h-[440px] overflow-y-auto">
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

            <div className="absolute left-1/2 bottom-36 transform -translate-x-1/2 z-10 text-center pointer-events-auto w-full ">
              <p className="text-2xl font-bold text-black flex items-center gap-1 justify-center">
                Coming Soon
                <Tooltip
                  title="This section is not functional yet. The academic calendar will launch soon, allowing you to plan your year effectively."
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
            <div className=" absolute bottom-0 left-0 w-full bg-[#B6BFF0] rounded-b-[12px] px-6 py-8 flex justify-end items-center z-30">
              <button
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-base"
                style={{
                  background: "#C9CDD5",
                  color: "#fff",
                  border: "none",
                  cursor: "inherit",
                }}
              >
                <BookOutlined />
                View Calendar
              </button>
            </div>
          </div>
        </div>
        <div className="col-span-8 h-full order-1 2xl:order-2">
          <div className="card py-8 px-3 h-full shadow-md bg-white rounded-[12px]">
            <div className="flex lg:flex-row xl:flex-wrap flex-col pb-5 lg:justify-between items-start lg:items-center gap-2 border-b  border-primary-brand-100">
              <p className="text-2xl font-bold lg:ml-3 m-2 ">Classes</p>
              <div className="right flex lg:flex-nowrap xl:flex-wrap lg:justify-end xl:justify-start items-center gap-3 ">
                {/* --------action btns----- */}
                {/* search box */}
                <div className="flex gap-2 items-center">
                  <div className=" h-[36px] xl:min-w-[290px] flex-1 rounded border border-primary-brand-500 relative">
                    {/* search input */}
                    <input
                      value={queryString}
                      onChange={(e) => searchHandler(e)}
                      placeholder="Search..."
                      type="text"
                      className="w-full h-full pl-[40px] pr-5 text-primary-brand-900 placeholder:text-primary-brand-300 text-16 tracking-wide rounded"
                    />
                    {/* search icon */}
                    <span className="absolute left-[10px] top-1/2 transform -translate-y-1/2 text-2xl font-light text-primary-brand-600">
                      <IoSearch />
                    </span>
                  </div>
                  <div className="flex-1">
                    <InputDropdown
                      placeholder="By Department"
                      classStyle={" min-w-[185px]"}
                      options={fetchGroups?.data?.map((grp) => ({
                        value: grp?.name,
                        label: grp?.name,
                      }))}
                      onChange={(e) => handleFilterByDepartment(e.target.value)}
                    />
                  </div>
                </div>
                <div className=" flex gap-2 border-black ">
                  <Link href="/classes/create">
                    <button className=" border border-slate-600 py-[4px] px-5  rounded-lg flex items-center justify-center gap-center gap-2 cursor-pointer">
                      <img
                        src="../../../../assets/img/icons/acc-plus.svg"
                        alt=""
                      />
                      <span className="text-black font-bold text-16">
                        Create Class
                      </span>
                    </button>
                  </Link>
                  <Link href="/classes/lists">
                    <button className=" bg-black py-[5px] px-5 rounded-lg flex items-center justify-center  gap-center gap-2 cursor-pointer">
                      <img
                        src="/assets/img/icons/open book.png"
                        alt="All classes icon"
                        className="w-4 h-4 inline-block"
                      />
                      <span className="text-white font-bold">All Classes</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            {fetchClasses && !loadingClasses ? (
              <div className=" sm:overflow-auto ">
                <div
                  className={`sm:block hidden ${
                    classes && classes.length > 0
                      ? "overflow-auto h-[500px]"
                      : ""
                  }`}
                >
                  <table className="w-full">
                    <thead className="bg-white sticky top-0 z-10 shadow-sm">
                      <tr className="text-gray-700 text-left">
                        <th className="px-4 py-6 font-semibold min-w-[200px]">
                          Class Name
                        </th>
                        <th className="px-4 py-6 font-semibold min-w-[124px]">
                          Class ID
                        </th>
                        <th className="px-4 py-6 font-semibold min-w-10">
                          Students
                        </th>
                        <th className="px-4 py-6 font-semibold min-w-10">
                          On Leave
                        </th>
                        <th className="px-4 py-6 font-semibold min-w-10">
                          <div className="flex items-center gap-1">
                            Absent
                            <Tooltip title="In the last class" color="white">
                              <img
                                src="/assets/img/icons/help.svg"
                                className="w-5 h-5 "
                                alt="Help Icon"
                              />
                            </Tooltip>
                          </div>
                        </th>
                        <th className="px-4 py-6 font-semibold min-w-10">
                          Alerts
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {classes && classes.length > 0 ? (
                        classes.map((item, itemIndex) => {
                          const columns =
                            item.attendance_aggregated_data
                              ?.event_participation_aggregated_columns || [];

                          const absent = getAttendanceValue(columns, "absent");
                          const leave = getAttendanceValue(columns, "leave");

                          return (
                            <tr
                              key={itemIndex}
                              ref={
                                itemIndex === classes.length - 1
                                  ? lastItemRef
                                  : null
                              }
                              className="border-y border-primary-brand-100"
                            >
                              <Link href={`/classes/lists/${item?.id}`}>
                                <td className="px-4 py-6 hover:text-primary-brand-500">
                                  {item?.class_name}
                                </td>
                              </Link>
                              <td className="px-4 py-6">{item?.class_id}</td>
                              <td className="px-4 py-6">
                                {Number(
                                  item?.class_aggregated_data
                                    ?.total_boy_student || 0
                                ) +
                                  Number(
                                    item?.class_aggregated_data
                                      ?.total_girl_student || 0
                                  )}
                              </td>
                              <td className="px-4 py-6">{leave}</td>
                              <td className="px-4 py-6">{absent}</td>
                              <td className="px-4 py-6">-</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-8 py-36 text-center text-gray-500 text-2xl"
                          >
                            <div className="flex flex-col items-center justify-center gap-8">
                              <div className="text-lg text-gray-500 max-w-xl">
                                {queryString
                                  ? "No classes match your search."
                                  : filterByClass
                                  ? "No classes found for this department."
                                  : "You haven't created any class yet. Please do so at your earliest convenience."}
                              </div>
                              <Link href="/classes/create">
                                <img
                                  src="../../../../assets/img/icons/plus-square.svg"
                                  alt="Create class icon"
                                  className="w-24 h-24 opacity-60"
                                />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* -----card for small device----------- */}
                <div className="sm:hidden visible ">
                  {classes &&
                    classes.length > 0 &&
                    classes.map((item, itemIndex) => (
                      <ClassListItem key={itemIndex} data={item} />
                    ))}
                  {/* <button className="w-full mt-3 py-2 border-2 border-[#22252B] rounded-lg text-black font-semibold">
          View More
        </button> */}
                </div>

                {loadingClasses && (
                  <div className="flex justify-center ">
                    <SvgLoader />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center mt-4">
                <span>
                  <SvgLoader />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Classes;
