import { isRejectedWithValue } from "@reduxjs/toolkit";
import { userLoggedOut } from "./authSlice";
import { removeHeaderCookie } from "./removeHeaderCookie";
import { message } from "antd";

export const checkAuth = (api) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    if (action.payload.status === 401) {
      api.dispatch(userLoggedOut());
      removeHeaderCookie("access_token");
      message.error("You have been logged out due to inactivity.");
      setTimeout(() => {
        window.location.replace("/");
      }, 3000);
    }
  }

  return next(action);
};
