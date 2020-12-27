/**
 * Emit files from this.emitFile, this to set the output name
 * @param {string[]} assetsJs -assets type js to resolve
 * @param {{[prop:string]:string}} assets - hash map
 * @returns {import("rollup").Plugin}
 */
export const pluginEmit = (assetsJs, assets) => ({
    name: "emit-chunks",
    buildStart() {
        assetsJs.forEach((id) => {
            this.emitFile({
                type: "chunk",
                id: id,
                fileName: assets[id],
            });
        });
    },
});
