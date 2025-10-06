"use client";
import { useEffect } from "react";
import { getCookie } from "cookies-next";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "@/store/features/auth/authSlice";

function InitSiteLoad({ children }) {
  const dispatch = useDispatch();
  //   when load website add auth in redux store
  useEffect(() => {
    const token = getCookie("access_token");
    if (token) {
      dispatch(
        userLoggedIn({
          accessToken: token,
        })
      );
    }
  });
  return children;
}

export default InitSiteLoad;
