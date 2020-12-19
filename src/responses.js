import mime from "mime";
/**
 *
 * @param {import("http").ServerResponse} res
 */
export const setKeepAlive = (res) =>
  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
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
