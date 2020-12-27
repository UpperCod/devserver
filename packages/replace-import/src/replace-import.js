import { init, parse } from "es-module-lexer";
/**
 *
 * @param {Object} param
 * @param {string} param.code
 * @param {(value:string)=>Promise<string>} param.resolve
 */
export async function replaceImport({ code, resolve }) {
    await init;

    let diff = 0;

    const [imports] = parse(code);
    return imports.reduce(
        (step, { s, e, d }) =>
            step.then(async (code) => {
                const dinamic = d > 0 ? 1 : 0;
                const start = s + diff + dinamic;
                const end = e + diff + dinamic;
                const md = code.slice(start, end);
                const id = await resolve(md);
                diff += id.length - md.length;
                return code.slice(0, start) + id + code.slice(end);
            }),
        Promise.resolve(code)
    );
}
