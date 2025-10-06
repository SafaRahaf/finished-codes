"use client";
import { Button, Input, Pagination } from "antd";
import { debounce } from "lodash";
import React, { useState, useCallback, useEffect, useRef } from "react";
import StudentListItem from "../StudentListItem";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import {
  useGetClassesQuery,
  useLazyGetAllStudentsQuery,
} from "@/store/features/class-management/apiSlice";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import {
  getDecodedToken,
  getOrgShortName,
} from "@/utilities/helpers/getDecodedValus";
import { useSelector } from "react-redux";

const StudentListTable = ({ appConnectionDataShowHandler }) => {
  // ----------- State Management -----------

  const [selectedClass, setSelectedClass] = useState(null);
  const [queryString, setQueryString] = useState("");
  const [studentsList, setStudentsList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const limit = 7;
  const pageRef = useRef(1);
  const observer = useRef(null);
  const decoded = getDecodedToken();
  const orgShortName =
    useSelector((state) => state.auth.orgShortName) || getOrgShortName();

  // ----------- API Queries -----------

  const { data: fetchClasses, isFetching: loadingClasses } = useGetClassesQuery(
    {
      page: 1,
      limit: 100,
    }
  );

  const [getStudents, { data: studentsData, isFetching: loadingStudents }] =
    useLazyGetAllStudentsQuery();

  // ----------- Effects -----------

  useEffect(() => {
    pageRef.current = 1;
    setStudentsList([]);
    setHasMore(true);
    fetchMoreStudents(1, true);
    // eslint-disable-next-line
  }, [queryString, selectedClass]);

  const fetchMoreStudents = (page, reset = false) => {
    setLoading(true);
    getStudents({
      page,
      limit,
      searchTerm: queryString,
      ...(selectedClass ? { selectedClass: selectedClass } : {}),
    }).then((res) => {
      const newData = res.data?.data || [];
      setStudentsList((prev) => (reset ? newData : [...prev, ...newData]));
      setHasMore(newData.length === limit);
      setLoading(false);
    });
  };

  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          pageRef.current += 1;
          fetchMoreStudents(pageRef.current);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, loading]
  );

  // Handlers
  const searchHandler = (e) => setQueryString(e.target.value);
  const classHandler = (val) => setSelectedClass(val);

  const classOptions = [
    { value: "", label: "All Classes" },
    ...(Array.isArray(fetchClasses?.data)
      ? fetchClasses.data.map((item) => ({
          value: item.id,
          label: item.class_name,
        }))
      : []),
  ];

  return (
    <div className="md:col-span-5">
      <div className="pt-8 pb-2 lg:px-5 px-2  shadow-custom-effect  h-full bg-white rounded-[12px] ">
        <div className="flex xl:flex-row flex-col pb-3 justify-between items-end gap-2 border-b border-primary-brand-100 ">
          <div className="w-full ">
            <p className=" font-bold">Select grade/class</p>
            <SelectBox
              inputHeight="!h-[36px]"
              placeholder="All Classes"
              list={classOptions}
              handler={classHandler}
              value={selectedClass}
              loading={loadingClasses}
            />
          </div>
          <div className="w-full mt-auto ">
            <input
              type="text"
              placeholder="Search"
              className="w-full border border-[#565555] rounded-[5px] px-4 py-2 !h-[36px]"
              value={queryString}
              onChange={searchHandler}
            />
          </div>
        </div>
        <div className="table-responsive overflow-y-auto h-[500px]">
          <div className="h-full">
            <div
              className="sm:block hidden"
              style={{
                maxHeight: "100%",
                overflowY: "auto",
              }}
            >
              <table className="w-full h-full">
                <thead>
                  <tr className="text-gray-700 text-left  sticky top-0 bg-white">
                    <th className="px-4 py-6 font-semibold min-w-[150px] ">
                      Students
                    </th>
                    <th className="px-4 py-6 font-semibold min-w-[124px]">
                      Student ID
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {studentsList.length > 0 ? (
                    studentsList.map((item, idx) => (
                      <tr
                        key={item?.id}
                        ref={
                          idx === studentsList.length - 1 ? lastItemRef : null
                        }
                        className="border-t border-primary-brand-100 cursor-pointer hover:bg-gray-50"
                        onClick={() => appConnectionDataShowHandler(item?.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex justify-start items-center gap-2 ">
                            <img
                              className="rounded-full w-12 h-12 object-cover"
                              src={
                                item?.profile_picture
                                  ? process.env.FILE_BROWSE_URL +
                                    item?.profile_picture
                                  : DefaultProfile.src
                              }
                              width={50}
                              height={50}
                              alt="avatar"
                            />
                            <span>
                              <p className=" text-md min-w-40">
                                {item?.first_name + " " + item?.last_name}
                              </p>
                            </span>
                          </div>
                        </td>
                        <td className="pl-10 ">
                          {orgShortName || decoded?.org_short_name}
                          {item?.unique_id}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-center py-8 text-gray-500"
                      >
                        No students found!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {loading && (
                <div className="flex justify-center mt-4">
                  <SvgLoader />
                </div>
              )}
            </div>
            {/* Mobile cards */}
            <div className="sm:hidden visible">
              {studentsList.length > 0
                ? studentsList.map((item, idx) => (
                    <StudentListItem
                      key={item.id}
                      item={item}
                      appConnectionDataShowHandler={
                        appConnectionDataShowHandler
                      }
                      ref={idx === studentsList.length - 1 ? lastItemRef : null}
                    />
                  ))
                : !studentsList.length &&
                  !loading && (
                    <div className="text-center py-8 text-gray-500">
                      No students found!
                    </div>
                  )}
              {loading && (
                <div className="flex justify-center mt-4">
                  <SvgLoader />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentListTable;
