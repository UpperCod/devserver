import replace from "@rollup/plugin-replace";
import pkg from "./package.json";
export default {
  input: "./src/cli.js",
  output: {
    dir: "./",
    format: "cjs",
    sourcemap: true,
    banner: "#!/usr/bin/env node",
  },
  plugins: [
    replace({
      "PKG.VERSION": pkg.version,
    }),
  ],
};
