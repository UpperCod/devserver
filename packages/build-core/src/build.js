import path from "path";
import { readFile, writeFile, copyFile } from "fs/promises";
import { hash } from "@uppercod/hash";
import { pathname, prepareDir } from "./utils.js";

export class Build {
    /**
     * Virtual files stored by the build
     * @type{Object<string,Ref>}
     */
    output = {};
    /**
     * Task queue
     * @type{Promise<any>[]}
     */
    task = [];
    /**
     *
     * @param {Object} options
     * @param {string} [options.href] - prefix to add to static file path reference
     * @param {string} [options.base] - base directory, limits the mayor reading files and resolutions
     * @param {string} [options.dest] - prefix to add to static file path reference
     * @param {boolean} [options.minify] - declare file minification for plugins
     * @param {boolean} [options.sourcemap] - declares the generation of source maps for the files
     * @param {Plugin[]} plugins
     */
    constructor(options, plugins = []) {
        this.options = options;
        this.plugins = plugins;
        this.regBase = RegExp("^(\\./){0,1}" + options.base);
    }
    /**
     * resolve a file under the build context
     * @param {string} from
     * @param {string} to
     */
    resolve = (from, to) => {
        return (
            "./" +
            pathname(
                path.join(
                    to[0] == "/" ? this.options.base : path.dirname(from),
                    to
                )
            )
        );
    };
    /**
     * Create a link object
     * @param {string} id
     * @param {boolean} [asset]
     * @returns {Link}
     */
    link = (id, asset) => {
        const self = this;
        return {
            id,
            get name() {
                return asset
                    ? hash(this.id) + path.extname(this.id)
                    : path.basename(this.id);
            },
            get href() {
                return pathname([self.options.href, this.dest].join("/"));
            },
            get dest() {
                return asset
                    ? "assets/" + this.name
                    : this.id.replace(self.regBase, "");
            },
        };
    };
    /**
     * load a file to the plugin queue
     * @param {string} id
     * @param {boolean} [asset]
     */
    load = (id, asset) => {
        const ref = this.set(id, {
            asset,
            load: (ref) =>
                this.plugins
                    .filter((plugin) => plugin.filter && plugin.filter(id))
                    .reduce(
                        (pipe, plugin) =>
                            plugin.load
                                ? pipe.then(() => plugin.load(ref, this))
                                : pipe,
                        Promise.resolve()
                    ),
        });

        if (ref.task) {
            this.task.push(ref.task);
        }

        return ref;
    };
    /**
     * Add the file to a resolution queue and return its reference
     * @param {string} id
     * @param {Object} options
     * @param {boolean} [options.copy]
     * @param {boolean} [options.asset]
     * @param {(ref:Ref)=>Promise<any>} [options.load]
     * @returns {Ref}
     */
    set = (id, { copy, asset, load } = {}) => {
        if (!this.output[id]) {
            this.output[id] = this.ref(id, {
                copy,
                asset,
            });
        }

        const ref = this.output[id];

        if (!ref.task && load) {
            ref.task = load(ref);
        }

        return ref;
    };
    /**
     * Create a file reference without association to the output
     * @param {string} id
     * @param {{asset?:boolean,copy?:boolean}} [options]
     * @returns {Ref}
     */
    ref = (id, { asset, copy } = {}) => {
        return {
            id,
            copy,
            asset,
            link: this.link(id, asset),
            /**
             *
             * @param {string} to
             */
            resolve: (to) => this.resolve(id, to),
            read: () => readFile(id, "utf8"),
        };
    };
    /**
     * Wait for the resolution of the tasks and
     * clean the already expected ones
     */
    waitTaskCycle = () => {
        const { task } = this;
        if (!task.length) return;
        this.task = [];
        return Promise.all(task).then(this.waitTaskCycle);
    };
    /**
     * Internal, allows to dispatch the plugin.loaded hook
     */
    buildEnd = async () => {
        await this.waitTaskCycle();
        /**
         * Execute the hook loaded in parallel
         */
        await Promise.all(
            this.plugins.map((plugin) => plugin.loaded && plugin.loaded(this))
        );

        await this.waitTaskCycle();
    };
    /**
     * Write the build files to disk
     */
    writeOutput = async () => {
        await this.buildEnd();
        const { output } = this;
        const { options } = this;
        return Promise.all([
            ...Object.keys(output)
                .map((id) => output[id])
                .map(async ({ id, copy, code, link, map }) => {
                    const fileDest = path.join(options.dest, link.dest);
                    await prepareDir(fileDest);
                    const task = [
                        copy
                            ? copyFile(id, fileDest)
                            : code != null && writeFile(fileDest, code, "utf8"),
                    ];
                    if (map && !/sourceMappingURL=/.test(code)) {
                        code += `//# sourceMappingURL=${link.href}.map`;
                        task.push(
                            writeFile(fileDest + ".map", map + "", "utf8")
                        );
                    }
                    return Promise.all(task);
                }),
        ]);
    };
}

/**
 * @typedef {Object} Link
 * @property {string} id
 * @property {string} name
 * @property {string} href
 * @property {string} dest
 */

/**
 * @typedef {Object} Ref
 * @property {string} id
 * @property {string} [code]
 * @property {any} [map]
 * @property {boolean} [copy]
 * @property {boolean} [asset]
 * @property {Link} link
 * @property {(to:string)=>string} resolve
 * @property {Promise<any>} [task]
 * @property {()=>Promise<string>} read
 */

/**
 * @callback Filter
 * @param {string} id
 */

/**
 * @callback Load
 * @param {Ref} ref
 * @param {Build} build
 */

/**
 * @callback Loaded
 * @param {Build} build
 */

/**
 * @typedef {Object} Plugin
 * @property {Filter} [filter]
 * @property {Load} [load]
 * @property {Loaded} [loaded]
 * @property {any} [data]
 */
