import { mapHtmlAttrs } from "./map-html-attrs.js";
/**
 * @returns {import("../../core/create-build").Plugin}
 */
export const pluginHtml = () => ({
    filter: (file) => file.endsWith(".html"),
    async load(file, { load }) {
        file.code = mapHtmlAttrs(
            await file.read(),
            (value) => load(file.resolve(value), !this.filter(value)).link.href
        );
    },
});
