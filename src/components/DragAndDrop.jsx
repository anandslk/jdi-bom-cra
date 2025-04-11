import React from "react";
import { useSelector } from "react-redux";
import DragAndDropComponent from "./DragAndDrop/DragAndDrop";
import Loader from "./Loader/Loader";
import { useInitializeDroppableArea } from "../hooks/useInitializeDropableArea";
import useDroppableArea from "../hooks/useDroppableArea";

export const WithDroppableLogic = ({ children, objectDropped }) => {
  const { loading } = useDroppableArea();

  useInitializeDroppableArea();

  // Use Redux for isDropped
  const isDropped = useSelector((state) => state.droppedObject.isDropped);

  // Check if a dynamic loadingObject value is passed via props;
  // if not, fallback to Redux.
  const loadingObject = objectDropped;

  console.warn("loadingObject...............", loadingObject);

  // Show loading states
  if (loading || loadingObject) {
    return <Loader />;
  }

  // If not dropped, show drag-and-drop area
  if (!isDropped) {
    return <DragAndDropComponent />;
  }

  // Render the wrapped component when isDropped = true
  return children;
};
