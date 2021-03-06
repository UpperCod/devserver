import { URL } from "url";
import { join } from "path";
import { readFile } from "fs/promises";
import { packageExports } from "@devserver/package-exports";
import { cache, addDefaultExtension } from "./utils.js";

const defaultModuleFolder = new URL(
    "node_modules/",
    "file://" + process.cwd().replace(/\\/g, "/") + "/"
);

export const packageName = /(@[^\/]+\/[^\/]+|[^\/]+)(?:\/){0,1}(.*)/;
/**
 * Resolve the files of a package
 * @param {string} npm - name of the package to solve
 * @param {Object} options
 * @param {string|URL} [options.moduleFolder] - allows to replace the module resolution path
 * @param {string} [options.pkgFileName] - allows replacing the name of the package.json, used for test.
 * @param {string} [options.defaultExtension] - allows replacing the name of the package.json, used for test.
 */
export async function resolve(
    npm,
    {
        moduleFolder = defaultModuleFolder,
        pkgFileName = "package.json",
        defaultExtension = ".js",
    } = {}
) {
    const [, folder, subpathname] = npm.match(packageName);

    const id = new URL(folder + "/" + pkgFileName, moduleFolder);

    const pkg = await cache(id + "#pkg", async () =>
        JSON.parse(await readFile(id, "utf-8"))
    );

    let file = "";
    // Export priority
    if (pkg.exports) {
        file = packageExports(pkg.exports, subpathname);
    }
    // Alternative export
    if (!file && !subpathname && pkg.module) {
        file = pkg.module;
    }

    return new URL(
        join(
            folder,
            addDefaultExtension(
                file || subpathname || "index",
                defaultExtension
            )
        ),
        moduleFolder
    );
}
