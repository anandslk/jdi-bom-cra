import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import droppedObjectReducer from "./droppedObjectSlice";
import { apiSlice } from "../slices/apis/app.api";
import { env } from "../utils/env";

import { authReducer } from "../slices/reducers/auth.reducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    droppedObject: droppedObjectReducer,

    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    env.NODE_ENV === "development"
      ? getDefaultMiddleware().concat(apiSlice.middleware, logger)
      : getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
