import { transformJs, isJs } from "@devserver/transform-js";

export { isJs } from "@devserver/transform-js";
/**
 *
 * @param {Object} options
 * @param {string} options.cdn
 * @returns {import("@devserver/build-core").Plugin}
 */
export const pluginJs = ({ cdn, jsxImportSource }) => ({
    filter: (file) => isJs(file),
    async load(ref, { set }) {
        const result = await transformJs({
            cdn,
            code: await ref.read(),
            file: ref.link.root,
            npm: "/npm/",
            load: (src) => src,
            transform: {
                jsxImportSource,
            },
        });

        const refMap = set(ref.id + ".map");

        refMap.task = true;

        ref.code = result.code + `\n//# sourceMappingURL=${refMap.link.name}`;

        refMap.code = JSON.stringify(result.map);
    },
});
