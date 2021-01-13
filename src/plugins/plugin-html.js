import { readFile } from "fs/promises";
/**
 *
 * @param {Object} options
 * @param {string} options.notFound
 * @returns {import("@devserver/build-core").Plugin}
 */
export const pluginHtml = ({ notFound }) => ({
    filter: (file) => file.endsWith(".html"),
    async load(ref) {
        const code = await ref.read().catch(() => readFile(notFound, "utf8"));
        const reload = `
            <script>{
            let source = new EventSource('/livereload');
            source.onmessage = e =>  setTimeout(()=>location.reload(),250);
            }</script>
        `;
        ref.code = code + reload;
    },
});
