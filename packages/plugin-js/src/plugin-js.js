import { rollup } from "rollup";
import { pluginChunk } from "./plugin-chunk.js";
import { pluginResolve, isJs } from "./plugin-resolve.js";
import { pluginTerser } from "./plugin-terser.js";
export { isJs } from "./plugin-resolve.js";
/**
 * @param {Object} options
 * @param {string[]} options.external
 * @param {string} options.base
 * @param {boolean|string} [options.cdn]
 * @returns {import("@devserver/build-core").Plugin}
 */
export const pluginJs = ({ external, base, cdn }) => ({
    async loaded({ output, options, load, set }) {
        /**
         * @type {import("@devserver/build-core").Ref[]}
         */
        const input = [];
        /**
         * @type {import("@devserver/build-core").Ref[]}
         */
        const assets = [];

        let site;

        for (const file in output) {
            if (file.endsWith(".html")) site = true;
            if (!isJs(file)) continue;
            const ref = output[file];
            (ref.asset ? assets : input).push(ref);
        }

        if (!input.length && !assets.length) return;

        /**
         * @type {import("rollup").Plugin[]}
         */
        const plugins = [
            pluginChunk(assets),
            pluginResolve({ base, cdn, load }),
        ];

        if (options.minify) {
            plugins.push(pluginTerser({ sourcemap: options.sourcemap }));
        }

        const bundle = await rollup({
            input: input.map((ref) => ref.id),
            preserveEntrySignatures: false,
            external: site ? [] : external,
            plugins,
        });

        const { output: outputRollup } = await bundle.generate({
            dir: options.dest,
            format: "esm",
            sourcemap: options.sourcemap,
            chunkFileNames: `chunks/[hash].js`,
        });

        for (const chunk of outputRollup) {
            if (chunk.type == "asset") continue;
            const ref =
                assets.find(({ link }) => link.dest == chunk.fileName) ||
                set(chunk.fileName);
            ref.code = chunk.code;
            ref.map = chunk.map;
            ref.asset = true;
        }
    },
});
