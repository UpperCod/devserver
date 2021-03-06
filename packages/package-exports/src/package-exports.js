/**
 * Returns the associated path according to the package.json#exports
 * {@link https://nodejs.org/api/packages.html#packages_exports_sugar Standard reference}
 * @example
 * ```json
 * // Example 1
 * {
 *  "import": "./index.js",
 *  "default": "./index.js"
 * }
 * // Example 2
 * {
 *   ".": "./index.js",
 *   "./core": "./core.js"
 *   "./utils/*": "./utils/*.js"
 * }
 * ```
 * @param {Exports} exports
 * @param {string} searchFolder
 */
export function packageExports(exports, searchFolder) {
    /**
     * If exports is of the string type, it returns the export path
     * @example
     * ```json
     * {"exports": "./index.js" }
     * ```
     */
    if (typeof exports == "string") return exports;
    /**
     * If the declaration of import to default exists at the root
     * level, the associated path is returned
     * @example
     * ```json
     * {"exports": {"import": "./index.js"} }
     * ```
     */
    if (exports.import || exports.default) {
        return exports.import || exports.default;
    }
    /**
     * In case of being an object, the export expressions are
     * generated for the path match
     * @type {[RegExp,string][]}
     */
    const folders = Object.keys(exports).map((folder) => {
        let value = exports[folder];
        if (typeof value == "object") value = value.import || value.default;
        if (folder == ".") return [RegExp("^$"), value];
        return [
            RegExp("^" + folder.slice(2).replace("*", "(.+)") + "$"),
            value,
        ];
    });

    const folder = folders.find(([regExp]) => regExp.test(searchFolder));
    if (folder) {
        const [regExp, subFolder] = folder;
        const [, wildcard] = searchFolder.match(regExp);
        return subFolder.replace("*", wildcard);
    } else {
        return false;
    }
}

/**
 * @typedef {Object} SubExports
 * @property {string} [import]
 * @property {string} [default]
 */

/**
 * @typedef {Object<string, string | SubExports>|SubExports|string} Exports
 */
