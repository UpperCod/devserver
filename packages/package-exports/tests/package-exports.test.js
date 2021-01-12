import test from "ava";
import { packageExports } from "../src/package-exports.js";

test("packageExports 1", (t) => {
    const folders = {
        ".": "./core.js",
        "./html": "./html.js",
        "./utils/*": "./u/*.js",
    };
    t.is(packageExports(folders, ""), "./core.js");
    t.is(packageExports(folders, "html"), "./html.js");
    t.is(packageExports(folders, "utils/tools"), "./u/tools.js");
    t.is(packageExports(folders, "css"), false);
});

test("packageExports 2", (t) => {
    const folders = {
        "./html": "./html.js",
        "./html/*": "./u/*.js",
    };

    t.is(packageExports(folders, "html"), "./html.js");
    t.is(packageExports(folders, "html/utils"), "./u/utils.js");
});
