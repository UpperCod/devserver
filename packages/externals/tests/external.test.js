import test from "ava";
import { URL } from "url";
import { getExternal } from "../src/external.js";

const testCwd = new URL("./", import.meta.url).href.replace("file:///", "");

test("external", async (t) => {
    const external = await getExternal({
        cwd: testCwd,
        pkgFileName: "pkg.json",
    });
    t.deepEqual(external, ["module-0", "module-1"]);
});
