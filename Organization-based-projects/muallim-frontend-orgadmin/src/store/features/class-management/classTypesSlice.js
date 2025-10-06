import routes from "@/config/routes";
import { apiSlice } from "../../api/apiSlice";
import siteConfig from "@/config";
const classService = siteConfig.API_VERSION_APPEND_AFTER_SERVICE
  ? "class"
  : "classncertificate";
// Inject all authentication related api in main api slice
export const classTypesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // get class peoples
    getClassTypes: builder.query({
      query: () => {
        return {
          url: routes.classTypesOrg(classService),
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
export const { useGetClassTypesQuery } = classTypesApi;
