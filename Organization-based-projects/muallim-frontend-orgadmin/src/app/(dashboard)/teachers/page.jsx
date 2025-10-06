"use client";
import AccessBtn from "@/components/ClassManagement/accessBtn";
import { debounce } from "lodash";
import React, { useState, useEffect, useCallback } from "react";
import {
  useGetClassesQuery,
  useLazyGetClassesQuery,
} from "@/store/features/class-management/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import TeacherTopCard from "@/components/TeacherManagement/TeacherTopCard";
import LeaveAndMoveListItem from "@/components/TeacherManagement/LeaveAndMoveListItem";
import { easyAccess } from "@/data/DashboardData";
import Link from "next/link";
import AllAttendanceSummeryChart from "@/components/attendance/AllAttendanceSummeryChart";
import { useTeacherDashboardCountQuery } from "@/store/features/dashboard/apiSlice";
import { DashboardCountConstant } from "@/constants/dashboardCountConstant";
import TeacherBulkUpload from "@/components/TeacherManagement/TeacherBulkUpload";

const {
  TOTAL_COMPLETE_CLASSES,
  TOTAL_INCOMPLETE_CLASS,
  TOTAL_TEACHER_ON_LEAVE,
  TOTAL_TEACHERS,
} = DashboardCountConstant;

