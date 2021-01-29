import renameExtensions from "@betit/rollup-plugin-rename-extensions";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import builtins from "builtin-modules";
import { terser } from "rollup-plugin-terser";

export default {
    input: ["./src/plugin-css.js"],
    output: {
        dir: "./",
        format: "cjs",
        sourcemap: false,
    },
    external: builtins,
    plugins: [
        resolve(),
        commonjs(),
        json(),
        renameExtensions({
            include: ["**/*.js"],
            mappings: {
                ".js": ".cjs",
            },
        }),
        terser(),
    ],
};
