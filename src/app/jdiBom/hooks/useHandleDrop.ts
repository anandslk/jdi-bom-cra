import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { MSG_INVALID_OBJECT_TYPE } from "src/utils/toastMessages";
import { ISelectedItem } from "../hoc/withDroppable";
import { useLazyGetObjectDetailsQuery } from "../slices/apis/dropped.api";
import { getErrorMessage } from "../slices/apis/types";
import {
  setInitialDroppedObjectData,
  setIsDropped,
  setObjectIds,
} from "../slices/reducers/jdiBom.reducer";
import { store, useAppDispatch } from "../store";
import { env } from "../env";

export const useHandleDrop = () => {
  const dispatch = useAppDispatch();

  const [getDroppedObject, { isFetching }] = useLazyGetObjectDetailsQuery();

  const handleDrop = useCallback(
    async (newItems: ISelectedItem[]): Promise<IProductInfo[]> => {
      const currentState = store.getState().jdiBom.initialDraggedData || [];

      if (newItems.length === 0) {
        toast.error("No data items to process.");
        return [] as IProductInfo[];
      }

      const uniqueItemsMap = new Map<string, ISelectedItem>();

      currentState.forEach((item) => {
        uniqueItemsMap.set(item.objectId, item);
      });

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
        toast.error(MSG_INVALID_OBJECT_TYPE);
        return [] as IProductInfo[];
      }

      dispatch(setObjectIds(validDataItems));

      const results = await Promise.allSettled(
        validDataItems.map((item) =>
          getDroppedObject({ oid: item.objectId, type: item.objectType }),
        ),
      );

      results.forEach((r) => {
        if (r.status === "rejected" || r.value?.error) {
          const error = r.status === "rejected" ? r.reason : r?.value?.error;

          toast.error(getErrorMessage(error));
        }
      });

      const productInfos = results
        ?.filter((r) => r?.status === "fulfilled")
        ?.map((r) => r?.value?.data);

      dispatch(setIsDropped(true));

      return productInfos as IProductInfo[];
    },
    [dispatch, getDroppedObject],
  );

  useEffect(() => {
    if (env.NODE_ENV === "development") {
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
    }
  }, []);

  return { handleDrop, isFetching };
};
