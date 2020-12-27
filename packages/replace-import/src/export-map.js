/**
 * Defines the subpath to use of an export map
 * @param {Exports} exports
 * @param {string} searchFolder
 */
export function exportMap(exports, searchFolder) {
    // create expressions by folder
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
 * @typedef {Object} Exports
 * @property { string | {import?: string, default?: string} } prop
 */
