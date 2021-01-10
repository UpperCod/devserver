import path from "path";
import { resolve } from "@devserver/resolve";
/**
 * Resolves the path of the resources only if they exist in NPM
 * @param {Object} options
 * @param {string} options.base - define the root directory of the assets
 * @param {boolean|string} options.cdn - define the root directory of the assets
 * @returns {import("rollup").Plugin}
 */
export const pluginResolve = ({ base, cdn }) => ({
    name: "plugin-resolve",
    resolveId(source) {
        // ignore dependency if this is already a url
        if (/^http(s){0,1}\:\/\//.test(source))
            return { id: source, external: true };
        // In the opposite case, associate a resolution process
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
});
