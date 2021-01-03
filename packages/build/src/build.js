import glob from "fast-glob";
import { createBuild } from "@devserver/build-core";
import { pluginHtml } from "@devserver/plugin-html";
import { pluginCss } from "@devserver/plugin-css";
import { pluginJs } from "@devserver/plugin-js";
import { getExternal } from "@devserver/external";

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

    const externalPkgs = Array.isArray(external)
        ? external
        : external
        ? await getExternal({ base })
        : [];

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
                filter: (file) => !/\.(js|css|html)$/.test(file),
                async load(ref) {
                    ref.copy = true;
                },
            },
            pluginJs({ external: externalPkgs, base, cdn }),
        ],
    });
}
