import { LoginCallback } from "@okta/okta-react";
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { withDroppable } from "src/app/jdiBom/hoc/withDroppable";
import { Layout } from "src/app/jdiBom/layout";
import { BASENAME } from "src/app/jdiBom/constants";
import { env } from "src/app/jdiBom/env";

const Home = lazy(() => import("src/app/jdiBom/pages"));

const DroppableLayout = env.WIDGET_ENTRY ? withDroppable(Layout) : Layout;

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <DroppableLayout />,

      children: [
        {
          index: true,
          element: <Home />,
        },

        {
          path: "/login/callback",
          element: <LoginCallback />,
        },
      ],
    },

    {
      path: "*",
      element: <>Page Not Found</>,
    },
  ],

  { basename: env.WIDGET_ENTRY ? BASENAME : "/" },
);
