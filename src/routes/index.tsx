import { LoginCallback } from "@okta/okta-react";
import { lazy } from "react";
import { createMemoryRouter } from "react-router-dom";
import { withDroppable } from "src/hoc/withDroppable";
import { Layout } from "src/layout";

const Home = lazy(() => import("src/pages/jdiBom/JdiBomPage"));

// const DroppableLayout = Layout;
const DroppableLayout = withDroppable(Layout);

export const router = createMemoryRouter([
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
]);
