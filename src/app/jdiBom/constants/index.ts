export const BASENAME = "/api/widget/frame";

export const route = Object.freeze({
  index: "/",
  rdo: "/rdo",
  status: "/status",
  statusItem: "/status/:id",
  callback: "/login/callback",

  404: "*",
} as const);
