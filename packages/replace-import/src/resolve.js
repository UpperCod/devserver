import { URL } from "url";
import { join } from "path";
import { readFile } from "fs/promises";
import { exportMap } from "./export-map.js";
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

    if (!subpathname && pkg.module) {
        file = pkg.module;
    } else if (typeof pkg.exports == "object") {
        file =
            pkg.exports.import ||
            pkg.exports.default ||
            exportMap(pkg.exports, subpathname) ||
            subpathname ||
            "index";
    }
    return new URL(
        join(folder, addDefaultExtension(file, defaultExtension)),
        moduleFolder
    );
}
