import { Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";

import Loader from "src/components/Loader/Loader";
// import { Navbar } from "src/components/Navbar";
import { oktaAuth, widgetBase } from "src/app/jdiBom/config";

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const restoreOriginalUri = (_oktaAuth: OktaAuth, originalUri: string) => {
    const appOrigin = window.location.origin + widgetBase;
    const relativeUrl = toRelativeUrl(originalUri || "/", appOrigin);
    navigate(relativeUrl, { replace: true });
  };

  const onAuthRequired = () => {
    const { pathname, search } = location;
    const fullOriginalUri = pathname + search;

    console.warn("fullOriginalUri......................", fullOriginalUri);

    oktaAuth.signInWithRedirect({ originalUri: fullOriginalUri });
  };

  return (
    <Suspense key={location.key} fallback={<Loader />}>
      <Security
        oktaAuth={oktaAuth}
        restoreOriginalUri={restoreOriginalUri}
        onAuthRequired={onAuthRequired}
      >
        {/* <Navbar /> */}
        <Outlet />
      </Security>
    </Suspense>
  );
};
