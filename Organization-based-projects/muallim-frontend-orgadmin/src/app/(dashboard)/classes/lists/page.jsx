"use client";
import AddNewClass from "@/components/ClassManagement/add-class";
import ClassAssignModal from "@/components/ClassManagement/ClassAssignModal";
import DepartmentCard from "@/components/ClassManagement/AllClasses/DepartmentCard";
import ClassCard from "@/components/ClassManagement/AllClasses/ClassCard";

import ClassCardNew from "@/components/ClassManagement/AllClasses/ClassCard";
import CreateGroupModal from "@/components/ClassManagement/createGroupModal";
import {
  useCreateClassGroupMutation,
  useDeleteGroupMutation,
  useGetClassesQuery,
  useGetGroupsQuery,
  useUpdateGroupMutation,
} from "@/store/features/class-management/apiSlice";
import { message, Tooltip } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const AllClasses = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [createGroupModal, setCreateGroupModal] = useState(false);

  // set default page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 99999999;
  const [classes, setClasses] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);

  // fetch classes data
  const { data: fetchClasses, isFetching: loadingClasses } = useGetClassesQuery(
    {
      page: 1,
      limit: 999,
    }
  );

  // fetch groups data
  const { data: fetchClassGroups, isFetching: loadingClassGroups } =
    useGetGroupsQuery({
      page: 1,
      limit: 999,
    });

  const [
    createGroup,
    { isLoading: createGroupLoading, error: createGroupError },
  ] = useCreateClassGroupMutation();

  // fetch classes
  useEffect(() => {
    if (!loadingClasses && fetchClasses) {
      setClasses(fetchClasses?.data);
      setTotalPages(fetchClasses?.meta?.total);
    }
  }, [fetchClasses, loadingClasses]);

  // fetch groups
  useEffect(() => {
    if (!loadingClassGroups && fetchClassGroups) {
      setClassGroups(fetchClassGroups?.data);
    }
  }, [fetchClassGroups, loadingClassGroups]);

  // redirect to individual group page
  const redirectToSingleGroup = (id) => {
    router.push(`/classes/lists/groups/${id}`);
  };

  // group error check
  useEffect(() => {
    if (createGroupError) {
      if (createGroupError.status === 400) {
        if (createGroupError?.data?.message.includes("exists")) {
          message.error("Group already exists");
        } else {
          message.error(createGroupError?.data?.message);
        }
      } else {
        message.error(error.data.message);
      }
    }
  }, [createGroupError]);

  const successHandler = () => {
    setCreateGroupModal(false);
    setGroupName("");
  };

  const createNewGroupHandler = () => {
    createGroup({ data: { name: groupName }, successHandler: successHandler });
  };

  // delete group
  const [deleteGroup, { isLoading: deleteGroupLoading, error }] =
    useDeleteGroupMutation();
  const deleteGroupHandler = (id) => {
    deleteGroup({ id: id });
  };

  // assign and disassign group

  // Add update group mutation
  const [updateGroup, { isLoading: updateGroupLoading }] =
    useUpdateGroupMutation();

  const handleRenameGroup = (groupId, newName) => {
    // Optimistically update the local state
    setClassGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, name: newName } : group
      )
    );

    updateGroup({
      data: {
        id: groupId,
        name: newName,
      },
    })
      .unwrap()
      .then(() => {
        message.success("Group renamed successfully");
      })
      .catch((error) => {
        // Revert the optimistic update if the API call fails
        setClassGroups((prevGroups) =>
          prevGroups.map((group) =>
            group.id === groupId ? { ...group, name: title } : group
          )
        );
        message.error(error?.data?.message || "Failed to rename group");
      });
  };

  return (
    <>
      {/* bradcrumb */}

      <div className="flex justify-start items-center gap-4 ">
        <Link href="/classes">Class Management</Link>
        <img src="/assets/img/icons/chevron.svg" alt="Chevron Icon" />
        <Link href="">All Classes</Link>
      </div>

      {/* bradcrumb */}

      {/* content */}
      <div className="flex justify-between mt-10 ">
        <div className="flex justify-between items-center gap-2 mb-6">
          <h3 className="lg:text-[30px] text-xl font-bold text-black">
            Department
          </h3>
          {/* tooltip */}
          <Tooltip
            title="If your organization has multiple departments, you can categorize classes accordingly during creation."
            color="white"
          >
            <img src="/assets/img/icons/help.svg" className="help" alt="" />
          </Tooltip>
        </div>

        <div className="flex justify-between items-center gap-4 mb-6">
          <Link
            href={"/classes/create"}
            className="bg-[#22252B] font-bold rounded-[8px] text-white py-2 px-3 flex justify-center items-center gap-2"
          >
            <img src="/assets/img/icons/plus.svg" alt="Plus Icon" />
            <span>Add New Class</span>
          </Link>
        </div>
      </div>

      {!loadingClassGroups ? (
        <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mb-10">
          {classGroups.length > 0 &&
            classGroups.map((item, index) => (
              <DepartmentCard
                handler={() => redirectToSingleGroup(item.id)}
                key={index}
                icon="/assets/img/icons/folder.svg"
                title={item.name}
                deleteHanler={() => deleteGroupHandler(item.id)}
                noOfClasses={
                  item?.class_id?.length > 0 ? item?.class_id?.length : 0
                }
                onRename={(newName) => handleRenameGroup(item.id, newName)}
              />
            ))}
          {classGroups.length === 0 && (
            <div className="col-span-full w-full  flex justify-center items-center">
              <h3 className="text-lg font-bold text-black">
                No departments found. Please add a new department to continue.
              </h3>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid custom-grid-top lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-10 ">
            <DepartmentCard loading />
            <DepartmentCard loading />
            <DepartmentCard loading />
            <DepartmentCard loading />
          </div>
        </>
      )}

      {fetchClasses && !loadingClasses ? (
        <>
          <div className="flex items-center gap-2 pb-2 mb-6">
            <h3 className="lg:text-[30px] text-xl font-bold text-black ">
              Classes
            </h3>
            <Tooltip
              title={`In this system, "class" denotes specific educational levels, like "Grade 1" or "Grade 2." Each department may include multiple classes for effective institute management.`}
              color="white"
            >
              <img src="/assets/img/icons/help.svg" className="help" alt="" />
            </Tooltip>
          </div>
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            {classes.length > 0 &&
              classes.map((item, index) => {
                // console.log(fetchClasses);
                // console.log(classes);
                // console.log(item);
                return (
                  <ClassCard
                    key={index}
                    id={item.id}
                    classId={item?.class_id}
                    name={item?.group_id?.name}
                    title={item?.class_name}
                    students={
                      Number(item?.class_aggregated_data?.total_boy_student) +
                      Number(item?.class_aggregated_data?.total_girl_student)
                    }
                    subjects={Number(
                      item?.class_aggregated_data?.total_subject
                    )}
                  />
                );
              })}

            {classes.length === 0 && (
              <div className="col-span-full w-full  flex justify-center items-center mt-5">
                <h3 className="text-lg font-bold text-black">
                  No Classes Found. Please add a new Class.
                </h3>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {loadingClasses ? (
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
              <ClassCard loading />
              <ClassCard loading />
              <ClassCard loading />
              <ClassCard loading />
            </div>
          ) : (
            <div className="col-span-full w-full  flex justify-center items-center mt-5">
              <h3 className="text-lg font-bold text-black">
                Something Went Wrong.
              </h3>
            </div>
          )}
        </>
      )}

      {/* modal */}
      {showModal && <AddNewClass setShowModal={setShowModal} />}
    </>
  );
};

export default AllClasses;
