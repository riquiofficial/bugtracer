const path = require("path");

module.exports = {
  entry: "./bugTracer.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bugTracer.bundle.js",
  },
};
