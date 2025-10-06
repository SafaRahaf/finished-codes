import { apiSlice } from "@/store/api/apiSlice";
import routes from "@/config/routes";

export const studentManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllStudents: builder.query({
      query: ({
        page = 1,
        searchTerm = "",
        selectedClass = "",
        sort = "first_name",
        sortOrder = "asc",
        limit,
      }) => {
        let url = `${routes.students("auth")}?page=${page ? page : ""}&limit=${
          limit ? limit : 10
        }&sort=${sort}&sortOrder=${sortOrder}`;
        if (searchTerm) {
          url += `&searchTerm=${searchTerm}`;
        }
        if (selectedClass) {
          url += `&filter[class_id]=${selectedClass}`;
        }
        return { url };
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
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
            dispatch(apiSlice.util.invalidateTags(["Students", "Dashboard"]));
          }
        } catch (error) {
          message.error("Failed to delete students");
          console.error(error);
        }
      },
    }),
    addNewStudent: builder.mutation({
      query: (data) => {
        return {
          url: `${routes.addNewStudent("auth")}`,
          method: "POST",
          body: data.data,
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          // Invalidate dashboard data when student is added
          dispatch(apiSlice.util.invalidateTags(["Dashboard", "Students"]));
          info.success(data, meta.response.status);
        } catch (error) {
          console.error(error);
          info.error(error);
        }
      },
    }),

    studentCompletion: builder.mutation({
      query: (data) => {
        return {
          url: `${routes.studentCompletion(
            "auth",
            data.uuidSyntexToken,
            data.oneTimeStudentCompletionToken
          )}`,
          method: "PATCH",
          body: data.data,
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          // Invalidate dashboard data when student completion is updated
          dispatch(apiSlice.util.invalidateTags(["Dashboard", "Students"]));
          if (info.success) {
            info.success(data, meta.response.status);
          }
        } catch (error) {
          console.error(error);
          if (info.error) {
            info.error(error);
          }
        }
      },
    }),

    studentCompletionGet: builder.query({
      query: ({ token, header_token }) => {
        return {
          url: `${routes.studentDefaultDetails("auth")}/${token}`,
          headers: {
            Authorization: `Bearer ${header_token}`,
          },
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),

    updateStudentPersonalInfo: builder.mutation({
      query: ({ peopleId, payload }) => {
        return {
          url: `${routes.studentPersonalInfoUpdate("auth", peopleId)}`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    updateStudentProfile: builder.mutation({
      query: ({ peopleId, payload }) => {
        return {
          url: `${routes.studentProfileUpdate("auth", peopleId)}`,
          method: "PATCH",
          body: payload,
        };
      },
    }),
    updateStudentGuardian: builder.mutation({
      query: ({ peopleId, payload }) => {
        return {
          url: `${routes.studentGuardianUpdate("auth", peopleId)}`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    updateStudentMedicalInfo: builder.mutation({
      query: ({ peopleId, payload }) => {
        return {
          url: `${routes.studentMedicalInfo("auth", peopleId)}`,
          method: "PATCH",
          body: payload,
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (info.success) {
            info.success(data, meta.response.status);
          }
        } catch (error) {
          console.error(error);
          if (info.error) {
            info.error(error);
          }
        }
      },
    }),
    getGrades: builder.query({
      query: () => {
        return {
          url: `${routes.grades("auth")}`,
        };
      },
    }),
    getDepartments: builder.query({
      query: () => {
        return {
          url: `${routes.departments("auth")}`,
        };
      },
    }),
  }),
});

export const {
  useGetAllStudentsQuery,
  useLazyGetAllStudentsQuery,
  useAddNewStudentMutation,
  useGetGradesQuery,
  useGetDepartmentsQuery,
  useDeleteBulkStudentsMutation,
  useUpdateStudentPersonalInfoMutation,
  useUpdateStudentMedicalInfoMutation,
  useUpdateStudentProfileMutation,
  useUpdateStudentGuardianMutation,
  useStudentCompletionMutation,
  useStudentCompletionGetQuery,
} = studentManagementApi;
