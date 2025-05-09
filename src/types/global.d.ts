export {};

type WidgetEvent = "onRefresh" | "onLoad";
type Value = "Credentials" | "email";

declare global {
  interface Window {
    widget: {
      getValue: (key: Value) => any;
      addEvent: (event: WidgetEvent, handler: (...args: any[]) => void) => void;
      body: any;
    };
    PlatformAPI: any;
    require: any;
  }
}
