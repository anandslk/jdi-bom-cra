import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

import { env } from "../env";
import { apiMiddleware, reducers } from "src/app/jdiBom/slices/reducers";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: reducers,

  middleware: (getDefaultMiddleware) => {
    const mws = getDefaultMiddleware().concat(apiMiddleware);

    return env.NODE_ENV === "development" ? mws.concat(logger) : mws;
  },
});

type AppState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
