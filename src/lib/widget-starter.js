import { SecurityContext } from "src/services/api/droppableService";
import { initWidget } from "./widget";

const widgetEntry = process.env.WIDGET_ENTRY || "revisionFloat"; // Default to revisionFloat

// Mapping of widget entries to their corresponding import paths
const widgetModules = {
  plantAssignment: () => import("src/pages/plantAssignment/plantIndex"),
  massUpload: () => import("src/massuUploadIndex"),
  bosAttribute: () => import("src/pages/BOSWidget/bosIndex"),
  jdiBom: () => import("src/app/jdiBom"),
  default: () => import("src/index"),
};

initWidget(
  async (widget) => {
    const response = await SecurityContext();

    const securitycontext = response.securitycontextpreference;
    const email = response.email;

    widget.setTitle("");
    // Add Security Context Preference (UI for SecurityContext)
    widget.addPreference(securitycontext);
    widget.setValue("email", email);

    // Optionally log all current preferences (if accessible)
    if (widget.preferences) {
      console.log(
        "[widget-starter] Current widget preferences:",
        widget.preferences
      );
    }

    // Handle specific preferences for massUpload
    if (widgetEntry === "massUpload") {
      widget.addPreference({
        name: "Email Notification",
        type: "boolean",
        label: "Email Notification",
        defaultValue: false,
      });
    }

    try {
      const module = await (
        widgetModules[widgetEntry] || widgetModules.default
      )();
      module.default();
    } catch (error) {
      console.error(
        `[widget-starter] Error dynamically importing ${widgetEntry}`,
        error
      );
      widget.body.innerHTML =
        "<div style='color: red;'>Error loading widget content.</div>";
    }
  },
  (error) => {
    console.error("[widget-starter] initWidget encountered an error:", error);
  }
);
