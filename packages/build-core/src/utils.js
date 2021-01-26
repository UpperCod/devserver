import { mkdir } from "fs/promises";

const cacheDir = {};
/**
 *
 * @param {string} dir
 */
export const prepareDir = (dir) => {
    const dirname = pathname(dir).replace(/(\/){0,1}[^\/]+\.\w+$/, "");
    return (cacheDir[dirname] =
        cacheDir[dirname] || mkdir(dirname, { recursive: true }));
};
/**
 *
 * @param {string} dir
 */
export const pathname = (dir) => dir.replace(/[\\\/]+/g, "/");
