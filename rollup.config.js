import renameExtensions from "@betit/rollup-plugin-rename-extensions";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";

/**
 * remove part of the code without affecting the sourcemap
 * @param {string} str
 */
const pluginRemoveEnv = (str) => ({
    name: "remove-env",
    transform: (code) => code.replace(str, " ".repeat(str.length)),
});

export default {
    input: "./src/cli.js",
    output: {
        dir: "./",
        format: "cjs",
        sourcemap: false,
        banner: "#!/usr/bin/env node",
    },
    external: Object.keys(pkg.dependencies).concat("@devserver/build"),
    plugins: [
        pluginRemoveEnv("#!/usr/bin/env node"),
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
