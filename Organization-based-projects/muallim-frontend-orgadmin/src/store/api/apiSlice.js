import siteConfig from "@/config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie, setCookie } from "cookies-next";
import { userLoggedIn, userLoggedOut } from "../features/auth/authSlice";
import routes from "@/config/routes";
import { removeHeaderCookie } from "../features/auth/removeHeaderCookie";
import { message } from "antd";

const baseQueryWithoutReauth = (baseUrl) =>
  fetchBaseQuery({
    baseUrl,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

const dynamicBaseQuery = async (args, api, extraOptions) => {
  const generateNewTokenApiRequest = routes.getToken("auth");
  let baseUrl = `${siteConfig.CORE_API_URL}api/`;
  if (args.meta && args.meta.baseUrl) {
    baseUrl = args.meta.baseUrl;
  }
  const rawBaseQuery = baseQueryWithoutReauth(baseUrl);
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const refreshToken = getCookie("refresh_token");
    if (refreshToken) {
      const refreshUrl = generateNewTokenApiRequest;
      const refreshResult = await baseQueryWithoutReauth(baseUrl)(
        {
          url: refreshUrl,
          method: "POST",
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions
      );
      if (refreshResult.data) {
        const { access_token } = refreshResult.data.data;
        setCookie("access_token", access_token, {
          path: "/",
        });
        api.dispatch(userLoggedIn({ accessToken: access_token }));
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(userLoggedOut());
        removeHeaderCookie("access_token");
        message.error("You have been logged out due to inactivity.");
        setTimeout(() => {
          window.location.replace("/");
        }, 3000);
      }
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: dynamicBaseQuery,
  tagTypes: [
    "Roles",
    "UserRoles",
    "Teachers",
    "Students",
    "Classes",
    "Dashboard",
    "ClassStudents",
  ],
  endpoints: (builder) => ({}),
});
