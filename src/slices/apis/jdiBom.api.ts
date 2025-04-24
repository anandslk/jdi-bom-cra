import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  createGetQuery,
  createGetWithParamsQuery,
  createMutationParamQuery,
  createMutationQuery,
  headers,
} from "./config";
import { env } from "src/utils/env";
import { IBomArgs, IRDOORGRes } from "./types";

export const jdiBomApiSlice = createApi({
  reducerPath: "jdiBomApi",

  baseQuery: fetchBaseQuery({
    baseUrl: env.API_URL,
    prepareHeaders: headers,
  }),

  endpoints: (builder) => ({
    bom: builder.mutation(createMutationQuery<IBomArgs>("/")),
    getSrcOrgs: builder.query<IRDOORGRes, { objectId: string }>(
      createGetWithParamsQuery("/jdiBom/srcOrg-list/:objectId")
    ),
    rdoList: builder.query<IRDOORGRes, {}>(createGetQuery("/jdiBom/rdo-list")),
    orgList: builder.query<IRDOORGRes, {}>(createGetQuery("/jdiBom/org-list")),
    taskList: builder.query(createGetQuery("/tasks-list")),
    updateStatus: builder.mutation(
      createMutationParamQuery("/task/:id/status", "PATCH")
    ),
    getBusinessUnits: builder.query(createGetQuery("/bu/getBusinessUnit")),
  }),
});

export const { useBomMutation, useUpdateStatusMutation } = jdiBomApiSlice;

export const {
  useGetSrcOrgsQuery,
  useRdoListQuery,
  useOrgListQuery,
  useTaskListQuery,
  useGetBusinessUnitsQuery,
} = jdiBomApiSlice;
