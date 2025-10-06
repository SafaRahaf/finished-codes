import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import React, { useState, useEffect, useRef } from "react";
import { usePeopleRolesQuery } from "@/store/features/auth/apiSlice";
import {
  useGetTeachersQuery,
  useGetTeachersWithExtraDataQuery,
} from "@/store/features/teacher-management/apiSlice";
import { useDeleteClassPeopleMutation } from "@/store/features/class-management/apiSlice";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { DeleteSvg } from "@/components/helpers/storeAllSvgs";
import { message, Tooltip } from "antd";

const extractErrorMessage = (error) => {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    (typeof error === "string" ? error : "") ||
    ""
  ).toLowerCase();
};

function SuperVisor({
  updateHandler,
  classId,
  createClassLoading,
  oldDataSets,
}) {
  const [teachers, setTeachers] = useState([]);
  const [peopleRoles, setPeopleRoles] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [selectedRoleValues, setSelectedRoleValues] = useState({});
  const [changedFields, setChangedFields] = useState({});

  const limit = 1000;
  const pageRef = useRef(1);

  const { data: fetchTeachers, isFetching: loadingTeachers } =
    useGetTeachersWithExtraDataQuery({
      page: pageRef.current,
      limit,
    });

  useEffect(() => {
    if (!loadingTeachers && fetchTeachers) {
      setTeachers(fetchTeachers?.data);
    }
  }, [fetchTeachers, loadingTeachers]);

  const { data: fetchPeopleRoles, isFetching: loadingPeopleRoles } =
    usePeopleRolesQuery();
  useEffect(() => {
    if (!loadingPeopleRoles && fetchPeopleRoles) {
      setPeopleRoles(fetchPeopleRoles?.data);
    }
  }, [fetchPeopleRoles, loadingPeopleRoles]);

  const [allSupervisor, setSupervisor] = useState(() => {
    // Filter for teacher supervisors only
    const getTeacherSupervisors = oldDataSets?.data?.class_people?.filter(
      (item) => item?.people_type_id?.type_name === "Supervisor"
    );

    if (getTeacherSupervisors && getTeacherSupervisors.length > 0) {
      return getTeacherSupervisors.map((item, index) => ({
        unKey: index + 1,
        id: item.id,
        people_id: item.people_id?.id || null,
        role_id: item.role_id?.id || null,
      }));
    }

    return [
      {
        unKey: 1,
        id: null,
        people_id: null,
        role_id: null,
      },
    ];
  });

  // delete mutation hook
  const [deleteClassPeople, { isLoading: deleteLoading }] =
    useDeleteClassPeopleMutation();

  // updateSupervisor function
  const updateSupervisor = (unKey, updatedData) => {
    setSupervisor((prev) =>
      prev.map((supervisor) =>
        supervisor.unKey === unKey
          ? {
              ...supervisor,
              people_id: updatedData.id,
            }
          : supervisor
      )
    );
    // Update selected value immediately
    setSelectedValues((prev) => ({
      ...prev,
      [unKey]: updatedData,
    }));

    // Track that people_id is changed for supervisor
    setChangedFields((prev) => ({
      ...prev,
      [unKey]: {
        ...prev[unKey],
        people_id: true,
      },
    }));
  };

  // updateSupervisorRole function
  const updateSupervisorRole = (unKey, updatedData) => {
    setSupervisor((prev) =>
      prev.map((supervisor) =>
        supervisor.unKey === unKey
          ? {
              ...supervisor,
              role_id: updatedData.id,
            }
          : supervisor
      )
    );
    // selected role value update immediately
    setSelectedRoleValues((prev) => ({
      ...prev,
      [unKey]: updatedData,
    }));

    // track role_id if it was changed for the supervisor
    setChangedFields((prev) => ({
      ...prev,
      [unKey]: {
        ...prev[unKey],
        // people_type: "supervisor",
        role_id: true,
      },
    }));
  };

  // add new supervisor
  const addNewSupervisorHandler = () => {
    if (allSupervisor.length < teachers.length) {
      setSupervisor((prev) => [
        ...prev,
        {
          unKey: prev.length + 1,
          id: null,
          people_id: null,
          role_id: null,
        },
      ]);
    }
  };

  // update class
  const updateClassApiHandler = async () => {
    const ids = allSupervisor.map((s) => s.people_id).filter(Boolean);
    const hasDuplicate = new Set(ids).size !== ids.length;
    if (hasDuplicate) {
      message.error(
        "You selected the same person twice as supervisor. Please choose different people."
      );
      return;
    }

    try {
      const cleanObject = (obj) => {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          if (
            value !== false &&
            value !== "" &&
            value !== null &&
            (!Array.isArray(value) || value.length > 0) &&
            value !== undefined
          ) {
            acc[key] = value;
          }
          return acc;
        }, {});
      };

      // Separate new supervisors from existing ones
      const newSupervisors = [];
      const existingSupervisors = [];

      allSupervisor.forEach((supervisor) => {
        if (supervisor.people_id && supervisor.role_id) {
          // Checking if this supervisor has an original id (meaning it's existing)
          if (supervisor.id) {
            // This is an existing supervisor
            const supervisorChanges = changedFields[supervisor.unKey] || {};
            const updatePayload = { id: supervisor.id };

            // Only include people_id if it was changed
            if (supervisorChanges.people_id) {
              updatePayload.people_id = supervisor.people_id;
            }

            // Only include role_id if it was changed
            if (supervisorChanges.role_id) {
              updatePayload.role_id = supervisor.role_id;
            }

            // Only add to existingSupervisors if there are actual changes
            if (Object.keys(updatePayload).length > 1) {
              existingSupervisors.push(updatePayload);
            }
          } else {
            // This is a new supervisor - use people_id format
            newSupervisors.push({
              people_id: supervisor.people_id,
              people_type: "supervisor",
              role_id: supervisor.role_id,
            });
          }
        }
      });

      const dataSanitizer = {
        id: Number(classId),
        class_people: [...existingSupervisors, ...newSupervisors],
      };

      const data = cleanObject(dataSanitizer);
      await updateHandler({ data }).unwrap();
    } catch (error) {
      const rawMsg = extractErrorMessage(error);

      if (/people id.*class people already exists/.test(rawMsg)) {
        message.error(
          "This person is already assigned as a supervisor for this class. Please select someone else."
        );
      } else if (rawMsg.includes("class people already exists")) {
        message.error(
          "This supervisor is already assigned to this class. Please select a different person."
        );
      } else {
        message.error("Failed to update class. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (oldDataSets?.data?.class_people?.length > 0) {
      const initialValues = {};
      const initialRoleValues = {};

      oldDataSets?.data?.class_people.forEach((item, index) => {
        if (item.people_id) {
          const teacher = teachers?.find((t) => t.id === item.people_id.id);
          if (teacher) {
            initialValues[index + 1] = teacher;
          }
        }
        if (item.role_id) {
          const role = peopleRoles?.find((r) => r.id === item.role_id.id);
          if (role) {
            initialRoleValues[index + 1] = role;
          }
        }
      });
      setSelectedValues(initialValues);
      setSelectedRoleValues(initialRoleValues);
    }
  }, [oldDataSets, teachers, peopleRoles]);

  const handleDeleteSupervisor = async (unKey) => {
    const supervisor = allSupervisor.find((s) => s.unKey === unKey);

    if (supervisor.id) {
      // This is an existing supervisor 9delete from API)
      try {
        await deleteClassPeople({
          classId: Number(classId),
          classPeopleId: supervisor.id,
          onSuccess: () => {
            setSupervisor((prev) => prev.filter((s) => s.unKey !== unKey));

            setSelectedValues((prev) => {
              const newValues = { ...prev };
              delete newValues[unKey];
              return newValues;
            });

            setSelectedRoleValues((prev) => {
              const newValues = { ...prev };
              delete newValues[unKey];
              return newValues;
            });

            setChangedFields((prev) => {
              const newFields = { ...prev };
              delete newFields[unKey];
              return newFields;
            });
          },
        });
      } catch (error) {
        console.error("Failed to delete supervisor:", error);
      }
    } else {
      setSupervisor((prev) => prev.filter((s) => s.unKey !== unKey));

      setSelectedValues((prev) => {
        const newValues = { ...prev };
        delete newValues[unKey];
        return newValues;
      });

      setSelectedRoleValues((prev) => {
        const newValues = { ...prev };
        delete newValues[unKey];
        return newValues;
      });

      // Clean up changed fields
      setChangedFields((prev) => {
        const newFields = { ...prev };
        delete newFields[unKey];
        return newFields;
      });
    }
  };

  // Mapping supervisor NAMES by their unKey
  const getSupervisorNameByKey = (unKey) => {
    const supervisor = allSupervisor.find((s) => s.unKey === unKey);
    if (supervisor && supervisor.people_id) {
      const teacher = teachers?.find((t) => t.id === supervisor.people_id);
      if (teacher) {
        return `${teacher.first_name} ${teacher.last_name}`;
      }
    }
    return "Supervisor";
  };

  // Mapping supervisor role ROLES by their unKey
  const getSupervisorRoleByKey = (unKey) => {
    const supervisor = allSupervisor.find((s) => s.unKey === unKey);
    if (supervisor && supervisor.role_id) {
      const role = peopleRoles?.find((r) => r.id === supervisor.role_id);
      if (role) {
        return role.role_name;
      }
    }
    return "Select a Supervisor Role";
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="w-full mb-[50px]">
          {/* add supervisor */}
          <div className="flex justify-start items-start mb-3">
            <p className="text-md font-bold">Class Supervisor</p>
            {/*<Switcher />*/}
          </div>
          {allSupervisor?.map((supervisor, i) => (
            <div
              key={supervisor.unKey}
              className="grid justify-center lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-x-5 gap-y-4"
            >
              <div className="flex">
                <SelectBox
                  className={"w-full"}
                  value={
                    selectedValues[supervisor.unKey] ||
                    teachers?.find((t) => t.id === supervisor.people_id)
                  }
                  list={
                    teachers?.map((item) => ({
                      ...item,
                      label: `${item?.first_name} ${item?.last_name}`,
                      value: item.id,
                    })) || []
                  }
                  labelName={"Supervisor"}
                  DefaultItem={getSupervisorNameByKey(supervisor.unKey)}
                  handler={(value, option) =>
                    updateSupervisor(supervisor.unKey, option)
                  }
                />
              </div>
              <div className="flex gap-x-5">
                <SelectBox
                  className={"w-full"}
                  value={
                    selectedRoleValues[supervisor.unKey] ||
                    peopleRoles?.find((r) => r.id === supervisor.role_id)
                  }
                  list={
                    peopleRoles?.map((item) => ({
                      ...item,
                      label: item.role_name,
                      value: item.id,
                    })) || []
                  }
                  labelName={"Supervisor Role"}
                  DefaultItem={getSupervisorRoleByKey(supervisor.unKey)}
                  handler={(value, option) =>
                    updateSupervisorRole(supervisor.unKey, option)
                  }
                />
                <div
                  className="mt-7 cursor-pointer"
                  onClick={() => handleDeleteSupervisor(supervisor.unKey)}
                  title="Delete Supervisor"
                >
                  {deleteLoading ? (
                    <SvgLoader className="w-5 h-5" />
                  ) : (
                    <DeleteSvg />
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addNewSupervisorHandler}
            type="button"
            className="flex justify-start mt-4 items-center gap-2"
          >
            <img
              src="/assets/img/icons/plus-square.svg"
              className="plus"
              alt=""
            />
            <span className="text-sm font-bold">Add another supervisor</span>
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={updateClassApiHandler}
            type="button"
            className="btn bg-[#22252B] py-[13px] px-[24px] font-bold text-lg rounded-[8px] text-white"
          >
            {createClassLoading ? (
              <SvgLoader className="text-white" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuperVisor;
