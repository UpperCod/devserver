import path from "path";
import { replaceImport } from "@devserver/replace-import";
/**
 *
 * @param {Object} options
 * @param {string} options.cdn
 * @returns {import("@devserver/build-core").Plugin}
 */
export const pluginJs = ({ cdn }) => ({
    filter: (file) => file.endsWith(".js"),
    async load(ref, { set }) {
        const m = await replaceImport(
            await ref.read(),
            /**
             * @param {import("@devserver/replace-import").Token} value
             */
            (value) => {
                const { src, scope, quote } = value;
                const ext = path.extname(src);
                if (/^\.|\//.test(src) && ext && ext != ".js") {
                    value.toString = () =>
                        `const ${scope} = new URL(${
                            quote + src + quote
                        }, import.meta.url)`;
                } else if (!/^(\.|\/|http(s){0,1}\:\/\/)/.test(src)) {
                    value.src = cdn ? `https://jspm.dev/${src}` : `/npm/${src}`;
                }
                return value;
            }
        );

        const refMap = set(ref.id + ".map");

        refMap.task = true;

        const map = m.generateMap({
            source: ref.id,
            file: refMap.link.href,
            includeContent: true,
        });

        ref.code = m + `\n//# sourceMappingURL=${refMap.link.name}`;

        refMap.code = map + "";
    },
});
