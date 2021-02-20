import renameExtensions from "@betit/rollup-plugin-rename-extensions";
export default {
    input: ["./src/plugin-html.js"],
    output: {
        dir: "./",
        format: "cjs",
        sourcemap: false,
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
