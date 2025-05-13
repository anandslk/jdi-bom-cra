import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import useToast from "src/hooks/useToast";
import { MSG_INVALID_OBJECT_TYPE } from "src/utils/toastMessages";
import { ISelectedItem } from "../hoc/withDroppable";
import { useLazyGetObjectDetailsQuery } from "../slices/apis/dropped.api";
import { getErrorMessage } from "../slices/apis/types";
import {
  setInitialDroppedObjectData,
  setObjectIds,
} from "../slices/reducers/jdiBom.reducer";
import { store, useAppDispatch } from "../store";

export const useHandleDrop = () => {
  const dispatch = useAppDispatch();

  const { showErrorToast } = useToast();

  const [getDroppedObject] = useLazyGetObjectDetailsQuery();

  const handleDrop = useCallback(
    async (newItems: ISelectedItem[]): Promise<void> => {
      const currentState = store.getState().jdiBom.initialDraggedData || [];

      if (newItems.length === 0) {
        toast.error("No data items to process.");
        return;
      }

      const uniqueItemsMap = new Map<string, ISelectedItem>();

      // Add existing items first
      currentState.forEach((item) => {
        uniqueItemsMap.set(item.objectId, item);
      });

      // Add or overwrite with new items
      newItems.forEach((item) => {
        uniqueItemsMap.set(item.objectId, item);
      });

      const mergedItems = Array.from(uniqueItemsMap.values());

      const isSameData =
        currentState.length === mergedItems.length &&
        currentState.every(
          (item, index) => item.objectId === mergedItems[index].objectId,
        );

      if (!isSameData) {
        dispatch(setInitialDroppedObjectData(mergedItems));
      } else {
        console.info(
          "[initializeDroppableArea] Data unchanged. Skipping dispatch.",
        );
      }

      const validTypes = ["VPMReference", "Raw_Material"];
      const validDataItems = newItems.filter((item) =>
        validTypes.includes(item.objectType),
      );

      if (validDataItems.length === 0) {
        return showErrorToast(MSG_INVALID_OBJECT_TYPE);
      }

      dispatch(setObjectIds(validDataItems));

      const results = await Promise.allSettled(
        validDataItems.map((item) =>
          getDroppedObject({ oid: item.objectId, type: item.objectType }),
        ),
      );

      results.forEach((result) => {
        if (result.status === "rejected" || result.value?.error) {
          const error =
            result.status === "rejected" ? result.reason : result?.value?.error;

          showErrorToast(getErrorMessage(error));
        }
      });
    },
    [dispatch, showErrorToast, getDroppedObject],
  );

  useEffect(() => {
    handleDrop([
      {
        objectId: "6B8F27BD5646250067FCA7500000252B",
        objectType: "VPMReference",
      },
      {
        objectId: "6B8F27BD42FD0F0068073E930000BCEB",
        objectType: "VPMReference",
      },
      {
        objectId: "6B8F27BD42FD0F006807849C0000C187",
        objectType: "VPMReference",
      },
      {
        objectId: "6B8F27BD42FD0F00680737090000BBDB",
        objectType: "VPMReference",
      },
      {
        objectId: "CF75043C908508006808BC670000373A",
        objectType: "VPMReference",
      },
      {
        objectId: "6B8F27BD42FD0F00680784DB0000C1A1",
        objectType: "VPMReference",
      },
    ]);
  }, []);

  return {};
};
