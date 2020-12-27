import { mkdir } from "fs/promises";
/**
 *
 * @param {string} dir
 */
export const prepareDir = (dir) => {
    const dirname = pathname(dir).replace(/(\/){0,1}[^\/]+\.\w+$/, "");
    return mkdir(dirname, { recursive: true });
};
/**
 *
 * @param {string} dir
 */
export const pathname = (dir) => dir.replace(/\\+/g, "/");
