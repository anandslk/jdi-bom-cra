import OktaAuth from "@okta/okta-auth-js";
import { BASENAME } from "src/app/jdiBom/constants";
import { env } from "src/app/jdiBom/env";

export const widgetBase = env.WIDGET_ENTRY ? BASENAME : "";

export const oktaAuth = new OktaAuth({
  clientId: env.OKTA_CLIENT_ID,
  issuer: env.OKTA_ISSUER!,
  redirectUri: `${window.location.origin}${widgetBase}/login/callback`,
  scopes: ["openid", "profile", "email"],
  pkce: true,
});
