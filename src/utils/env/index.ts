import { toast } from "react-toastify";

export const env = Object.freeze({
  API_URL: process.env.API_URL,
  ENOVIA_BASE_URL: process.env.REACT_APP_ENOVIA_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  WIDGET_ENTRY: process.env.WIDGET_ENTRY,
});

const missingVars = Object.entries(env)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  toast.error(
    `⚠️ Missing Required Environment Variables ⚠️\n\n${missingVars
      .map((v) => `• ${v}`)
      .join("\n")}`
  );
}
