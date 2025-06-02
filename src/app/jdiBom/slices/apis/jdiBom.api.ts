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
        userId: string;
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
  }),
});

export const { useGetUserQuery, useJdiBomsQuery, useGetJdiBomQuery } =
  jdiBomApiSlice;

export const {
  useCreateJdiBomMutation,
  useDeleteAllMutation,
  useUpdateJdiBomMutation, // ✅ export the new hook
} = jdiBomApiSlice;

export interface BomItem {
  id: string;
  sourceOrg: string;
  status: string;
  timestamp: string;
  targetOrgs: string[];
  processedItems: IProductInfo[];
}

export interface BomResponse {
  data: BomItem[];
  total: number;
}

export interface CreateJdiBomItem {
  // id: string;
  // status: "In Process" | "Completed" | "Failed";
  sourceOrg: string;
  processedItems: IProductInfo[];
  targetOrgs: string[];
  userId: string;
  userEmail: string;
}
