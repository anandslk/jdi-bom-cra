import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "../../store/initialState";
import { apiSlice } from "../apis/app.api";

const authSlice = createSlice({
  name: "auth",
  initialState: initialState.user,

  reducers: {},

  extraReducers: (builder) => {
    builder.addMatcher(apiSlice.endpoints.post.matchFulfilled, () => {});
  },
});

export const {} = authSlice.actions;

export const authReducer = authSlice.reducer;
