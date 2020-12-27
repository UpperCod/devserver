import path from "path";
import { hash } from "@uppercod/hash";
import { mapHtml } from "@devserver/assets";
import { readFile, writeFile } from "fs/promises";
import { prepareDir, pathname } from "./utils.js";
/**
 *
 * @param {Object} options
 * @param {string} options.file - path of the html file to process
 * @param {string} options.root - source directory for html files
 * @param {string} options.dist - write destination of processed files
 * @param {string} [options.href] - prefix for assets associated with html files
 */
export async function loadHtml({ file, root, dist, href }) {
    const assets = {};
    const dirname = path.dirname(file);
    const code = await readFile(file, "utf8");

    const html = mapHtml(code, (value, attr) => {
        const extension = path.extname(value);
        const file = pathname(
            "./" + path.join(value[0] == "/" ? root : dirname, value)
        );
        const id = `${hash(file)}${extension}`;
        assets[file] = id;
        return `${href || ""}/assets/${id}`;
    });

    const destFile = path.join(dist, file.replace(root, ""));

    await prepareDir(destFile);
    await writeFile(destFile, html);

    return assets;
}
