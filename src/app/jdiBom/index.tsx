import { initializeWidget } from "src/app/jdiBom/components/InitializeWidget";

import { App } from "src/app/jdiBom/App";

// const JDIWidget = withDroppableLogic<{}, {}>(JdiBomPage);
// const JdiBomWidget = () => initializeWidget(<JDIWidget />);

const JdiBomWidget = () => initializeWidget(<App />);

export default JdiBomWidget;
