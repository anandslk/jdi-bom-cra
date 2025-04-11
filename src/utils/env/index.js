import toast from "react-hot-toast";

export const env = Object.freeze({
  API_URL: process.env.API_URL,
  NODE_ENV: process.env.NODE_ENV,
  WIDGET_ENTRY: process.env.WIDGET_ENTRY,
} );

const missingVars = Object.entries(env)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  toast.error(
    `⚠️ Missing Required Environment Variables ⚠️\n\n${missingVars
      .map((v) => `• ${v}`)
      .join("\n")}`,
    {
      duration: 3000,
      style: {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        padding: "16px",
      },
    },
  );
}
