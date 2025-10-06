import { message } from "antd";
import { apiSlice } from "../../api/apiSlice";
import siteConfig from "@/config";
import routes from "@/config/routes";
const classService = siteConfig.API_VERSION_APPEND_AFTER_SERVICE
  ? "class"
  : "classncertificate";
// Inject all authentication related api in main api slice
export const classManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // get all classes
    getClasses: builder.query({
      query: ({
        page,
        limit,
        searchTerm,
        filter,
        sort,
        sortOrder,
        filterByDate,
      }) => {
        return {
          url: `${routes.classes(classService)}?page=${page}${
            limit ? `&limit=${limit}` : ""
          }${searchTerm ? `&searchTerm=${searchTerm}` : ""}${
            filter ? `&filter[department]=${filter}` : ""
          }${
            filterByDate
              ? `&filter[attendance_details_date]=${filterByDate}`
              : ""
          }${sort ? `&sort=${sort}` : ""}${
            sortOrder ? `&sortOrder=${sortOrder}` : ""
          }`,
        };
      },
      providesTags: ["Classes"],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // delete class
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `${routes.classes(classService)}/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Class deleted successfully");
            dispatch(apiSlice.util.invalidateTags(["Classes", "Dashboard"]));
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // create classes
    createClass: builder.mutation({
      query: ({ data }) => {
        return {
          url: routes.classes(classService),
          method: "POST",
          body: { ...data },
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201) {
            message.success("Class created successfully");
            // Invalidate dashboard data
            dispatch(apiSlice.util.invalidateTags(["Dashboard", "Classes"]));
            info.redirect(data?.data?.id);
            info.resetHandler();
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // get single class
    getClass: builder.query({
      query: (id) => {
        return {
          url: `${routes.classes(classService)}/${id}`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // update class
    updateClass: builder.mutation({
      query: ({ data }) => {
        return {
          url: `${routes.classes(classService)}/${data.id}`,
          method: "PATCH",
          body: { ...data },
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Update successfully");
            // Invalidate dashboard data
            dispatch(apiSlice.util.invalidateTags(["Dashboard", "Classes"]));
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // get all groups
    getGroups: builder.query({
      query: (args = {}) => {
        const { page, limit } = args;
        const extraQuery = page && limit ? `?page=${page}&limit=${limit}` : "";
        return {
          url: `${routes.classGroups(classService)}${extraQuery || ""}`,
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${JSON.stringify(queryArgs || {})}`;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // get classes by groups
    getClassesByGroup: builder.query({
      query: ({ id }) => {
        return {
          url: `${routes.classGroups(classService)}/${id}`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // create new class group
    createClassGroup: builder.mutation({
      query: ({ data }) => {
        return {
          url: routes.classGroups(classService),
          method: "POST",
          body: data,
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201) {
            message.success("Class group created successfully");
            dispatch(
              apiSlice.util.updateQueryData("getGroups", undefined, (draft) => {
                const oldData = JSON.parse(JSON.stringify(draft));
                let updateData = {
                  ...oldData,
                  data: [
                    ...oldData.data,
                    {
                      id: data?.data?.id,
                      org_id: null,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      name: data?.data?.name,
                      status: "active",
                      classes: [],
                    },
                  ],
                };
                if (info.successHandler) {
                  info.successHandler(updateData.data);
                }
                return (draft = updateData);
              })
            );
          }
        } catch (error) {
          console.error(error);
        }
      },
    }),
    UpdateGroup: builder.mutation({
      query: ({ data }) => {
        return {
          url: `${routes.classGroups(classService)}/${data.id}`,
          method: "PATCH",
          body: { name: data.name },
        };
      },
      async onQueryStarted({ data }, { queryFulfilled, dispatch }) {
        try {
          const { data: responseData, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Updated successfully");
          }
        } catch (error) {
          console.error("Error updating group:", error);
          message.error(error?.data?.message || "Failed to update group");
        }
      },
    }),
    // delete group
    deleteGroup: builder.mutation({
      query: ({ id }) => {
        return {
          url: `${routes.classGroups(classService)}/${id}`,
          method: "DELETE",
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Group deleted successfully");
            dispatch(
              apiSlice.util.updateQueryData("getGroups", undefined, (draft) => {
                const oldData = JSON.parse(JSON.stringify(draft));
                const deleteItemAndGenerateNew =
                  oldData &&
                  oldData.data.length > 0 &&
                  oldData.data.filter(
                    (item) => Number(info.id) !== Number(item.id)
                  );
                let updateData = {
                  ...oldData,
                  data: deleteItemAndGenerateNew,
                };
                return (draft = updateData);
              })
            );
          }
        } catch (error) {
          console.error(error);
        }
      },
    }),
    // associate class in group
    associateClassInGroup: builder.mutation({
      query: ({ classId, groupId }) => {
        return {
          url: routes.associateClassInGroup(classService, classId),
          method: "PATCH",
          body: {
            group_id: groupId,
            class_id: classId,
          },
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Class associated with group successfully");
            info.handler();
          }
        } catch (error) {
          console.error(error);
        }
      },
    }),
    // disassociate class in group
    disassociateClassInGroup: builder.mutation({
      query: ({ classGroupId }) => ({
        url: routes.disassociateClassInGroup(classService, classGroupId),
        method: "PATCH",
        // body: { class_id: classId },
      }),
      async onQueryStarted({ classId, groupId }, { queryFulfilled, dispatch }) {
        try {
          const { meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Class removed from group successfully");
          }
        } catch (error) {
          console.error("Error removing class from group:", error);
          message.error("Failed to remove class from group");
        }
      },
    }),

    // add student in class
    addStudentToClass: builder.mutation({
      query: ({ class_id, student_ids, date }) => {
        return {
          url: routes.studentAssociateInClass("auth"),
          method: "POST",
          body: {
            date: date,
            class_id: class_id,
            student_ids: student_ids,
          },
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201) {
            message.success("Student added successfully");
            info.handler();
            info.resetHandler();
          }
        } catch (error) {
          console.error(error);
        }
      },
    }),
    // class students
    getClassStudents: builder.query({
      query: ({ id, page, limit, searchTerm, sort, sortOrder }) => {
        return {
          url: `${routes.students("auth")}?filter[class_id]=${id}&page=${page}${
            limit ? `&limit=${limit}` : ""
          }${searchTerm ? `&searchTerm=${searchTerm}` : ""}${
            sort ? `&sort=${sort}` : ""
          }${sortOrder ? `&sortOrder=${sortOrder}` : ""}`,
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${JSON.stringify(queryArgs || {})}`;
      },
      providesTags: (result, error, arg) => [
        { type: "ClassStudents", id: arg.id },
      ],
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      // serializeQueryArgs: ({ endpointName }) => {
      //   return endpointName;
      // },
      // forceRefetch({ currentArg, previousArg }) {
      //   return currentArg !== previousArg;
      // },
    }),

    // get all students
    getAllStudents: builder.query({
      query: ({
        page,
        limit,
        searchTerm,
        sort = "first_name",
        sortOrder = "asc",
        selectedClass = "",
      }) => {
        return {
          url: `${routes.students("auth")}?page=${page}${
            limit ? `&limit=${limit}` : ""
          }${
            searchTerm ? `&searchTerm=${searchTerm}` : ""
          }&sort=${sort}&sortOrder=${sortOrder}${
            selectedClass ? `&filter[class_id]=${selectedClass}` : ""
          }`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    getStudentDetails: builder.query({
      query: (id) => {
        return {
          url: `${routes.students("auth")}/${id}?moreInformation=true`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // get class subjects
    getClassSubjects: builder.query({
      query: ({ id, page, limit, searchTerm }) => {
        return {
          url: `${routes.classSubjects(classService, id)}?page=${page}${
            limit ? `&limit=${limit}` : ""
          }${searchTerm ? `&searchTerm=${searchTerm}` : ""}`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // get guardian list by student id
    // getStudentGuardianList: builder.query({
    //   query: (id) => {
    //     return {
    //       url: `${routes.student("auth")}/${id}`,
    //     };
    //   },
    //   serializeQueryArgs: ({ endpointName }) => {
    //     return endpointName;
    //   },
    //   forceRefetch({ currentArg, previousArg }) {
    //     return currentArg !== previousArg;
    //   },
    // }),
    getStudentGuardianList: builder.query({
      query: (id, filter = true) => {
        return {
          url: `${routes.studentGuardianList("auth")}/${id}${
            filter ? `?filter[is_guardian_connected_by_app]=${filter}` : ""
          }`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // guardian details
    getStudentGuardianDetails: builder.query({
      query: (id) => {
        return {
          url: `${routes.studentGuardian("auth")}/${id}`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // count matrix data
    classCountMatrix: builder.query({
      query: () => {
        return {
          url: routes.classCountMartix("org"),
        };
      },
      providesTags: ["Dashboard"],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // dissociate student from class
    dissociateStudentFromClass: builder.mutation({
      query: ({ class_id, student_ids, date }) => {
        return {
          url: routes.studentDissociateInClass("auth"),
          method: "POST",
          body: { class_id, student_ids, date },
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        const removedIds = new Set(info?.student_ids || []);
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            "getClassStudents",
            {
              id: info.class_id,
              page: 1,
              limit: 10,
              searchTerm: "",
              sort: "first_name",
              sortOrder: "asc",
            },
            (draft) => {
              if (!draft?.data) return;
              const prevLength = draft.data.length;
              draft.data = draft.data.filter((s) => !removedIds.has(s.id));
              const removedCount = prevLength - draft.data.length;
              if (draft.meta && typeof draft.meta.total === "number") {
                draft.meta.total = Math.max(0, draft.meta.total - removedCount);
              }
            }
          )
        );

        try {
          const { meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Student removed from class successfully");
            dispatch(
              apiSlice.util.invalidateTags([
                { type: "ClassStudents", id: info.class_id },
              ])
            );
            if (info.modalHandler) info.modalHandler(false);
          }
        } catch (error) {
          patchResult.undo();
          console.error(error);
          message.error(
            error?.data?.message || "Failed to remove student from class"
          );
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "ClassStudents", id: arg.class_id },
      ],
    }),
    // delete class people (supervisor)
    deleteClassPeople: builder.mutation({
      query: ({ classId, classPeopleId }) => {
        return {
          url: routes.deleteClassPeople("auth", classId, classPeopleId),
          method: "DELETE",
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Supervisor removed successfully");
            if (info.onSuccess) {
              info.onSuccess();
            }
          }
        } catch (error) {
          console.error("Error deleting supervisor:", error);
          message.error(error?.data?.message || "Failed to remove supervisor");
        }
      },
    }),
    deleteBulkStudents: builder.mutation({
      query: ({ items, reason }) => {
        return {
          url: `${routes.deleteBulkStudents("auth")}`,
          method: "POST",
          body: { items, reason },
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            message.success(
              `Successfully deleted ${data.meta.success} students`
            );
            dispatch(classManagementApi.util.invalidateTags(["Students"]));
          }
        } catch (error) {
          message.error("Failed to delete students");
          console.error(error);
        }
      },
    }),
    getAbsentStudents: builder.query({
      query: ({
        startDate,
        endDate,
        searchTerm,
        page = 1,
        limit = 10,
        filter,
      }) => {
        let url = `${routes.absentStudent("attendance")}?page=${page}`;
        if (limit) url += `&limit=${limit}`;
        if (searchTerm) url += `&searchTerm=${searchTerm}`;
        if (filter) url += `&filter[department]=${filter}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        return { url };
      },
    }),
    deleteClassDaySchedule: builder.mutation({
      query: ({ data, classId }) => {
        return {
          url: `${routes.classes(classService)}/${classId}/class-days/delete`,
          method: "POST",
          body: { ...data },
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Class days deleted successfully");
            dispatch(classManagementApi.util.invalidateTags(["Classes"]));
            if (info.onSuccess) {
              info.onSuccess();
            }
          }
        } catch (error) {
          console.error("Error deleting class days:", error);
          message.error(error?.data?.message || "Failed to delete class days");
        }
      },
    }),
  }),
});
export const {
  useClassCountMatrixQuery,
  useGetStudentGuardianDetailsQuery,
  useGetClassSubjectsQuery,
  useLazyGetClassSubjectsQuery,
  useAddStudentToClassMutation,
  // useGetStudentsQuery,
  // useLazyGetStudentsQuery,
  useGetClassStudentsQuery,
  useLazyGetClassStudentsQuery,
  useDisassociateClassInGroupMutation,
  useAssociateClassInGroupMutation,
  useDeleteGroupMutation,
  useGetClassesQuery,
  useLazyGetClassesQuery,
  useGetClassQuery,
  useCreateClassMutation,
  useDeleteClassMutation,
  useUpdateClassMutation,
  useGetGroupsQuery,
  useGetClassesByGroupQuery,
  useCreateClassGroupMutation,
  useGetAllStudentsQuery,
  useLazyGetAllStudentsQuery,
  useGetStudentGuardianListQuery,
  useLazyGetStudentGuardianListQuery,
  useUpdateGroupMutation,
  useDissociateStudentFromClassMutation,
  useDeleteClassPeopleMutation,
  useDeleteBulkStudentsMutation,
  useGetAbsentStudentsQuery,
  useGetStudentDetailsQuery,
  useDeleteClassDayScheduleMutation, // Add this export
} = classManagementApi;
