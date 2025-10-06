"use client";
import "./role.css";
import Switcher from "@/components/common/Inputs/Buttons/Switch";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import CreateModal from "@/components/UserManagment/CreateRoleModal";
import {
  useCreateRoleMutation,
  useGetActivityListQuery,
  useGetRolesQuery,
  useLazyGetSingleActivityQuery,
  useUpdateUserActivityMutation,
} from "@/store/features/roles/apiSlice";
import { RoleSaveSvgBtn } from "@/components/helpers/storeAllSvgs";
import { message } from "antd";
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import CreateRoleModal from "@/components/UserManagment/CreateRoleModal";

const Roles = () => {
  const [current, setCurrent] = React.useState(0);
  const [draftPermissions, setDraftPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const rolePermissionsHandler = (activityId, status, value) => {
    const previousPremissions = rolePermissions;
    const updatedPermissions = previousPremissions.map((item) => {
      if (item?.activity_id === activityId) {
        return {
          ...item,
          activity_value: status
            ? !item.activity_value.includes(value)
              ? `${item.activity_value}${value}`
              : item.activity_value
            : item.activity_value.replace(value, ""),
        };
      }
      return item;
    });
    setRolePermissions(updatedPermissions);
  };
  //   get all Activity
  const { data: activityList, isFetching: activityListLoading } =
    useGetActivityListQuery();

  useEffect(() => {
    if (activityList && !activityListLoading) {
      const classic = activityList?.data?.classic?.length
        ? activityList?.data?.classic
        : [];
      const boolean = activityList?.data?.boolean?.length
        ? activityList?.data?.boolean
        : [];
      const permissionList = [...classic, ...boolean];
      const storePermissions =
        permissionList.length &&
        permissionList.map((activity) => ({
          activity_id: activity?.id,
          activity_permissions: activity?.value,
          activity_permissions_id: null,
          activity_value: "",
          activity_name: activity?.name,
          activity_description: activity?.description,
        }));
      setDraftPermissions(storePermissions);
      setRolePermissions(storePermissions);
    }
  }, [activityList, activityListLoading]);

  // update activity permissions by role
  const [
    getSingleActivity,
    { data: userActivityData, isLoading: activityPermissionFetching },
  ] = useLazyGetSingleActivityQuery();

  useEffect(() => {
    if (userActivityData && !activityPermissionFetching) {
      const previousPremissions = rolePermissions;
      if (userActivityData?.data?.length) {
        const updatedPermissions = previousPremissions.map((item) => {
          const found = userActivityData?.data?.find(
            (activity) => activity?.activity_id === item?.activity_id
          );
          if (found) {
            return {
              ...item,
              activity_value: found?.permission_type,
              activity_permissions_id: found.id,
            };
          }
          return item;
        });
        setRolePermissions(updatedPermissions);
      } else {
        console.log("Permissions");
        setRolePermissions(draftPermissions);
      }
    }
  }, [userActivityData, activityPermissionFetching]);

  // onChange role
  const onChangeRole = async (id) => {
    setCurrent(id);
    setRolePermissions(draftPermissions);
    await getSingleActivity(id);
  };

  // update user activity permission slice
  const [
    updateUserActivity,
    { data: updatedActivityData, isLoading: updateUserActivityLoading },
  ] = useUpdateUserActivityMutation();

  const updateUserActivityHandler = async (data) => {
    const updateData = data?.activity_permissions_id
      ? {
          role_id: current,
          activity_permissions: {
            id: data?.activity_permissions_id,
            permission_type: data?.activity_value,
            activity_id: data?.activity_id,
          },
        }
      : {
          role_id: current,
          activity_permissions: {
            permission_type: data?.activity_value,
            activity_id: data?.activity_id,
          },
        };
    await updateUserActivity(updateData);
  };

  /* 
  NOTE: currently fetching issue here
  */
  useEffect(() => {
    if (updatedActivityData) {
      if (updatedActivityData?.success) {
        message.success("Updated");
      }
    }
  }, [updatedActivityData]);

  // get all roles
  const { data: roleList, isFetching: roleListLoading } = useGetRolesQuery();
  const [orgRoles, setOrgRoles] = useState([]);

  useEffect(() => {
    if (roleList && !roleListLoading) {
      const roles = roleList?.data?.length
        ? roleList?.data?.filter((item) => item?.role_type === "orgrole")
        : [];
      setOrgRoles(roles);
      setCurrent(Number(roles[0]?.id));
      getSingleActivity(Number(roles[0]?.id));
    }
  }, [roleList, roleListLoading]);

  // create role
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [
    createRole,
    { data: getNewRole, isLoading: creatingRoleLoader, error: roleCreateError },
  ] = useCreateRoleMutation();
  const createRoleHandler = async () => {
    await createRole({
      role_name: roleName,
      role_type: "orgrole",
      description: descriptionValue,
    });
  };
  useEffect(() => {
    if (getNewRole && !creatingRoleLoader) {
      if (getNewRole?.success) {
        setOrgRoles((prev) => [...prev, getNewRole.data]);
        onChangeRole(getNewRole.data.id);
        message.success("Role Created");
        setCreateRoleModal(false);
      }
    }
    if (roleCreateError) {
      if (roleCreateError.status === 400) {
        message.error(roleCreateError.data.message);
      }
    }
  }, [getNewRole, creatingRoleLoader]);

  return (
    <div>
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-2xl font-bold">Role List</h2>
        <button
          type="button"
          onClick={() => setCreateRoleModal(true)}
          className="text-white bg-[#22252B] px-6 py-2 rounded-md"
        >
          <FaPlus className="inline-block text-white me-2 mb-1" />
          Create Role
        </button>
      </div>
      <div className="grid custom-grid-top xl:grid-cols-4 grid-cols-1 gap-4 mt-8">
        <div className="role-list">
          <div className="card rounded-[10px] shadow-md">
            <div className="p-4">
              <div
                className={`flex justify-between items-center cursor-pointer border-b py-3 text-sm px-4`}
              >
                <span className="font-bold">Role</span>
                <span className="font-bold">User</span>
              </div>
              {roleList && !roleListLoading ? (
                <>
                  {orgRoles.length ? (
                    orgRoles.map((item, i) => (
                      <div
                        key={i}
                        className={`flex justify-between items-center cursor-pointer py-4 text-sm border-b last:border-none px-4 ${
                          current === Number(item?.id) && "bg-[#E7F7FF]"
                        }`}
                        onClick={() => onChangeRole(Number(item?.id))}
                      >
                        <span className="font-bold">{item?.role_name}</span>
                        {/* <span className="font-bold">2</span> */}
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center mt-2">
                      <span>Data not Found</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {roleListLoading ? (
                    <div className="flex justify-center mt-2">
                      <SvgLoader />
                    </div>
                  ) : (
                    <div className="flex justify-center mt-1">
                      <span>Data not Found</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="card easy-access-items xl:col-span-3 rounded-[10px] col-span-1 shadow-md">
          <div className="p-10">
            <div className="roles">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">Access Permission</h4>
                {/* <button className="text-[#22252b] bg-white border border-[#22252B] px-5 text-[15px] py-1 rounded-md">
                  <FaPlus className="inline-block text-[#22252b] text-[14px] mb-1" />{" "}
                  Edit Role
                </button> */}
              </div>
              <hr className="my-3" />
              {orgRoles && orgRoles.length ? (
                <div className="overflow-x-auto">
                  {orgRoles.map((role, i) => (
                    <React.Fragment key={i}>
                      {current === Number(role?.id) && (
                        <>
                          {!activityListLoading && activityList?.data && (
                            <div className="w-full overflow-x-auto">
                              <table className="table w-full role-table">
                                <thead>
                                  <tr>
                                    <th className="text-left border-b pb-3 w-[180px]">
                                      Access Name
                                    </th>
                                    <th className="text-left border-b pb-3 w-[200px]">
                                      Description
                                    </th>
                                    <th className="text-left border-b pb-3">
                                      View
                                    </th>
                                    <th className="text-left border-b pb-3">
                                      Create
                                    </th>
                                    <th className="text-left border-b pb-3">
                                      Delete
                                    </th>
                                    <th className="text-left border-b pb-3">
                                      Edit
                                    </th>
                                    <th className="text-left border-b pb-3">
                                      List
                                    </th>
                                    <th className="text-left border-b pb-3">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rolePermissions.length &&
                                    rolePermissions?.map((item, i) => (
                                      <tr key={i}>
                                        <td className="py-3">
                                          {item?.activity_name}
                                        </td>
                                        <td className="py-3">
                                          {item?.activity_description}
                                        </td>
                                        <td className="py-3">
                                          <Switcher
                                            handler={(status) =>
                                              rolePermissionsHandler(
                                                item?.activity_id,
                                                status,
                                                "R"
                                              )
                                            }
                                            initialValue={item?.activity_value.includes(
                                              "R"
                                            )}
                                            disabled={
                                              !item?.activity_permissions.includes(
                                                "R"
                                              )
                                            }
                                          />
                                        </td>
                                        <td className="py-3">
                                          <Switcher
                                            handler={(status) =>
                                              rolePermissionsHandler(
                                                item?.activity_id,
                                                status,
                                                "C"
                                              )
                                            }
                                            initialValue={item?.activity_value.includes(
                                              "C"
                                            )}
                                            disabled={
                                              !item?.activity_permissions.includes(
                                                "C"
                                              )
                                            }
                                          />
                                        </td>
                                        <td className="py-3">
                                          <Switcher
                                            handler={(status) =>
                                              rolePermissionsHandler(
                                                item?.activity_id,
                                                status,
                                                "D"
                                              )
                                            }
                                            initialValue={item?.activity_value.includes(
                                              "D"
                                            )}
                                            disabled={
                                              !item?.activity_permissions.includes(
                                                "D"
                                              )
                                            }
                                          />
                                        </td>
                                        <td className="py-3">
                                          <Switcher
                                            handler={(status) =>
                                              rolePermissionsHandler(
                                                item?.activity_id,
                                                status,
                                                "U"
                                              )
                                            }
                                            initialValue={item?.activity_value.includes(
                                              "U"
                                            )}
                                            disabled={
                                              !item?.activity_permissions.includes(
                                                "U"
                                              )
                                            }
                                          />
                                        </td>
                                        <td className="py-3">
                                          <Switcher
                                            handler={(status) =>
                                              rolePermissionsHandler(
                                                item?.activity_id,
                                                status,
                                                "L"
                                              )
                                            }
                                            initialValue={item?.activity_value.includes(
                                              "L"
                                            )}
                                            disabled={
                                              !item?.activity_permissions.includes(
                                                "L"
                                              )
                                            }
                                          />
                                        </td>
                                        <td>
                                          <button
                                            onClick={() =>
                                              updateUserActivityHandler(item)
                                            }
                                            type="button"
                                            className="border px-2 rounded-lg bg-slate-800 text-white hover:bg-slate-600"
                                          >
                                            Save
                                            {/* <RoleSaveSvgBtn /> */}
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <>
                  {roleListLoading ? (
                    <div className="flex justify-center mt-2">
                      <SvgLoader />
                    </div>
                  ) : (
                    <div className="flex justify-center mt-1">
                      <span>No roles are added yet</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {createRoleModal && (
        <CreateRoleModal
          descriptionValue={descriptionValue}
          descriptionHandler={setDescriptionValue}
          inputValue={roleName}
          inputHandler={setRoleName}
          modalAction={setCreateRoleModal}
          actionHandler={createRoleHandler}
        />
      )}
    </div>
  );
};

export default Roles;
