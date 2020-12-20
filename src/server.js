import { join } from "path";
import { createReadStream } from "fs";
import { readFile } from "fs/promises";
import { createServer as server } from "http";
import { replaceImport } from "@uppercod/replace-import";
import { resolve, packageName } from "@uppercod/replace-import/resolve";
import { routes } from "./routes.js";
import {
  setCache,
  setNoCache,
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
export const createServer = ({ base, port, spa, cdn }) => {
  // File to display for unresolved routes
  const notFound = join(base, spa || "404.html");
  // redirect NPM content
  const localResolve = (value) =>
    /^(\.|\/)/.test(value)
      ? value
      : cdn
      ? `https://jspm.dev/${value}`
      : `/npm/${value}`;

  return new Promise((ready) =>
    server((req, res) => {
      const src = pathname(req.url);
      routes(
        {
          "/favicon.ico": () => res.end(""),
          "/livereload": () => {
            setKeepAlive(res);
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
                createReadStream(file).pipe(res);
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
                let source = new EventSource('http://localhost:${port}/livereload');
                source.onmessage = e =>  setTimeout(()=>location.reload(),250);
                }</script>
              `;
              res.end(code + reload);
            } else {
              createReadStream(file).pipe(res);
            }
          },
        },
        src
      );
    }).listen(port, () =>
      ready({
        port,
        reload() {
          responses.forEach((res) => sendMessage(res, "message", "reloading"));
          responses = [];
        },
      })
    )
  );
};
