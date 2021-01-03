import postcss from "postcss";
import { postcssImport } from "./postcss-import.js";
/**
 * @returns {import("@devserver/build-core").Plugin}
 */
export const pluginCss = () => ({
    filter: (file) => file.endsWith(".css"),
    async load(ref, { load, options }) {
        const { css } = await postcss([
            postcssImport((file) => load(ref.resolve(file)).link.href),
        ]).process(await ref.read());
        ref.code = options.minify
            ? minify(css, { sourceMap: options.sourcemap }).css
            : css;
    },
});
