import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createGetWithParamsQuery, headers } from "./config";
import { env } from "../../env";

export const usersApiSlice = createApi({
  reducerPath: "usersApi",

  baseQuery: fetchBaseQuery({
    baseUrl: env.API_URL,
    prepareHeaders: headers,
  }),

  endpoints: (builder) => ({
    getUser: builder.query<{}, { email: string }>(
      createGetWithParamsQuery("/users/:email"),
    ),
  }),
});

export const { useGetUserQuery } = usersApiSlice;
