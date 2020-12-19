import renameExtensions from "@betit/rollup-plugin-rename-extensions";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default {
  input: "./src/cli.js",
  output: {
    dir: "./",
    format: "cjs",
    sourcemap: true,
    banner: "#!/usr/bin/env node",
  },
  external: Object.keys(pkg.dependencies).concat("@atomico/build"),
  plugins: [
    replace({
      "PKG.VERSION": pkg.version,
    }),
    resolve(),
    commonjs(),
    renameExtensions({
      include: ["**/*.js"],
      mappings: {
        ".js": ".cjs",
      },
    }),
  ],
};
