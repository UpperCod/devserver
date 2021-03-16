import path from "path";
import { createServer as serverHttp } from "http";
import { createSecureServer as serverHttp2 } from "http2";
import { resolve, packageName } from "@devserver/resolve";
import { Build } from "@devserver/build-core";
import { routes } from "./routes.js";
import {
    setCache,
    setNoCors,
    setNoCache,
    sendStream,
    setRedirect,
    sendMessage,
    setKeepAlive,
    setContentType,
} from "./responses.js";
import { pathname, addDefaultIndex } from "./utils.js";
import { pluginJs, isJs } from "./plugins/plugin-js.js";
import { pluginHtml } from "./plugins/plugin-html.js";

let responses = [];

/**
 * @param {Object} options
 * @param {string} options.base
 * @param {number} options.port
 * @param {string} options.spa
 * @param {string} options.cdn
 * @param {string} options.cert
 * @param {string} options.debug
 * @param {string} options.jsxImportSource - Associate the alias for jsx-runtime
 * @returns {Promise<{port:number,build:Build,reload:()=>void}>}
 */
export const createServer = ({
    base,
    port,
    spa,
    cdn,
    cert,
    debug,
    jsxImportSource,
}) => {
    // File to display for unresolved routes
    const notFound = path.join(base, spa || "404.html");

    const build = new Build({ base, dest: "" }, [
        pluginJs({ cdn, jsxImportSource }),
        pluginHtml({ notFound }),
        {
            filter: (src) => !src.endsWith(".html") && !isJs(src),
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
                setNoCors(res);

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
                                `new EventSource(new URL('/livereload',import.meta.url).href).onmessage = e =>  setTimeout(()=>location.reload());`
                            );
                        },
                        "/npm/{...pkg}": async ({ pkg }) => {
                            setCache(res, 600);

                            const [, folder, subpathname] = pkg.match(
                                packageName
                            );

                            const npmFolder = [folder, subpathname].join("/");
                            if (pkg != npmFolder) {
                                setRedirect(res, "/npm/" + npmFolder);
                            } else {
                                const file = await resolve(pkg);

                                const absolute = file.href.replace(
                                    "file:///",
                                    ""
                                );

                                const [, npm] = absolute.split("node_modules/");

                                if (pkg != npm) {
                                    setRedirect(res, "/npm/" + npm);
                                } else {
                                    const ref = build.load(absolute);

                                    await ref.task;

                                    setContentType(res, ref.id);

                                    if (ref.copy) {
                                        return sendStream(res, file);
                                    } else {
                                        res.end(ref.code);
                                    }
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

                            setContentType(res, isJs(ref.id) ? ".js" : ref.id);

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
                setNoCache(res);
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
