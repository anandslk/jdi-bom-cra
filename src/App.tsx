import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Providers } from "./providers";
import JdiBomPage from "./pages/jdiBom/JdiBomPage";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export function App() {
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Providers>
      <JdiBomPage />
    </Providers>
  </StrictMode>
);
