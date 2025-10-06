import routes from "@/config/routes";
import { apiSlice } from "../../api/apiSlice";
// Inject all authentication related api in main api slice
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // get countries
    getCountries: builder.query({
      query: () => {
        return {
          url: `${routes.parentLocations("org")}?depth=1&sort=location_name`,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // get locations
    getLocationLayers: builder.query({
      query: (id) => {
        return {
          url: `${routes.locations("org")}/${id}?depth=1&sort=location_name`,
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
  useGetCountriesQuery,
  useGetLocationLayersQuery,
  useLazyGetLocationLayersQuery,
} = authApi;
