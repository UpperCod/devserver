import { rollup } from "rollup";
import { pluginChunk } from "./plugin-chunk.js";
import { pluginTransform, isJs } from "./plugin-transform.js";
import { pluginTerser } from "./plugin-terser.js";
export { isJs } from "./plugin-transform.js";
/**
 * @param {Object} options
 * @param {string[]} options.external
 * @param {string} options.base
 * @param {boolean|string} [options.cdn]
 * @param {string} [options.jsxImportSource] - Associate the alias for jsx-runtime
 * @param {boolean} [options.minifyCssLiteral] - Associate the alias for jsx-runtime
 * @returns {import("@devserver/build-core").Plugin}
 */
export const pluginJs = ({
    external,
    base,
    cdn,
    jsxImportSource,
    minifyCssLiteral,
}) => ({
    async loaded({ output, options, load, set, parse }) {
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
            pluginTransform({
                base,
                cdn,
                load,
                parse,
                jsxImportSource,
                minifyCssLiteral,
            }),
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
