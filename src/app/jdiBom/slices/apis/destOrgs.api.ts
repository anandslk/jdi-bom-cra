import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createGetQuery, createMutationQuery, headers } from "./config";
import { env } from "src/app/jdiBom/env";

export const destOrgsApiSlice = createApi({
  reducerPath: "destOrgsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: env.API_URL,
    prepareHeaders: headers,
  }),

  tagTypes: ["destOrgs"],

  endpoints: (builder) => ({
    destOrgs: builder.query<
      IDestOrgs,
      {
        search?: string;
        sortField?: string;
        sortOrder?: "ASC" | "DESC";
        pageNumber?: number;
        pageSize?: number;
      }
    >({
      ...createGetQuery("/destOrgs"),
      providesTags: ["destOrgs"],
    }),

    createDestOrgs: builder.mutation<{}, IRDO_ORGS>({
      ...createMutationQuery("/destOrgs"),
      invalidatesTags: ["destOrgs"],
    }),
  }),
});

export const { useDestOrgsQuery } = destOrgsApiSlice;

export const { useCreateDestOrgsMutation } = destOrgsApiSlice;

export interface IDestOrgs {
  data: IRDO_ORGS;
  total: number;
}

export interface IRDO_ORGS {
  Daniel: string[];
  "Micro Motion": string[];
  "Rosmount Leve": string[];
  Roxar: string[];
  Ultrasonic: string[];
  availOrgs: string[];
}
