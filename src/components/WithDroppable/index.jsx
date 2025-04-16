import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Loader/Loader";
import { toast } from "react-toastify";
import { setObjectData } from "src/store/droppedObjectSlice";
import { initializeDroppableArea } from "src/services/api/droppableService";

import useToast from "src/hooks/useToast";
import { MSG_INVALID_OBJECT_TYPE } from "src/utils/toastMessages";
import { DragAndDropComponent } from "./DragAndDrop";
import { useLazyGetObjectDetailsQuery } from "src/slices/apis/dropped.api";
import { getErrorMessage } from "src/slices/apis/types";

export const WithDroppableLogic = ({ children }) => {
  const { showErrorToast } = useToast();
  const dispatch = useDispatch();
  const { isDropped } = useSelector((state) => state.droppedObject);

  const [getDroppedObject, { isFetching }] = useLazyGetObjectDetailsQuery();

  const handleDrop = useCallback(
    async (dataItems) => {
      if (!!!dataItems?.length) {
        return toast.error("No data items to process.");
      }

      const objectType = dataItems?.[0]?.objectType;
      const objectId = dataItems?.[0]?.objectId;

      const validTypes = ["VPMReference", "Document", "Raw_Material"];

      if (!validTypes.includes(objectType)) {
        return showErrorToast(MSG_INVALID_OBJECT_TYPE);
      }

      dispatch(setObjectData(dataItems));

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

    let cleanup;

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

  return children;
};
