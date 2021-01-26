import path from "path";
import { transform } from "sucrase";
import { replaceImport } from "@devserver/replace-import";
import merge from "merge-source-map";

export const isJs = (file) => /\.(mjs|js|jsx|ts|tsx)/.test(file);

export async function transformJs({ cdn, code, file, load, npm }) {
    /**
     * @type {import("sucrase").Transform[]}
     */
    const use = [];
    const result = { code };

    if (/\.(jsx|tsx)$/.test(file)) use.push("jsx");
    if (/\.(tsx|ts)/.test(file)) use.push("typescript");

    const resultTransform = transform(code, {
        transforms: use,
        production: true,
        filePath: file,
        sourceMapOptions: {
            compiledFilename: file,
        },
    });

    result.code = resultTransform.code;
    result.map = resultTransform.sourceMap;

    if (/import|export/.test(result.code)) {
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
                    value.src = cdn ? `https://jspm.dev/${src}` : npm + src;
                }
                return value;
            }
        );
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
