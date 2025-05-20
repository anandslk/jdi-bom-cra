export const createMutationQuery = <T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
) => ({
  query: (args: T) => ({
    url,
    method,
    body: args,
  }),
});

export const createMutationParamQuery = <T, P extends Record<string, any>>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
) => ({
  query: ({ params, body }: { params?: P; body: T }) => {
    let resolvedUrl = url;

    // Replace URL placeholders with actual parameters
    if (params) {
      resolvedUrl = Object.entries(params).reduce(
        (acc, [key, value]) =>
          acc.replace(`:${key}`, encodeURIComponent(value)),
        url,
      );
    }

    return {
      url: resolvedUrl,
      method,
      body,
    };
  },
});

export const createGetQuery = <T extends Record<string, any>>(url: string) => ({
  query: (params?: T) => {
    const queryString = params
      ? "?" +
        Object.entries(params)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
          )
          .join("&")
      : "";

    return {
      url: `${url}${queryString}`,
      method: "GET",
    };
  },
});

export const createGetWithParamsQuery = <T extends Record<string, any>>(
  url: string,
) => ({
  query: (params: T) => {
    const resolvedUrl = Object.entries(params).reduce(
      (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(value)),
      url,
    );

    return {
      url: resolvedUrl,
      method: "GET",
    };
  },
});

export const headers = (headers: Headers) => {
  // const token = Cookies.get("token");

  // headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  return headers;
};
