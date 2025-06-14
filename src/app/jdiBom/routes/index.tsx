import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { withDroppable } from "src/app/jdiBom/hoc/withDroppable";
import { Layout } from "src/app/jdiBom/layout";
import { BASENAME, route } from "src/app/jdiBom/constants";
import { env } from "src/app/jdiBom/env";

const Home = lazy(() => import("src/app/jdiBom/pages"));
const RDOList = lazy(() => import("src/app/jdiBom/pages/rdos"));
const Status = lazy(() => import("src/app/jdiBom/pages/status"));
const StatusItem = lazy(() => import("src/app/jdiBom/pages/status/[id]"));

const DroppableLayout = env.WIDGET_ENTRY ? withDroppable(Layout) : Layout;

export const router = createBrowserRouter(
  [
    {
      path: route.index,
      element: <DroppableLayout />,

      children: [
        { index: true, element: <Home /> },
        { path: route.rdo, element: <RDOList /> },
        { path: route.status, element: <Status /> },
        { path: route.statusItem, element: <StatusItem /> },
      ],
    },

    { path: route[404], element: <>Page Not Found</> },
  ],

  { basename: env.WIDGET_ENTRY ? BASENAME : route.index },
);
