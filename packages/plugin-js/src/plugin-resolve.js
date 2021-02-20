import path from "path";
import { resolve } from "@devserver/resolve";
import { transformJs } from "@devserver/transform-js";
export { isJs } from "@devserver/transform-js";
import csso from "csso";
/**
 * Resolves the path of the resources only if they exist in NPM
 * @param {Object} options
 * @param {string} options.base - define the root directory of the assets
 * @param {boolean|string} options.cdn - define the root directory of the assets
 * @param {(src:string,asset:boolean)=>any} options.load - define the root directory of the assets
 * @param {string} [options.jsxImportSource] - Associate the alias for jsx-runtime
 * @param {boolean} [options.minifyCssLiteral] - Associate the alias for jsx-runtime
 * @returns {import("rollup").Plugin}
 */
export const pluginResolve = ({
    base,
    cdn,
    load,
    jsxImportSource,
    minifyCssLiteral,
}) => ({
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
                load(path.join(path.dirname(source), src), true).link.href,
            transform: {
                jsxImportSource,
                cssLiteral:
                    minifyCssLiteral &&
                    ((block) => {
                        return (
                            block.open.args[0] +
                            "`" +
                            csso.minify(block.content).css +
                            "`"
                        );
                    }),
            },
        });
    },
});
