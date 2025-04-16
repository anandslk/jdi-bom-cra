import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import droppedObjectReducer from "./droppedObjectSlice";
import { apiSlice } from "../slices/apis/app.api";
import { env } from "../utils/env";

import { authReducer } from "../slices/reducers/auth.reducer";
import { droppedSlice } from "src/slices/apis/dropped.api";

const store = configureStore({
  reducer: {
    auth: authReducer,
    droppedObject: droppedObjectReducer,

    [apiSlice.reducerPath]: apiSlice.reducer,
    [droppedSlice.reducerPath]: droppedSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    env.NODE_ENV === "development"
      ? getDefaultMiddleware().concat(
          apiSlice.middleware,
          droppedSlice.middleware,
          logger
        )
      : getDefaultMiddleware().concat(
          apiSlice.middleware,
          droppedSlice.middleware
        ),
});

export default store;
