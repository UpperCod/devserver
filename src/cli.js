import sade from "sade";
import { createServer } from "./server.js";
import { createWatch } from "./watch.js";
import { log } from "./utils.js";

const command = sade("my-cli").version("PKG.VERSION");

command
  .command("dev <src>")
  .option("--port", "port for  server", 80)
  .option("--spa", "port for  server", "")
  .action(async (base = "./", { port, spa }) => {
    const devServer = await createServer({ port, base, spa });

    log(`DEV server running on http://localhost:${devServer.port}`);

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
  .command("build <src> <dist>")
  .option("--minify", "minify the js code", false)
  .option(
    "--href",
    "associates a prefix for the output of assets declared in html files",
    ""
  )
  .options("--external", "allows adding external dependencies manually", "")
  .action(async (src = "./", dist, { minify, href, external }) => {
    const { createBuild } = await import("@atomico/build");
    log(`Build starting from ${src} to ${dist}...`);
    createBuild({
      src,
      dist,
      minify,
      href,
      external: external ? external.split(/ *, */) : false,
    });
    log(`Build completed!`);
  });

command.parse(process.argv);
