import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { apiSlice } from "@/store/api/apiSlice";

export const useDashboardUpdates = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      // if (document.visibilityState === "visible") {
      dispatch(apiSlice.util.invalidateTags(["Dashboard"]));
      // }
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Function to manually trigger dashboard update
  const refreshDashboard = () => {
    dispatch(apiSlice.util.invalidateTags(["Dashboard"]));
  };

  return { refreshDashboard };
};
