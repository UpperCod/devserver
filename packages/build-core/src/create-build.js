import path from "path";
import { hash } from "@uppercod/hash";
import { writeFile, readFile, copyFile } from "fs/promises";
import { prepareDir, pathname } from "./utils.js";

/**
 *
 * @param {Options} options
 */
export async function createBuild({
    input,
    base,
    dest,
    href,
    minify,
    plugins,
    sourcemap,
}) {
    /**
     * Stores files to be written
     * @type {Output}
     */
    const output = {};
    /**
     * This expression is used to resolve the write
     * path based on a directory as a base
     */
    const regBase = RegExp("^(\\./){0,1}" + base);
    /**
     * Create a link according to the scope of configuration
     * @param {string} id
     * @param {boolean} [asset]
     * @returns {RefLink}
     */
    const createLink = (id, asset) => {
        const dest = asset
            ? "assets/" + hash(id) + path.extname(id)
            : id.replace(regBase, "");
        return {
            href: pathname([href, dest].join("/")),
            dest,
        };
    };

    /**
     * recursive task queue
     * @type {Promise<any>[]}
     */
    let task = [];
    /**
     * Wait for the resolution of the tasks and
     * clean the already expected ones
     */
    const taskCycle = () => {
        if (!task.length) return;
        let currentTask = task;
        task = [];
        return Promise.all(currentTask).then(taskCycle);
    };

    /**
     * @type {Build}
     */
    const context = {
        options: { base, dest, href, minify, sourcemap },
        resolve(from, to) {
            return (
                "./" +
                pathname(
                    path.join(to[0] == "/" ? base : path.dirname(from), to)
                )
            );
        },
        load(id, asset) {
            const item = context.set(id, {
                asset,
                /**
                 * Execute in hook load in asynchronous queue
                 * @param {Ref} ref
                 */
                load: (ref) =>
                    plugins
                        .filter((plugin) => plugin.filter && plugin.filter(id))
                        .reduce(
                            (pipe, plugin) =>
                                plugin.load
                                    ? pipe.then(() => plugin.load(ref, context))
                                    : pipe,
                            Promise.resolve()
                        ),
            });

            task.push(item.task);

            return item;
        },
        set(id, { copy, asset, load }) {
            if (!output[id]) {
                output[id] = {
                    id,
                    copy,
                    asset,
                    link: createLink(id, asset),
                    read: async () => output[id].code || readFile(id, "utf8"),
                    resolve: (to) => context.resolve(id, to),
                };
            }

            if (!output[id].task) {
                output[id].task = load(output[id]);
            }

            return output[id];
        },
    };
    /**
     * Process the files to build, these files can generate
     * recursive processes, taskCycle takes care of waiting for all processes
     */
    input.map((id) => context.load(id));

    await taskCycle();
    /**
     * Execute the hook loaded in parallel
     */
    await Promise.all(
        plugins.map((plugin) => plugin.loaded && plugin.loaded(output, context))
    );

    await taskCycle();

    await Promise.all([
        ...Object.keys(output)
            .map((id) => output[id])
            .map(async ({ id, copy, code, link }) => {
                const fileDest = path.join(dest, link.dest);
                await prepareDir(fileDest);
                return copy
                    ? copyFile(id, fileDest)
                    : code != null && writeFile(fileDest, code, "utf8");
            }),
    ]);

    return output;
}

/**
 * @typedef {Object} Options
 * @property {string[]} input
 * @property {string} base
 * @property {string} href
 * @property {string} dest
 * @property {boolean} [minify]
 * @property {boolean} [sourcemap]
 * @property {Plugin[]} plugins
 */

/**
 * @typedef {Object} RefOptions
 * @property {boolean} [asset]
 * @property {boolean} [copy]
 * @property {(ref:Ref)=>Promise<any>} [load]
 */

/**
 * @typedef {Object} RefLink
 * @property {string} href
 * @property {string} dest
 */

/**
 * @typedef {Object} RefValue
 * @property {string} id
 * @property {RefLink} link
 * @property {string} [code]
 * @property {()=>Promise<string>} read
 * @property {(to:string)=>string} resolve
 * @property {Promise<any>} [task]
 * @property {any} [map]
 */

/**
 * @typedef {RefOptions & RefValue} Ref
 */

/**
 * @typedef {Object<string,Ref>} Output
 */

/**
 * @typedef {Object} BuildOptions
 * @property {string} href
 * @property {string} base
 * @property {string} dest
 * @property {boolean} [minify]
 * @property {boolean} [sourcemap]
 */

/**
 * @typedef {Object} Build
 * @property {BuildOptions} options
 * @property {(id:string,options?:RefOptions)=>Ref} set
 * @property {(id:string,asset?:boolean)=>Ref} load
 * @property {(from:string,to:string)=>string} resolve
 */

/**
 * @callback Filter
 * @param {string} file
 * @returns {boolean}
 */

/**
 * @callback Load
 * @param {Ref} ref
 * @param {Build} build
 * @returns {any}
 */

/**
 * @callback Loaded
 * @param {Output} file
 * @param {Build} build
 * @returns {any}
 */

/**
 * @typedef {Object} Plugin
 * @property {Filter} [filter]
 * @property {Load} [load]
 * @property {Loaded} [loaded]
 * @property {any} [data]
 */
