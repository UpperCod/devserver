const CACHE = new Map();

/**
 *
 * @param {any} id
 * @param {()=>Promise<any>} callback
 */
export const cache = (id, callback) => (CACHE[id] = CACHE[id] || callback());
/**
 *
 * @param {string} value
 * @param {string} ext
 */
export const addDefaultExtension = (value, ext) =>
    /\.\w+$/.test(value) ? value : value + ext;