// parent components
const Teachers = () => {
  // search feature
  const [queryString, setQueryString] = useState("");
  // set default page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 5;

  // fetch data
  const [classes, setClasses] = useState([]);
  const { data: fetchClasses, isFetching: loadingClasses } = useGetClassesQuery(
    { page: currentPage, limit: limit, searchTerm: queryString }
  );
  const [getClass, { data: queryData, isFetching: queryLoading }] =
    useLazyGetClassesQuery();

  useEffect(() => {
    if (!loadingClasses && fetchClasses) {
      setClasses(fetchClasses?.data);
      setTotalPages(fetchClasses?.meta?.total);
    }
  }, [fetchClasses, loadingClasses]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      getClass({ searchTerm: query, page: currentPage, limit });
    }, 500),
    [currentPage, limit]
  );

  let teachers = "teacher";
  // teacher dashboard count for Teacher top card

  /**
   * teacher dashboard count for Teacher top card
   * default state  TeacherDashboardHeaderData
   * @param {object|array} teacherDashboardCount
   * @returns {object|array} teacherDashboardHeaderData
   */
  const [teacherDashboardHeaderData, setTeacherDashboardHeaderData] = useState([
    {
      value: 0,
      title: "Total Classes",
    },
    {
      value: 0,
      title: "Total Teachers",
      value1: 0,
      title1: "Active",
      value2: 0,
      title2: "On Leave",
      color1: "#9CB4CC",
      color2: "#C3B091",
    },
    {
      value: 0,
      title: "New Applications",
    },
    {
      value: 0,
      title: "Incomplete Tasks",
    },
  ]);

  const {
    data: teacherDashboardCount,
    isFetching: teacherDashboardCountLoading,
  } = useTeacherDashboardCountQuery();

  useEffect(() => {
    if (!teacherDashboardCountLoading && teacherDashboardCount) {
      const metrics = teacherDashboardCount.data?.aggregated_metrics || [];

      const getValue = (name) =>
        metrics.find((item) => item.aggregated_column_name_id.name === name)
          ?.value || 0;

      const activeTeachers = getValue(TOTAL_TEACHERS);
      const teachersOnLeave = getValue(TOTAL_TEACHER_ON_LEAVE);
      const totalTeachers = activeTeachers + teachersOnLeave;
      const totalCompletedClass = getValue(TOTAL_COMPLETE_CLASSES);
      const totalIncompleteClass = getValue(TOTAL_INCOMPLETE_CLASS);
      const totalClasses = totalCompletedClass + totalIncompleteClass;

      // console.log(activeTeachers);

      setTeacherDashboardHeaderData([
        {
          value: totalClasses,
          title: "Total Classes",
          // value1: totalCompletedClass,
          // title1: "Complete",
          // value2: totalIncompleteClass,
          // title2: "Incomplete",
          // color1: "#60EC6E",
          // color2: "#C3B091",
        },
        {
          value: activeTeachers,
          title: "Total Teachers",
          value1: activeTeachers - teachersOnLeave,
          title1: "Active",
          value2: teachersOnLeave,
          title2: "On Leave",
          color1: "#9CB4CC",
          color2: "#C3B091",
        },
        { value: 0, title: "New Applications" },
        { value: 0, title: "Incomplete Tasks" },
      ]);
    }
  }, [teacherDashboardCount, teacherDashboardCountLoading]);

  const [showTeacherBulkModal, setShowTeacherBulkModal] = useState(false);

  return (
    <div className="">
      <div className="grid  lg:grid-cols-12 grid-cols-1  justify-between items-center gap-4 ">
        <div className=" lg:col-span-9  h-full ">
          <div
            className=" bg-[#e7f7ff] h-full flex justify-center items-center w-full rounded-[12px] bg-no-repeat lg:bg-contain bg-right bg-cover"
            style={{ backgroundImage: "url(../assets/img/caligraphy.svg)" }}
          >
            <div className="flex  xl:flex-row flex-col justify-between  w-full">
              <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1   gap-6 lg:gap-0 2xl:gap-8 py-8  mx-4">
                {teacherDashboardHeaderData.map((item, index) => (
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
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-12 gap-4 mt-8 ">
        <div className="col-span-1 2xl:col-span-4 h-full  grid lg:grid-cols-2 xl:grid-cols-1 lg:gap-6 xl:gap-0">
          <AllAttendanceSummeryChart summeryFor={teachers} totalPeople={true} />
          {/* Teacher academic calender  */}
          <div className=" h-[300px] lg:h-auto xl:h-[300px] py-8 mt-5 lg:mt-0 xl:mt-5 xl:px-10 px-4 bg-[#E7F7FF] rounded-[12px]">
            <p className="text-2xl font-bold">Teacher Meeting</p>
            <div className="text-center pt-20">
              <p className="text-sm">
                Academic Calendar is not functional yet. We are hoping to launch
                this feature very soon, inshaAllah. Please stay with us until
                then.
              </p>
            </div>
          </div>
        </div>
        {/* ----------Leave & Movements table-------- */}
        <div className="col-span-1 2xl:col-span-8 h-full  ">
          <div className="flex justify-end gap-4 mb-5 ">
            {/* ---------Teacher Bulk Upload ----------- */}
            <button
              onClick={() => setShowTeacherBulkModal(true)}
              className="py-[9px] px-[20px] rounded-[8px] flex justify-center items-center gap-2 border-black border"
            >
              <img src="../../../../assets/img/icons/acc-plus.svg" alt="" />
              <span className="text-black text-16 font-bold">Add Teacher</span>
            </button>
            <Link
              href="/teachers/lists"
              className="bg-black py-[9px] px-[20px] rounded-[8px] flex justify-center items-center gap-2 "
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.1801 10.19C19.4608 10.0598 18.7311 9.99624 18.0001 10C17.5801 10 17.1701 10 16.7601 10.08C16.2497 9.39888 15.5982 8.83605 14.8501 8.43C15.4927 7.72825 15.8494 6.81148 15.8501 5.86C15.8501 4.83626 15.4435 3.85446 14.7196 3.13057C13.9957 2.40668 13.0139 2 11.9901 2C10.9664 2 9.98459 2.40668 9.2607 3.13057C8.53681 3.85446 8.13013 4.83626 8.13013 5.86C8.13087 6.81148 8.48759 7.72825 9.13013 8.43C8.38653 8.83816 7.73606 9.39668 7.22013 10.07C6.83013 10 6.42013 10 6.00013 10C5.26856 10.0028 4.5388 10.0731 3.82013 10.21C3.58718 10.2526 3.3769 10.3765 3.22673 10.5596C3.07657 10.7427 2.99627 10.9732 3.00013 11.21V19.46C2.99989 19.6069 3.03203 19.7521 3.09425 19.8852C3.15647 20.0182 3.24725 20.136 3.36013 20.23C3.4723 20.3246 3.60391 20.3933 3.74563 20.4313C3.88734 20.4694 4.03568 20.4757 4.18013 20.45C4.77854 20.3197 5.3879 20.246 6.00013 20.23C7.93723 20.2279 9.8323 20.7947 11.4501 21.86L11.5801 21.91C11.7128 21.9676 11.8555 21.9982 12.0001 22C12.0956 21.9988 12.1902 21.9819 12.2801 21.95H12.3501L12.4801 21.9C14.1134 20.8073 16.0351 20.2259 18.0001 20.23C18.6111 20.2328 19.2204 20.2931 19.8201 20.41C19.9646 20.4357 20.1129 20.4294 20.2546 20.3913C20.3964 20.3533 20.528 20.2846 20.6401 20.19C20.753 20.096 20.8438 19.9782 20.906 19.8452C20.9682 19.7121 21.0004 19.5669 21.0001 19.42V11.17C20.9993 10.9366 20.9168 10.7109 20.7671 10.5319C20.6173 10.353 20.4097 10.232 20.1801 10.19ZM12.0001 4C12.4686 4.03442 12.9067 4.2448 13.2264 4.58888C13.5461 4.93297 13.7238 5.38529 13.7238 5.855C13.7238 6.32471 13.5461 6.77703 13.2264 7.12112C12.9067 7.4652 12.4686 7.67558 12.0001 7.71C11.5317 7.67558 11.0936 7.4652 10.7739 7.12112C10.4541 6.77703 10.2764 6.32471 10.2764 5.855C10.2764 5.38529 10.4541 4.93297 10.7739 4.58888C11.0936 4.2448 11.5317 4.03442 12.0001 4ZM11.0001 19.33C9.43281 18.6055 7.7268 18.2302 6.00013 18.23C5.67013 18.23 5.34013 18.23 5.00013 18.28V12C5.8387 11.9062 6.68595 11.923 7.52013 12.05H7.63013C8.82173 12.269 9.96361 12.7027 11.0001 13.33V19.33ZM12.0001 11.6C11.5555 11.3435 11.0945 11.1163 10.6201 10.92H10.5601C10.2301 10.79 9.90013 10.66 9.56013 10.56C10.2544 10.0074 11.1128 9.70132 12.0001 9.69C12.8851 9.69561 13.7432 9.99455 14.4401 10.54C13.5912 10.805 12.7732 11.1604 12.0001 11.6ZM19.0001 18.28C16.9468 18.0737 14.8756 18.4189 13.0001 19.28V13.28C14.0385 12.6688 15.1811 12.2552 16.3701 12.06H16.5701C17.3741 11.9348 18.191 11.9146 19.0001 12V18.28Z"
                  fill="white"
                />
              </svg>

              <span className="text-white ">Teacher List</span>
            </Link>
          </div>
          <div className="  px-3 shadow-custom-effect bg-white rounded-[12px]  ">
            <div className="flex lg:flex-row flex-col pb-6 lg:justify-between items-start lg:items-center gap-2 border-b  border-primary-brand-100 ">
              <p className="text-2xl pt-6 font-bold lg:ml-3 m-2">
                Leave & Movements
              </p>
            </div>

            {loadingClasses && !fetchClasses ? (
              <div className="flex justify-center mt-4 ">
                <span>
                  <SvgLoader />
                </span>
              </div>
            ) : (
              <div className="sm:overflow-auto  ">
                <div className="sm:block  hidden ">
                  <table className="w-full">
                    <thead>
                      <tr className="text-black text-left">
                        <th className="px-4 py-6 font-semibold ">
                          Submitted On
                        </th>
                        <th className="px-4 py-6 font-semibold ">
                          Submitted By
                        </th>
                        <th className="px-4 py-6 font-semibold ">Leave Type</th>
                        <th className="px-4 py-6 font-semibold ">Approval</th>
                      </tr>
                    </thead>

                    <tbody className="text-gray-700">
                      <tr>
                        <td colSpan={4}>
                          <hr />
                          <div className="flex justify-center items-center h-[400px] text-gray-600 text-base text-center px-4">
                            Leave & Movement is not functional yet. <br />
                            We are hoping to launch this feature very soon,
                            inshaAllah. <br />
                            Please stay with us till then.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* -----card for small device----------- */}
                <div className="sm:hidden visible">
                  {classes && classes.length > 0 ? (
                    classes.map((item, itemIndex) => (
                      <LeaveAndMoveListItem key={itemIndex} data={item} />
                    ))
                  ) : (
                    <div className="text-center text-gray-600 py-4">
                      Leave & Movement is not functional yet. We are hoping to
                      launch this feature very soon, inshaAllah.
                    </div>
                  )}
                </div>

                {/* Pagination Component */}
                {/* <div className="flex justify-end mt-4">
                  <Pagination
                    current={currentPage}
                    total={totalPages}
                    pageSize={limit}
                    onChange={handleChangePage}
                    showSizeChanger={false}
                  />
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* second grid */}
      {showTeacherBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-[95vw]">
            <TeacherBulkUpload
              onCancel={() => setShowTeacherBulkModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
