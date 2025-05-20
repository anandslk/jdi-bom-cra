import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createGetQuery, headers } from "./config";
import { env } from "src/app/jdiBom/env";

export const droppedApiSlice = createApi({
  reducerPath: "droppedApi",

  baseQuery: fetchBaseQuery({
    baseUrl: env.API_URL,
    prepareHeaders: headers,
  }),

  endpoints: (builder) => ({
    getObjectDetails: builder.query(
      createGetQuery("/revFloat/getDroppedObjectDetails"),
    ),
  }),
});

export const { useLazyGetObjectDetailsQuery } = droppedApiSlice;
