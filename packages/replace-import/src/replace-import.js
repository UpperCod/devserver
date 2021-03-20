import { init, parse } from "es-module-lexer";
import MagicString from "magic-string";
import { Token } from "./token.js";
export { Token } from "./token.js";

/**
 *
 * @param {string} code
 * @param {(token:Token)=>Token} callback
 */
export async function replaceImport(code, callback) {
    await init;

    const [imports] = parse(code);
    const tokens = await Promise.all(
        imports.map((part) => callback(new Token(code, part)))
    );

    return tokens
        .filter((token) => token)
        .filter((token) => token.input != token + "")
        .reduce((s, token) => {
            const [start, end] = token.mark;
            s.overwrite(start, end, token + "");
            return s;
        }, new MagicString(code));
}
