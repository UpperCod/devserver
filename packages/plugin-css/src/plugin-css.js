import postcss from "postcss";
import csso from "csso";
import { postcssImport } from "./postcss-import.js";
/**
 * @returns {import("@devserver/build-core").Plugin}
 */
export const pluginCss = () => ({
    filter: (file) => file.endsWith(".css"),
    async load(ref, { load, options }) {
        const plugins = [
            postcssImport((file) => load(ref.resolve(file)).link.href),
        ];

        const { css } = await postcss().process(await ref.read());

        ref.code = options.minify ? csso.minify(css).css : css;
    },
});
