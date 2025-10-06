import routes from "@/config/routes";
import { apiSlice } from "../../api/apiSlice";
// Inject all authentication related api in main api slice
export const userManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // user lists
    getUsersWithExtraData: builder.query({
      query: ({ page, limit, searchTerm, designation }) => {
        return {
          url: `${routes.users("auth")}?page=${page}${
            limit ? `&limit=${limit}` : ""
          }${searchTerm ? `&searchTerm=${searchTerm}` : ""}${
            designation ? `&filter[designation]=${designation}` : ""
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
  }),
});
export const {
  useGetUsersWithExtraDataQuery,
  useLazyGetUsersWithExtraDataQuery,
} = userManagementApi;
