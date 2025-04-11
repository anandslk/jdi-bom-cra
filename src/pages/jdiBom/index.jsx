import { initializeWidget } from "src/components/InitializeWidget";
import { JdiBomPage } from "src/pages";
import { useSelector } from "react-redux";
import { WithDroppableLogic } from "src/components/DragAndDrop";

const JDIWidget = () => {
  const loadingParentDetails = useSelector(
    (state) => state.droppedObject.loadingParentDetails
  );

  return <WithDroppableLogic objectDropped={loadingParentDetails}>
    <JdiBomPage />
  </WithDroppableLogic>;
};

const JdiBomWidget = () => initializeWidget(<JDIWidget />);

export default JdiBomWidget;
