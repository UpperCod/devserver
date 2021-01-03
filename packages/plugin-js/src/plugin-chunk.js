/**
 * Emit files from this.emitFile, this to set the output name
 * @param {import("@devserver/build-core").Ref[]} assets
 * @returns {import("rollup").Plugin}
 */
export const pluginChunk = (assets) => ({
    name: "plugin-internal-chunks",
    buildStart() {
        assets.forEach(({ id, link }) =>
            this.emitFile({
                type: "chunk",
                id: id,
                fileName: link.dest,
            })
        );
    },
});
