import { apiSlice } from "../../api/apiSlice";
import { message } from "antd";
import { userLoggedIn, setUserData } from "./authSlice";
import { setCookie, deleteCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import routes from "@/config/routes";
import { CLIENT_NAME } from "@/static/static";
// Inject all authentication related api in main api slice
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // signin api endpoint
    signInReq: builder.mutation({
      // expected parameters email, password
      query: ({ data }) => {
        return {
          url: routes.signin("auth"),
          method: "POST",
          // for any type of user login
          headers: { "client-name": CLIENT_NAME },
          body: {
            email: data.email,
            password: data.password,
          },
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            const userData = data?.data;
            // decode all user data
            const decoded = jwtDecode(userData.access_token);
            // Set access token in cookies (replace localStorage)
            setCookie("access_token", userData.access_token, {
              path: "/",
            });
            setCookie("refresh_token", userData.refresh_token, {
              path: "/",
            });

            // Dispatch login action to Redux store
            dispatch(
              userLoggedIn({
                accessToken: userData.access_token,
              })
            );
            //Dispatch store user data  to Redux store
            dispatch(setUserData(decoded));
            info.resetHandler();

            const isClientName = decoded?.client_name;
            if (isClientName !== CLIENT_NAME) {
              message.error("You are not authorized to access this Panel.");
              info.redirecToDashboard("/create-organization");
            } else {
              message.success("Login successful");
              if (decoded?.org_id === null) {
                info.redirecToDashboard("/create-organization");
              } else {
                info.redirecToDashboard("/dashboard");
              }
            }

            // message.success("Login successful");

            // if (decoded?.org_id === null) {
            //   info.redirecToDashboard("/create-organization");
            // } else {
            //   info.redirecToDashboard("/dashboard");
            // }
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // signup api endpoint
    signup: builder.mutation({
      // expected parameters first_name, last_name, email, password, mobile
      query: ({ data }) => {
        return {
          url: routes.signup("auth"),
          method: "POST",
          headers: { "client-name": CLIENT_NAME },
          body: {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password: data.password,
            mobile: data.mobile,
            verification_method: data.verification_method,
          },
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201) {
            info.redirectAnotherPage();
            info.resetHandler();
            message.success("Signup successful");
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // email varification
    emailVerification: builder.mutation({
      // expected parameters email, otp
      query: ({ data }) => {
        return {
          url: routes.verifyOtp("auth"),
          method: "POST",
          headers: { "client-name": CLIENT_NAME },
          body: {
            otp: `${data.otp}`,
            to: data.email,
            purpose: data.purpose,
          },
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201) {
            message.success("Verfication successfully.");
            if (info.data.purpose === "reset_password") {
              info.redirectAnotherPage(
                `/forgot-password/reset-password?email=${info.data.email}${
                  data?.data?.otp_support_pin
                    ? `&secret=${data?.data?.otp_support_pin}`
                    : ""
                }`
              );
            } else {
              info.redirectAnotherPage();
            }
          }
        } catch (error) {
          console.log(error);
          if (error?.error?.status === 400) {
            message.error(error?.error?.data?.message);
          }
        }
      },
    }),
    // resend OTP
    resendOtp: builder.mutation({
      // expected parameters email, otpfgh
      query: ({ data }) => {
        return {
          url: routes.resendOtp("auth"),
          method: "POST",
          headers: { "client-name": CLIENT_NAME },
          body: {
            method: data.method,
            to: data.email,
            purpose: data.purpose,
          },
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201) {
            info.resetTime();
            message.success(
              "OTP has been resent successfully. Please check your registered email for the new OTP."
            );
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // create organization
    createOrganzization: builder.mutation({
      // expected parameters name, description, website_url, org_type_id
      query: ({ data }) => {
        return {
          url: routes.creatOrganization("org"),
          method: "POST",
          body: data,
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201) {
            info.switchToOrgUserHandler(data?.data?.id);
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // switch to general user to org user
    switchToOrgUser: builder.mutation({
      // expected parameters org_id
      query: ({ org_id }) => {
        return {
          url: routes.switchProfile("auth"),
          method: "POST",
          body: {
            org_id: org_id,
          },
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Welcome to Muallim Organization");
            const userData = data?.data;
            // decode all user data
            const decoded = jwtDecode(userData.access_token);
            // Set access token in cookies (replace localStorage)
            deleteCookie("access_token");
            setCookie("access_token", userData.access_token, {
              maxAge: 60 * 60 * 24 * 7, // 1 week expiration
              path: "/",
            });

            // Dispatch login action to Redux store
            dispatch(
              userLoggedIn({
                accessToken: userData.access_token,
              })
            );
            //Dispatch store user data  to Redux store
            dispatch(
              setUserData({
                authData: decoded,
              })
            );
            localStorage.setItem("newOrg", JSON.stringify(true));
            info.redirectToAnotherPage();
            info.resetHandler();
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // sent otp
    sentOtpByEmail: builder.mutation({
      // expected parameters email, otp
      query: ({ data }) => {
        return {
          url: routes.sentOtp("auth"),
          method: "POST",
          headers: { "client-name": CLIENT_NAME },
          body: {
            method: data.method,
            to: data.email,
            purpose: data.purpose,
          },
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201) {
            info.redirect();
            info.resetHandler();
            message.success("OTP sent successfully.");
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // reset password
    resetPassword: builder.mutation({
      // expected parameters otp_support_pin, to, new_password
      query: ({ data }) => {
        return {
          url: routes.resetPassword("auth"),
          method: "POST",
          headers: { "client-name": CLIENT_NAME },
          body: {
            otp_support_pin: data.otp_support_pin,
            to: data.email,
            new_password: data.new_password,
          },
        };
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 201) {
            info.redirect();
            info.resetHandler();
            message.success("Password reset successful.");
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // get organization types
    orgaizationTypes: builder.query({
      query: () => {
        return {
          url: routes.orgTypes("org"),
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // get contact types
    contactTypes: builder.query({
      query: () => {
        return {
          url: routes.contactTypes("org"),
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // delete contact
    deleteContact: builder.mutation({
      query: ({ id }) => {
        return {
          url: `${routes.deleteContact("org")}/${id}`,
          method: "DELETE",
        };
      },
    }),
    // onboarding profile setup
    onboardingProfileSetupData: builder.query({
      query: () => {
        return {
          url: routes.onBoardingProfileSetup("org"),
          method: "GET",
        };
      },
      providesTags: ["OnboardingProfileSetupData"],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    onboardingProfileSetup: builder.mutation({
      query: ({ data }) => {
        return {
          url: routes.onBoardingProfileSetup("org"),
          method: "PATCH",
          body: data,
        };
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Profile Update successfully");

            // Invalidate the onboarding profile setup data cache
            dispatch(
              apiSlice.util.invalidateTags([
                { type: "OnboardingProfileSetupData", id: "LIST" },
              ])
            );

            info.next();
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // roles
    peopleRoles: builder.query({
      query: () => {
        return {
          url: `${routes.peopleRoles("auth")}?limit=999`,
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // identification types
    identificationTypes: builder.query({
      query: () => {
        return {
          url: routes.identificationTypes("auth"),
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // employee degree list
    employeeDegreeList: builder.query({
      query: () => {
        return {
          url: routes.employeeDegrees("auth"),
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // employee institute list
    employeeInstituteList: builder.query({
      query: () => {
        return {
          url: routes.organizationList("auth"),
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // designation list
    designationList: builder.query({
      query: () => {
        return {
          url: routes.designationList("auth"),
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // org designation list
    orgDesignationList: builder.query({
      query: () => {
        return {
          url: routes.orgDesignationList("auth"),
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // check email exist or not
    checkEmailExistOrNot: builder.mutation({
      query: (email) => {
        return {
          url: `${routes.emailAvailable("auth")}`,
          method: "POST",
          headers: { "client-name": CLIENT_NAME },
          body: {
            email,
          },
        };
      },
    }),
    checkEmailExistOrNotForParent: builder.mutation({
      query: (email) => {
        return {
          url: `${routes.emailAvailable(
            "auth"
          )}?moreInformation=true&isParentEmail=true`,
          method: "POST",
          headers: { "client-name": CLIENT_NAME },
          body: {
            email,
          },
        };
      },
    }),
    // check mobile exist or not
    checkMobileExistOrNot: builder.mutation({
      query: (mobile) => {
        return {
          url: routes.mobileAvailable("auth"),
          method: "POST",
          headers: { "client-name": CLIENT_NAME },
          body: {
            mobile_no: mobile,
          },
        };
      },
    }),
    // get user information
    getUserInformation: builder.query({
      query: () => {
        return {
          url: routes.profile("auth"),
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // user profile update
    updateUserInformation: builder.mutation({
      query: ({ data }) => {
        return {
          url: routes.profile("auth"),
          method: "PATCH",
          body: data,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      async onQueryStarted(info, { queryFulfilled, dispatch }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Profile Settings Successfully Updated");

            // Invalidate the onboarding profile setup data cache
            dispatch(
              apiSlice.util.invalidateTags([
                { type: "OnboardingProfileSetupData", id: "LIST" },
              ])
            );
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // get org profile info
    getOrgProfileInfo: builder.query({
      query: (id) => {
        return {
          url: `${routes.organizationProfile("org")}/${id}`,
          method: "GET",
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    // update org profile info
    updateOrgProfileInfo: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `${routes.organizationProfile("org")}/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      async onQueryStarted(info, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          if (meta.response.status === 200) {
            message.success("Organization Settings Successfully Updated");
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
    // get all organizations
    getAllOrganizations: builder.query({
      query: () => {
        return {
          url: routes.organizationProfile("org"),
        };
      },
    }),
    getAllAuthOrganizations: builder.query({
      query: () => {
        return {
          url: `${routes.organizationProfile("auth")}?limit=999`,
        };
      },
    }),
  }),
});
export const {
  useDeleteContactMutation,
  useCheckMobileExistOrNotMutation,
  useSwitchToOrgUserMutation,
  useGetOrgProfileInfoQuery,
  useGetAllOrganizationsQuery,
  useGetAllAuthOrganizationsQuery,
  useLazyGetOrgProfileInfoQuery,
  useUpdateOrgProfileInfoMutation,
  useGetUserInformationQuery,
  useUpdateUserInformationMutation,
  useCheckEmailExistOrNotMutation,
  useDesignationListQuery,
  useOrgDesignationListQuery,
  useEmployeeInstituteListQuery,
  useEmployeeDegreeListQuery,
  useIdentificationTypesQuery,
  usePeopleRolesQuery,
  useSignInReqMutation,
  useSignupMutation,
  useEmailVerificationMutation,
  useCreateOrganzizationMutation,
  useResendOtpMutation,
  useSentOtpByEmailMutation,
  useResetPasswordMutation,
  useLazyOnboardingProfileSetupDataQuery,
  useOnboardingProfileSetupMutation,
  useOnboardingProfileSetupDataQuery,
  useOrgaizationTypesQuery,
  useContactTypesQuery,
  useCheckEmailExistOrNotForParentMutation,
} = authApi;
