import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import renameExtensions from "@betit/rollup-plugin-rename-extensions";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default {
    input: "./src/transform-js.js",
    external: Object.keys(pkg.dependencies),
    output: {
        dir: "./",
        format: "cjs",
        sourcemap: true,
    },
    plugins: [
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
