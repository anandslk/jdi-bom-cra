import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  createGetQuery,
  createGetWithParamsQuery,
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
      createGetWithParamsQuery("/users/getUserByEmail/:email"),
    ),

    jdiBoms: builder.query<
      BomResponse,
      {
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

    createJdiBom: builder.mutation<{}, {}>({
      ...createMutationQuery("/jdiBom"),
      invalidatesTags: ["JdiBom"],
    }),

    deleteAll: builder.mutation<{}, {}>({
      ...createMutationQuery("/jdiBom", "DELETE"),
      invalidatesTags: ["JdiBom"],
    }),

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
  }),
});

export const { useGetUserQuery, useJdiBomsQuery } = jdiBomApiSlice;

export const {
  useCreateJdiBomMutation,
  useDeleteAllMutation,
  useUpdateJdiBomMutation, // ✅ export the new hook
} = jdiBomApiSlice;

export interface BomItem {
  id: string;
  requestID: string;
  sourceORG: string;
  status: string;
  timestamp: string;
  // sourceOrg: string;
  targetOrgs: string[];
  processedItems: { Segment1: string }[];
}

export interface BomResponse {
  data: BomItem[];
  total: number;
}
