import renameExtensions from "@betit/rollup-plugin-rename-extensions";
import builtins from "builtin-modules";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

export default {
    input: ["./src/build.js"],
    output: {
        dir: "./",
        format: "cjs",
        sourcemap: false,
    },
    external: Object.keys(pkg.dependencies || {}).concat(builtins),
    plugins: [
        json(),
        resolve(),
        commonjs(),
        renameExtensions({
            include: ["**/*.js"],
            mappings: {
                ".js": ".cjs",
            },
        }),
        terser(),
    ],
};
