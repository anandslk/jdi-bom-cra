export const BASENAME = "/api/widget/frame";

export const route = Object.freeze({
  index: "/",
  rdo: "/rdo",
  status: "/status",
  statusItem: "/status/:id",

  404: "*",
} as const);
