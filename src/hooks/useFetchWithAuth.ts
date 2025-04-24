import { useQuery } from "@tanstack/react-query";
import { fetchCsrfToken } from "src/services/api/PlantAssignment/fetchCsrfService";
import { env } from "src/utils/env";
import { loadWAFData } from "src/utils/helpers";

export const useFetchWithAuth = () => {
  const headers = useQuery({
    queryKey: ["headers"],
    queryFn: fetchCsrfToken,
  });

  const fetchWithAuth = async (url: string) => {
    const WAFData = await loadWAFData();

    return new Promise((resolve, reject) => {
      WAFData.authenticatedRequest(
        `${env.ENOVIA_BASE_URL}/resources/v1${url}`,
        {
          method: "GET",
          headers: headers?.data,
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
