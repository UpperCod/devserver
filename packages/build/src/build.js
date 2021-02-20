import glob from "fast-glob";
import { Build } from "@devserver/build-core";
import { pluginHtml } from "@devserver/plugin-html";
import { pluginCss } from "@devserver/plugin-css";
import { pluginJs, isJs } from "@devserver/plugin-js";
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
 * @param {string} [options.jsxImportSource] - Associate the alias for jsx-runtime
 * @param {string} [options.minifyCssLiteral] - Associate the alias for jsx-runtime
 */
export async function build({
    src,
    dest,
    href,
    sourcemap,
    minify,
    external,
    cdn,
    jsxImportSource,
    minifyCssLiteral,
}) {
    const base = src.replace(/^([^\*]+)(.*)/, "$1");

    const externalPkgs = Array.isArray(external)
        ? external
        : external
        ? await getExternal({ base })
        : [];

    const build = new Build(
        {
            base,
            dest,
            href,
            sourcemap,
            minify,
        },
        [
            pluginHtml(),
            pluginCss(),
            {
                filter: (file) => !/\.(css|html)$/.test(file) && !isJs(file),
                async load(ref) {
                    ref.copy = true;
                },
            },
            pluginJs({
                external: externalPkgs,
                base,
                cdn,
                jsxImportSource,
                minifyCssLiteral,
            }),
        ]
    );
    (await glob(src))
        .map((file) => "./" + file)
        .forEach((input) => build.load(input));

    return await build.writeOutput();
}
