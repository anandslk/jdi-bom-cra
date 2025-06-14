import { BASENAME } from "src/app/jdiBom/constants";
import { env } from "src/app/jdiBom/env";

export const widgetBase = env.WIDGET_ENTRY ? BASENAME : "";
