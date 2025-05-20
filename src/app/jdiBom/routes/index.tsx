import { LoginCallback } from "@okta/okta-react";
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { withDroppable } from "src/app/jdiBom/hoc/withDroppable";
import { Layout } from "src/app/jdiBom/layout";
import { BASENAME, route } from "src/app/jdiBom/constants";
import { env } from "src/app/jdiBom/env";

const Home = lazy(() => import("src/app/jdiBom/pages"));
const Status = lazy(() => import("src/app/jdiBom/pages/StatusCheck"));

const DroppableLayout = env.WIDGET_ENTRY ? withDroppable(Layout) : Layout;

export const router = createBrowserRouter(
  [
    {
      path: route.index,
      element: <DroppableLayout />,

      children: [
        {
          index: true,
          element: <Home />,
        },

        {
          path: route.status,
          element: <Status />,
        },
        {
          path: route.callback,
          element: <LoginCallback />,
        },
      ],
    },

    {
      path: route[404],
      element: <>Page Not Found</>,
    },
  ],

  { basename: env.WIDGET_ENTRY ? BASENAME : route.index },
);
