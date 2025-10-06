"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { debounce } from "lodash";
import { IoSearch } from "react-icons/io5";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import { FaCheck, FaPlus } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";
import TeacherListCard from "@/components/TeacherManagement/teachers/TeacherListCard";
import { RightOutlined } from "@ant-design/icons";
import {
  useGetTeachersWithExtraDataQuery,
  useLazyGetTeachersWithExtraDataQuery,
  useDeleteBulkTeachersMutation,
} from "@/store/features/teacher-management/apiSlice";
import { useOrgDesignationListQuery } from "@/store/features/auth/apiSlice";
import { Dropdown, Space, message, Modal, Pagination } from "antd";
import LoaderSpinner from "@/components/loader";
import PrintList from "@/components/Print-PDF-Download/print/PrintList";
import { DeleteBtnSvg } from "@/components/helpers/storeAllSvgs";
import UserAccessControlModal from "@/components/UserManagment/UserAccessControlModal";
import DeleteTeachersModal from "@/components/TeacherManagement/DeleteTeachersModal";
import ConfirmDeleteModal from "@/components/TeacherManagement/ConfirmDeleteModal";
import {
  getDecodedToken,
  getOrgShortName,
} from "@/utilities/helpers/getDecodedValus";
import { getCookie } from "cookies-next";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";

