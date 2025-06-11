import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  createGetQuery,
  createGetWithParamsQuery,
  createMutationParamQuery,
  createMutationQuery,
  headers,
} from "./config";
import { env } from "src/app/jdiBom/env";
import { Dayjs } from "dayjs";

export const jdiBomApiSlice = createApi({
  reducerPath: "jdiBomApi",

  baseQuery: fetchBaseQuery({
    baseUrl: env.API_URL,
    prepareHeaders: headers,
  }),

  tagTypes: ["JdiBom"],

  endpoints: (builder) => ({
    getUser: builder.query<{}, { email: string }>(
      createGetWithParamsQuery("/users/:email"),
    ),

    jdiBoms: builder.query<
      BomResponse,
      {
        userId?: string;
        search: string;
        status: "All" | "In Process" | "Completed" | "Failed";
        sortOrder: "ASC" | "DESC";
        pageNumber: number;
        pageSize: number;
        timestampFrom?: Dayjs | null | undefined;
        timestampTo?: Dayjs | null | undefined;
      }
    >({
      ...createGetQuery("/jdiBom"),
      providesTags: ["JdiBom"],
    }),

    createJdiBom: builder.mutation<{}, CreateJdiBomItem>({
      ...createMutationQuery("/jdiBom"),
      invalidatesTags: ["JdiBom"],
    }),

    deleteJdi: builder.mutation<void, { params: { id: string } }>({
      ...createMutationParamQuery<void, { id: string }>(
        "/jdiBom/:id",
        "DELETE",
      ),
      invalidatesTags: ["JdiBom"],
    }),

    deleteAll: builder.mutation<{}, {}>({
      ...createMutationQuery("/jdiBom", "DELETE"),
      invalidatesTags: ["JdiBom"],
    }),

    getJdiBom: builder.query<{ data: BomItem }, { id: string }>(
      createGetWithParamsQuery("/jdiBom/:id"),
    ),

    // ✅ NEW: PATCH /jdiBom/:id
    updateJdiBom: builder.mutation<
      {}, // Response
      { id: string; updates: Partial<Omit<BomItem, "id" | "timestamp">> } // Args
    >({
      query: ({ id, updates }) => ({
        url: `/jdiBom/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["JdiBom"],
    }),

    getIds: builder.query<{}, {}>(createGetQuery("/jdiBom/ids")),
  }),
});

export const {
  useGetUserQuery,
  useJdiBomsQuery,
  useGetJdiBomQuery,

  useGetIdsQuery,
} = jdiBomApiSlice;

export const {
  useCreateJdiBomMutation,
  useDeleteJdiMutation,
  useDeleteAllMutation,
  useUpdateJdiBomMutation, // ✅ export the new hook
} = jdiBomApiSlice;

interface IStatusDetail {
  status: "FAILED" | "SUCCESS";
  message: string;
  processedItem: string;
  sourceOrg: string;
  targetOrg: string;
  creationDate: string;
}

export interface BomItem {
  id: string;
  sourceOrg: string;
  status: string;
  timestamp: string;
  targetOrgs: string[];
  userEmail: string;
  processedItems: IProductInfo[];
  statusDetails: IStatusDetail[];
}

export interface BomResponse {
  data: BomItem[];
  total: number;
}

export interface CreateJdiBomItem {
  sourceOrg: string;
  processedItems: IProductInfo[];
  targetOrgs: string[];
  userId: string;
  userEmail: string;
}
