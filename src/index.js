import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Providers } from "./providers";
import JdiBomPage from "./pages";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Providers>
      <JdiBomPage />
    </Providers>
  </StrictMode>
);
