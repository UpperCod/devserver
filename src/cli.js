import sade from "sade";
import { createSSL } from "./ssl.js";
import { createServer } from "./server.js";
import { createWatch } from "./watch.js";
import { log } from "./utils.js";

const command = sade("my-cli").version("PKG.VERSION");

command
    .command("dev <src>")
    .option("--port", "port for  server", 80)
    .option("--spa", "page to resolve lost requests", "")
    .option("--ssl", "page to resolve lost requests", false)
    .option(
        "--cdn",
        "Enables the use of CDN avoiding the need to install the PKG",
        false
    )
    .action(async (base = "./", { port, spa, cdn, ssl }) => {
        const cert = ssl ? await createSSL(`localhost`) : false;

        const devServer = await createServer({ port, base, spa, cdn, cert });

        log(
            `DEV server running on ${ssl ? "https" : "http"}://localhost:${
                devServer.port
            }`
        );

        const watchLog = () => log(`Watcher waiting for changes...`);

        watchLog();

        createWatch({
            base,
            listener() {
                devServer.reload();
                watchLog();
            },
        });
    });

command
    .command("build <src> <dest>")
    .option("--minify", "minify the js code", false)
    .option(
        "--href",
        "associates a prefix for the output of assets declared in html files",
        ""
    )
    .option("--sourcemap", "enable the generation of sourcemap", false)
    .option("--external", "allows adding external dependencies manually", "")
    .option(
        "--cdn",
        "Enables the use of CDN avoiding the need to install the PKG",
        ""
    )
    .action(
        async (
            src = "./",
            dest = "",
            { minify, href, external, cdn, sourcemap }
        ) => {
            const { build } = await import("@devserver/build");
            log(`Build starting from ${src} to ${dest}...`);
            build({
                src,
                dest,
                minify,
                href,
                external: external ? external.split(/ *, */) : false,
                cdn,
                sourcemap,
            });
            log(`Build completed!`);
        }
    );

command.parse(process.argv);
