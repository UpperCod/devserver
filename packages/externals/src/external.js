import glob from "fast-glob";
import { join } from "path";
import { readFile } from "fs/promises";

/**
 * captures all packages in order to extract
 * external dependencies from them
 * @param {Object} [options]
 * @param {string} [options.base]
 * @param {string} [options.pkgFileName]
 * @param {string} [options.cwd]
 * @returns {Promise<string[]>}
 */
export async function getExternal({
    base = "",
    pkgFileName = "package.json",
    cwd = process.cwd(),
} = {}) {
    const pkgFiles = await glob(
        [base + "**/" + pkgFileName, "!node_modules/**", pkgFileName],
        {
            cwd,
        }
    );

    const pkgs = await Promise.all(
        pkgFiles.map(async (file) =>
            JSON.parse(await readFile(join(cwd, file), "utf8"))
        )
    );

    return Object.keys(
        pkgs.reduce(
            (external, pkg) =>
                [
                    "dependencies",
                    "peerDependencies",
                    "optionalDependencies",
                ].reduce(
                    (external, prop) => Object.assign(external, pkg[prop]),
                    external
                ),
            {}
        )
    );
}
