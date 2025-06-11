import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createGetWithParamsQuery, headers } from "./config";

export const usersApiSlice = createApi({
  reducerPath: "usersApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080",
    prepareHeaders: headers,
  }),

  endpoints: (builder) => ({
    getUser: builder.query<{}, { email: string }>(
      createGetWithParamsQuery("/users/:email"),
    ),
  }),
});

export const { useGetUserQuery } = usersApiSlice;
