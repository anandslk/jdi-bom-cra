import { env } from "src/utils/env";

const OKTA_TESTING_DISABLEHTTPSCHECK =
  process.env.OKTA_TESTING_DISABLEHTTPSCHECK || false;

// export const REDIRECT_URI = `${window.location.origin}/login/callback`;

export const REDIRECT_URI = `${"https://emr-product-datahub-qa.azurewebsites.net"}/login/callback`;

export const config = {
  oidc: {
    clientId: env.OKTA_CLIENT_ID,
    issuer: env.OKTA_ISSUER!,
    redirectUri: REDIRECT_URI,
    scopes: ["openid", "profile", "email"],
    pkce: true,
    disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK,
    domain: env.OKTA_DOMAIN,
  },
};
