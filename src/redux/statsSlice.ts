import { createSlice } from "@reduxjs/toolkit";

const initialState: boolean = false;

export const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    showStats: () => {
      return true;
    },
    hideStats: () => {
      return false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { showStats, hideStats } = statsSlice.actions;

export default statsSlice.reducer;
