export {};

type WidgetEvent = "onRefresh" | "onLoad";
type Value = "Credentials" | "email";

declare global {
  interface Window {
    widget: {
      getValue: (key: Value) => any;
      addEvent: (event: WidgetEvent, handler: (...args: any[]) => void) => void;
      body: any;
      id: string;
    };
    PlatformAPI: any;
    require: any;
  }

  interface IWidget {
    setTitle: (title: string) => void;
    addPreference: (pref: any) => void;
    setValue: (key: string, value: any) => void;
    preferences?: any;
    body: HTMLElement;
  }

  interface IWidgetModules {
    [key: string]: () => Promise<{ default: () => void }>;
  }
}
