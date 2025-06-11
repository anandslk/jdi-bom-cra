import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "src/app/jdiBom/store/initialState";
import { usersApiSlice } from "../apis/users.api";

const userSlice = createSlice({
  name: "user",
  initialState: initialState.user,

  reducers: {},

  extraReducers: (builder) => {
    builder.addMatcher(
      usersApiSlice.endpoints.getUser.matchFulfilled,
      (_, action) => {
        return (action.payload as any)?.data as IUser;
      },
    );
  },
});

export const userReducer = userSlice.reducer;
