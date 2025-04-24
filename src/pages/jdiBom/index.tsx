import { initializeWidget } from "src/components/InitializeWidget";
import { JdiBomPage } from "src/pages/jdiBom/JdiBomPage";
import { withDroppableLogic } from "src/components/WithDroppable";

const JDIWidget = withDroppableLogic<{}, {}>(JdiBomPage);
const JdiBomWidget = () => initializeWidget(<JDIWidget />);

export default JdiBomWidget;
