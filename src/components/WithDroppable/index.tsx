import { ComponentType, useCallback, useEffect } from "react";
import Loader from "../Loader/Loader";
import { toast } from "react-toastify";
import { setObjectIds } from "src/store/droppedObjectSlice";
import { initializeDroppableArea } from "src/services/api/droppableService";

import useToast from "src/hooks/useToast";
import { MSG_INVALID_OBJECT_TYPE } from "src/utils/toastMessages";
import { DragAndDropComponent } from "./DragAndDrop";
import { useLazyGetObjectDetailsQuery } from "src/slices/apis/dropped.api";
import { getErrorMessage } from "src/slices/apis/types";
import { useAppDispatch, useAppSelector } from "src/store";

export const withDroppableLogic = <P extends object, T extends unknown>(
  WrappedComponent: ComponentType<P & InjectedDroppableProps<T>>
) => {
  const ComponentWithDroppableLogic = (props: P) => {
    const { showErrorToast } = useToast();
    const dispatch = useAppDispatch();
    const { isDropped } = useAppSelector((state) => state.droppedObject);

    const [getDroppedObject, { isFetching }] = useLazyGetObjectDetailsQuery();

    const handleDrop = useCallback(
      async (dataItems: ISelectedItem[]): Promise<void> => {
        if (dataItems.length === 0) {
          toast.error("No data items to process.");
          return;
        }

        const objectType = dataItems?.[0]?.objectType;
        const objectId = dataItems?.[0]?.objectId;

        const validTypes = ["VPMReference", "Document", "Raw_Material"];

        if (!validTypes.includes(objectType)) {
          return showErrorToast(MSG_INVALID_OBJECT_TYPE);
        }

        dispatch(setObjectIds(dataItems?.[0]));

        const { error } = await getDroppedObject({
          oid: objectId,
          type: objectType,
        });

        if (error) return showErrorToast(getErrorMessage(error));
      },
      [dispatch, showErrorToast]
    );

    useEffect(() => {
      if (isDropped) return;
      let cleanup: (() => void) | void;

      const interval = setInterval(() => {
        const container = document.querySelector(".droppable-container");

        if (container) {
          clearInterval(interval);
          cleanup = initializeDroppableArea(
            container,
            handleDrop,
            dispatch,
            showErrorToast
          );
        }
      }, 100);

      return () => {
        clearInterval(interval);
        cleanup?.();
      };
    }, [isDropped, handleDrop, dispatch, showErrorToast]);

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
