import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Providers } from "./providers";
import JdiBomPage from "./pages/jdiBom/JdiBomPage";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Providers>
      <JdiBomPage />
    </Providers>
  </StrictMode>
);
