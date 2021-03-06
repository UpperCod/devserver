import cac from "cac";
import { createSSL } from "./ssl.js";
import { createServer } from "./server.js";
import { createWatch } from "./watch.js";
import { log } from "./utils.js";

const command = cac("devserver").version("PKG.VERSION");

command
    .command("dev <src>", "...")
    .option("--port [port]", "port for  server")
    .option("--spa [file]", "page to resolve lost requests", "")
    .option(
        "--jsxImportSource [jsxImportSource]",
        "Add support to jsx-runtime",
        ""
    )
    .option("--debug", "silence errors for failed responses", false)
    .option("--ssl", "enables the use of SSL and HTTP2", false)
    .option(
        "--cdn",
        "Enables the use of CDN avoiding the need to install the PKG",
        false
    )
    .action(
        async (
            base = "./",
            { port = 80, spa, cdn, ssl, debug, jsxImportSource }
        ) => {
            const cert = ssl ? await createSSL(`localhost`) : false;

            const devServer = await createServer({
                port,
                base,
                spa,
                cdn,
                cert,
                debug,
                jsxImportSource,
            });

            log(
                `DEV server running on ${ssl ? "https" : "http"}://localhost:${
                    devServer.port
                }`
            );

            const watchLog = () => log(`Watcher waiting for changes...`);

            watchLog();

            createWatch({
                base,
                async listener(files) {
                    for (const file in files) {
                        delete devServer.build.output[file];
                    }

                    devServer.reload();

                    watchLog();
                },
            });
        }
    );

command
    .command("build <src> <dest>")
    .option("--minify", "minify the JS and CSS code")
    .option(
        "--minifyCssLiteral",
        "Experimental. Minify the css code associated with template literals"
    )
    .option(
        "--href [href]",
        "associates a prefix for the output of assets declared in html files"
    )
    .option("--jsxImportSource [jsxImportSource]", "Add support to jsx-runtime")
    .option("--sourcemap", "enable the generation of sourcemap")
    .option(
        "--external [external]",
        "allows adding external dependencies manually"
    )
    .option(
        "--cdn",
        "Enables the use of CDN avoiding the need to install the PKG"
    )
    .action(
        async (
            src = "./",
            dest = "",
            {
                minify,
                href,
                external,
                cdn,
                sourcemap,
                jsxImportSource,
                minifyCssLiteral,
            }
        ) => {
            const { build } = await import("@devserver/build");
            log(`Build starting from ${src} to ${dest}...`);
            try {
                await build({
                    src,
                    dest,
                    minify,
                    href,
                    external:
                        typeof external == "string"
                            ? external.split(/ *, */)
                            : false,
                    cdn,
                    sourcemap,
                    jsxImportSource,
                    minifyCssLiteral,
                });
                log(`Build completed!`);
            } catch (e) {
                log(`Build error ` + e);
            }
        }
    );

command.help();

command.parse(process.argv);
