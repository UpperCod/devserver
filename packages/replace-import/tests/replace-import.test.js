import test from "ava";
import { replaceImport } from "../src/replace-import.js";

test("replaceImport 1", async (t) => {
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
    t.is(nextCode + "", codeExpect);
});

test("replaceImport 2", async (t) => {
    const code = `
        import "dep-1";
    `;
    const codeExpect = `
        import "d1";
    `;
    const nextCode = await replaceImport(code, (dep) => {
        if (dep.src == "dep-1") {
            dep.src = "d1";
        }
        return dep;
    });
    t.is(nextCode + "", codeExpect);
});

test("replaceImport 3", async (t) => {
    const code = `
        import("dep-1");
    `;
    const codeExpect = `
        import("d1");
    `;
    const nextCode = await replaceImport(code, (dep) => {
        if (dep.src == "dep-1") {
            dep.src = "d1";
        }
        return dep;
    });
    t.is(nextCode + "", codeExpect);
});

test("replaceImport 4", async (t) => {
    const code = `
        export * from "dep-1";
    `;
    const codeExpect = `
        export * from "d1";
    `;
    const nextCode = await replaceImport(code, (dep) => {
        if (dep.src == "dep-1") {
            dep.src = "d1";
        }
        return dep;
    });
    t.is(nextCode + "", codeExpect);
});

test("replaceImport 5", async (t) => {
    const code = `
        import src from "./image.jpg";
    `;
    const codeExpect = `
        const src = new URL("./image.jpg",import.meta.url);
    `;
    const nextCode = await replaceImport(code, (dep) => {
        const { scope, src, quote } = dep;
        dep.toString = () =>
            `const ${scope} = new URL(${quote + src + quote},import.meta.url)`;
        return dep;
    });
    t.is(nextCode + "", codeExpect);
});

test("replaceImport 6", async (t) => {
    const code = `
        import src from "http://unpkg.com/atomico";
    `;
    const codeExpect = `
        import src from "atomico";
    `;
    const nextCode = await replaceImport(code, (dep) => {
        dep.src = "atomico";
        return dep;
    });
    t.is(nextCode + "", codeExpect);
});
