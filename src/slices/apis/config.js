import Cookies from "js-cookie";

export const createMutationQuery = (url, method = "POST") => ({
  query: (args) => ({
    url,
    method,
    body: args,
  }),
});

export const createMutationParamQuery = (url, method = "POST") => ({
  query: ({ params, body }) => {
    let resolvedUrl = url;

    // Replace URL placeholders with actual parameters
    if (params) {
      resolvedUrl = Object.entries(params).reduce(
        (acc, [key, value]) =>
          acc.replace(`:${key}`, encodeURIComponent(value)),
        url
      );
    }

    return {
      url: resolvedUrl,
      method,
      body,
    };
  },
});

export const createGetQuery = (url) => ({
  query: (params) => {
    const queryString = params
      ? "?" +
        Object.entries(params)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          )
          .join("&")
      : "";

    return {
      url: `${url}${queryString}`,
      method: "GET",
    };
  },
});

export const createGetWithParamsQuery = (url) => ({
  query: (params) => {
    const resolvedUrl = Object.entries(params).reduce(
      (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(value)),
      url
    );

    return {
      url: resolvedUrl,
      method: "GET",
    };
  },
});

export const headers = (headers) => {
  const token = Cookies.get("token");

  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  return headers;
};
