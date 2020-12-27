import test from "ava";
import { exportMap } from "../src/export-map.js";

test("exportMap 1", (t) => {
    const folders = {
        ".": "./core.js",
        "./html": "./html.js",
        "./utils/*": "./u/*.js",
    };
    t.is(exportMap(folders, ""), "./core.js");
    t.is(exportMap(folders, "html"), "./html.js");
    t.is(exportMap(folders, "utils/tools"), "./u/tools.js");
    t.is(exportMap(folders, "css"), false);
});

test("exportMap 2", (t) => {
    const folders = {
        "./html": "./html.js",
        "./html/*": "./u/*.js",
    };

    t.is(exportMap(folders, "html"), "./html.js");
    t.is(exportMap(folders, "html/utils"), "./u/utils.js");
});
