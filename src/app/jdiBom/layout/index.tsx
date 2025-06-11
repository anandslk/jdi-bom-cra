import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Loader from "src/components/Loader/Loader";
// import { Navbar } from "../components/Navbar";
import { useAppSelector } from "../store";

export const Layout = () => {
  const location = useLocation();
  const isLoading = useAppSelector((state) => state.jdiBom.isLoading);

  return (
    <Suspense key={location.key} fallback={<Loader />}>
      {isLoading && <Loader />}

      {/* <Navbar /> */}

      <Outlet />
    </Suspense>
  );
};
