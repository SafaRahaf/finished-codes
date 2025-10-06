"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Dropdown, message, Modal } from "antd";
import { debounce } from "lodash";
import {
  PlusSvg,
  SearchSvg,
  ThreeDotsSvg,
} from "@/components/helpers/storeAllSvgs";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import InputDropdown from "@/components/common/Inputs/Input/InputDropdown";
import {
  useGetClassStudentsQuery,
  useLazyGetClassStudentsQuery,
  useDissociateStudentFromClassMutation,
} from "@/store/features/class-management/apiSlice";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import AddStudentIntoClassModal from "@/components/ClassManagement/AddStudentIntoClassModal";
import { RightOutlined } from "@ant-design/icons";
import moment from "moment";

const ClassStudentsTable = ({
  classId,
  refetchClassData,
  updateStudentCounts,
}) => {
  const [addStudentModalToggle, setAddStudentModalToggle] = useState(false);
  const [queryString, setQueryString] = useState("");
  const [selectBoxTrue, setSelectBoxTrue] = useState(false);
  const [sorting, setSorting] = useState("first_name");
  const [sortBy, setSortBy] = useState("asc");
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const pageRef = useRef(1);
  const observer = useRef(null);
  const [StudentsByClass, setStudentsByClass] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: fetchStudents, isFetching: loadingStudents } =
    useGetClassStudentsQuery({
      id: classId,
      page: pageRef.current,
      limit: limit,
      searchTerm: queryString,
      sort: sorting,
      sortOrder: sortBy,
    });

  const [
    getClassStudents,
    { data: queryDataStudents, isFetching: queryStudentsLoading },
  ] = useLazyGetClassStudentsQuery();

  const [dissociateStudent] = useDissociateStudentFromClassMutation();

  const getUniqueStudents = (students) => {
    const uniqueStudentsMap = new Map();
    students.forEach((student) => {
      if (student?.unique_id) {
        uniqueStudentsMap.set(student.unique_id, student);
      }
    });
    return Array.from(uniqueStudentsMap.values());
  };

  useEffect(() => {
    if (fetchStudents?.data?.length > 0) {
      const newStudents = fetchStudents.data;
      setStudentsByClass((prev) => {
        const combinedStudents =
          pageRef.current === 1 ? newStudents : [...prev, ...newStudents];
        return getUniqueStudents(combinedStudents);
      });
      setHasMore(fetchStudents?.meta?.hasNextPage !== false);
    } else if (fetchStudents?.data?.length === 0 && pageRef.current === 1) {
      setStudentsByClass([]);
      setHasMore(false);
    }
  }, [fetchStudents]);

  useEffect(() => {
    if (queryDataStudents?.data) {
      const newStudents = queryDataStudents.data;
      if (newStudents.length === 0 && pageRef.current === 1) {
        setStudentsByClass([]);
        setHasMore(false);
        return;
      }
      setStudentsByClass((prev) => {
        const combinedStudents =
          pageRef.current === 1 ? newStudents : [...prev, ...newStudents];
        return getUniqueStudents(combinedStudents);
      });
      setHasMore(newStudents.length === limit);
    }
  }, [queryDataStudents]);

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
            id: classId,
            page: pageRef.current,
            limit,
            searchTerm: queryString,
            sort: sorting,
            sortOrder: sortBy,
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [
      loadingStudents,
      queryStudentsLoading,
      hasMore,
      queryString,
      sorting,
      sortBy,
    ]
  );

  const debouncedSearch = useCallback(
    debounce((query) => {
      pageRef.current = 1;
      setHasMore(true);
      setStudentsByClass([]);
      getClassStudents({
        id: classId,
        page: 1,
        limit,
        searchTerm: query,
        sort: sorting,
        sortOrder: sortBy,
      });
    }, 500),
    [sorting, sortBy]
  );

  const searchHandler = (e) => {
    const newQuery = e.target.value;
    setQueryString(newQuery);
    pageRef.current = 1;
    setHasMore(true);
    setStudentsByClass([]);
    debouncedSearch(newQuery);
  };

  const options = [
    { value: "1", label: "A-Z" },
    { value: "2", label: "Z-A" },
    { value: "3", label: "Attendance" },
    { value: "4", label: "Performance" },
  ];

  const handleSortChange = (value) => {
    let newSort = "first_name";
    let newOrder = "asc";

    switch (value) {
      case "1": // A-Z
        newSort = "first_name";
        newOrder = "asc";
        break;
      case "2": // Z-A
        newSort = "first_name";
        newOrder = "desc";
        break;
      case "3": // Attendance
        newSort = "attendance_percentage";
        newOrder = "desc";
        break;
      case "4": // Performance
        newSort = "performance_percentage";
        newOrder = "desc";
        break;
      default:
        newSort = "first_name";
        newOrder = "asc";
    }

    setSorting(newSort);
    setSortBy(newOrder);
    pageRef.current = 1;
    setHasMore(true);
    // setStudentsByClass([]);
    getClassStudents({
      id: classId,
      page: 1,
      limit,
      searchTerm: queryString,
      sort: newSort,
      sortOrder: newOrder,
    });
  };

  const studentsOnClass =
    StudentsByClass?.length > 0
      ? StudentsByClass.map((stdnt) => stdnt.unique_id)
      : [];

  const handleDissociateStudent = async (studentId) => {
    const todayLocal = moment();
    const todayUTC = todayLocal.clone().utc();
    const formattedtime = todayUTC.format("YYYY-MM-DD");

    try {
      setIsLoading(true);

      // Local instant removal
      setStudentsByClass((prev) => prev.filter((s) => s.id !== studentId));
      setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId));
      setHasMore(true);
      pageRef.current = 1;

      const studentToRemove = StudentsByClass.find(
        (student) => student.id === studentId
      );

      await dissociateStudent({
        class_id: Number(classId),
        student_ids: [studentId],
        date: formattedtime,
        reFetch: getClassStudents,
        modalHandler: null,
      }).unwrap();

      if (updateStudentCounts && studentToRemove) {
        const isBoy =
          studentToRemove.gender === "male" ||
          studentToRemove.gender === "Male";
        updateStudentCounts(isBoy ? -1 : 0, isBoy ? 0 : -1);
      }

      // Fresh fetch page 1 to sync
      await getClassStudents({
        id: classId,
        page: 1,
        limit,
        searchTerm: queryString,
        sort: sorting,
        sortOrder: sortBy,
      });

      setIsLoading(false);
      setDeleteModalVisible(false);
    } catch (error) {
      console.error("Failed to dissociate student:", error);
      message.error("Failed to remove student. Please try again.");
      setIsLoading(false);
    }
  };

  const getDropdownItems = (student) => [
    {
      key: "Remove Student",
      label: (
        <div
          className="p-1 cursor-pointer text-16"
          onClick={() => {
            setIsBulkDelete(false);
            setDeleteModalData(student);
            setDeleteModalVisible(true);
          }}
        >
          Remove Student
          <RightOutlined className="text-10 ml-2" />
        </div>
      ),
    },
  ];

  const handleCheckboxChange = (e, student) => {
    if (e.target.checked) {
      setSelectedStudents((prev) => [...prev, student]);
    } else {
      setSelectedStudents((prev) => prev.filter((s) => s.id !== student.id));
    }
  };

  const handleBulkDissociate = async () => {
    try {
      setIsLoading(true);
      const studentIds = selectedStudents.map((student) => student.id);

      // Local instant removal
      setStudentsByClass((prev) =>
        prev.filter((s) => !studentIds.includes(s.id))
      );
      setHasMore(true);
      pageRef.current = 1;

      let boysToRemove = 0;
      let girlsToRemove = 0;
      selectedStudents.forEach((student) => {
        const isBoy = student.gender === "male" || student.gender === "Male";
        if (isBoy) boysToRemove++;
        else girlsToRemove++;
      });

      await dissociateStudent({
        class_id: Number(classId),
        student_ids: studentIds,
        reFetch: getClassStudents,
        modalHandler: null,
      }).unwrap();

      if (updateStudentCounts)
        updateStudentCounts(-boysToRemove, -girlsToRemove);

      setDeleteModalVisible(false);
      setSelectedStudents([]);
      setSelectBoxTrue(false);

      // Fresh fetch page 1 to sync
      await getClassStudents({
        id: classId,
        page: 1,
        limit,
        searchTerm: queryString,
        sort: sorting,
        sortOrder: sortBy,
      });
    } catch (error) {
      message.error("Failed to remove student(s). Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteButtonClick = () => {
    if (selectedStudents.length === 0) {
      message.warning("Please select students to remove");
      return;
    }

    setIsBulkDelete(true);
    setDeleteModalVisible(true);
  };
  const headerDropdownItems = [
    {
      key: "remove-multiple",
      label: (
        <div
          className="p-1 cursor-pointer text-16"
          onClick={() => {
            setSelectBoxTrue((prev) => !prev);
          }}
        >
          {selectBoxTrue ? "Cancel Selection" : "Remove Multiple Students"}
          <RightOutlined className="text-10 ml-2" />
        </div>
      ),
    },
  ];

  return (
    <div className=" h-full w-full overflow-x-auto lg:pb-4 lg:pt-10 lg:px-6 p-5 bg-[#fff] shadow-lg rounded-[12px] shadow-custom-effect">
      <div className="flex  lg:flex-row xl:flex-wrap flex-col mb-6 justify-between lg:items-center gap-2 ">
        <p className="text-2xl font-bold text-left">Students</p>
        <div className=" flex justify-end items-center gap-[8px]">
          <InputDropdown
            placeholder="A-Z"
            options={options}
            onChange={(e) => handleSortChange(e.target.value)}
            defaultValue="1"
            classStyle="!w-[136px]"
          />
          <div className="w-[136px] h-[36px]  xl:block block rounded border border-[#798295] relative st-search">
            <input
              value={queryString}
              onChange={(e) => searchHandler(e)}
              placeholder="Search..."
              type="text"
              className="w-full h-full pl-[50px] pr-5 text-primary-brand-900 placeholder:text-primary-brand-300 text-16 tracking-wide rounded"
            />
            <span className="absolute left-[17px] top-1/2 transform -translate-y-1/2">
              <SearchSvg />
            </span>
          </div>
          <Button
            onClick={() => setAddStudentModalToggle(true)}
            style={{ background: "black" }}
            size="large"
          >
            <div className="text-sm bg-black text-white flex space-x-3 items-center">
              <PlusSvg />
              <span>Add Student</span>
            </div>
          </Button>
        </div>
      </div>

      <div className="table-responsive overflow-x-auto">
        <div
          className="w-full overflow-x-auto overflow-y-auto "
          style={{ maxHeight: "500px" }}
        >
          <table className="w-full ">
            <thead className="z-10 shadow-sm bg-white ">
              <tr
                className="text-black sticky top-0 bg-white z-10 border-y 
text-left"
              >
                <th className="  py-6 font-semibold  ">
                  {selectBoxTrue && (
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-2xl border-[2px] border-gray-400 checked:border-orange-400 checked:bg-white appearance-none cursor-pointer transition-all duration-200 relative 
                        before:content-['✔'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-orange-400 before:opacity-0 checked:before:opacity-100"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(StudentsByClass);
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                      checked={
                        StudentsByClass.length > 0 &&
                        selectedStudents.length === StudentsByClass.length
                      }
                    />
                  )}
                </th>
                <th className="  py-6 font-semibold min-w-10">Student Name</th>
                <th className="  py-6 font-semibold min-w-10">Attendance</th>
                <th className="  py-6 font-semibold min-w-10">Performance</th>
                <th className="py-6 font-semibold min-w-10">
                  <Dropdown
                    menu={{ items: headerDropdownItems }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <div className="cursor-pointer">...</div>
                  </Dropdown>
                </th>
              </tr>
            </thead>
            <tbody className="text-black ">
              {StudentsByClass?.length > 0 ? (
                StudentsByClass?.map((item, itemIndex) => (
                  <tr
                    key={item.id}
                    ref={
                      itemIndex === StudentsByClass.length - 1
                        ? lastItemRef
                        : null
                    }
                    className="border-y border-primary-brand-100 "
                  >
                    <td className=" ">
                      {selectBoxTrue && (
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-2xl border-[2px] border-gray-400 checked:border-orange-400 checked:bg-white appearance-none cursor-pointer transition-all duration-200 relative 
                            before:content-['✔'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-orange-400 before:opacity-0 checked:before:opacity-100"
                          onChange={(e) => handleCheckboxChange(e, item)}
                          checked={selectedStudents.some(
                            (s) => s.id === item.id
                          )}
                        />
                      )}
                    </td>
                    <td className=" py-4 flex ">
                      <img
                        src={
                          item?.profile_picture
                            ? `${process.env.FILE_BROWSE_URL}${item?.profile_picture}`
                            : DefaultProfile.src
                        }
                        className="w-[40px] h-[40px] rounded-full"
                        alt=""
                      />
                      <span className="flex items-center pl-2">
                        {item?.first_name + " " + item?.last_name}
                      </span>
                    </td>
                    <td className=" ">
                      {item?.class_people[0]?.attendance_percentage}%
                    </td>
                    <td className=" ">
                      {item?.class_people[0]?.performance_percentage}%
                    </td>
                    <td className=" ">
                      <Dropdown
                        menu={{
                          items: getDropdownItems(item),
                        }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <div className="cursor-pointer">
                          <ThreeDotsSvg />
                        </div>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              ) : !loadingStudents ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-gray-500 h-[300px] px-6"
                  >
                    No students have been added yet. You can add students to
                    this department/grade from any single class or during
                    onboarding.
                  </td>
                </tr>
              ) : (
                <></>
              )}
            </tbody>
          </table>
          {loadingStudents && (
            <div className="flex justify-center py-4">
              <SvgLoader />
            </div>
          )}
        </div>
      </div>
      {selectedStudents.length > 0 && (
        <div className="flex justify-end items-center w-full pt-4  bg-white sticky bottom-0 z-20 border-t">
          <button
            onClick={handleDeleteButtonClick}
            className="flex items-center gap-2 px-5 py-3 rounded-md bg-[#22252B] text-white hover:bg-[#000] transition-colors  font-medium"
          >
            Remove Students ({selectedStudents.length})
          </button>
        </div>
      )}

      {addStudentModalToggle && (
        <AddStudentIntoClassModal
          classId={classId}
          handler={setAddStudentModalToggle}
          reFetch={getClassStudents}
          refetchClassData={refetchClassData}
          studentsOnClass={studentsOnClass}
          updateStudentCounts={updateStudentCounts}
        />
      )}

      {/* <Modal
        title="Remove Students"
        open={deleteModalVisible}
        onOk={handleBulkDissociate}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Remove"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to remove {selectedStudents.length} student
          {selectedStudents.length > 1 ? "s" : ""} from this class?
        </p>
      </Modal> */}

      <Modal
        open={deleteModalVisible}
        footer={null}
        onCancel={() => setDeleteModalVisible(false)}
        closable={false}
      >
        <div className="p-2 m-1 mb-0 pt-0 leading-[26px] tracking-[0.32px] ">
          <div className="flex gap-3 items-center mb-3">
            <img
              src="/assets/img/icons/Exclamation.png"
              alt="Exclamation Mark"
            />
            <h2 className="text-[16px] font-bold text-[#F47B0A] tracking-normal">
              {isBulkDelete ? "Remove Students?" : "Remove Student?"}
            </h2>
          </div>
          <hr />
          <p className="my-4 text-16">
            {isBulkDelete
              ? `Do you wish to remove ${selectedStudents.length} students from this class? Their data will remain secure in the database for future re-enrollment.`
              : "Do you wish to remove the student from this class? Their data will remain secure in the database for future re-enrollment."}
          </p>

          {isBulkDelete ? (
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
              {selectedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 border-b border-gray-100 pb-2"
                >
                  <img
                    className="w-10 h-10 rounded-full"
                    src={
                      student?.profile_picture
                        ? `${process.env.FILE_BROWSE_URL}${student.profile_picture}`
                        : DefaultProfile.src
                    }
                    alt="Student"
                  />
                  <span className="text-sm text-black">
                    {student?.first_name} {student?.last_name} –{" "}
                    <span className="font-normal">{student?.unique_id}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            deleteModalData && (
              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full"
                  src={
                    deleteModalData?.profile_picture
                      ? `${process.env.FILE_BROWSE_URL}${deleteModalData.profile_picture}`
                      : DefaultProfile.src
                  }
                  alt="Student"
                />
                <span className="text-sm text-black">
                  {deleteModalData?.first_name} {deleteModalData?.last_name} –{" "}
                  <span className="font-normal">
                    {deleteModalData?.unique_id}
                  </span>
                </span>
              </div>
            )
          )}

          <hr className="my-4" />

          <div className="flex justify-between">
            <button
              className="flex items-center text-16 justify-center gap-2 px-5 py-[9px] rounded-md bg-[#FDAE51] text-white font-medium"
              onClick={() => {
                if (!isLoading) {
                  isBulkDelete
                    ? handleBulkDissociate()
                    : handleDissociateStudent(deleteModalData?.id);
                }
              }}
            >
              {isLoading ? <SvgLoader /> : "Remove"}
            </button>
            <button
              className="flex items-center text-16 justify-center gap-2 px-5 py-[9px] rounded-md border border-[#22252B] text-[#22252B] font-medium"
              onClick={() => setDeleteModalVisible(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassStudentsTable;
