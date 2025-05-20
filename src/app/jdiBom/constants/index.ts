export const BASENAME = "/api/widget/frame";

export const route = Object.freeze({
  index: "/",
  status: "/status",
  callback: "/login/callback",

  404: "*",
} as const);
