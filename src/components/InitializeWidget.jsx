import { createRoot } from "react-dom/client";
import { Providers } from "../providers";
import WidgetLifecycle from "../WidgetLifecycle-munish";

// Global React root reference
let root = null;

/**
 * Mounts the React application dynamically.
 * @param {JSX.Element} AppComponent - The main component to render inside the app.
 * @returns {JSX.Element} - Returns the mounted component.
 */
function start(AppComponent) {
  requirejs(["DS/PlatformAPI/PlatformAPI"], (PlatformAPI) => {
    window.PlatformAPI = PlatformAPI;
  });

  // Find the root element within the widget's body (if available)
  const widget = window.widget;

  let rootElement =
    widget?.body?.querySelector("#root") || document.getElementById("root");

  // If no root element exists, create one and append it to the widget body or document body.
  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.id = "root";
    (widget?.body || document.body).appendChild(rootElement);
  }

  root = root || createRoot(rootElement);
  root.render(
    <Providers>
      <WidgetLifecycle />

      {AppComponent}
    </Providers>
  );

  return AppComponent;
}

// Function to inject the refresh listener script into the **parent window**
function injectRefreshListener() {
  const scriptContent = `
      function listenForRefreshClicks() {
        // console.log("🌍 [Parent] Listening for manual refresh clicks...");
  
        document.body.addEventListener("click", function (event) {
          let refreshButton = event.target.closest("#refresh"); // Check if refresh was clicked
  
          if (refreshButton) {
            // console.log("✅ [Parent] User clicked Refresh!");
            sessionStorage.setItem("userClickedRefresh", "true"); // Store flag
            // console.log("Stored Flag:", sessionStorage.getItem("userClickedRefresh"));
          }
        }, true);
      }
  
      // ✅ Ensure event listener is added even if DOM is already loaded
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", listenForRefreshClicks);
      } else {
        listenForRefreshClicks();
      }
    `;

  // Inject script **into the parent window**
  if (window.parent && window.parent.document) {
    let injectedScript = window.parent.document.createElement("script");
    injectedScript.textContent = scriptContent;
    window.parent.document.body.appendChild(injectedScript);
    // console.log("✅ [index.js] Script successfully injected and executed in parent!");
  } else {
    console.warn(
      "⚠️ [index.js] Unable to inject script—parent window not accessible."
    );
  }
}

/**
 * Initializes the widget and returns the mounted component.
 * @param {JSX.Element} AppComponent - The main component to render inside the app.
 * @returns {JSX.Element} - Returns the mounted component.
 */
export function initializeWidget(AppComponent) {
  // ✅ Inject the script when the React app starts
  injectRefreshListener();

  if (window.widget) {
    let hasOnLoadRun = false;

    window.widget.addEvent("onLoad", () => {
      if (hasOnLoadRun) {
        console.warn(
          "⏳ onLoad was already executed. Ignoring duplicate trigger."
        );
        return;
      }

      hasOnLoadRun = true;
      start(AppComponent);
    });
  } else {
    console.error("❌ Widget not detected! onLoad cannot be registered.");
  }

  return AppComponent;
}
