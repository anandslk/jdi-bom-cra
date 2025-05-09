import { createSlice } from "@reduxjs/toolkit";
import { droppedApiSlice } from "src/app/jdiBom/slices/apis/dropped.api";
import { initialState } from "src/app/jdiBom/store/initialState";

const droppedObjectSlice = createSlice({
  name: "jdiBom",
  initialState: initialState.jdiBom,

  reducers: {
    setObjectIds: (state, action) => {
      state.objectIds = action.payload;
    },

    setObjectDetails: (state, action) => {
      state.objectDetails = action.payload;
    },

    removeProduct: (state) => {
      state.isDropped = initialState.jdiBom.isDropped;
      state.objectIds = [];
      state.objectDetails = [];
      state.initialDraggedData = initialState.jdiBom.initialDraggedData;
    },

    setInitialDroppedObjectData: (state, action) => {
      state.initialDraggedData = action.payload;
    },

    setIsDropped: (state, action) => {
      state.isDropped = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(
      droppedApiSlice.endpoints.getObjectDetails.matchFulfilled,
      (state, action) => {
        const payload = action.payload as IProductInfo;

        // if (payload?.["Maturity State"] !== "Released") {
        //   toast.error(
        //     "Part is not in Released state. Please select another part"
        //   );
        //   return;
        // }

        state.isDropped = true;

        const alreadyExists = state.objectDetails.some(
          (detail) =>
            detail?.["Dropped Revision ID"] ===
            payload?.["Dropped Revision ID"],
        );

        if (!alreadyExists) {
          state.objectDetails.push(payload);
        }
      },
    );
  },
});

export const {
  setInitialDroppedObjectData,
  setIsDropped,
  setObjectIds,
  setObjectDetails,
  removeProduct,
} = droppedObjectSlice.actions;

export const jdiBomReducer = droppedObjectSlice.reducer;
