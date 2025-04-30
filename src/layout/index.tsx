import { Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LineProgress } from "src/components/LineProgress";

import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";

import { config } from "src/config";
import { Navbar } from "src/components/Navbar";

const oktaAuth = new OktaAuth(config.oidc);

export const Layout = () => {
  const { key } = useLocation();
  const navigate = useNavigate();

  const restoreOriginalUri = (_: any, originalUri: string) => {
    navigate(toRelativeUrl(originalUri || "/", window.location.origin));
  };

  const onAuthRequired = () => navigate(window.location.origin);

  return (
    <>
      <Suspense key={key} fallback={<LineProgress />}>
        <Security
          oktaAuth={oktaAuth}
          restoreOriginalUri={restoreOriginalUri}
          onAuthRequired={onAuthRequired}
        >
          <Navbar />

          <Outlet />
        </Security>
      </Suspense>
    </>
  );
};
