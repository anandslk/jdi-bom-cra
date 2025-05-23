import { ComponentType, useEffect } from "react";
import Loader from "src/components/Loader/Loader";
import { toast } from "react-toastify";

import useToast from "src/hooks/useToast";
import { MSG_REFRESH_SUCCESS } from "src/utils/toastMessages";
import { DragAndDropComponent } from "../components/DragAndDrop";
import { store, useAppDispatch, useAppSelector } from "src/app/jdiBom/store";
import { useGetUserQuery } from "../slices/apis/jdiBom.api";
import { useHandleDrop } from "../hooks/useHandleDrop";

export const withDroppable = <P extends object, T extends unknown>(
  WrappedComponent: ComponentType<P & InjectedDroppableProps<T>>,
) => {
  const ComponentWithDroppableLogic = (props: P) => {
    const { showErrorToast } = useToast();
    const dispatch = useAppDispatch();
    const { isDropped } = useAppSelector((state) => state.jdiBom);

    const email = window.widget.getValue("email");

    const { data } = useGetUserQuery({ email }, { skip: !email });

    const { handleDrop, isFetching } = useHandleDrop();

    console.log("data..................", data);

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