const TeachersList = () => {
  // ----------- State Management -----------
  const [queryString, setQueryString] = useState("");
  const [teacherLists, setTeacherLists] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isAccessPermissonModalOpen, setIsAccessPermissonModalOpen] =
    useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedDesignation, setSelectedDesignation] = useState("all");
  const limit = 10;
  const pageRef = useRef(1);
  const observer = useRef(null);

  const decoded = getDecodedToken();
  const orgShortName =
    useSelector((state) => state.auth.orgShortName) || getOrgShortName();

  // ----------- API Queries -----------
  const {
    data: fetchTeachers,
    isFetching: loadingTeachers,
    refetch,
  } = useGetTeachersWithExtraDataQuery(
    {
      page: pageRef.current,
      limit,
      searchTerm: queryString,
      sort,
      sortOrder,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [getTeacher, { data: queryDataTeachers }] =
    useLazyGetTeachersWithExtraDataQuery();

  const {
    data: designationListsData,
    isFetching: loadingDesignationListsData,
  } = useOrgDesignationListQuery();

  const [deleteBulkTeachers] = useDeleteBulkTeachersMutation();

  // ----------- Use Effects -----------

  useEffect(() => {
    if (designationListsData && !loadingDesignationListsData) {
      const allTeachersOption = {
        designation_id: { designation: "all" },
        label: "All Teachers",
        value: "all",
      };

      setDesignationList([allTeachersOption, ...designationListsData.data]);
    }
  }, [designationListsData]);

  useEffect(() => {
    if (fetchTeachers?.data) {
      // For initial load, replace the list; for pagination, append
      if (pageRef.current === 1) {
        setTeacherLists(fetchTeachers?.data);
      } else {
        // Check for duplicates before appending
        setTeacherLists((prev) => {
          const existingIds = new Set(prev.map((teacher) => teacher.id));
          const newTeachers = fetchTeachers.data.filter(
            (teacher) => !existingIds.has(teacher.id)
          );
          return [...prev, ...newTeachers];
        });
      }
      setHasMore(fetchTeachers?.meta?.hasNextPage !== false);
    }
  }, [fetchTeachers]);

  useEffect(() => {
    if (queryDataTeachers?.data) {
      if (queryDataTeachers.data.length === 0) {
        setHasMore(false);
        return;
      }

      // For search/filter/sort operations, replace the list
      // For pagination, append to the list
      if (pageRef.current === 1) {
        setTeacherLists(queryDataTeachers.data);
      } else {
        // Check for duplicates before appending
        setTeacherLists((prev) => {
          const existingIds = new Set(prev.map((teacher) => teacher.id));
          const newTeachers = queryDataTeachers.data.filter(
            (teacher) => !existingIds.has(teacher.id)
          );
          return [...prev, ...newTeachers];
        });
      }

      setHasMore(queryDataTeachers.data.length === limit);
    }
  }, [queryDataTeachers]);

  // ----------- Callbacks -----------

  const lastItemRef = useCallback(
    (node) => {
      if (loadingTeachers || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingTeachers) {
          if (hasMore) {
            pageRef.current += 1;
            getTeacher({
              page: pageRef.current,
              limit,
              searchTerm: queryString,
              sort,
              sortOrder,
              designation:
                selectedDesignation !== "all" ? selectedDesignation : undefined,
            });
          }
        }
      });

      if (node) observer.current.observe(node);
    },
    [
      loadingTeachers,
      hasMore,
      queryString,
      sort,
      sortOrder,
      selectedDesignation,
      getTeacher,
    ]
  );

  const debouncedSearch = useCallback(
    debounce((query) => {
      pageRef.current = 1;
      setHasMore(true);
      setTeacherLists([]);
      getTeacher({ page: 1, limit, searchTerm: query });
    }, 500),
    []
  );

  // ----------- Handlers -----------

  const handleCheckboxChange = (e, teacher) => {
    if (e.target.checked) {
      setSelectedTeachers((prev) => [...prev, teacher]);
    } else {
      setSelectedTeachers((prev) => prev.filter((t) => t?.id !== teacher?.id));
    }
  };

  const handleRemoveTeacherFromModal = (teacherId) => {
    setSelectedTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  };

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

    // Reset pagination and clear list
    pageRef.current = 1;
    setHasMore(true);
    setTeacherLists([]);

    // Disconnect observer to prevent stale calls
    if (observer.current) {
      observer.current.disconnect();
    }

    getTeacher({
      page: 1,
      limit,
      searchTerm: queryString,
      designation:
        selectedDesignation !== "all" ? selectedDesignation : undefined,
      sort: newSort,
      sortOrder: newOrder,
    });
  };

  const searchHandler = (e) => {
    const newQuery = e.target.value;
    setQueryString(newQuery);
    debouncedSearch(newQuery);
  };

  const designationChangeHandler = (value, option) => {
    setSelectedDesignation(value);
    pageRef.current = 1;
    setHasMore(true);
    setTeacherLists([]);

    // Disconnect observer to prevent stale calls
    if (observer.current) {
      observer.current.disconnect();
    }

    const queryParams = {
      page: 1,
      limit,
      searchTerm: queryString,
      sort,
      sortOrder,
      ...(value !== "all" && { designation: value }),
    };

    getTeacher(queryParams);
  };

  // Handle modal

  const openAccessControlModal = (userId) => {
    setSelectedUserId(userId);
    setIsAccessPermissonModalOpen(true);
  };

  const DropDownItemLabel = ({ label }) => (
    <>
      {label} <RightOutlined className="text-10" />
    </>
  );

  const handleBulkDelete = async (note) => {
    try {
      const items = selectedTeachers?.map((teacher) => teacher?.id);

      const response = await deleteBulkTeachers({
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
        setTeacherLists([]);
        setHasMore(true);
        setSelectedTeachers([]);

        getTeacher({
          page: 1,
          limit,
          searchTerm: queryString,
          sort,
          sortOrder,
          designation:
            selectedDesignation !== "all" ? selectedDesignation : undefined,
        });
      } else {
        message.error(response.message || "Failed to delete teachers");
      }

      setDeleteModalVisible(false);
    } catch (error) {
      message.error("Failed to delete teachers");
      console.error("Failed to delete teachers:", error);
    }
  };

  const handleConfirmDelete = async (note) => {
    try {
      await handleBulkDelete(note);
      setConfirmModal(false);
    } catch (error) {
      console.error("Failed to delete teachers:", error);
    }
  };

  const handleDeleteButtonClick = () => {
    if (selectedTeachers?.length === 0) {
      message.warning("Please select teachers to delete");
      return;
    }
    setDeleteModalVisible(true);
  };

  const handleDeleteModalConfirm = () => {
    setDeleteModalVisible(false);
    setConfirmModal(true);
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="">
      {/* Top Bar */}
      <div className="flex justify-between items-center no-print">
        <p className="text-gray-600 text-14 flex items-center font-bold pl-2">
          <Link href="/teachers">Teacher Management</Link>
          <span className="md:mx-3">
            <MdKeyboardArrowRight />
          </span>
          <Link href="/teachers/lists" className="text-black">
            Teachers
          </Link>
        </p>
        <Link
          href="/teachers/invite"
          className="fixed right-4  md:static  bg-black py-[9px] px-[20px] rounded-[8px] flex justify-center gap-center gap-2 "
        >
          <FaPlus className="text-white inline-flex mt-1" />
          <span className="text-white">Add Teacher</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="mt-5 px-6 2xl:py-6 py-4 rounded-[12px] shadow-custom-effect ">
        <div className="md:flex flex-wrap justify-between items-center gap-3 mb-4 no-print ">
          <p className="text-2xl font-bold">Teachers</p>

          <div className="md:flex flex-wrap items-center gap-3 ">
            {/* Search Input */}

            <div className="flex items-center gap-3">
              <div className="w-[187px] h-[36px] relative">
                <input
                  value={queryString}
                  onChange={searchHandler}
                  placeholder="Search"
                  type="text"
                  className="w-full h-full pl-[40px] pr-5 border border-primary-brand-500 text-16 rounded"
                />
                <span className="absolute left-[10px] top-1/2 transform -translate-y-1/2 text-2xl text-gray-500">
                  <IoSearch />
                </span>
              </div>
              {/* Sort + Designation Filters */}

              <div className="w-[187px]">
                <SelectBox
                  inputHeight="!h-[36px]"
                  handler={sortChangeHandler}
                  placeholder="Sort by A-Z"
                  list={[
                    { label: "Sort by A-Z", value: "az" },
                    { label: "Sort by Z-A", value: "za" },
                    { label: "Newest", value: "newest" },
                    { label: "Oldest", value: "oldest" },
                  ]}
                />
              </div>

              {/* ----------------Sort By A-Z-------------- */}
              <div className="w-[187px]">
                <SelectBox
                  inputHeight="!h-[36px]"
                  handler={designationChangeHandler}
                  placeholder="By Designation"
                  defaultValue="all"
                  list={designationList.map((item) => ({
                    ...item,
                    label:
                      item.designation_id?.designation === "all"
                        ? "All Teachers"
                        : item.designation_id?.designation,
                    value: item.designation_id?.designation,
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {selectedTeachers && (
                <button
                  onClick={handleDeleteButtonClick}
                  className="flex items-center hover:text-red-700"
                >
                  <DeleteBtnSvg />
                  {selectedTeachers.length > 0 && (
                    <span className="bg-red-700 text-white px-[7px] py-[3px] rounded-full text-12 -ml-2 mb-2">
                      {selectedTeachers.length}
                    </span>
                  )}
                </button>
              )}

              <PrintList viewType={"teacherlist"} data={teacherLists} />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="sm:block hidden overflow-auto h-[500px] print-desktop 2xl:mb-10 border-t">
          <table className="w-full">
            <thead className="bg-zinc-50 sticky top-0 z-10 shadow-sm">
              <tr className="text-black text-left md:text-14 2xl:text-16">
                <th className="w-1/4 pl-8 py-6">Teachers</th>
                <th className="w-1/6  ">Teacher ID</th>
                <th className="w-1/6  ">Designation</th>
                <th className="w-1/6  ">Contact</th>
                <th className="w-1/8  ">Status</th>
                <th className="w-1/7  "></th>
                <th className="w-1/7  "></th>
              </tr>
            </thead>
            <tbody>
              {loadingTeachers && pageRef.current === 1 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <LoaderSpinner />
                  </td>
                </tr>
              ) : teacherLists?.length > 0 ? (
                teacherLists?.map((teacher, index) => (
                  <tr
                    key={index}
                    ref={
                      index === teacherLists?.length - 1 ? lastItemRef : null
                    }
                    className="border-y md:text-12 2xl:text-14"
                  >
                    <td className="py-3  z-0" style={{ zIndex: 0 }}>
                      <div className="flex items-center gap-4 ">
                        <label className="relative cursor-pointer  z-0">
                          <input
                            type="checkbox"
                            className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-400 bg-white checked:bg-white checked:border-orange-400"
                            onChange={(e) => handleCheckboxChange(e, teacher)}
                            checked={selectedTeachers.some(
                              (t) => t.id === teacher.id
                            )}
                          />
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 opacity-0 peer-checked:opacity-100 flex">
                            <FaCheck className="text-10 mb-[6px]" />
                          </span>
                        </label>
                        <img
                          src={
                            teacher?.profile_picture
                              ? `${process.env.FILE_BROWSE_URL}${teacher?.profile_picture}`
                              : DefaultProfile.src
                          }
                          alt=""
                          className="w-[50px] h-[50px] rounded-full"
                        />
                        <Link href={`/teachers/lists/${teacher?.id}`}>
                          {teacher?.first_name + " " + teacher?.last_name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3">
                      {orgShortName || decoded?.org_short_name}
                      {teacher?.unique_id || "-"}
                    </td>
                    <td className="py-3">
                      {teacher?.designation_employees
                        ?.map(
                          (d) =>
                            d.designation_org_id?.designation_id?.designation
                        )
                        .join(", ")}
                    </td>
                    <td className="py-3 ">
                      {
                        teacher?.user_id?.mobiles?.find(
                          (item) => item.mobile_type === "primary"
                        )?.mobile_no
                      }
                    </td>
                    <td className="py-3 ">
                      {teacher?.people_orgs?.[0] && (
                        <div className="flex items-center gap-2 ">
                          <div
                            className={`w-[10px] h-[10px] rounded-full ${
                              teacher?.people_orgs[0].status === "active"
                                ? "bg-[#60EC6E]"
                                : teacher?.people_orgs[0].status ===
                                  "casual leave"
                                ? "bg-[#B6BFF0]"
                                : teacher?.people_orgs[0].status ===
                                  "sick leave"
                                ? "bg-[#FDAE51]"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <span>{teacher?.people_orgs[0]?.status}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 no-print">
                      <Link
                        href={`/teachers/lists/${teacher?.id}`}
                        className="font-bold underline pl-3 flex"
                      >
                        View Profile
                      </Link>
                    </td>
                    <td className="no-print">
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "1",
                              label: (
                                <Link
                                  className="cursor-pointer  p-1"
                                  href={`/teachers/update/${teacher?.id}`}
                                >
                                  Edit Profile
                                  <RightOutlined className="text-10" />
                                </Link>
                              ),
                            },
                            {
                              key: "2",
                              label: (
                                <div
                                  className=" p-1 cursor-pointer"
                                  onClick={() =>
                                    openAccessControlModal(teacher.user_id.id)
                                  }
                                >
                                  <DropDownItemLabel label="Role Management" />
                                </div>
                              ),
                            },
                          ],
                        }}
                        trigger={["click"]}
                      >
                        <a onClick={(e) => e.preventDefault()}>
                          <Space className="cursor-pointer">
                            <img src="/assets/img/icons/threeDot.svg" alt="" />
                          </Space>
                        </a>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No teachers found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loadingTeachers && pageRef.current > 1 && (
            <div className="text-center py-4">
              <LoaderSpinner />
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="print-mobile sm:hidden">
          {loadingTeachers && pageRef.current === 1 ? (
            <div className="text-center py-8">
              <LoaderSpinner />
            </div>
          ) : teacherLists?.length > 0 ? (
            teacherLists.map((teacher, i) => (
              <TeacherListCard key={i} teacher={teacher} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No teachers found!
            </div>
          )}

          {loadingTeachers && pageRef.current > 1 && (
            <div className="text-center py-4">
              <LoaderSpinner />
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteTeachersModal
        isVisible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteModalConfirm}
        selectedInfo={selectedTeachers}
        onRemoveTeacher={handleRemoveTeacherFromModal}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isVisible={confirmModal}
        onCancel={() => setConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        selectedInfo={selectedTeachers}
      />

      {/* Access Control Modal */}
      {isAccessPermissonModalOpen && (
        <UserAccessControlModal
          userId={selectedUserId}
          modalAction={setIsAccessPermissonModalOpen}
        />
      )}
    </div>
  );
};

export default TeachersList;
