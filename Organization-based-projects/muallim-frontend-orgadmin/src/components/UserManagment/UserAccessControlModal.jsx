"use client";
import React, { useEffect, useMemo, useState } from "react";
import { message, Select } from "antd";
import {
  useAssignRolesMutation,
  useDeleteAssignedRolesMutation,
  useGetRolesQuery,
  useGetUserRolesQuery,
} from "@/store/features/roles/apiSlice";
import SvgLoader from "../ui/loaders/SvgLoader";

const UserAccessControlModal = ({ userId, modalAction }) => {
  // ──────────────────────────────────────────────────────────────
  // 1) Load data
  // ──────────────────────────────────────────────────────────────
  const { data: getUserRoles, isFetching: getUserRolesLoader } =
    useGetUserRolesQuery(userId, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  const { data: roleList, isFetching: roleListLoading } = useGetRolesQuery();

  // Normalize existing user roles to consistent shape
  const userExistingRoles = useMemo(() => {
    const arr = getUserRoles?.data || [];
    return arr;
  }, [getUserRoles]);

  // A set of role ids the user already has
  const assignedRoleIdSet = useMemo(() => {
    return new Set(
      (userExistingRoles || []).map((r) => r?.role?.id).filter(Boolean)
    );
  }, [userExistingRoles]);

  // Normalize org roles from /roles to { id, role_name }
  const orgRolesNormalized = useMemo(() => {
    const roles = (roleList?.data || []).filter(
      (item) => item?.role_type === "orgrole"
    );
    return roles.map((r) => ({
      id: r.id,
      role_name: r.role_name,
    }));
  }, [roleList]);

  // Build Select options: [{ value, label, disabled? }]
  const roleOptions = useMemo(() => {
    return (orgRolesNormalized || []).map((r) => ({
      value: r.id,
      label: r.role_name,
      // optionally disable roles the user already has:
      disabled: assignedRoleIdSet.has(r.id),
    }));
  }, [orgRolesNormalized, assignedRoleIdSet]);

  // ──────────────────────────────────────────────────────────────
  // 2) Selection state for new assignments (array of role IDs)
  // ──────────────────────────────────────────────────────────────
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  const handleChange = (values) => {
    setSelectedRoleIds(values);
  };

  // ──────────────────────────────────────────────────────────────
  // 3) Mutations
  // ──────────────────────────────────────────────────────────────
  const [
    assignRoles,
    { data: updateAssignValue, isLoading: assignUserAssignLoader },
  ] = useAssignRolesMutation();

  const [deleteAssignedRoles] = useDeleteAssignedRolesMutation();

  const updateHandler = async () => {
    if (!selectedRoleIds.length) {
      message.warning("Please select at least one role to assign.");
      return;
    }

    try {
      await assignRoles({
        user_id: userId,
        role_ids: selectedRoleIds, // already ids
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (updateAssignValue && !assignUserAssignLoader) {
      if (updateAssignValue?.success) {
        message.success("Successfully assigned new roles.");
        modalAction(false);
      } else {
        message.error(updateAssignValue?.message || "Failed to assign roles.");
      }
    }
  }, [updateAssignValue, assignUserAssignLoader, modalAction]);

  const deleteHandler = async (assignedId) => {
    try {
      await deleteAssignedRoles(assignedId);
      message.success("Role removed.");
    } catch {
      message.error("Failed to remove role.");
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 4) Render
  // ──────────────────────────────────────────────────────────────
  const isLoadingAny = roleListLoading || getUserRolesLoader;

  return (
    <div>
      <div
        className="onboarding-profile-bg z-30"
        onClick={() => modalAction(false)}
      ></div>

      <div className="card w-[450px] max-w-[95%] max-h-[90vh] overflow-y-auto p-12 rounded-[12px] shadow-lg bg-white z-[999999] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <p className="text-2xl font-bold">Update User Access</p>
        <div className="line h-[1px] w-full bg-[#E4E6EA] my-6"></div>

        {isLoadingAny ? (
          <div className="flex justify-center mt-1">
            <SvgLoader />
          </div>
        ) : (
          <>
            {/* Already assigned roles */}
            <div>
              <p className="font-semibold">Already Have these Roles</p>

              <div className="flex gap-2 flex-wrap">
                {(() => {
                  const filteredRoles =
                    userExistingRoles?.filter(
                      (r) => r?.role?.role_type === "orgrole"
                    ) || [];

                  return filteredRoles.length > 0 ? (
                    filteredRoles.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => deleteHandler(r.id)}
                        type="button"
                        className="flex gap-3 justify-between items-center group text-12 tracking-wider bg-[#E7F7FF] px-2 py-1 rounded-2xl my-4 font-medium border border-transparent hover:border-red-500 hover:bg-red-50"
                        title="Remove role"
                      >
                        <span>{r?.role?.role_name}</span>
                        <span>
                          <svg
                            className="w-4 h-4 text-primary-brand-default group-hover:text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z" />
                          </svg>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center text-12 tracking-widest py-6 w-full">
                      No Roles Found
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Assign new roles */}
            <div className="mb-2">
              <p className="font-semibold mb-1.5">Assign New Role</p>

              <Select
                mode="multiple"
                allowClear
                placeholder="Select roles"
                options={roleOptions}
                value={selectedRoleIds}
                onChange={handleChange}
                className="w-full"
                optionFilterProp="label"
              />
            </div>

            <div className="flex justify-between items-center mt-10">
              <button
                onClick={() => modalAction(false)}
                className="cancel border border-black px-5 py-2 rounded-[8px] text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={updateHandler}
                disabled={assignUserAssignLoader}
                className="cancel disabled:cursor-not-allowed disabled:opacity-50 border border-black px-5 py-2 bg-black text-white rounded-[8px] text-sm"
              >
                {assignUserAssignLoader ? <SvgLoader /> : "Save & Exit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserAccessControlModal;
