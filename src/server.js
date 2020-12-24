import { join } from "path";
import { readFile } from "fs/promises";
import { createServer as serverHttp } from "http";
import { createSecureServer as serverHttp2 } from "http2";
import { replaceImport } from "@devserver/replace-import";
import { resolve, packageName } from "@devserver/replace-import/resolve";
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

let responses = [];

/**
 *
 * @param {string} base
 * @param {number} port
 * @param {string} spa
 */
export const createServer = ({ base, port, spa, cdn, cert }) => {
  // File to display for unresolved routes
  const notFound = join(base, spa || "404.html");
  // redirect NPM content
  const localResolve = (value) =>
    /^(\.|\/|http(s){0,1}\:\/\/)/.test(value)
      ? value
      : cdn
      ? `https://jspm.dev/${value}`
      : `/npm/${value}`;

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
              setInterval(sendMessage, 60000, res, "ping", "still waiting");
              // Watch the target directory for changes and trigger reload
              responses.push(res);
            },
            "/npm/{...pkg}": async ({ pkg }) => {
              setCache(res, 600);

              const [, folder, subpathname] = pkg.match(packageName);
              const npmFolder = [folder, subpathname].join("/");

              if (pkg != npmFolder) {
                setRedirect(res, npmFolder);
              } else {
                const file = await resolve(pkg);
                setContentType(res, file.href);
                if (file.href.endsWith(".js")) {
                  const code = await replaceImport({
                    file,
                    code: await readFile(file, "utf8"),
                    resolve: localResolve,
                  });

                  res.end(code);
                } else {
                  return sendStream(res, file);
                }
              }
            },
            "/[...local]": async ({ local }) => {
              const file = join(base, addDefaultIndex(local, ".html"));
              setNoCache(res);
              setContentType(res, file);
              if (file.endsWith(".js")) {
                const code = await replaceImport({
                  file,
                  code: await readFile(file, "utf8"),
                  resolve: localResolve,
                });

                res.end(code);
              } else if (file.endsWith(".html")) {
                const code = await readFile(file, "utf8").catch(() =>
                  readFile(notFound, "utf8")
                );
                const reload = `
                <script>{
                let source = new EventSource('/livereload');
                source.onmessage = e =>  setTimeout(()=>location.reload(),250);
                }</script>
              `;
                res.end(code + reload);
              } else {
                return sendStream(res, file);
              }
            },
          },
          src
        );
      } catch (e) {
        res.statusCode = 404;
        res.end("");
      }
    };
    (cert ? serverHttp2(cert, handler) : serverHttp(handler)).listen(port, () =>
      ready({
        port,
        reload() {
          responses.forEach((res) => sendMessage(res, "message", "reloading"));
          responses = [];
        },
      })
    );
  });
};
