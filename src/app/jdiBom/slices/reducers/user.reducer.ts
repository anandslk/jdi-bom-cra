import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "src/app/jdiBom/store/initialState";
import { jdiBomApiSlice } from "../apis/jdiBom.api";

const userSlice = createSlice({
  name: "user",
  initialState: initialState.user,

  reducers: {},

  extraReducers: (builder) => {
    builder.addMatcher(
      jdiBomApiSlice.endpoints.getUser.matchFulfilled,
      (_, action) => {
        return (action.payload as any)?.data as IUser;
      },
    );
  },
});

export const userReducer = userSlice.reducer;
