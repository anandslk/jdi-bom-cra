const path = require("path");
const webpack = require("webpack");
const { override, overrideDevServer } = require("customize-cra");

function customizeWebpack(config) {
  // Set custom entry point based on WIDGET_ENTRY
  if (process.env.WIDGET_ENTRY) {
    console.info("Creating Widget :-", process.env.WIDGET_ENTRY);
    config.entry = { main: "./src/lib/widget-starter" };
  } else {
    console.info("Creating React App");
    config.entry = { main: "./src/app/jdiBom/App" };
  }

  // Remove any existing DefinePlugin to avoid duplicates
  config.plugins = config.plugins.filter(
    (plugin) => !(plugin instanceof webpack.DefinePlugin)
  );

  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    })
  );

  // Alias for 'src'
  config.resolve.alias.src = path.resolve(__dirname, "src/");

  // 3DEXPERIENCE externals
  config.externals = {
    "DS/DataDragAndDrop/DataDragAndDrop": "DS/DataDragAndDrop/DataDragAndDrop",
    "DS/PlatformAPI/PlatformAPI": "DS/PlatformAPI/PlatformAPI",
    "DS/TagNavigatorProxy/TagNavigatorProxy":
      "DS/TagNavigatorProxy/TagNavigatorProxy",
    "DS/WAFData/WAFData": "DS/WAFData/WAFData",
    "UWA/Utils/InterCom": "UWA/Utils/InterCom",
  };

  return config;
}

function customizeJest(config) {
  return {
    ...config,
    moduleNameMapper: {
      ...config.moduleNameMapper,
      "^DS/(.*)$": "<rootDir>/__mocks__/DS/$1.js",
      "^src/(.*)$": "<rootDir>/src/$1",
    },
    transformIgnorePatterns: ["/node_modules/(?!@standard-schema)/"],
  };
}

module.exports = {
  webpack: override(customizeWebpack),
  jest: customizeJest,
  devServer: overrideDevServer((config) => config),
};
