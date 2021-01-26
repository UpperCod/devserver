import renameExtensions from "@betit/rollup-plugin-rename-extensions";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import builtins from "builtin-modules";
import pkg from "./package.json";

export default {
    input: ["./src/build.js"],
    output: {
        dir: "./",
        format: "cjs",
        sourcemap: false,
    },
    external: Object.keys(pkg.dependencies).concat(builtins),
    plugins: [
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
