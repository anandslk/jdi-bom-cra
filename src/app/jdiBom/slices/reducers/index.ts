import { destOrgsApiSlice } from "../apis/destOrgs.api";
import { droppedApiSlice } from "../apis/dropped.api";
import { jdiBomApiSlice } from "../apis/jdiBom.api";

import { jdiBomReducer } from "./jdiBom.reducer";
import { userReducer } from "./user.reducer";

const apiSlices = [droppedApiSlice, jdiBomApiSlice, destOrgsApiSlice];

export const apiMiddleware = apiSlices.map((slice) => slice.middleware);

export const reducers = {
  jdiBom: jdiBomReducer,
  user: userReducer,

  [droppedApiSlice.reducerPath]: droppedApiSlice.reducer,
  [jdiBomApiSlice.reducerPath]: jdiBomApiSlice.reducer,
  [destOrgsApiSlice.reducerPath]: destOrgsApiSlice.reducer,
};
