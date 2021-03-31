/**
 * @param {string[]} external
 * @returns {import("rollup").Plugin}
 */
export const pluginExternal = (external) => {
    const regExternal = external.map((pkg) => {
        pkg = pkg.includes("*") ? pkg : pkg + "/*";
        return RegExp(
            "^" +
                pkg
                    .split(/\//)
                    .reduce(
                        (value, name, index) =>
                            value +
                            (index
                                ? name == "*"
                                    ? "(/){0,1}.*"
                                    : "/" + name
                                : name),
                        ""
                    )
        );
    });
    return {
        name: "plugin-internal-chunks",
        resolveId(id) {
            if (regExternal.some((reg) => reg.test(id))) {
                return { external: true, id };
            }
            return null;
        },
    };
};
