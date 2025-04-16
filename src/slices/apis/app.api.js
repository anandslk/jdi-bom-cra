import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  createGetQuery,
  createMutationParamQuery,
  createMutationQuery,
  headers,
} from "./config";
import { env } from "src/utils/env";

export const apiSlice = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: env.API_URL,
    prepareHeaders: headers,
  }),

  endpoints: (builder) => ({
    post: builder.mutation(createMutationQuery("/")),
    rdoList: builder.query(createGetQuery("/jdiBom/rdo-list")),
    orgList: builder.query(createGetQuery("/jdiBom/org-list")),
    taskList: builder.query(createGetQuery("/tasks-list")),
    updateStatus: builder.mutation(
      createMutationParamQuery(
        "/task/:id/status",
        "PATCH",
      ),
    ),
    getBusinessUnits: builder.query(createGetQuery("/bu/getBusinessUnit")),
  }),
});

export const {
  usePostMutation,
  useRdoListQuery,
  useOrgListQuery,
  useTaskListQuery,
  useUpdateStatusMutation,
  useGetBusinessUnitsQuery
} = apiSlice;

export const {} = apiSlice;
