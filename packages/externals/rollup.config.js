import renameExtensions from "@betit/rollup-plugin-rename-extensions";
import builtins from "builtin-modules";
import pkg from "./package.json";

export default {
    input: ["./src/external.js"],
    output: {
        dir: "./",
        format: "cjs",
        sourcemap: true,
    },
    external: Object.keys(pkg.dependencies || {}).concat(builtins),
    plugins: [
        renameExtensions({
            include: ["**/*.js"],
            mappings: {
                ".js": ".cjs",
            },
        }),
    ],
};
