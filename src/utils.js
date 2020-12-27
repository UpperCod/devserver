/**
 *
 * @param {string} value
 */
export const pathname = (value) => {
    const [, pathname] = value.match(/([^?]*)(?:\?i=(.+)){0,1}/);
    return pathname.replace(/([\/\\]+)/g, "/").replace(/^\.\//, "");
};

export const addDefaultIndex = (file, extension) => {
    const [lastFolder] = file.match(/([^\/]*)$/);
    const value = file + (lastFolder ? "" : "index");
    return value + (/\.\w+$/.test(value) ? "" : extension);
};
/**
 * @param {string} message
 */
export const log = (message) => {
    const time = new Date();
    const markTime = [time.getHours(), time.getMinutes(), time.getSeconds()]
        .map((value) => (value > 9 ? value : "0" + value))
        .join(":");
    console.log(`\n[${markTime}] ${message}`);
};
