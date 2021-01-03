import postcss from "postcss";
import { readFile } from "fs/promises";

const imported = {};

export async function loadCss({ file, dest, resolve }) {
    const { css } = postcss([plugin({ resolve })]).process(
        await readFile(file, "utf8"),
        { from: file }
    );
    return [file, css];
}

/**
 * @param {Object} options
 * @param {(from:string,to:string)=>string}  options.resolve
 * @returns {import("postcss").Plugin}
 */
const plugin = ({ resolve }) => ({
    postcssPlugin: "postcss-import",
    Once(root, { AtRule }) {
        const from = root.source.input.file;
        root.walkAtRules("import", async (atRule) => {
            const [file, media] = importParts(atRule.params);
            const [src, dest] = resolve(from, file);
            const nextAtRule = new AtRule({
                name: "import",
                params: `url(${dest}) ${media}`,
            });
            atRule.replaceWith(nextAtRule);
        });
    },
});

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
