"use client";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { getCookie } from "cookies-next";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoSearch, IoSearchOutline } from "react-icons/io5";
import { FaEdit, FaCheck, FaPlus } from "react-icons/fa";
import {
  useDeleteBulkStudentsMutation,
  // useGetAllStudentsQuery,
  useGetClassesQuery,
  useLazyGetAllStudentsQuery,
} from "@/store/features/class-management/apiSlice";
import { MdKeyboardArrowRight } from "react-icons/md";
import PrintList from "@/components/Print-PDF-Download/print/PrintList";
import { DeleteBtnSvg, ShareSvg } from "@/components/helpers/storeAllSvgs";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { Modal, Input, List, Button, message } from "antd";
import { Dropdown, Space } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { getFullAddress } from "@/components/Location/GetFullLocation";
import {
  getDecodedToken,
  getOrgShortName,
} from "@/utilities/helpers/getDecodedValus";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import { useSelector } from "react-redux";

const DeleteStudentsModal = ({
  isVisible,
  onCancel,
  onConfirm,
  selectedInfo,
  onRemoveStudent,
}) => {
  const decoded = getDecodedToken();
  const orgShortName =
    useSelector((state) => state.auth.orgShortName) || getOrgShortName();

  return (
    <Modal
      title={
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-red-600 gap-2 font-semibold text-base my-2">
            <img
              src="/assets/img/icons/red warning.png"
              alt="Warning"
              className="w-5 h-5"
            />
            Delete Student Profile?
          </div>
          <hr className="border-gray-200" />
        </div>
      }
      open={isVisible}
      footer={null}
      onCancel={onCancel}
      styles={{
        body: { padding: "12px" },
      }}
    >
      <div className="space-y-4">
        <p className="text-gray-700 text-base">
          Are you sure you want to delete <strong>{selectedInfo.length}</strong>{" "}
          {selectedInfo.length === 1 ? "student" : "students"} profile
          {selectedInfo.length === 1 ? "" : "s"} below?
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {selectedInfo.map((student) => (
            <div
              key={student.id}
              className="flex justify-between items-center p-2"
            >
              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={
                    student?.profile_picture
                      ? `${process.env.FILE_BROWSE_URL}${student?.profile_picture}`
                      : DefaultProfile.src
                  }
                  alt=""
                />
                <div className="flex items-center gap-1">
                  <p className="text-gray-800 font-medium">
                    {student.first_name} {student.last_name} -
                  </p>
                  <p className="text-gray-500 text-sm">
                    {orgShortName || decoded?.org_short_name}
                    {student?.unique_id}
                  </p>
                </div>
              </div>
              <button
                className="text-gray-500 font-bold text-lg px-2"
                onClick={() => onRemoveStudent(student.id)}
                aria-label="Remove student"
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between pt-2">
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md text-base font-semibold"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="border border-gray-400 px-6 py-2 rounded-md text-base font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ConfirmDeleteStudentsModal = ({
  isVisible,
  onCancel,
  onConfirm,
  selectedInfo,
}) => {
  const [note, setNote] = React.useState("");
  const maxLength = 120;

  const handleConfirm = () => {
    onConfirm(note);
  };

  return (
    <Modal
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      centered
      closeIcon={null}
      styles={{ body: { padding: "12px" } }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <img
          src="/assets/img/icons/red warning.png"
          alt="Warning"
          className="w-5 h-5"
        />
        <h2 className="text-lg font-semibold text-red-500">
          Delete Student Profile?
        </h2>
      </div>
      {/* Body */}
      <div className="mb-4">
        <p className="text-gray-700 mb-4 text-16">
          Deleting these student profiles will permanently erase their data,
          including attendance, activities, and progress. Are you sure you want
          to proceed?
        </p>
        {/* Student Avatars */}
        <div className="flex -space-x-2 mb-4">
          {selectedInfo?.map((student, index) => (
            <img
              key={student?.id}
              src={
                student?.profile_picture
                  ? `${process.env.FILE_BROWSE_URL}${student?.profile_picture}`
                  : DefaultProfile.src
              }
              alt=""
              className="w-10 h-10 rounded-full border-2 border-white"
              style={{ zIndex: selectedInfo.length - index }}
            />
          ))}
        </div>
        {/* Note Input */}
        <div className="mt-4">
          <label className="text-gray-700 mb-2 block font-bold">
            Type Note
          </label>
          <div className="relative">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, maxLength))}
              className="w-full p-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[120px] resize-none"
              placeholder="Enter your reason for deletion..."
            />
            <span className="absolute bottom-2 right-2 text-gray-400 text-sm">
              {note.length}/{maxLength}
            </span>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onCancel}
          className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
};

const StudentList = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [students, setStudents] = useState([]);
  const [classCurrentPage, setClassCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedClass, setSelectedClass] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [classes, setClasses] = useState([]);
  const [queryString, setQueryString] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [deleteNote, setDeleteNote] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const decoded = getDecodedToken();
  const orgShortName =
    useSelector((state) => state.auth.orgShortName) || getOrgShortName();

  const pageRef = useRef(1);
  const observer = useRef(null);
  const scrollContainerRef = useRef(null);

  const limit = 10;

  const [getStudents, { data: fetchStudents, isFetching: loadingStudents }] =
    useLazyGetAllStudentsQuery();

  const { data: fetchClasses, isFetching: loadingClasses } = useGetClassesQuery(
    {
      page: classCurrentPage,
      limit: 999,
    }
  );

  const [deleteBulkStudents] = useDeleteBulkStudentsMutation();

  useEffect(() => {
    const handler = setTimeout(() => {
      setQueryString(searchInput);
    }, 100);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchMoreStudents = useCallback(
    (reset = false) => {
      if (reset) {
        setIsInitialLoad(true);
        setStudentsLoading(true);
      } else {
        setStudentsLoading(true);
      }

      getStudents({
        page: pageRef.current,
        limit,
        searchTerm: queryString,
        selectedClass,
        sort,
        sortOrder,
      });
    },
    [getStudents, queryString, selectedClass, sort, sortOrder]
  );

  useEffect(() => {
    if (fetchStudents && fetchStudents.data) {
      setStudents((prev) =>
        pageRef.current === 1
          ? fetchStudents.data
          : [...prev, ...fetchStudents.data]
      );

      // Fix: Properly check if there are more results
      const currentTotal = fetchStudents.meta?.total || 0;
      const currentPage = pageRef.current;
      const hasMoreResults = currentPage * limit < currentTotal;

      setHasMore(hasMoreResults);
      setTotalPages(Math.ceil(currentTotal / limit));
      setStudentsLoading(false);
      setIsInitialLoad(false);
    }
  }, [fetchStudents, limit]);

  const lastStudentRef = useCallback(
    (node) => {
      if (loadingStudents || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingStudents) {
          pageRef.current += 1;
          fetchMoreStudents();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingStudents, hasMore, fetchMoreStudents]
  );

  useEffect(() => {
    pageRef.current = 1;
    setStudents([]);
    setHasMore(true); // Reset to true initially
    setStudentsLoading(true); // Show loading state
    fetchMoreStudents(true);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [queryString, selectedClass, sort, sortOrder]);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 600);
    };
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const sortChangeHandler = (value) => {
    let newSort = "first_name";
    let newOrder = "asc";

    if (value === "az") {
      newSort = "first_name";
      newOrder = "asc";
    } else if (value === "za") {
      newSort = "first_name";
      newOrder = "desc";
    } else if (value === "newest") {
      newSort = "created_at";
      newOrder = "desc";
    } else if (value === "oldest") {
      newSort = "created_at";
      newOrder = "asc";
    }

    setSort(newSort);
    setSortOrder(newOrder);
  };

  const handleCheckboxChange = (e, student) => {
    if (e.target.checked) {
      setSelectedStudents((prev) => [...prev, student]);
    } else {
      setSelectedStudents((prev) => prev.filter((s) => s.id !== student.id));
    }
  };

  const handleDeleteButtonClick = () => {
    if (selectedStudents.length === 0) {
      message.warning("Please select students to delete");
      return;
    }
    setDeleteModalVisible(true);
  };

  const handleRemoveStudentFromModal = (studentId) => {
    setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const handleDeleteModalConfirm = () => {
    setDeleteModalVisible(false);
    setConfirmModalVisible(true);
  };

  const handleConfirmDelete = async (note) => {
    try {
      const items = selectedStudents.map((student) => student.id);
      const response = await deleteBulkStudents({
        items,
        reason: note,
      }).unwrap();

      if (response.success) {
        const successMsgs = response.data?.success
          ?.map((item) => item.message)
          .join("\n");
        const failedMsgs = response.data?.failed
          ?.map((item) => item.message)
          .join("\n");

        let toastMsg = `${response.message}\n\n`;
        if (successMsgs) toastMsg += `Success:\n${successMsgs}\n`;
        if (failedMsgs) toastMsg += `Failed:\n${failedMsgs}`;

        message.open({
          type: "success",
          content: <pre style={{ whiteSpace: "pre-wrap" }}>{toastMsg}</pre>,
          duration: 6,
          icon: null,
        });

        pageRef.current = 1;
        setStudents([]);
        setHasMore(true);
        setSelectedStudents([]);
        fetchMoreStudents(true);
      } else {
        message.error(response.message || "Failed to delete students");
      }

      setConfirmModalVisible(false);
      setDeleteNote("");
    } catch (error) {
      message.error("Failed to delete students");
      setConfirmModalVisible(false);
    }
  };

  const getClassStats = (student) => {
    if (!selectedClass) {
      const classPeople =
        student.class_people?.filter(
          (cp) => typeof cp.attendance_percentage === "number"
        ) || [];
      if (classPeople.length === 0) {
        return { attendance: 0, performance: 0 };
      }
      const attendanceSum = classPeople.reduce(
        (sum, cp) => sum + (cp.attendance_percentage || 0),
        0
      );
      const performanceSum = classPeople.reduce(
        (sum, cp) => sum + (cp.performance_percentage || 0),
        0
      );
      return {
        attendance: Math.round(attendanceSum / classPeople.length),
        performance: Math.round(performanceSum / classPeople.length),
      };
    }
    const classPerson = student.class_people?.find(
      (cp) => cp.class_id && cp.class_id.id == selectedClass
    );
    return {
      attendance: classPerson?.attendance_percentage ?? 0,
      performance: classPerson?.performance_percentage ?? 0,
    };
  };

  return (
    <div className="w-full">
      {mounted ? (
        <>
          {/* Top Bar */}
          <div className="flex justify-between items-center no-print">
            <p className="text-gray-600 text-14 flex items-center font-bold pl-2">
              <Link href="/students">Student Management</Link>
              <span className="md:mx-3">
                <MdKeyboardArrowRight />
              </span>
              <Link href="/students/list" className="text-black">
                Students
              </Link>
            </p>
          </div>

          {/* Main Card */}
          <div className="flex justify-between items-center">
            <p className="text-4xl font-bold my-8 ">Student List</p>
            <Link
              href="add"
              className="  bg-black py-2 px-[20px] rounded-[8px] flex justify-center gap-center gap-2 "
            >
              <FaPlus className="text-white inline-flex mt-1" />
              <span className="text-white">Add New Student</span>
            </Link>
          </div>
          <div className="">
            <div className="md:flex flex-wrap justify-between items-center gap-3 mb-4 no-print">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-[#2C3333]">
                  Select Grade/Class
                </p>
                <div className="w-[187px]">
                  <SelectBox
                    inputHeight="!h-[36px]"
                    placeholder="All Classes"
                    handler={(val) => setSelectedClass(val)}
                    list={[{ label: "All Classes", value: "" }, ...classes]}
                  />
                </div>
              </div>

              <div className="md:flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="flex items-center gap-3">
                  <div className="w-[187px] h-[36px] relative mt-1">
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search"
                      type="text"
                      className="w-full h-full pl-[40px] pr-5 border border-primary-brand-500 text-16 rounded"
                    />
                    <span className="absolute left-[10px] top-1/2 transform -translate-y-1/2 text-2xl text-gray-500">
                      <IoSearch />
                    </span>
                  </div>
                  {/* Sort  Filters */}
                  <div className="w-[187px]">
                    <SelectBox
                      inputHeight="!h-[36px]"
                      handler={sortChangeHandler}
                      placeholder=" A-Z"
                      list={[
                        { label: "Sort by A-Z", value: "az" },
                        { label: "Sort by Z-A", value: "za" },
                        { label: "Newest", value: "newest" },
                        { label: "Oldest", value: "oldest" },
                      ]}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-x-4 justify-end">
                  <button
                    onClick={handleDeleteButtonClick}
                    className="flex items-center hover:text-red-700"
                  >
                    <DeleteBtnSvg />
                    {selectedStudents.length > 0 && (
                      <span className="bg-red-700 text-white px-[7px] py-[3px] rounded-full text-12 -ml-2 mb-2">
                        {selectedStudents.length}
                      </span>
                    )}
                  </button>
                  {/* <div>
                    <ShareSvg />
                  </div> */}
                  <PrintList viewType={"studentlist"} data={students} />
                </div>
              </div>
            </div>

            <hr />
            {isMobileView ? (
              // CARD VIEW for small screens
              <>
                <div className="grid grid-cols-1 gap-4">
                  {isInitialLoad && studentsLoading ? (
                    <div className="flex justify-center py-20">
                      <SvgLoader />
                    </div>
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <div
                        key={student.id}
                        className="border p-4 rounded-lg shadow-md flex items-start gap-4"
                      >
                        <img
                          src={
                            student?.profile_picture
                              ? `${
                                  process.env.FILE_BROWSE_URL +
                                  student?.profile_picture
                                }`
                              : DefaultProfile.src
                          }
                          className="w-[60px] h-[60px] rounded-full"
                          alt={`${student?.first_name}`}
                        />
                        <div className="flex-1">
                          <Link
                            href={`./details?id=${student.id}`}
                            className="flex items-center gap-2"
                          >
                            {" "}
                            <h2 className="text-lg font-bold">
                              {student?.first_name} {student?.last_name} | ID:{" "}
                              {student.id}
                            </h2>{" "}
                          </Link>

                          <p>
                            Status:{" "}
                            <span
                              className={`inline-block w-[10px] h-[10px] rounded-full mr-2 ${
                                student.people_orgs[0]?.status === "active"
                                  ? "bg-[#60EC6E]"
                                  : student.people_orgs[0]?.statu === "inactive"
                                  ? "bg-[#F95656]"
                                  : student.people_orgs[0]?.statu ===
                                    "sick_leave"
                                  ? "bg-orange-500"
                                  : student.people_orgs[0]?.statu ===
                                    "sick_leave"
                                  ? "bg-blue-500"
                                  : ""
                              }`}
                            ></span>
                            {student.people_orgs[0]?.status === "active"
                              ? "Present"
                              : student.people_orgs[0]?.status === "inactive"
                              ? "Absent"
                              : student.people_orgs[0]?.status === "leave"
                              ? "Leave"
                              : student.people_orgs[0]?.status === "sick_leave"
                              ? "Sick"
                              : student.people_orgs[0]?.status ===
                                "casual_leave"
                              ? "Leave"
                              : student.people_orgs[0]?.status ===
                                "earned_leave"
                              ? "Leave"
                              : "-"}
                          </p>
                          <p>
                            Attendance: {getClassStats(student).attendance}%
                          </p>
                          <p>
                            Performance: {getClassStats(student).performance}%
                          </p>
                          <p>
                            Address:{" "}
                            {getFullAddress(student.location_id) || "--"}
                          </p>
                        </div>
                        <Link
                          href={`./edit?id=${student.id}`}
                          className="btn text-xl mt-1"
                        >
                          <FaEdit />
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-xl font-bold rounded-md text-gray-600">
                      No students found!
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                ref={scrollContainerRef}
                className="sm:block hidden overflow-auto h-[500px] print-desktop 2xl:mb-10 border-t"
              >
                {isInitialLoad && studentsLoading ? (
                  <div className="w-full flex justify-center items-center py-20">
                    <SvgLoader />
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-zinc-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="text-left min-w-60 pl-10 py-4 font-semibold">
                          Student
                        </th>
                        <th className="text-left min-w-28  font-semibold">
                          Student ID
                        </th>
                        <th className="text-left min-w-28  font-semibold">
                          Attendance
                        </th>
                        <th className="text-left min-w-28 font-semibold">
                          Performance
                        </th>
                        <th className="text-left min-w-28 font-semibold">
                          Status
                        </th>
                        <th className="text-left min-w-28  font-semibold">
                          Address
                        </th>
                        <th className="py-4 font-semibold"></th>{" "}
                        <th className="font-semibold "></th>{" "}
                      </tr>
                    </thead>
                    <tbody>
                      {students.length > 0 ? (
                        students?.map((student, idx) => (
                          <tr
                            key={student.id}
                            ref={
                              idx === students.length - 1
                                ? lastStudentRef
                                : null
                            }
                            className="border-y md:text-12 2xl:text-14"
                          >
                            <td className="py-[10px] flex items-center gap-2">
                              <label className="relative cursor-pointer z-0">
                                <input
                                  type="checkbox"
                                  className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-400 bg-white checked:bg-white checked:border-orange-400"
                                  checked={selectedStudents.some(
                                    (s) => s.id === student.id
                                  )}
                                  onChange={(e) =>
                                    handleCheckboxChange(e, student)
                                  }
                                />
                                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 opacity-0 peer-checked:opacity-100 flex">
                                  <FaCheck className="text-10 mb-[6px]" />
                                </span>
                              </label>
                              <Link
                                href={`./details?id=${student.id}`}
                                className="flex items-center gap-2"
                              >
                                <img
                                  src={
                                    student?.profile_picture
                                      ? `${process.env.FILE_BROWSE_URL}${student.profile_picture}`
                                      : DefaultProfile.src
                                  }
                                  className="w-[50px] h-[50px] rounded-full"
                                  alt=""
                                />
                                <span>
                                  {student?.first_name} {student.last_name}
                                </span>
                              </Link>
                            </td>
                            <td className="">
                              {orgShortName || decoded?.org_short_name}
                              {student?.unique_id || "--"}
                            </td>
                            <td className="">
                              <div className="">
                                <span>
                                  {getClassStats(student).attendance}%
                                </span>
                              </div>
                            </td>
                            <td className="">
                              <div className="">
                                <span>
                                  {getClassStats(student).performance}%
                                </span>
                              </div>
                            </td>
                            <td className="">
                              <div className="flex items-center">
                                <span
                                  className={`flex items-center px-3 py-1 text-sm min-w-[90px] justify-start
                                    ${
                                      student.people_orgs[0]?.status ===
                                      "active"
                                        ? "bg-green-100"
                                        : student.people_orgs[0]?.status ===
                                          "inactive"
                                        ? "bg-red-100"
                                        : student.people_orgs[0]?.status ===
                                          "sick_leave"
                                        ? "bg-orange-100"
                                        : student.people_orgs[0]?.status ===
                                          "leave"
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                                    }
                                    rounded
                                  `}
                                >
                                  <span
                                    className={`w-4 h-4 rounded-full mr-3
                                      ${
                                        student.people_orgs[0]?.status ===
                                        "active"
                                          ? "bg-green-400"
                                          : student.people_orgs[0]?.status ===
                                            "inactive"
                                          ? "bg-red-400"
                                          : student.people_orgs[0]?.status ===
                                            "sick_leave"
                                          ? "bg-orange-400"
                                          : student.people_orgs[0]?.status ===
                                            "leave"
                                          ? "bg-blue-300"
                                          : "bg-gray-300"
                                      }
                                    `}
                                  ></span>
                                  {student.people_orgs[0]?.status === "active"
                                    ? "Present"
                                    : student.people_orgs[0]?.status ===
                                      "inactive"
                                    ? "Absent"
                                    : student.people_orgs[0]?.status ===
                                      "sick_leave"
                                    ? "Sick"
                                    : student.people_orgs[0]?.status === "leave"
                                    ? "Leave"
                                    : "-"}
                                </span>
                              </div>
                            </td>
                            <td className=" ">
                              <div className="">
                                {getFullAddress(student.location_id) || "--"}
                              </div>
                            </td>
                            <td>
                              <Dropdown
                                menu={{
                                  items: [
                                    {
                                      key: "1",
                                      label: (
                                        <Link
                                          className="cursor-pointer p-1"
                                          href={`./edit?id=${student.id}`}
                                        >
                                          Edit Profile
                                          <RightOutlined className="text-10 ml-2" />
                                        </Link>
                                      ),
                                    },
                                    {
                                      key: "2",
                                      label: (
                                        <Link
                                          className="cursor-pointer p-1"
                                          href={`./details?id=${student.id}`}
                                        >
                                          View Profile
                                          <RightOutlined className="text-10 ml-2" />
                                        </Link>
                                      ),
                                    },
                                  ],
                                }}
                                trigger={["click"]}
                              >
                                <a onClick={(e) => e.preventDefault()}>
                                  <Space className="cursor-pointer">
                                    <img
                                      src="/assets/img/icons/threeDot.svg"
                                      alt=""
                                    />
                                  </Space>
                                </a>
                              </Dropdown>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center py-20 text-xl font-bold rounded-md text-gray-600"
                          >
                            No students found!
                          </td>
                        </tr>
                      )}
                      {/* {students.length <= 0 ? <>No students found</> : <></>} */}
                    </tbody>
                  </table>
                )}
                {!isInitialLoad && studentsLoading && students.length > 0 && (
                  <div className="w-full flex justify-center items-center py-3">
                    <SvgLoader />
                  </div>
                )}
              </div>
            )}
            <DeleteStudentsModal
              isVisible={deleteModalVisible}
              onCancel={() => setDeleteModalVisible(false)}
              onConfirm={handleDeleteModalConfirm}
              selectedInfo={selectedStudents}
              onRemoveStudent={handleRemoveStudentFromModal}
            />
            <ConfirmDeleteStudentsModal
              isVisible={confirmModalVisible}
              onCancel={() => setConfirmModalVisible(false)}
              onConfirm={handleConfirmDelete}
              selectedInfo={selectedStudents}
            />
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[200px]">
          <SvgLoader />
        </div>
      )}
    </div>
  );
};

export default StudentList;
