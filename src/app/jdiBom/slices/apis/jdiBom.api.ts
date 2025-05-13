import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createGetWithParamsQuery, headers } from "./config";
import { env } from "src/app/jdiBom/env";

export const jdiBomApiSlice = createApi({
  reducerPath: "jdiBomApi",

  baseQuery: fetchBaseQuery({
    baseUrl: env.API_URL,
    prepareHeaders: headers,
  }),

  endpoints: (builder) => ({
    getUser: builder.query<{}, { email: string }>(
      createGetWithParamsQuery("/jdiBom/getUserByEmail/:email"),
    ),
  }),
});

export const { useGetUserQuery } = jdiBomApiSlice;
