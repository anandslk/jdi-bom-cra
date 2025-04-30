import { useQuery } from "@tanstack/react-query";
import { fetchCsrfToken } from "src/services/api/PlantAssignment/fetchCsrfService";
import { env } from "src/utils/env";
import { loadWAFData } from "src/utils/helpers";

export const useFetchWithAuth = () => {
  const headers = useQuery({
    queryKey: ["headers"],
    queryFn: fetchCsrfToken,
  });

  type Imethod = "POST" | "PUT" | "GET";

  const fetchWithAuth = async (url: string, method?: Imethod, body?: any) => {
    const WAFData = await loadWAFData();

    const requestMethod = method ?? "GET";

    const isWriteMethod = requestMethod === "POST" || requestMethod === "PUT";

    return new Promise((resolve, reject) => {
      WAFData.authenticatedRequest(
        `${env.ENOVIA_BASE_URL}/resources/v1${url}`,
        {
          method: method ?? "GET",
          headers: {
            ...headers?.data,
            ...(isWriteMethod ? { "Content-Type": "application/json" } : {}),
          },

          ...(isWriteMethod ? { data: JSON.stringify(body) } : {}),
          type: "json",
          onComplete: resolve,
          onFailure: reject,
        }
      );
    });
  };

  return {
    fetchWithAuth,
    headers,
  };
};
