import { minify } from "terser";

let cache = {};
/**
 * rollup-plugin-terser, has dependencies that prevent
 * the generation of the bundle, so a similar effect is used
 * @param {object} options
 * @param {boolean} options.sourcemap
 * @returns {import("rollup").Plugin}
 */
export const pluginTerser = ({ sourcemap }) => ({
    name: "plugin-terser",
    async renderChunk(code, chunk) {
        if (chunk.fileName.endsWith(".js")) {
            if (!cache[code]) {
                cache[code] = minify(code, {
                    sourceMap: sourcemap,
                    module: true,
                });
            }
            return cache[code];
        }
    },
});
