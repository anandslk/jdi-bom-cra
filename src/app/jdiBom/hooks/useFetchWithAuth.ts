import { useQuery } from "@tanstack/react-query";
import { fetchCsrfToken } from "src/services/api/PlantAssignment/fetchCsrfService";
import { env } from "src/app/jdiBom/env";
import { loadWAFData } from "src/utils/helpers";

export const useFetchWithAuth = () => {
  const headers = useQuery({
    queryKey: ["headers"],
    queryFn: fetchCsrfToken,
  });

  const fetchWithAuth = async (options: FetchOptions) => {
    const { url, method, body, customUrl } = options;
    const WAFData = await loadWAFData();

    const requestMethod = method ?? "GET";

    const isWriteMethod = requestMethod === "POST" || requestMethod === "PUT";
    const baseUrl = customUrl || `${env.ENOVIA_BASE_URL}/resources/v1${url}`;

    const apiOptions = {
      method: method ?? "GET",
      headers: {
        ...headers?.data,
        "Content-Type": "application/json",
        // ...(isWriteMethod ? { "Content-Type": "application/json" } : {}),
      },

      ...(isWriteMethod && body ? { data: JSON.stringify(body) } : {}),
      type: "json",
      // onComplete: resolve,
      // onFailure: reject,
    };

    return new Promise((resolve, reject) => {
      WAFData.authenticatedRequest(baseUrl, {
        ...apiOptions,
        onComplete: resolve,
        onFailure: reject,
      });
    });
  };

  return {
    fetchWithAuth,
    headers,
  };
};

type Imethod = "POST" | "PUT" | "GET";

type FetchOptions =
  | {
      url?: never; // explicitly disallow url when customUrl is present
      method?: Imethod;
      body?: any;
      customUrl: string;
    }
  | {
      url: string;
      method?: Imethod;
      body?: any;
      customUrl?: undefined; // disallow customUrl when url is used
    };
