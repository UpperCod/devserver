/**
 * @param {(file:string)=>string} load
 * @returns {import("postcss").Plugin}
 */
export const postcssImport = (load) => ({
    postcssPlugin: "postcss-import",
    Once(root, { AtRule }) {
        root.walkAtRules("import", (atRule) => {
            const [file, media] = importParts(atRule.params);
            const src = load(file);
            const nextAtRule = new AtRule({
                name: "import",
                params: `url("${src}") ${media}`,
            });
            atRule.replaceWith(nextAtRule);
        });
    },
});

/**
 *
 * @param {string} value
 */
const importParts = (value) => {
    let test;
    let quote;
    if (/^url\(/.test(value)) {
        test = value.slice(4).match(/([^\)]+)\)(.*)/);
    } else if (/^("|')/.test(value)) {
        quote = true;
        test = value.slice(1).match(RegExp(`([^${value[0]}]+)${value[0]}(.*)`));
    }
    if (test) {
        const [, value, media] = test;
        return [quote ? value : importParts(value)[0], media.trim()];
    } else {
        return [value];
    }
};
