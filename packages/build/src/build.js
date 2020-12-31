import { join } from "path";
import glob from "fast-glob";
import { rollup } from "rollup";
import { copyFile } from "fs/promises";
import { loadHtml } from "./load-html.js";
import { prepareDir } from "./utils.js";
import { pluginEmit } from "./plugin-emit.js";
import { pluginTerser } from "./plugin-terser.js";
import { pluginResolve } from "./plugin-resolve.js";
import { getExternal } from "@devserver/external";

/**
 *
 * @param {Object} options
 * @param {string} options.src - files or expression to be processed by the build
 * @param {string} options.dist - write destination of processed files
 * @param {string} [options.href] - prefix for assets associated with html files
 * @param {boolean} [options.sourcemap] - enable the use of sourcemap for files type js
 * @param {boolean} [options.minify] - minify the js code
 * @param {string[]} [options.external] - minify the js code
 * @param {boolean} [options.cdn] - minify the js code
 */
export async function createBuild({
    src,
    dist,
    href,
    sourcemap,
    minify,
    external,
    cdn,
}) {
    const root = src.replace(/^([^\*]+)(.*)/, "$1");

    const [input, html] = (await glob(src)).reduce(
        (list, file) => {
            list[file.endsWith(".html") ? 1 : 0].push("./" + file);
            return list;
        },
        [[], []]
    );
    /**
     * contains assets captured from HTML files
     * @type {{[prop:string]:string}}
     */
    const assets = {};

    await Promise.all(
        html.map(async (file) =>
            Object.assign(assets, await loadHtml({ file, dist, root, href }))
        )
    );

    const assetsKeys = Object.keys(assets);

    const assetsCopy = assetsKeys.filter((src) => !src.endsWith(".js"));

    const assetsJs = assetsKeys.filter((src) => src.endsWith(".js"));

    const dir = join(dist, assetsKeys.length ? "assets" : "");

    const plugins = [
        pluginResolve({ root, cdn }),
        pluginEmit(assetsJs, assets),
        pluginTerser({ sourcemap }),
    ];

    if (minify) plugins.push(terser());

    const bundle = await rollup({
        input,
        preserveEntrySignatures: false,
        external: html.length
            ? []
            : external
            ? external
            : await getExternal({ root }),
        plugins,
    });

    if (assetsCopy.length) {
        await prepareDir(dir);
    }

    await Promise.all(
        assetsCopy.map(async (id) => copyFile(id, join(dir, assets[id])))
    );

    await bundle.write({
        dir,
        format: "esm",
        sourcemap,
        chunkFileNames: `chunks-[hash].js`,
    });
}
