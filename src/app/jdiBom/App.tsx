import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Providers } from "./providers";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { env } from "./env";

export function App() {
  return <RouterProvider router={router} />;
}

if (!env.WIDGET_ENTRY) {
  createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>,
  );
}
