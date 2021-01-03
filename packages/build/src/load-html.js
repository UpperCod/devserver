import { mapHtml } from "@devserver/assets";
import { readFile } from "fs/promises";
/**
 * Extract assets declared in html attributes only if they use absolute or relative path prefix
 * @example
 * ```html
 * <script type="module" src="./my.js"></script>
 * <img src="/my.jpg"/>
 * <custom-element source="../my.jpg"></custom-element>
 * ```
 * @param {Object} options
 * @param {string} options.file - path of the html file to process
 * @param {(from:string,to:string)=>string} options.resolve - path of the html file to process
 */
export const loadHtml = async ({ file, resolve }) => ({
    file,
    code: mapHtml(
        await readFile(file, "utf8"),
        (value) => resolve(file, value)[1]
    ),
});
