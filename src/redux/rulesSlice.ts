import { createSlice } from "@reduxjs/toolkit";

const saveCache = (state: boolean): void => {
  window.localStorage.setItem("firstTime", state ? "true" : "false");
};
const loadCache = (): boolean => {
  const cache = window.localStorage.getItem("firstTime") || "true";
  return cache === "true";
};

const initialState: boolean = loadCache();

export const rulesSlice = createSlice({
  name: "rules",
  initialState,
  reducers: {
    showRules: () => {
      saveCache(false);
      return true;
    },
    hideRules: () => {
      saveCache(false);
      return false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { showRules, hideRules } = rulesSlice.actions;

export default rulesSlice.reducer;
