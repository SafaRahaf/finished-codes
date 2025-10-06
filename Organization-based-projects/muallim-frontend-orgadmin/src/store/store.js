import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./features/auth/authSlice";

export const store = configureStore({
  reducer: {
    // dynamically apply all features reducers paths
    [apiSlice.reducerPath]: apiSlice.reducer,
    // store auth data into state
    auth: authReducer,
  },
  // concat all apiSlice middlwares
  middleware: (getDefaultMiddlewares) =>
    getDefaultMiddlewares().concat(apiSlice.middleware),
});
