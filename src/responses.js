import mime from "mime";
import { createReadStream } from "fs";
/**
 * Allows request from all origins
 * @param {import("http").ServerResponse} res
 */
export const setNoCors = (res) =>
    res.setHeader("Access-Control-Allow-Origin", "*");
/**
 * It keeps the connection active only in http
 * @param {import("http").ServerResponse} res
 * @param {boolean} [isSSL]
 */
export const setKeepAlive = (res, isSSL) =>
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        ...(isSSL ? {} : { Connection: "keep-alive" }),
    });
/**
 *
 * @param {import("http").ServerResponse} res
 * @param {string} channel
 * @param {string} data
 */
export const sendMessage = (res, channel, data) => {
    res.write(`event: ${channel}\nid: 0\ndata: ${data}\n`);
    res.write("\n\n");
};
/**
 * @param {import("http").ServerResponse} res
 * @param {string} value
 */
export const setContentType = (res, value) =>
    res.setHeader("Content-Type", mime.getType(value));

/**
 * @param {import("http").ServerResponse} res
 * @param {string} Location
 */
export const setRedirect = (res, Location) =>
    res
        .writeHead(301, {
            Location,
        })
        .end("");

/**
 *
 * @param {import("http").ServerResponse} res
 * @param {number} duration
 */
export const setCache = (res, duration) =>
    res.setHeader("Cache-Control", "max-age=" + duration);

/**
 *
 * @param {import("http").ServerResponse} res
 * @param {number} duration
 */
export const setNoCache = (res) => res.setHeader("Cache-Control", "no-cache");
/**
 *
 * @param {import("http").ServerResponse} res
 * @param {string} file
 */
export const sendStream = (res, file) =>
    new Promise((resolve, reject) => {
        const readStream = createReadStream(file);
        readStream.on("open", () => {
            readStream.pipe(res);
            resolve();
        });
        readStream.on("error", reject);
    });
