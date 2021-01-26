import path from "path";
import { transform } from "sucrase";
import { replaceImport } from "@devserver/replace-import";
import merge from "merge-source-map";

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
            code,
            /**
             * @param {import("@devserver/replace-import").Token} value
             */
            (value) => {
                const { src, scope, quote } = value;
                const ext = path.extname(src);
                if (
                    ext &&
                    /^\.|\//.test(src) &&
                    !/\.(js|jsx|ts|tsx)/.test(ext)
                ) {
                    value.toString = () =>
                        `const ${scope} = new URL(${
                            quote + load(src) + quote
                        }, import.meta.url)`;
                } else if (!/^(\.|\/|http(s){0,1}\:\/\/)/.test(src)) {
                    value.src = cdn ? `https://jspm.dev/${src}` : npm + src;
                }
                return value;
            }
        );
        result.code = resultReplaceImport.toString();
        result.map = merge(
            result.map,
            resultReplaceImport.generateMap({ hires: true })
        );
    }

    return result;
}
