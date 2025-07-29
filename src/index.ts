import { SecurityContext } from "src/services/api/droppableService";
import { initWidget } from "./lib/widget";

const getWidgetEntryFromURL = () => {
  const mainParams = new URLSearchParams(window.location.search);
  const uwaUrlEncoded = mainParams.get("uwaUrl");

  if (uwaUrlEncoded) {
    try {
      const uwaUrlDecoded = decodeURIComponent(uwaUrlEncoded);
      const uwaParams = new URLSearchParams(new URL(uwaUrlDecoded).search);
      return uwaParams.get("widget") || "revisionFloat";
    } catch (err) {
      console.error("[widget-starter] Failed to parse uwaUrl", err);
    }
  }

  return "revisionFloat";
};

const widgetModules: IWidgetModules = {
  jdiBom: () => import("src/app/jdiBom"),
  default: () => import("src/app/jdiBom"),
};

initWidget(
  async (widget: IWidget) => {
    const widgetEntry = getWidgetEntryFromURL();

    try {
      const { securitycontextpreference, email } = await SecurityContext();

      widget.setTitle("");
      widget.addPreference(securitycontextpreference);
      widget.setValue("email", email);

      if (widget.preferences) {
        console.log(
          "[widget-starter] Current widget preferences:",
          widget.preferences,
        );
      }

      if (widgetEntry === "massUpload") {
        widget.addPreference({
          name: "Email Notification",
          type: "boolean",
          label: "Email Notification",
          defaultValue: false,
        });
      }

      const loadModule = widgetModules[widgetEntry] || widgetModules.default;
      const module = await loadModule();
      module.default();
    } catch (error) {
      console.error(
        `[widget-starter] Failed to load widget: ${widgetEntry}`,
        error,
      );
      widget.body.innerHTML = `<div style='color: red;'>Error loading widget content.</div>`;
    }
  },
  (error: any) => {
    console.error("[widget-starter] initWidget encountered an error:", error);
  },
);
