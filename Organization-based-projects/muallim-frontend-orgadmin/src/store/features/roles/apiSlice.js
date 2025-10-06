import routes from "@/config/routes";
import { apiSlice } from "../../api/apiSlice";
// Inject all authentication related api in main api slice
export const roleManagmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //get roles
    getRoles: builder.query({
      query: () => {
        return {
          url: `${routes.roles("auth")}?limit=999`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result) => {
        const list = result?.data || [];
        return [
          { type: "Roles", id: "LIST" },
          ...list.map((r) => ({ type: "Roles", id: r.id })),
        ];
      },
    }),
    // create a new role
    createRole: builder.mutation({
      query: (data) => {
        return {
          url: routes.roles("auth"),
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: (result, error, id) => [{ type: "Roles", id }],
    }),
    // activity list
    getActivityList: builder.query({
      query: () => {
        return {
          url: routes.activities("auth"),
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // single activity by user id
    getSingleActivity: builder.query({
      query: (id) => {
        return {
          url: `${routes.activityPermissions(
            "auth"
          )}?filter[role_id]=${id}&limit=999`,
        };
      },
      serializeQueryArgs: (id) => {
        return id;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // update activity by user id
    updateUserActivity: builder.mutation({
      query: (data) => {
        return {
          url: routes.activityPermissions("auth"),
          method: "POST",
          body: data,
        };
      },
    }),
    // get user roles
    getUserRoles: builder.query({
      query: (id) => {
        return {
          url: `${routes.allUserRoles("auth")}?filter[user_id]=${id}&limit=999`,
        };
      },
      serializeQueryArgs: (id) => {
        return id;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // assign roles for user
    assignRoles: builder.mutation({
      query: (data) => {
        return {
          url: routes.assignRoles("auth"),
          method: "POST",
          body: data,
        };
      },
    }),
    // delete assigned roles
    deleteAssignedRoles: builder.mutation({
      query: (id) => {
        return {
          url: `${routes.assignRoles("auth")}/${id}`,
          method: "DELETE",
        };
      },
    }),
  }),
});
export const {
  useDeleteAssignedRolesMutation,
  useAssignRolesMutation,
  useGetUserRolesQuery,
  useCreateRoleMutation,
  useGetActivityListQuery,
  useGetRolesQuery,
  useGetSingleActivityQuery,
  useLazyGetSingleActivityQuery,
  useUpdateUserActivityMutation,
} = roleManagmentApi;
