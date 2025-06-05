import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { droppedApiSlice } from "src/app/jdiBom/slices/apis/dropped.api";
import { initialState } from "src/app/jdiBom/store/initialState";

const droppedObjectSlice = createSlice({
  name: "jdiBom",
  initialState: initialState.jdiBom,

  reducers: {
    setObjectIds: (state, action: PayloadAction<IObjectId[]>) => {
      state.objectIds = action.payload;
    },

    setObjectDetails: (state, action: PayloadAction<IProductInfo[]>) => {
      state.objectDetails = action.payload;
    },

    updateObjectDetail: (
      state,
      action: PayloadAction<UpdateObjectDetailPayload>,
    ) => {
      const { droppedRevisionId, updates } = action.payload;

      const index = state.objectDetails.findIndex(
        (item) => item["Dropped Revision ID"] === droppedRevisionId,
      );

      if (index !== -1) {
        state.objectDetails[index] = {
          ...state.objectDetails[index],
          ...updates,
        };
      }
    },

    updateObjectId: (state, action: PayloadAction<UpdateObjectIdPayload>) => {
      const { objectId, updates } = action.payload;

      const index = state.objectIds.findIndex(
        (item) => item.objectId === objectId,
      );

      if (index !== -1) {
        state.objectIds[index] = {
          ...state.objectIds[index],
          ...updates,
        };
      }
    },

    removeSingleObject: (state, action: PayloadAction<string>) => {
      const idToRemove = action.payload;

      state.objectIds = state.objectIds.filter(
        (obj) => obj.objectId !== idToRemove,
      );

      state.objectDetails = state.objectDetails.filter(
        (detail) => detail["Dropped Revision ID"] !== idToRemove,
      );
    },

    removeProduct: (state) => {
      state.isDropped = false;
      state.objectIds = [];
      state.objectDetails = [];
      state.initialDraggedData = initialState.jdiBom.initialDraggedData;
    },

    setInitialDroppedObjectData: (
      state,
      action: PayloadAction<IJdiBom["initialDraggedData"]>,
    ) => {
      state.initialDraggedData = action.payload;
    },

    setIsDropped: (state, action: PayloadAction<boolean>) => {
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

// ---- Payload types ----
interface UpdateObjectDetailPayload {
  droppedRevisionId: string;
  updates: Partial<IProductInfo>;
}

interface UpdateObjectIdPayload {
  objectId: string;
  updates: Partial<IObjectId>;
}

export const {
  setInitialDroppedObjectData,
  setIsDropped,
  setObjectIds,
  setObjectDetails,
  updateObjectDetail,
  removeSingleObject,
  updateObjectId,
  removeProduct,
} = droppedObjectSlice.actions;

export const jdiBomReducer = droppedObjectSlice.reducer;
