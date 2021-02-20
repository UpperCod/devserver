import path from "path";
import { transform } from "sucrase";
import { replaceImport } from "@devserver/replace-import";
import { getFragments, walkFragments } from "@uppercod/str-fragment";
import merge from "merge-source-map";

/**
 * Defines if the file should be considered of type JS
 * @param {string} file
 * @returns {boolean}
 */
export const isJs = (file) => /\.(mjs|js|jsx|ts|tsx)/.test(file);
/**
 *
 */
const cssLiteralOpen = /(\/\*css\s*\*\/\s*|css)`/;

/**
 * Transfroma thanks to Sucrase code considered as JS
 * @param {Object} options
 * @param {string} [options.cdn] - Associate external dependencies with a CDN
 * @param {string} options.code - Code to transform
 * @param {string} options.file - Code source file
 * @param {(src:string)=>string} options.load - Request the load path for an unresolved dependency like JS
 * @param {string} [options.npm] - Associate a prefix for NPM dependencies, this option is only useful for the server
 * @param {Transform} [options.transform]
 *
 * @returns {Promise<{code:string,map?:any}>}
 */
export async function transformJs({
    cdn,
    code,
    file,
    load,
    npm = "",
    transform: optionsTransform,
}) {
    /**
     * @type {import("sucrase").Transform[]}
     */
    const use = [];
    const result = { code };

    optionsTransform = {
        ...optionsTransform,
        jsxPragma: "jsx",
        jsxFragmentPragma: "jsx",
    };

    let {
        jsxImportSource,
        jsxPragma,
        jsxFragmentPragma,
        cssLiteral,
    } = optionsTransform;

    if (jsxImportSource) {
        jsxPragma = "_jsx";
        jsxFragmentPragma = "_jsx";
    }

    if (/\.(jsx|tsx)$/.test(file)) use.push("jsx");
    if (/\.(tsx|ts)/.test(file)) use.push("typescript");

    const resultTransform = transform(code, {
        transforms: use,
        production: true,
        filePath: file,
        jsxPragma,
        jsxFragmentPragma,
        sourceMapOptions: {
            compiledFilename: file,
        },
    });

    result.code = resultTransform.code;
    result.map = resultTransform.sourceMap;

    if (/import|export/.test(result.code) || jsxImportSource || cssLiteral) {
        /**
         *
         * @param {string} src
         */
        const resolve = (src) => (cdn ? `https://jspm.dev/${src}` : npm + src);

        const resultReplaceImport = await replaceImport(
            result.code,
            /**
             * @param {import("@devserver/replace-import").Token} value
             */
            (value) => {
                const { src, scope, quote } = value;
                const ext = path.extname(src);
                if (ext && /^\.|\//.test(src) && !isJs(ext)) {
                    value.toString = () =>
                        `const ${scope} = new URL(${
                            quote + load(src) + quote
                        }, import.meta.url)`;
                } else if (
                    !/^(\.|\/|http(s){0,1}\:\/\/)/.test(src) &&
                    (npm || cdn)
                ) {
                    value.src = resolve(src);
                }
                return value;
            }
        );

        if (cssLiteral && cssLiteralOpen.test(result.code)) {
            const cssInline = getFragments(result.code, {
                open: cssLiteralOpen,
                end: /`/,
            });

            walkFragments(result.code, cssInline, (block) => {
                resultReplaceImport.overwrite(
                    block.open.indexOpen,
                    block.end.indexEnd,
                    cssLiteral(block)
                );
            });
        }

        if (jsxImportSource && use.includes("jsx")) {
            resultReplaceImport.prepend(
                `import {jsx as _jsx} from "${resolve(
                    jsxImportSource + "/jsx-runtime"
                )}";\n`
            );
        }

        result.code = resultReplaceImport.toString();

        result.map = merge(
            result.map,
            resultReplaceImport.generateMap({
                source: file,
                file: path.basename(file) + ".map",
            })
        );
    }
    result.map.sourcesContent = [code];

    return result;
}

/**
 * @typedef {Object} Transform
 * @property {string} [jsxPragma]
 * @property {string} [jsxFragmentPragma]
 * @property {string} [jsxImportSource]
 * @property {(block:import("@uppercod/str-fragment").CallbackParam)=>string} [cssLiteral]
 */
