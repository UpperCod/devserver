import path from "path";
import { createServer as serverHttp } from "http";
import { createSecureServer as serverHttp2 } from "http2";
import { resolve, packageName } from "@devserver/resolve";
import { Build } from "@devserver/build-core";
import { routes } from "./routes.js";
import {
    setCache,
    setNoCache,
    sendStream,
    setRedirect,
    sendMessage,
    setKeepAlive,
    setContentType,
} from "./responses.js";
import { pathname, addDefaultIndex } from "./utils.js";
import { pluginJs } from "./plugins/plugin-js.js";
import { pluginHtml } from "./plugins/plugin-html.js";

let responses = [];

/**
 *
 * @param {string} base
 * @param {number} port
 * @param {string} spa
 * @returns {Promise<{port:number,build:Build,reload:()=>void}>}
 */
export const createServer = ({ base, port, spa, cdn, cert, debug }) => {
    // File to display for unresolved routes
    const notFound = path.join(base, spa || "404.html");

    const build = new Build({ base, dest: "" }, [
        pluginJs({ cdn }),
        pluginHtml({ notFound }),
        {
            filter: (src) => !/.(html|js)$/.test(src),
            load(ref) {
                ref.copy = true;
            },
        },
    ]);

    return new Promise((ready) => {
        /**
         *
         * @param {import("http").IncomingMessage} req
         * @param {import("http").ServerResponse} res
         */
        const handler = async (req, res) => {
            const src = pathname(req.url);
            try {
                await routes(
                    {
                        "/favicon.ico": () => res.end(""),
                        "/livereload": () => {
                            setKeepAlive(res, !!cert);
                            // Send an initial ack event to stop any network request pending
                            sendMessage(res, "connected", "awaiting change");
                            // Send a ping event every minute to prevent console errors
                            setInterval(
                                sendMessage,
                                60000,
                                res,
                                "ping",
                                "still waiting"
                            );
                            // Watch the target directory for changes and trigger reload
                            responses.push(res);
                        },
                        "/livereload.js": () => {
                            setCache(res, 600);
                            setContentType(res, ".js");
                            res.end(
                                `if(!window._reload){ new EventSource('/livereload').onmessage = e =>  setTimeout(()=>location.reload(),250); }`
                            );
                        },
                        "/npm/{...pkg}": async ({ pkg }) => {
                            setCache(res, 600);

                            const [, folder, subpathname] = pkg.match(
                                packageName
                            );
                            const npmFolder = [folder, subpathname].join("/");

                            if (pkg != npmFolder) {
                                setRedirect(res, npmFolder);
                            } else {
                                const file = await resolve(pkg);

                                const ref = build.load(
                                    file.href.replace("file:///", "")
                                );

                                await ref.task;

                                setContentType(res, ref.id);

                                if (ref.copy) {
                                    return sendStream(res, file);
                                } else {
                                    res.end(ref.code);
                                }
                            }
                        },
                        "/[...local]": async ({ local }) => {
                            const file = path.join(
                                base,
                                addDefaultIndex(local, ".html")
                            );

                            setNoCache(res);

                            const ref = build.load(file);

                            await ref.task;

                            setContentType(res, ref.id);

                            if (ref.copy) {
                                return sendStream(res, file);
                            } else {
                                res.end(ref.code);
                            }
                        },
                    },
                    src
                );
            } catch (e) {
                if (debug) console.log(e);
                res.statusCode = 404;
                res.end("");
            }
        };
        (cert ? serverHttp2(cert, handler) : serverHttp(handler)).listen(
            port,
            () =>
                ready({
                    port,
                    build,
                    reload() {
                        responses.forEach((res) =>
                            sendMessage(res, "message", "reloading")
                        );
                        responses = [];
                    },
                })
        );
    });
};
