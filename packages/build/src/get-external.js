import glob from "fast-glob";
import { join } from "path";
import { readFile } from "fs/promises";

const cwd = process.cwd();
/**
 * captures all packages in order to extract
 * external dependencies from them
 * @param {string} root
 */
export async function getExternal(root) {
    const pkgFile = join(cwd, "package.json");

    const pkgFiles = await glob([root + "**/package.json", "!node_modules/**"]);

    const pkgs = await Promise.all(
        pkgFiles
            .concat(pkgFile)
            .map(async (file) => JSON.parse(await readFile(file, "utf8")))
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
