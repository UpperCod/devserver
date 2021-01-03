import glob from "fast-glob";
// import { join, extname, dirname } from "path";
// import { rollup } from "rollup";
// import { hash } from "@uppercod/hash";
// import { loadHtml } from "./load-html.js";
// import { loadCss } from "./load-css.js";
// import { pluginEmit } from "./plugin-emit.js";
// import { copyFile, writeFile } from "fs/promises";
// import { prepareDir, pathname } from "./core/utils.js";
// import { pluginTerser } from "./plugin-terser.js";
// import { pluginResolve } from "./plugin-resolve.js";
// import { getExternal } from "@devserver/external";
import { createBuild } from "@devserver/build-core";
import { pluginHtml } from "@devserver/plugin-html";
import { pluginCss } from "@devserver/plugin-css";

/**
 *
 * @param {Object} options
 * @param {string} options.src - files or expression to be processed by the build
 * @param {string} options.dest - write destination of processed files
 * @param {string} [options.href] - prefix for assets associated with html files
 * @param {boolean} [options.sourcemap] - enable the use of sourcemap for files type js
 * @param {boolean} [options.minify] - minify the js code
 * @param {string[]} [options.external] - minify the js code
 * @param {boolean} [options.cdn] - minify the js code
 */
export async function build({
    src,
    dest,
    href,
    sourcemap,
    minify,
    external,
    cdn,
}) {
    const base = src.replace(/^([^\*]+)(.*)/, "$1");

    await createBuild({
        input: (await glob(src)).map((file) => "./" + file),
        base,
        dest,
        href,
        sourcemap,
        minify,
        plugins: [
            pluginHtml(),
            pluginCss(),
            {
                filter: (file) => !/\.(js|css)$/.test(file),
                async load(ref) {
                    ref.copy = true;
                },
            },
        ],
    });
    // const [input, html] = (await glob(src)).reduce(
    //     (list, file) => {
    //         list[file.endsWith(".html") ? 1 : 0].push("./" + file);
    //         return list;
    //     },
    //     [[], []]
    // );
    // /**
    //  * contains assets captured from HTML files
    //  * @type {{[prop:string]:string}}
    //  */
    // const assets = {};
    // /**
    //  * Fcapture assets from an HTML file to be resolved as static assets or js code
    //  * @param {string} from - source file that requires the assets
    //  * @param {string} to - source file that requires the assets
    //  */
    // const resolve = (from, to) => {
    //     const extension = extname(to);
    //     const file = pathname(
    //         "./" + join(to == "/" ? root : dirname(from), to)
    //     );
    //     const id = `${hash(file)}${extension}`;
    //     assets[file] = id;
    //     return [file, `${href || ""}/assets/${id}`];
    // };
    // const documents = await Promise.all(
    //     html.map((file) => loadHtml({ file, resolve }))
    // );
    // const assetsKeys = Object.keys(assets);
    // const assetsCopy = assetsKeys.filter((src) => !/\.(js|css)$/.test(src));
    // const assetsJs = assetsKeys.filter((src) => src.endsWith(".js"));
    // const dir = join(dist, assetsKeys.length ? "assets" : "");
    // const plugins = [
    //     pluginResolve({ root, cdn }),
    //     pluginEmit(assetsJs, assets),
    //     pluginTerser({ sourcemap }),
    // ];
    // if (minify) plugins.push(terser());
    // const bundle = await rollup({
    //     input,
    //     preserveEntrySignatures: false,
    //     external: html.length
    //         ? []
    //         : external
    //         ? external
    //         : await getExternal({ root }),
    //     plugins,
    // });
    // if (assetsCopy.length) {
    //     await prepareDir(dir);
    // }
    // await Promise.all([
    //     ...assetsCopy.map(async (id) => copyFile(id, join(dir, assets[id]))),
    //     ...documents.map(async ({ file, code }) => {
    //         const destFile = join(dist, file.replace(root, ""));
    //         await prepareDir(destFile);
    //         return writeFile(destFile, code);
    //     }),
    //     ...Promise.all(
    //         assetsKeys
    //             .filter((src) => src.endsWith(".css"))
    //             .map((file) => loadCss({ file, dest: assets[file], resolve }))
    //     ),
    //     bundle.write({
    //         dir,
    //         format: "esm",
    //         sourcemap,
    //         chunkFileNames: `chunks-[hash].js`,
    //     }),
    // ]);
}
