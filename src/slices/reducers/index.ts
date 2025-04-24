import { droppedSlice } from "../apis/dropped.api";
import { jdiBomApiSlice } from "../apis/jdiBom.api";
import { authReducer } from "./auth.reducer";

import droppedObjectReducer from "src/store/droppedObjectSlice";

const apiSlices = [jdiBomApiSlice, droppedSlice];

export const apiMiddleware = apiSlices.map((slice) => slice.middleware);

export const reducers = {
  auth: authReducer,
  droppedObject: droppedObjectReducer,

  [jdiBomApiSlice.reducerPath]: jdiBomApiSlice.reducer,
  [droppedSlice.reducerPath]: droppedSlice.reducer,
};
