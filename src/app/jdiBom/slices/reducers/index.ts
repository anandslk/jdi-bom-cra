import { destOrgsApiSlice } from "../apis/destOrgs.api";
import { droppedApiSlice } from "../apis/dropped.api";
import { jdiBomApiSlice } from "../apis/jdiBom.api";
import { usersApiSlice } from "../apis/users.api";

import { jdiBomReducer } from "./jdiBom.reducer";
import { userReducer } from "./user.reducer";

const apiSlices = [
  droppedApiSlice,
  jdiBomApiSlice,
  usersApiSlice,
  destOrgsApiSlice,
];

export const apiMiddleware = apiSlices.map((slice) => slice.middleware);

export const reducers = {
  jdiBom: jdiBomReducer,
  user: userReducer,

  [droppedApiSlice.reducerPath]: droppedApiSlice.reducer,
  [jdiBomApiSlice.reducerPath]: jdiBomApiSlice.reducer,
  [usersApiSlice.reducerPath]: usersApiSlice.reducer,
  [destOrgsApiSlice.reducerPath]: destOrgsApiSlice.reducer,
};
