import pkg from "./package.json";
import renameExtensions from "@betit/rollup-plugin-rename-extensions";

export default {
    input: "src/package-exports.js",
    external: Object.keys(pkg.dependencies),
    output: {
        dir: "./",
        format: "cjs",
        sourcemap: true,
    },
    plugins: [
        renameExtensions({
            include: ["**/*.js"],
            mappings: {
                ".js": ".cjs",
            },
        }),
    ],
};
