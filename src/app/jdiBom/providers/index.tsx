import { ReactNode, Suspense } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import { Bounce, ToastContainer } from "react-toastify";
import { store } from "../store";

import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import "../styles/dateRange.css";
import "src/index.css";
import "src/styles/variables.css";
import Loader from "src/components/Loader/Loader";

export const Providers = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Loader />}>
          <ToastContainer
            position={"top-right"}
            autoClose={2000}
            hideProgressBar={false}
            closeOnClick={true}
            pauseOnHover={false}
            pauseOnFocusLoss={false}
            draggable={true}
            theme={"light"}
            transition={Bounce}
          />

          {children}
        </Suspense>
      </QueryClientProvider>
    </Provider>
  );
};
