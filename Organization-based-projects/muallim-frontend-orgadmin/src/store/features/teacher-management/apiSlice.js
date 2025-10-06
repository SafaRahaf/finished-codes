import { message } from "antd";
import { apiSlice } from "../../api/apiSlice";
import routes from "@/config/routes";
import { CLIENT_NAME } from "@/static/static";

export const classManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // get all teachers
    getTeachers: builder.query({
      query: () => {
        return {
          url: routes.teachers("auth"),
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // get teacher details
    getTeacherDetails: builder.query({
      query: (id) => {
        return {
          url: `${routes.teachers(
            "auth"
          )}/${id}?classAndSubject=true&moreInformation=true`,
        };
      },
      providesTags: (result, error, id) => [
        { type: "Teachers", id },
        { type: "Teachers", id: "LIST" },
      ],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),

    // teacher lists
    getTeachersWithExtraData: builder.query({
      query: ({ page, limit, searchTerm, designation, sort, sortOrder }) => {
        const url = `${routes.teachers("auth")}?page=${
          page ? page : ""
        }&limit=${limit ? limit : ""}${
          searchTerm ? `&searchTerm=${searchTerm}` : ""
        }${designation ? `&filter[designation]=${designation}` : ""}${
          sort ? `&sort=${sort}` : ""
        }${sortOrder ? `&sortOrder=${sortOrder}` : ""}`;
        return { url };
      },
      //   serializeQueryArgs: ({ endpointName }) => {
      //     return endpointName;
      //   },
      //   forceRefetch({ currentArg, previousArg }) {
      //     return currentArg !== previousArg;
      //   },
    }),

    // invite teacher
    inviteTeacher: builder.mutation({
      query: ({ data }) => {
        return {
          url: routes.inviteTeacher("auth"),
          method: "POST",
          body: data,
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201) {
            dispatch(apiSlice.util.invalidateTags(["Dashboard", "Teachers"]));
            info.successHandler();
          }
        } catch (error) {
          console.error(error);
        }
      },
    }),
    // default teacher details
    getTeacherDefaultDetails: builder.query({
      query: ({ token, header_token }) => {
        return {
          url: `${routes.teacherDefaultDetails("auth")}/${token}`,
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
    // submit teacher form
    submitTeacherForm: builder.mutation({
      query: ({ data, token }) => {
        return {
          url: `${routes.employeeProfileCompletion("auth")}/${
            token ? token : ""
          }`,
          method: "PATCH",
          body: data,
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201 || meta.response.status === 200) {
            message.success("Request Success");
            // Invalidate dashboard data when teacher form is submitted
            dispatch(apiSlice.util.invalidateTags(["Dashboard", "Teachers"]));
            info.redirectAnotherPage();
            info.resetCookie();
          }
        } catch (error) {
          console.error(error);
        }
      },
    }),
    // teacher attendence tab data
    getTeacherStudentAttendance: builder.query({
      query: ({ startDate, endDate, peopleId, summaryDetailsFor }) => {
        return {
          url: `${routes.attendanceSummaryDetails(
            "attendance"
          )}?startDate=${startDate}&endDate=${endDate}&people_id=${peopleId}${
            summaryDetailsFor ? "&summary_details_for=" + summaryDetailsFor : ""
          }`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      // serializeQueryArgs: ({ queryArgs }) => {
      //   return `${queryArgs.peopleId}-${queryArgs.startDate}-${
      //     queryArgs.endDate
      //   }-${queryArgs.summaryDetailsFor || "default"}`;
      // },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // teacher attendence chart
    getTeacherAttendanceChart: builder.query({
      query: ({ startDateForChart, endDateForChart, peopleId, summeryFor }) => {
        let url = `${routes.attendanceSummary(
          "attendance"
        )}?startMonth=${startDateForChart}&endMonth=${endDateForChart}`;
        if (peopleId) {
          url += `&people_id=${peopleId}`;
        }
        if (summeryFor) {
          url += `&summary_for=${summeryFor}`;
        }
        return { url };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),

    getAllAttendanceChart: builder.query({
      query: ({
        startDateForChart,
        endDateForChart,
        summeryFor,
        studentAttendanceDate,
        peopleId,
      }) => {
        let url = `${routes.attendanceSummaryAll("attendance")}`;
        if (startDateForChart || endDateForChart) {
          url += `?startDate=${
            studentAttendanceDate ? studentAttendanceDate : startDateForChart
          }&endDate=${
            studentAttendanceDate ? studentAttendanceDate : endDateForChart
          }`;
        }
        if (summeryFor) {
          url += `&summary_for=${summeryFor}`;
        }
        if (peopleId) {
          url += `&filter[people_id]=${peopleId}`;
        }
        return { url };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),

    getAttendanceSheet: builder.query({
      query: ({
        sheetFor,
        startDate,
        endDate,
        page,
        limit,
        filters,
        filterByClass,
        dataType,
      }) => {
        let url = `${routes.attendanceSheet(
          "attendance"
        )}?sheet_for=${sheetFor}&startDate=${startDate}&endDate=${endDate}${
          page ? `&page=${page}` : ""
        }${limit ? `&limit=${limit}` : ""}${
          filterByClass ? `&filter[class_id]=${filterByClass}` : ""
        }`;

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url += `&filter[${key}]=${value}`;
            }
          });
        }
        if (dataType) {
          url += `&filter[data_type]=${dataType}`;
        }

        return { url };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    getAttendanceSheetLazy: builder.query({
      query: ({
        sheetFor,
        startDate,
        endDate,
        page,
        limit,
        filters,
        dataType,
      }) => {
        let url = `${routes.attendanceSheet(
          "attendance"
        )}?sheet_for=${sheetFor}&startDate=${startDate}&endDate=${endDate}${
          page ? `&page=${page}` : ""
        }${limit ? `&limit=${limit}` : ""}`;

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url += `&filter[${key}]=${value}`;
            }
          });
        }

        if (dataType) {
          url += `&filter[data_type]=${dataType}`;
        }

        return { url };
      },
    }),
    // teacher profile update auth/profile/employee-profile-update
    teacherProfileUpdate: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `${routes.employeeProfileUpdate("auth")}/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Teachers", id },
        { type: "Teachers", id: "LIST" },
      ],
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201 || meta.response.status === 200) {
            message.success("Update Success");
            info.redirectAnotherPage();
            info.resetCookie();
          }
        } catch (error) {
          console.error(error);
        }
      },
    }),
    // delete employee Schedule
    deleteEmployeeSchedule: builder.mutation({
      query: ({ id, query }) => {
        return {
          url: `${routes.employeeScheduleDelete("auth")}/${id}${query || ""}`,
          method: "DELETE",
        };
      },
    }),
    // delete employee responsibilities
    deleteEmployeeResponsibilities: builder.mutation({
      query: ({ id }) => {
        return {
          url: `${routes.employeeResponsibilitiesDelete("auth")}/${id}`,
          method: "DELETE",
        };
      },
    }),
    // delete employee Education
    deleteEmployeeEducation: builder.mutation({
      query: ({ id }) => {
        return {
          url: `${routes.deletePeopleEducation("auth")}/${id}`,
          method: "DELETE",
        };
      },
    }),
    // delete employee Experience
    deleteEmployeeExperience: builder.mutation({
      query: ({ id }) => {
        return {
          url: `${routes.deletePeopleExperience("auth")}/${id}`,
          method: "DELETE",
        };
      },
    }),
    // delete people identification
    deletePeopleIdentification: builder.mutation({
      query: ({ id }) => {
        return {
          url: `${routes.deletePeopleIdentification("auth")}/${id}`,
          method: "DELETE",
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            message.success("Identification deleted successfully");
          }
        } catch (error) {
          message.error("Failed to delete identification");
          console.error(error);
        }
      },
    }),

    updateAdminNote: builder.mutation({
      query: ({ id, admin_note, status }) => ({
        url: routes.adminNote("attendance", id),
        method: "PATCH",
        body: { admin_note, status },
      }),
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          await queryFulfilled;
          message.success("Attendance updated successfully");
        } catch (error) {
          message.error("Failed to update attendance");
        }
      },
    }),

    deleteBulkTeachers: builder.mutation({
      query: ({ items, reason }) => {
        return {
          url: `${routes.deleteBulkTeachers("auth")}`,
          method: "POST",
          body: { items, reason },
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            message.success(
              `Successfully deleted ${data.meta.success} teachers`
            );
            // Invalidate both teachers and dashboard data
            dispatch(apiSlice.util.invalidateTags(["Teachers", "Dashboard"]));
          }
        } catch (error) {
          message.error("Failed to delete teachers");
          console.error(error);
        }
      },
    }),
    getTeacherInfoDataByEmailIfExists: builder.mutation({
      query: ({ email }) => {
        return {
          url: `${routes.teacherExistsInTheSystem("auth")}`,
          method: "POST",
          body: { email },
        };
      },
    }),
    isExistingPeople: builder.mutation({
      query: (email) => {
        return {
          url: `${routes.emailAvailable("auth")}?isOrgAdminEmail=true`,
          method: "POST",
          headers: { "client-name": CLIENT_NAME },
          body: {
            email,
          },
        };
      },
    }),
  }),
});
export const {
  useTeacherProfileUpdateMutation,
  useUpdateAdminNoteMutation,
  useGetTeacherAttendanceChartQuery,
  useGetAllAttendanceChartQuery,
  useGetTeacherStudentAttendanceQuery,
  useGetAttendanceSheetQuery,
  useGetTeacherDetailsQuery,
  useSubmitTeacherFormMutation,
  useGetTeacherDefaultDetailsQuery,
  useGetTeachersWithExtraDataQuery,
  useLazyGetTeachersWithExtraDataQuery,
  useDeletePeopleIdentificationMutation,
  useDeleteEmployeeExperienceMutation,
  useDeleteEmployeeEducationMutation,
  useDeleteEmployeeResponsibilitiesMutation,
  useDeleteEmployeeScheduleMutation,
  useLazyGetAttendanceSheetQuery,
  useGetTeachersQuery,
  useInviteTeacherMutation,
  useDeleteBulkTeachersMutation,
  useGetTeacherInfoDataByEmailIfExistsMutation,
  useIsExistingPeopleMutation,
} = classManagementApi;
