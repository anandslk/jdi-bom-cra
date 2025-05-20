import { droppedApiSlice } from "../apis/dropped.api";
import { jdiBomApiSlice } from "../apis/jdiBom.api";

import { jdiBomReducer } from "./jdiBom.reducer";
import { userReducer } from "./user.reducer";

const apiSlices = [droppedApiSlice, jdiBomApiSlice];

export const apiMiddleware = apiSlices.map((slice) => slice.middleware);

export const reducers = {
  jdiBom: jdiBomReducer,
  user: userReducer,

  [droppedApiSlice.reducerPath]: droppedApiSlice.reducer,
  [jdiBomApiSlice.reducerPath]: jdiBomApiSlice.reducer,
};
