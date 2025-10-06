"use client";
import "./users.css";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { debounce } from "lodash";
import { Pagination } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useDesignationListQuery } from "@/store/features/auth/apiSlice";
import {
  useGetUsersWithExtraDataQuery,
  useLazyGetUsersWithExtraDataQuery,
} from "@/store/features/user-management/apiSlice";
import { IoSettingsOutline, IoSearch } from "react-icons/io5";
import { PiPrinterLight } from "react-icons/pi";
import UserAccessControlModal from "@/components/UserManagment/UserAccessControlModal";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaPlus, FaCheck } from "react-icons/fa";
import { RightOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import { DeleteBtnSvg } from "@/components/helpers/storeAllSvgs";
import PrintList from "@/components/Print-PDF-Download/print/PrintList";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const Users = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [queryString, setQueryString] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const limit = 10;
  const [UserLists, setUserLists] = useState([]);
  const { data: fetchUsers, isFetching: loadingUsers } =
    useGetUsersWithExtraDataQuery({
      page: currentPage,
      limit: limit,
      searchTerm: queryString,
    });
  const [
    getTeacher,
    { data: queryDataTeachers, isFetching: queryTeachersLoading },
  ] = useLazyGetUsersWithExtraDataQuery();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 600);
    };
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (fetchUsers && !loadingUsers) {
      setUserLists(fetchUsers?.data);
      setTotalPages(fetchUsers?.meta?.total);
    }
  }, [fetchUsers, loadingUsers]);
  useEffect(() => {
    if (queryDataTeachers && !queryTeachersLoading) {
      setUserLists(queryDataTeachers?.data);
      setTotalPages(queryDataTeachers?.meta?.total);
    }
  }, [queryDataTeachers]);

  // change page
  const handleChangePage = (page) => {
    setCurrentPage(page);
  };
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      getTeacher({ page: currentPage, limit: limit, searchTerm: query });
    }, 500),
    [currentPage, limit]
  );

  // Handle input change
  const searchHandler = (e) => {
    const newQuery = e.target.value;
    setQueryString(newQuery);
    debouncedSearch(newQuery);
  };

  // list of institutions
  const [designationList, setDesignationList] = useState([]);
  const {
    data: designationListsData,
    isFetching: loadingDesignationListsData,
  } = useDesignationListQuery();
  useEffect(() => {
    if (!loadingDesignationListsData && designationListsData) {
      setDesignationList(designationListsData?.data);
    }
  }, [designationListsData, loadingDesignationListsData]);

  const designationChangeHandler = (value, option) => {
    getTeacher({
      page: currentPage,
      limit: limit,
      searchTerm: queryString,
      designation: value,
    });
  };

  // user access control
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [accessPermissonModal, setAccessPermissonModal] = useState(false);
  const openAccessControlModal = (userId) => {
    setSelectedUserId(userId);
    setAccessPermissonModal(true);
  };

  const DropDownItemLabel = ({ label }) => (
    <>
      {label} <RightOutlined className="text-10" />
    </>
  );

  return (
    <div>
      <div className="flex lg:flex-row flex-col gap-3 justify-between  pl-6">
        <p className="text-gray-600 flex items-center">
          Dashboard <MdKeyboardArrowRight className="mx-4" />
          <span className="text-black font-bold">Users</span>
        </p>
      </div>

      <div className="card shadow-custom-effect px-6 py-8 rounded-[12px] mt-8">
        <div className="flex justify-between items-center gap-3 mb-4">
          <p className="text-2xl font-bold">User Lists</p>
          <div className="flex justify-end items-center gap-3 lg:flex-row xl:flex-row md:flex-row flex-col">
            <div className="w-[200px] h-[36px] rounded border border-primary-brand-500 relative ">
              {/* search input */}
              <input
                value={queryString}
                onChange={(e) => searchHandler(e)}
                placeholder="Search..."
                type="text"
                className="w-full  h-full pl-[50px] pr-5 text-primary-brand-900 placeholder:text-primary-brand-300 text-16 tracking-wide rounded "
              />
              {/* search icon */}
              <span className="absolute left-[10px] top-1/2 transform -translate-y-1/2 text-2xl text-gray-500">
                <IoSearch />
              </span>
            </div>
            <div className="label w-[187px]">
              <SelectBox
                inputHeight="!h-[36px]"
                handler={(value, option) =>
                  designationChangeHandler(value, option)
                }
                placeholder="Select Designation"
                list={
                  designationList &&
                  designationList.length > 0 &&
                  designationList.map((item) => ({
                    ...item,
                    label: item.designation,
                    value: item.designation,
                  }))
                }
              />
            </div>
            <div className="flex items-center gap-3">
              {/* <button className="flex items-center hover:text-red-700">
                <DeleteBtnSvg />
              </button> */}
              <PrintList viewType={"userlist"} data={UserLists} />
            </div>
          </div>
        </div>
        <hr />
        <div className="mt-4"></div>

        {isMobileView ? (
          <div className="grid grid-cols-1 gap-4">
            {" "}
            {loadingUsers && !fetchUsers ? (
              <div className="flex justify-center mt-4">
                <span>
                  <SvgLoader />
                </span>
              </div>
            ) : (
              UserLists &&
              UserLists.length > 0 &&
              UserLists.map((user) => (
                <div
                  key={user?.id}
                  className="border p-4 flex rounded-lg shadow-md items-start gap-4"
                >
                  <div>
                    <img
                      src={
                        user?.people?.profile_picture
                          ? `${
                              process.env.FILE_BROWSE_URL +
                              user?.people?.profile_picture
                            }`
                          : DefaultProfile.src
                      }
                      className="w-[60px] h-[60px] rounded-full"
                      alt={`${user?.people?.first_name}`}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <div className="font-medium text-xl text-gray-800">
                        {user?.people?.first_name} {user?.people?.last_name}
                      </div>
                      <div>
                        <button
                          onClick={() => openAccessControlModal(user.id)}
                          type="button"
                          className="font-bold underline"
                        >
                          <div className="flex space-x-1 items-center">
                            <span className="font-extrabold text-xl text-black pr-1">
                              <IoSettingsOutline />
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                    <p>
                      <span className="font-medium text-gray-800">ID: </span>
                      {user?.people?.unique_id}
                    </p>

                    <p>
                      <span className="font-medium text-gray-800">
                        Designation:{" "}
                      </span>
                      {user?.people?.designation_employees.length
                        ? user?.people?.designation_employees
                            .map(
                              (designation) =>
                                designation?.designation_org_id?.designation_id
                                  ?.designation
                            )
                            .join(", ")
                        : "_"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">
                        Phone number :{" "}
                      </span>
                      {user?.mobiles.length &&
                        user?.mobiles
                          .map((Contact) => Contact?.mobile_no)
                          .slice(0, 1)
                          .join(", ")}
                      {user?.mobiles.length > 1 && "..."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="table-responsive ">
            {loadingUsers && !fetchUsers ? (
              <div className="flex justify-center mt-4">
                <span>
                  <SvgLoader />
                </span>
              </div>
            ) : (
              <div className="w-full  h-[600px] overflow-y-scroll">
                <table className="overflow-hidden table xl:w-full w-[100%]">
                  <thead className="bg-zinc-50 sticky top-0 z-10 shadow-sm">
                    <tr className="text-black text-left md:text-12 2xl:text-14">
                      <th className="pl-5 py-6 font-semibold">Users</th>
                      <th className="py-6 font-semibold">User ID</th>
                      <th className="py-6 font-semibold">Designation</th>
                      <th className="py-6 font-semibold">Contact</th>
                      <th className="py-6 font-semibold">Manage Access</th>
                      {/* <th className="py-4 font-semibold"></th> */}
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {UserLists &&
                      UserLists.length > 0 &&
                      UserLists.map((user) => (
                        <tr
                          key={user?.id}
                          className="border-y md:text-12 2xl:text-14"
                        >
                          <td className="py-3 z-0" style={{ zIndex: 0 }}>
                            <div className="flex items-center gap-4">
                              <label className="relative cursor-pointer z-0">
                                {/* <input
                                  type="checkbox"
                                  className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-400 bg-white checked:bg-white checked:border-orange-400"
                                /> */}
                                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 opacity-0 peer-checked:opacity-100 flex">
                                  <FaCheck className="text-10 mb-[6px]" />
                                </span>
                              </label>
                              <img
                                src={
                                  user?.people?.profile_picture
                                    ? `${
                                        process.env.FILE_BROWSE_URL +
                                        user?.people?.profile_picture
                                      }`
                                    : DefaultProfile.src
                                }
                                alt=""
                                className="w-[50px] h-[50px] rounded-full"
                              />
                              {user?.people?.first_name +
                                " " +
                                user?.people?.last_name}
                            </div>
                          </td>

                          <td className="py-3">{user?.people?.unique_id}</td>

                          <td className="py-3">
                            {user?.people?.designation_employees.length
                              ? user?.people?.designation_employees
                                  .map(
                                    (designation) =>
                                      designation?.designation_org_id
                                        ?.designation_id?.designation
                                  )
                                  .join(", ")
                              : "_"}
                          </td>
                          <td className="py-3">
                            {user?.mobiles.length &&
                              user?.mobiles
                                .map((Contact) => Contact?.mobile_no)
                                .slice(0, 1)
                                .join(", ")}
                            {user?.mobiles.length > 1 && "..."}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => openAccessControlModal(user.id)}
                              type="button"
                              className="font-bold underline"
                            >
                              <div className="flex space-x-1 items-center">
                                <span className="font-extrabold text-xl text-black pr-1">
                                  <IoSettingsOutline />
                                </span>
                                <span>Access Control</span>
                              </div>
                            </button>
                          </td>
                          {/* <td className="no-print">
                            <img
                              src="/assets/img/icons/threeDot.svg"
                              alt=""
                              className="cursor-pointer"
                            />
                          </td> */}
                        </tr>
                      ))}
                  </tbody>
                </table>
                {/* Pagination Component */}
                <div className="bg-white sticky bottom-0 shadow-md py-3 px-4 flex justify-end">
                  <Pagination
                    current={currentPage}
                    total={totalPages}
                    pageSize={limit}
                    onChange={handleChangePage}
                    showSizeChanger={false}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Access Control Modal */}
      {accessPermissonModal && (
        <UserAccessControlModal
          userId={selectedUserId}
          modalAction={setAccessPermissonModal}
        />
      )}
    </div>
  );
};

export default Users;
