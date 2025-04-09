const path = require("path");
const {
  override,
} = require("customize-cra");
const webpack = require("webpack");

module.exports = override(
  (config, env) => {
      // Set a common entry point but determine the correct widget inside it
      config.entry = {
        main: "./src/lib/widget-starter.js",
      };

    // Remove the DefinePlugin that sets process.env.WIDGET_ENTRY if it exists
    config.plugins = config.plugins.filter(
      (plugin) => !(plugin instanceof webpack.DefinePlugin)
    );

    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(process.env),
      })
    );

    // Define externals for the 3DEXPERIENCE modules
    config.externals = {
      "DS/DataDragAndDrop/DataDragAndDrop":
        "DS/DataDragAndDrop/DataDragAndDrop",
      "DS/PlatformAPI/PlatformAPI": "DS/PlatformAPI/PlatformAPI",
      "DS/TagNavigatorProxy/TagNavigatorProxy":
        "DS/TagNavigatorProxy/TagNavigatorProxy",
        "DS/WAFData/WAFData": "DS/WAFData/WAFData",
      "UWA/Utils/InterCom": "UWA/Utils/InterCom",
    };

    return config;
  }
);