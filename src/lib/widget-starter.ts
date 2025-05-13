import { SecurityContext } from "src/services/api/droppableService";
import { initWidget } from "./widget";

const widgetEntry = process.env.WIDGET_ENTRY || "revisionFloat";

const widgetModules: IWidgetModules = {
  plantAssignment: () => import("src/pages/plantAssignment/plantIndex"),
  massUpload: () => import("src/massuUploadIndex"),
  bosAttribute: () => import("src/pages/BOSWidget/bosIndex"),
  jdiBom: () => import("src/app/jdiBom"),
  default: () => import("src/index"),
};

initWidget(
  async (widget: IWidget) => {
    try {
      const { securitycontextpreference, email } = await SecurityContext();

      widget.setTitle("");
      widget.addPreference(securitycontextpreference);
      widget.setValue("email", email);

      if (widget.preferences) {
        console.log(
          "[widget-starter] Current widget preferences:",
          widget.preferences
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
        error
      );
      widget.body.innerHTML = `<div style='color: red;'>Error loading widget content.</div>`;
    }
  },
  (error: any) => {
    console.error("[widget-starter] initWidget encountered an error:", error);
  }
);
