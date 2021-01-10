import test from "ava";
import { replaceImport, Token } from "../src/replace-import.js";

test("resolve-id", async (t) => {
    const code = `
        import * from "dep-1";
        import * from "dep-2";
    `;
    const codeExpect = `
        import * from "d1";
        import * from "dependency";
    `;
    const nextCode = await replaceImport(code, (dep) => {
        if (dep.src == "dep-1") {
            dep.src = "d1";
        }
        if (dep.src == "dep-2") {
            dep.src = "dependency";
        }
        return dep;
    });
    console.log(nextCode + "");
    t.is(nextCode + "", codeExpect);
});
