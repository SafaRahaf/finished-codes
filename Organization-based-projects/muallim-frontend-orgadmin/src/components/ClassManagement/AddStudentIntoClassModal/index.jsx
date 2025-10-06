import { SearchSvg } from "@/components/helpers/storeAllSvgs";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import {
  useAddStudentToClassMutation,
  useGetAllStudentsQuery,
} from "@/store/features/class-management/apiSlice";
import { message, Pagination } from "antd";
import { debounce } from "lodash";
import React, { useState, useEffect, useCallback, useRef } from "react";
import nextConfig from "../../../../next.config.mjs";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import moment from "moment";

const AddStudentIntoClassModal = ({
  handler,
  classId,
  reFetch,
  refetchClassData,
  studentsOnClass,
  updateStudentCounts,
}) => {
  const [studentCollections, setStudentCollections] = useState([]);
  const [sortedStudents, setSortedStudents] = useState([]);
  const [queryString, setQueryString] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 20;
  const [StudentByClass, setStudentByClass] = useState([]);

  const { data: fetchStudents, isFetching: loadingStudents } =
    useGetAllStudentsQuery({
      page: currentPage,
      limit: limit,
      searchTerm: queryString,
    });

  const getUniqueStudents = (students) => {
    const uniqueStudentsMap = new Map();
    students.forEach((student) => {
      if (student?.unique_id) {
        uniqueStudentsMap.set(student.unique_id, student);
      }
    });
    return Array.from(uniqueStudentsMap.values());
  };

  const studentCollectionHandler = (student) => {
    setStudentCollections((prevCollections) => {
      if (prevCollections.includes(student)) {
        return prevCollections.filter((item) => item !== student);
      } else {
        return [...prevCollections, student];
      }
    });
  };

  const [addStudentToClass, { isLoading, error }] =
    useAddStudentToClassMutation();

  // error watcher
  useEffect(() => {
    if (error) {
      if (error.status === 400) {
        message.error(
          error?.data?.message.includes("exists")
            ? "Class people already exists. Please try a different one"
            : error.data.message
        );
      } else {
        message.error(error.data.message);
      }
    }
  }, [error]);

  const resetHandler = () => {
    setQueryString("");
    setCurrentPage(1);
    setStudentByClass([]);
  };

  const todayLocal = moment();
  const todayUTC = todayLocal.clone().utc();

  const formattedtime = todayUTC.format("YYYY-MM-DD");

  const addNewStudentHandler = async () => {
    if (studentCollections && studentCollections.length) {
      // Count genders for added students
      let boysToAdd = 0;
      let girlsToAdd = 0;

      studentCollections.forEach((studentId) => {
        const student = StudentByClass.find((s) => s.id === studentId);
        if (student) {
          const isBoy = student.gender === "male" || student.gender === "Male";
          if (isBoy) boysToAdd++;
          else girlsToAdd++;
        }
      });

      await addStudentToClass({
        date: formattedtime,
        class_id: Number(classId),
        student_ids: studentCollections,
        modalHandler: handler,
        resetHandler: resetHandler,
      });

      // Update local counts
      if (updateStudentCounts) {
        updateStudentCounts(boysToAdd, girlsToAdd);
      }

      await reFetch({ id: classId, page: 1, limit: 200 });
      handler(false);
    } else {
      message.error("There is no student selected. please select a student");
    }
  };

  useEffect(() => {
    if (fetchStudents && !loadingStudents) {
      setStudentByClass((prev) =>
        currentPage === 1
          ? getUniqueStudents(fetchStudents?.data)
          : getUniqueStudents([...prev, ...fetchStudents?.data])
      );
      setTotalPages(fetchStudents?.meta?.total);
    }
  }, [fetchStudents, loadingStudents, currentPage]);

  // Sort: in-class students first
  useEffect(() => {
    if (StudentByClass && StudentByClass.length > 0) {
      const sorted = [...StudentByClass].sort((a, b) => {
        const aIsInClass = studentsOnClass?.includes(a.unique_id);
        const bIsInClass = studentsOnClass?.includes(b.unique_id);

        if (aIsInClass && !bIsInClass) return -1;
        if (!aIsInClass && bIsInClass) return 1;
        return 0;
      });

      setSortedStudents(sorted);
    } else {
      setSortedStudents([]); // Clear sorted students if StudentByClass is empty
    }
  }, [StudentByClass, studentsOnClass]);

  // useEffect(() => {
  //   console.log("Current class students:", studentsOnClass);
  // }, [studentsOnClass]);

  const isInCurrentClass = (student) =>
    student.class_people?.some((cp) => cp.class_id?.id === Number(classId));

  const studentsInClass = sortedStudents.filter(isInCurrentClass);

  const studentsNotInClass = sortedStudents.filter(
    (item) => !isInCurrentClass(item)
  );

  const allRows = [
    ...studentsInClass.map((item) => ({
      ...item,
      _section: "selected",
    })),
    ...studentsNotInClass.map((item) => ({
      ...item,
      _section: "notSelected",
    })),
  ];

  const observer = useRef(null);

  const lastRowRef = useCallback(
    (node) => {
      if (loadingStudents) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new window.IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          fetchStudents?.data?.length === limit &&
          allRows.length < fetchStudents?.meta?.total
        ) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingStudents, allRows.length, totalPages, currentPage]
  );

  const debouncedSearch = useCallback(
    debounce((query) => {
      setCurrentPage(1);
      setStudentByClass([]);
    }, 500),
    []
  );

  const searchHandler = (e) => {
    const newQuery = e.target.value;
    setQueryString(newQuery);
    setCurrentPage(1);
    setStudentByClass([]);
    debouncedSearch(newQuery);
  };

  // Add this function to handle select all functionality
  const handleSelectAllUnselected = (checked) => {
    if (checked) {
      // Get all unselected student IDs (students not in current class)
      const unselectedStudentIds = studentsNotInClass.map(student => student.id);
      setStudentCollections(unselectedStudentIds);
    } else {
      // Clear all selections
      setStudentCollections([]);
    }
  };

  // Check if all unselected students are selected
  const isAllUnselectedSelected = studentsNotInClass.length > 0 && 
    studentsNotInClass.every(student => studentCollections.includes(student.id));

  // Check if some (but not all) unselected students are selected
  const isSomeUnselectedSelected = studentsNotInClass.some(student => 
    studentCollections.includes(student.id)
  );

  return (
    <>
      <div
        className="onboarding-profile-bg z-30 "
        onClick={() => handler(false)}
      ></div>
      <div className="card st-modal lg:w-[700px] w-[95%] max-w-[95%] p-12 rounded-[12px] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-40 shadow-lg bg-white m-auto mt-1">
        <h2 className="text-[30px] font-bold">Add Student</h2>
        <div className="line h-[1px] w-full bg-[#E4E6EA] mt-6 mb-4"></div>
        <div className="w-full h-[36px] mb-5 rounded border border-primary-brand-500 relative">
          {/* search input */}
          <input
            value={queryString}
            onChange={(e) => searchHandler(e)}
            placeholder="Search..."
            type="text"
            className="w-full h-full pl-[50px] pr-5 text-primary-brand-900 placeholder:text-primary-brand-300 text-16 tracking-wide rounded "
          />
          {/* search icon */}
          <span className="absolute left-[17px] top-1/2 transform -translate-y-1/2">
            <SearchSvg />
          </span>
        </div>
        {loadingStudents && !fetchStudents ? (
          <div className="flex justify-center mt-4">
            <span>
              <SvgLoader />
            </span>
          </div>
        ) : (
          <div
            className="w-full overflow-x-auto overflow-y-auto"
            style={{ maxHeight: 500 }}
          >
            <table className="w-full overflow-hidden">
              <thead>
                <tr className="text-black text-left text-16">
                  <th className="px-4 py-2 flex justify-start items-center gap-2 font-semibold min-w-[200px]">
                    <input
                      type="checkbox"
                      className={`w-5 h-5 rounded-2xl border-[2px] border-gray-400 checked:border-orange-400 checked:bg-white appearance-none cursor-pointer transition-all duration-200 relative 
      before:content-['✔'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-orange-400 before:opacity-0 checked:before:opacity-100`}
                      onChange={(e) => handleSelectAllUnselected(e.target.checked)}
                      checked={isAllUnselectedSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isSomeUnselectedSelected && !isAllUnselectedSelected;
                        }
                      }}
                    />
                    Student
                  </th>
                  <th className=" text-center py-2 font-semibold min-w-[124px]">
                    Student ID
                  </th>
                  <th className="px-4 text-center py-2 font-semibold min-w-10">
                    Class
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {studentsNotInClass.length > 0 && (
                  <>
                    <tr>
                      <td colSpan={3} className="font-bold py-2 text-10">
                        NOT ADDED
                      </td>
                    </tr>
                    {studentsNotInClass?.map((item, itemIndex) => {
                      const isLast =
                        allRows.length > 0 &&
                        itemIndex + studentsInClass.length ===
                          allRows.length - 1;
                      const isStudentInCurrentClass = isInCurrentClass(item);

                      return (
                        <tr
                          key={item.id}
                          ref={isLast ? lastRowRef : null}
                          className="border-t border-primary-brand-100 text-black "
                        >
                          <td className="px-4 py-4 ">
                            <div className="flex space-x-2 items-center">
                              <input
                                type="checkbox"
                                className={`w-5 h-5 rounded-2xl border-[2px] border-gray-400 checked:border-orange-400 checked:bg-white appearance-none cursor-pointer transition-all duration-200 relative 
      before:content-['✔'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-orange-400 before:opacity-0 checked:before:opacity-100`}
                                onClick={() => console.log("clicked")}
                                onChange={() =>
                                  studentCollectionHandler(item?.id)
                                }
                                checked={
                                  isStudentInCurrentClass ||
                                  studentCollections.includes(item?.id)
                                }
                                disabled={isStudentInCurrentClass}
                              />

                              <div className="w-[56px] hide-mobile h-[56px]  rounded-full overflow-hidden bg-gray-50">
                                <img
                                  src={
                                    item?.profile_picture &&
                                    item?.profile_picture !== null
                                      ? `${process.env.FILE_BROWSE_URL}${item?.profile_picture}`
                                      : DefaultProfile.src
                                  }
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span>
                                {" "}
                                {item?.first_name + " " + item?.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-6 ">
                            {item?.unique_id}
                          </td>
                          <td className="px-4 text-center py-6">
                            {item?.class_people?.[0]?.class_id?.class_name ||
                              "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </>
                )}

                {studentsInClass?.length > 0 && (
                  <>
                    <tr>
                      <td
                        colSpan={3}
                        className="font-bold py-2 text-md text-10 "
                      >
                        ADDED
                      </td>
                    </tr>
                    {studentsInClass?.map((item, itemIndex) => {
                      const isLast =
                        allRows.length > 0 && itemIndex === allRows.length - 1;
                      const isStudentInCurrentClass = isInCurrentClass(item);

                      const getClassesFromCollection = item?.class_people?.map(
                        (cp) => cp?.class_id?.class_name
                      );
                      return (
                        <tr
                          key={item.id}
                          ref={isLast ? lastRowRef : null}
                          className={`border-t border-primary-brand-100 ${
                            isStudentInCurrentClass ? "bg-white" : ""
                          }`}
                        >
                          <td className="px-4 py-4 ">
                            <div className="flex space-x-2 items-center">
                              <input
                                type="checkbox"
                                className={`w-5 h-5 rounded-2xl border-[2px] border-gray-400 checked:border-orange-400 checked:bg-white appearance-none cursor-pointer transition-all duration-200 relative 
                                before:content-['✔'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-orange-400 before:opacity-0 checked:before:opacity-100`}
                                onClick={() => console.log("clicked")}
                                onChange={() =>
                                  studentCollectionHandler(item?.id)
                                }
                                checked={
                                  isStudentInCurrentClass ||
                                  studentCollections.includes(item?.id)
                                }
                                disabled={isStudentInCurrentClass}
                              />

                              <div className="w-[56px] hide-mobile h-[56px] rounded-full overflow-hidden">
                                <img
                                  src={
                                    item?.profile_picture &&
                                    item?.profile_picture !== null
                                      ? `${process.env.FILE_BROWSE_URL}${item?.profile_picture}`
                                      : DefaultProfile.src
                                  }
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span>
                                {" "}
                                {item?.first_name + " " + item?.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-6">
                            {item?.unique_id}
                          </td>
                          <td className="px-4 text-center py-6">
                            {getClassesFromCollection.join(", ") || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
            {!loadingStudents &&
              !studentsInClass?.length &&
              !allRows?.length && (
                <div className="font-bold py-6 text-xl flex justify-center">
                  No Students Available!
                </div>
              )}
          </div>
        )}

        {loadingStudents && currentPage > 1 && (
          <div className="flex justify-center py-4">
            <SvgLoader />
          </div>
        )}

        <div className="flex justify-end mt-8">
          <button
            className="btn bg-black mx-auto text-white w-[60%] flex justify-center items-center min-w-[300px] py-3 rounded-md text-lg font-bold"
            onClick={addNewStudentHandler}
          >
            {isLoading ? <SvgLoader /> : "Add Student"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddStudentIntoClassModal;
