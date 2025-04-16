import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createGetQuery, headers } from "./config";
import { env } from "src/utils/env";

export const droppedSlice = createApi({
  reducerPath: "droppedApi",

  baseQuery: fetchBaseQuery({
    baseUrl: env.API_URL,
    prepareHeaders: headers,
  }),

  endpoints: (builder) => ({
    getObjectDetails: builder.query(
      createGetQuery("/revFloat/getDroppedObjectDetails")
    ),
  }),
});

export const { useLazyGetObjectDetailsQuery } = droppedSlice;

export const {} = droppedSlice;
