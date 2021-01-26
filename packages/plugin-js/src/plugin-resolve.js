import path from "path";
import { resolve } from "@devserver/resolve";
import { transformJs } from "@devserver/transform-js";
/**
 * Resolves the path of the resources only if they exist in NPM
 * @param {Object} options
 * @param {string} options.base - define the root directory of the assets
 * @param {boolean|string} options.cdn - define the root directory of the assets
 * @param {(src:string,asset:boolean)=>any} options.load - define the root directory of the assets
 * @returns {import("rollup").Plugin}
 */
export const pluginResolve = ({ base, cdn, load }) => ({
    name: "plugin-resolve",
    resolveId(source, importer) {
        // ignore dependency if this is already a url
        if (/^http(s){0,1}\:\/\//.test(source))
            return { id: source, external: true };
        // In the opposite case, associate a resolution process
        if (!importer) return source;

        return source[0] == "."
            ? null
            : source[0] == "/"
            ? path.join(base, source.slice(1))
            : cdn
            ? {
                  id:
                      typeof cdn == "string"
                          ? cdn.replace("$", source)
                          : `https://jspm.dev/${source}`,
                  external: true,
              }
            : resolve(source).then((url) =>
                  url.href.replace(/^file\:(\/|\\){2,3}/, "")
              );
    },
    async transform(code, source) {
        return transformJs({
            code,
            file: source,
            /**
             *
             * @param {string} src
             */
            load: (src) =>
                load(path.join(path.dirname(source), src), true).link,
        });
        // const m = await replaceImport(code, (token) => {
        //     const { src, scope, quote } = token;
        //     const ext = path.extname(src);
        //     if (/^\.|\//.test(src) && ext && ext != ".js") {
        //         token.toString = () =>
        //             `const ${scope} = new URL(${
        //                 quote +
        //                 load(path.join(path.dirname(source), src), true).link
        //                     .name +
        //                 quote
        //             }, import.meta.url)`;
        //     }
        //     return token;
        // });

        // const map = m.generateMap({
        //     hires: true,
        // });

        // return {
        //     code: m + "",
        //     map,
        // };
    },
});
