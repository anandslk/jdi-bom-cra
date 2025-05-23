import { useQuery } from "@tanstack/react-query";
import { fetchCsrfToken } from "src/services/api/PlantAssignment/fetchCsrfService";
import { env } from "src/app/jdiBom/env";
import { loadWAFData } from "src/utils/helpers";

export const useFetchWithAuth = () => {
  const headersQuery = useQuery({
    queryKey: ["headers"],
    queryFn: fetchCsrfToken,
  });

  const fetchWithAuth = async (options: FetchOptions) => {
    const { url, method, body, customUrl, headers: customHeaders } = options;
    const WAFData = await loadWAFData();

    const requestMethod = method ?? "GET";

    const isWriteMethod = requestMethod === "POST" || requestMethod === "PUT";
    const baseUrl = customUrl || `${env.ENOVIA_URL}/resources/v1${url}`;

    return new Promise((resolve, reject) => {
      WAFData.authenticatedRequest(baseUrl, {
        method: requestMethod,
        headers: {
          ...(customHeaders || headersQuery.data),
          "Content-Type": "application/json",
        },

        ...(isWriteMethod && body ? { data: JSON.stringify(body) } : {}),
        type: "json",

        onComplete: resolve,
        onFailure: reject,
      });
    });
  };

  return {
    fetchWithAuth,
    headers: headersQuery,
  };
};

type Imethod = "POST" | "PUT" | "GET";

type FetchOptions =
  | {
      url?: never;
      method?: Imethod;
      body?: any;
      customUrl: string;
      headers?: Record<string, string>;
    }
  | {
      url: string;
      method?: Imethod;
      body?: any;
      customUrl?: undefined;
      headers?: Record<string, string>;
    };
