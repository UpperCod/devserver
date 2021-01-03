import postcss from "postcss";
import csso from "postcss-csso";
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

        if (options.minify) {
            plugins.push(csso());
        }

        const { css } = await postcss(plugins).process(await ref.read(), {
            from: ref.id,
        });

        ref.code = css;
    },
});
