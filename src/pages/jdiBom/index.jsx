import { initializeWidget } from "src/components/InitializeWidget";
import { JdiBomPage } from "src/pages/jdiBom/JdiBomPage";
import { WithDroppableLogic } from "src/components/WithDroppable";

const JDIWidget = () => {
  return (
    <WithDroppableLogic>
      <JdiBomPage />
    </WithDroppableLogic>
  );
};

const JdiBomWidget = () => initializeWidget(<JDIWidget />);

export default JdiBomWidget;
