import test from "ava";
import { replaceImport } from "../src/replace-import.js";

test("resolve-id", async (t) => {
    const code = `
        import * from "dep-1";
        import * from "dep-2";
    `;
    const codeExpect = `
        import * from "d1";
        import * from "dependency";
    `;
    const nextCode = await replaceImport({
        code,
        resolve: (dep) => {
            switch (dep) {
                case "dep-1":
                    return "d1";
                case "dep-2":
                    return "dependency";
            }
        },
    });

    t.is(nextCode, codeExpect);
});
