import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  createGetQuery,
  createMutationParamQuery,
  createMutationQuery,
  headers,
} from "./config";
import { env } from "src/utils/env";
import { IBomArgs, IRDOORGRes } from "./types";

export const saasApiSlice = createApi({
  reducerPath: "saasApi",

  baseQuery: fetchBaseQuery({
    baseUrl: env.ENOVIA_BASE_URL,
    prepareHeaders: headers,
  }),

  endpoints: (builder) => ({
    bom: builder.mutation(createMutationQuery<IBomArgs>("/")),
    getSrcOrgs:builder.query<IRDOORGRes, {}>(createGetQuery("/resources/v1/modeler/dslib/dslib:ClassifiedItem/:objectId")),
    rdoList: builder.query<IRDOORGRes, {}>(createGetQuery("/jdiBom/rdo-list")),
    orgList: builder.query<IRDOORGRes, {}>(createGetQuery("/jdiBom/org-list")),
    taskList: builder.query(createGetQuery("/tasks-list")),
    updateStatus: builder.mutation(
      createMutationParamQuery("/task/:id/status", "PATCH")
    ),
    getBusinessUnits: builder.query(createGetQuery("/bu/getBusinessUnit")),
  }),
});

export const { useBomMutation, useUpdateStatusMutation } = saasApiSlice;

export const {
  useRdoListQuery,
  useOrgListQuery,
  useTaskListQuery,
  useGetBusinessUnitsQuery,
} = saasApiSlice;
