import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Loader/Loader";
import { toast } from "react-toastify";
import {
  setObjectData,
  setObjectDetails,
  setIsDropped,
  setLoading,
} from "src/store/droppedObjectSlice";
import {
  initializeDroppableArea,
  getDroppedObjectDetails,
} from "src/services/api/droppableService";

import useToast from "src/hooks/useToast";
import {
  MSG_FETCH_OBJECT_DETAILS_FAILED,
  MSG_INVALID_OBJECT_TYPE,
  MSG_UNEXPECTED_ERROR,
} from "src/utils/toastMessages";
import { DragAndDropComponent } from "./DragAndDrop";

export const WithDroppableLogic = ({ children }) => {
  const { showErrorToast } = useToast();
  const dispatch = useDispatch();
  const { isDropped, loading } = useSelector((state) => state.droppedObject);

  const fetchObjectDetails = useCallback(
    async (dataItems) => {
      try {
        const objectDetailsResult = await getDroppedObjectDetails({
          dataItems,
        });

        if (objectDetailsResult?.success) {
          dispatch(setObjectDetails(objectDetailsResult?.data?.cardData));
          dispatch(setIsDropped(true));
        } else {
          showErrorToast(MSG_FETCH_OBJECT_DETAILS_FAILED);
        }
      } catch (error) {
        console.error("[FetchObjectDetails] Error:", error);
        showErrorToast(MSG_FETCH_OBJECT_DETAILS_FAILED);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, showErrorToast]
  );

  const handleDrop = useCallback(
    async (dataItems) => {
      dispatch(setLoading(true));

      try {
        if (!!!dataItems?.length) {
          return toast.error("No data items to process.");
        }

        const objectType = dataItems?.[0]?.objectType;
        const validTypes = ["VPMReference", "Document", "Raw_Material"];

        if (!validTypes.includes(objectType)) {
          return showErrorToast(MSG_INVALID_OBJECT_TYPE);
        }

        dispatch(setObjectData(dataItems));

        await fetchObjectDetails(dataItems);
      } catch (error) {
        console.error("[Drop] Error:", error);
        dispatch(setLoading(false));
        showErrorToast(MSG_UNEXPECTED_ERROR);
      }
    },
    [dispatch, showErrorToast, fetchObjectDetails]
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

  if (loading) return <Loader />;
  if (!isDropped) return <DragAndDropComponent handleDrop={handleDrop} />;

  return children;
};
