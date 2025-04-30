import { initializeWidget } from "src/components/InitializeWidget";

import { App } from "src/App";

// const JDIWidget = withDroppableLogic<{}, {}>(JdiBomPage);
// const JdiBomWidget = () => initializeWidget(<JDIWidget />);

const JdiBomWidget = () => initializeWidget(<App />);

export default JdiBomWidget;
