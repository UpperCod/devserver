import { join } from "path";
import { rollup } from "rollup";
import { pluginChunk } from "./plugin-chunk.js";
import { pluginResolve } from "./plugin-resolve.js";
/**
 * @param {Object} options
 * @param {string[]} options.external
 * @param {string} options.base
 * @param {boolean|string} [options.cdn]
 * @returns {import("@devserver/build-core").Plugin}
 */
export const pluginJs = ({ external, base, cdn }) => ({
    data: [],
    filter(src) {
        if (src.endsWith(".html")) this.data.push(src);
        return false;
    },
    async loaded(output, { options }) {
        /**
         * @type {import("@devserver/build-core").Ref[]}
         */
        const input = [];
        /**
         * @type {import("@devserver/build-core").Ref[]}
         */
        const assets = [];

        for (const file in output) {
            if (!file.endsWith(".js")) continue;
            const ref = output[file];
            (ref.asset ? assets : input).push(ref);
        }

        /**
         * @type {import("rollup").Plugin[]}
         */
        const plugins = [pluginChunk(assets), pluginResolve({ base, cdn })];

        const bundle = await rollup({
            input: input.map((ref) => ref.id),
            preserveEntrySignatures: false,
            external,
            plugins,
        });

        await bundle.write({
            dir: options.dest,
            format: "esm",
            sourcemap: options.sourcemap,
            chunkFileNames: `chunks/[hash].js`,
        });
    },
});
