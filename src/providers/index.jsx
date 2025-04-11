import { Suspense } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { Bounce, ToastContainer } from "react-toastify";
import store from "../store";

import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import "../index.css";
import "../App.css";
import "../styles/variables.css";

export const Providers = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<h1>loading</h1>}>
            <Toaster position="top-center" reverseOrder={false} />
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
    </HelmetProvider>
  );
};
