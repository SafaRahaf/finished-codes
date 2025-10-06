import { apiSlice } from "../../api/apiSlice";
import siteConfig from "@/config";
import routes from "@/config/routes";
// Inject all authentication related api in main api slice
export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    studentDashboardCount: builder.query({
      query: () => ({
        url: routes.studentDashboardCount("class"),
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
    teacherDashboardCount: builder.query({
      query: () => ({
        url: routes.teacherDashboardCount("class"),
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
    parentDashboardCount: builder.query({
      query: () => ({
        url: routes.parentDashboardCount("org"),
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
    classDashboardCount: builder.query({
      query: () => ({
        url: routes.classDashboardCount("class"),
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
    classDashboardCountFiltered: builder.query({
      query: ({ dataType, startDate, endDate, filterByClass }) => {
        let url = routes.classDashboardCount("class");
        const params = [];
        if (dataType) params.push(`filter[data_type]=${dataType}`);
        if (filterByClass) params.push(`filter[class_id]=${filterByClass}`);
        if (startDate) params.push(`filter[start_date]=${startDate}`);
        if (endDate) params.push(`filter[end_date]=${endDate}`);
        if (params.length) url += `?${params.join("&")}`;
        return { url, method: "GET" };
      },
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useStudentDashboardCountQuery,
  useTeacherDashboardCountQuery,
  useClassDashboardCountQuery,
  useClassDashboardCountFilteredQuery,
  useParentDashboardCountQuery,
} = dashboardApi;
