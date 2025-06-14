import { toast } from "react-toastify";

export const env = Object.freeze({
  API_URL: process.env.API_URL,

  ENOVIA_URL: process.env.REACT_APP_ENOVIA_BASE_URL,
  ENOVIA_BASE_URL: process.env.ENOVIA_BASE_URL,
  ADVANCED_SEARCH: process.env.ENOVIA_ADVANCED_SEARCH_URL,

  NODE_ENV: process.env.NODE_ENV,
  WIDGET_ENTRY: process.env.NODE_ENV !== "development",
} as const);

const missingVars = Object.entries(env)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  toast.error(
    `⚠️ Missing Required Environment Variables ⚠️\n\n${missingVars
      .map((v) => `• ${v}`)
      .join("\n")}`,
  );
}
