"use client";
import AddNewClass from "@/components/ClassManagement/add-class";
import ClassAssignModal from "@/components/ClassManagement/ClassAssignModal";
import ClassCard from "@/components/ClassManagement/AllClasses/ClassCard";
import {
  useAssociateClassInGroupMutation,
  useDisassociateClassInGroupMutation,
  useGetClassesByGroupQuery,
  useGetGroupsQuery,
} from "@/store/features/class-management/apiSlice";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";

const GroupClasses = () => {
  const params = useParams();
  const { id } = params;
  const [showModal, setShowModal] = useState(false);

  // fetch classes data
  const [groupData, setGroupData] = useState(null);
  const {
    data: fetchClasses,
    isFetching: loadingClasses,
    refetch,
  } = useGetClassesByGroupQuery({ id: id });
  useEffect(() => {
    if (!loadingClasses && fetchClasses) {
      setGroupData(fetchClasses?.data);
    }
  }, [fetchClasses, loadingClasses]);

  // fetch groups data
  const [classGroups, setClassGroups] = useState([]);
  const { data: fetchClassGroups, isFetching: loadingClassGroups } =
    useGetGroupsQuery({ page: 1, limit: 999 });

  useEffect(() => {
    if (!loadingClassGroups && fetchClassGroups) {
      setClassGroups(fetchClassGroups?.data);
    }
  }, [fetchClassGroups, loadingClassGroups]);

  // assign and disassign group
  const [selectedClass, setSelectedClass] = useState(null);
  const [createAssignModal, setCreateAssignModal] = useState(false);
  const assignModalhandler = (id) => {
    setSelectedClass(id);
    setCreateAssignModal(true);
  };
  // api slice
  const [associateClassInGroup] = useAssociateClassInGroupMutation();
  const [disassociateClassInGroup] = useDisassociateClassInGroupMutation();
  const assignGroupHandler = (value, option) => {
    if (selectedClass) {
      associateClassInGroup({
        classId: selectedClass,
        groupId: option.id,
        handler: () => setCreateAssignModal(false),
      });
    }
  };
  const disassignHandler = (id) => {
    disassociateClassInGroup({
      classGroupId: id,
    });
  };
  return (
    <>
      {/* Breadcrumb */}
      <div className="flex justify-start items-center gap-4 mb-6">
        <Link href="/classes">Class Management</Link>
        <img src="/assets/img/icons/chevron.svg" alt="Chevron Icon" />
        <Link href="/classes/lists">All Classes</Link>
        <img src="/assets/img/icons/chevron.svg" alt="Chevron Icon" />
        <Link href="">Department</Link>
      </div>

      {groupData?.class_id?.length > 0 ? (
        <div className="grid gap-5 grid-cols-1   md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {groupData.class_id.map((item) => (
            <ClassCard
              key={item.id}
              disassignHandler={() => disassignHandler(item.id)}
              assignModalhandler={assignModalhandler}
              id={item.id}
              classId={item.class_id || "No ID"}
              name={item.class_type_id?.type_name || "No Type Name"}
              title={item.class_name || "No Title"}
              students={
                Number(item.class_aggregated_data?.total_boy_student || 0) +
                Number(item.class_aggregated_data?.total_girl_student || 0)
              }
              subjects={Number(item.class_aggregated_data?.total_subject || 0)}
              refech={refetch}
            />
          ))}
        </div>
      ) : loadingClasses ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <ClassCard loading />
          <ClassCard loading />
          <ClassCard loading />
          <ClassCard loading />
        </div>
      ) : (
        <div className="w-full flex justify-center items-center mt-5">
          <h3 className="text-lg font-bold text-black">
            No classes available in this department.
          </h3>
        </div>
      )}

      {/* Modals */}
      {showModal && <AddNewClass setShowModal={setShowModal} />}
      {createAssignModal && (
        <ClassAssignModal
          groupList={classGroups}
          assignGroupHandler={assignGroupHandler}
          setCreateGroupModal={setCreateAssignModal}
        />
      )}
    </>
  );
};

export default GroupClasses;
