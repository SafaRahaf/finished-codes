import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: undefined,
  authData: undefined,
  profileToggle: false,
  tourModalOpen: false,
  orgShortName: null, // Add organization short name to state
  cachedProfileData: null, // Cache for profile data from API
};

// create reducer for store user access data
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.accessToken = action.payload.accessToken;
    },
    userLoggedOut: (state) => {
      state.accessToken = "";
      state.authData = undefined;
      state.orgShortName = null; // Clear org short name on logout
      state.cachedProfileData = null; // Clear cached profile data on logout
    },
    setUserData: (state, action) => {
      state.authData = action.payload;
      // Set org short name from decoded token data
      if (action.payload?.org_short_name) {
        state.orgShortName = action.payload.org_short_name;
      }
    },
    toggleProfile: (state) => {
      state.profileToggle = !state.profileToggle;
    },
    setProfileToggle: (state, action) => {
      state.profileToggle = action.payload; // Explicitly set the value
    },
    setTourModalOpen: (state, action) => {
      state.tourModalOpen = action.payload;
    },
    // New action to update organization short name
    updateOrgShortName: (state, action) => {
      state.orgShortName = action.payload;
      // Also update localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("org_short_name", action.payload);
      }
    },
    // New action to cache profile data from API
    setCachedProfileData: (state, action) => {
      state.cachedProfileData = action.payload;
      // Also store in localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "cached_profile_data",
          JSON.stringify(action.payload)
        );
      }
    },
    // New action to update profile name in cache
    updateProfileName: (state, action) => {
      if (state.cachedProfileData) {
        state.cachedProfileData.people = {
          ...state.cachedProfileData.people,
          first_name: action.payload.first_name,
          last_name: action.payload.last_name,
        };
        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "cached_profile_data",
            JSON.stringify(state.cachedProfileData)
          );
        }
      }
    },
    // New action to clear cached profile data
    clearCachedProfileData: (state) => {
      state.cachedProfileData = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("cached_profile_data");
      }
    },
  },
});

export default authSlice.reducer;
export const {
  userLoggedIn,
  userLoggedOut,
  setUserData,
  toggleProfile,
  setProfileToggle,
  setTourModalOpen,
  updateOrgShortName, // Export new action
  setCachedProfileData, // Export new action
  updateProfileName, // Export new action
  clearCachedProfileData, // Export new action
} = authSlice.actions;
