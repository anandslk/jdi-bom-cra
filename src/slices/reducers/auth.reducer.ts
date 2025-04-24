import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "../../store/initialState";
import { jdiBomApiSlice } from "../apis/jdiBom.api";

const authSlice = createSlice({
  name: "auth",
  initialState: initialState.user,

  reducers: {},

  extraReducers: (builder) => {
    builder.addMatcher(jdiBomApiSlice.endpoints.bom.matchFulfilled, () => {});
  },
});

export const {} = authSlice.actions;

export const authReducer = authSlice.reducer;
