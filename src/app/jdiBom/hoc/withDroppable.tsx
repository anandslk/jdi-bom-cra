import { ComponentType, useCallback, useEffect } from "react";
import Loader from "src/components/Loader/Loader";
import { toast } from "react-toastify";
import {
  setInitialDroppedObjectData,
  setObjectIds,
} from "src/app/jdiBom/slices/reducers/jdiBom.reducer";

import useToast from "src/hooks/useToast";
import {
  MSG_INVALID_OBJECT_TYPE,
  MSG_REFRESH_SUCCESS,
} from "src/utils/toastMessages";
import { DragAndDropComponent } from "../components/DragAndDrop";
import { useLazyGetObjectDetailsQuery } from "src/app/jdiBom/slices/apis/dropped.api";
import { getErrorMessage } from "src/app/jdiBom/slices/apis/types";
import { store, useAppDispatch, useAppSelector } from "src/app/jdiBom/store";
import { useGetUserQuery } from "../slices/apis/jdiBom.api";

export const withDroppable = <P extends object, T extends unknown>(
  WrappedComponent: ComponentType<P & InjectedDroppableProps<T>>,
) => {
  const ComponentWithDroppableLogic = (props: P) => {
    const { showErrorToast } = useToast();
    const dispatch = useAppDispatch();
    const { isDropped } = useAppSelector((state) => state.jdiBom);

    const email = window.widget.getValue("email");

    const { data } = useGetUserQuery({ email }, { skip: !email });

    console.log("data..................", data);

    const [getDroppedObject, { isFetching }] = useLazyGetObjectDetailsQuery();

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
              result.status === "rejected"
                ? result.reason
                : result?.value?.error;

            showErrorToast(getErrorMessage(error));
          }
        });
      },
      [dispatch, showErrorToast, getDroppedObject],
    );

    useEffect(() => {
      if (isDropped) return;
      let cleanup: (() => void) | void;

      const initializeDroppableArea = (
        droppableContainer: any,
        handleDrop: (dataItems: ISelectedItem[]) => Promise<void>,
      ) => {
        try {
          window.require(
            ["DS/DataDragAndDrop/DataDragAndDrop"],
            (DataDragAndDrop: any) => {
              DataDragAndDrop.droppable(droppableContainer, {
                drop: async (data: any) => {
                  console.info("[DragAndDrop] Drop event:", data);

                  const parsedData = JSON.parse(data);

                  const newItems =
                    parsedData?.data?.items?.map((item: ISelectedItem) => ({
                      objectId: item?.objectId,
                      objectType: item?.objectType,
                    })) || [];

                  await handleDrop(newItems);
                  droppableContainer.classList.remove("drag-over");
                },

                enter: () => droppableContainer.classList.add("drag-over"),
                out: () => droppableContainer.classList.remove("drag-over"),
                leave: () => droppableContainer.classList.remove("drag-over"),
              });
            },
          );
        } catch (error) {}
      };

      const interval = setInterval(() => {
        const container = document.querySelector(".droppable-container");

        if (container) {
          clearInterval(interval);
          cleanup = initializeDroppableArea(container, handleDrop);
        }
      }, 100);

      return () => {
        clearInterval(interval);
        cleanup?.();
      };
    }, [isDropped, handleDrop, dispatch, showErrorToast]);

    useEffect(() => {
      if (!window.widget) return;

      const isAutoTriggeredRefresh = (trace: any) => {
        return trace.some(
          (line: any) =>
            line?.includes("UWA_Frame_Alone.js") ||
            line?.includes("bundle-min.js"),
        );
      };

      const onRefresh = async () => {
        const trace = new Error()?.stack?.split("\n");
        // ✅ Check if refresh was manually triggered
        const userClickedRefresh = sessionStorage.getItem("userClickedRefresh");
        if (isAutoTriggeredRefresh(trace) && !userClickedRefresh) return; // ✅ Block auto-triggered refresh
        // ✅ Reset manual refresh flag so next refresh isn't blocked
        sessionStorage.removeItem("userClickedRefresh");

        const latestState = store.getState();

        const latestDraggedData = latestState.jdiBom?.initialDraggedData;

        if (!!!latestDraggedData?.length) return;

        await handleDrop(latestDraggedData);
        toast.success(MSG_REFRESH_SUCCESS);
      };

      window.widget.addEvent("onRefresh", onRefresh);
    }, []);

    if (isFetching) return <Loader />;
    if (!isDropped) return <DragAndDropComponent handleDrop={handleDrop} />;

    return <WrappedComponent {...props} />;
  };

  return ComponentWithDroppableLogic;
};

export interface ISelectedItem {
  objectType: string;
  objectId: string;
}

export interface InjectedDroppableProps<T> {
  droppedData?: T;
}
