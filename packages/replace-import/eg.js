import { init, parse } from "es-module-lexer";
import MagicString from "magic-string";

class Token {
    /**
     *
     * @param {string} code
     * @param {import("es-module-lexer").ImportSpecifier} part
     */
    constructor(code, part) {
        this.src = code.slice(part.s, part.e);
        this.input = code.slice(part.ss, part.se);
        this.parse(this.input);
        this.mark =
            this.type == "dynamic" ? [part.s, part.e] : [part.ss, part.se];
    }
    /**
     *  @param {string} input
     */
    parse(input) {
        if (this.input) {
            let [
                ,
                type,
                gapType,
                scope,
                gapScope,
                from,
                gapFrom,
                quote,
            ] = input.match(/^(import|export)(\s*)(.+)(\s*)(from)(\s*)(.)/s);

            const optsGapScope = scope.match(/(.+)(\s+)$/s);

            if (optsGapScope) {
                [, scope, gapScope] = optsGapScope;
            }
            this.type = type;
            this.scope = scope;
            this.from = from;
            this.quote = quote;
            this.gaps = [gapType, gapScope, gapFrom];
        } else {
            this.type = "dynamic";
            this.gaps = [];
            this.input = this.src;
            if (/^('|")/.test(this.src)) {
                this.quote = this.src[0];
                this.src = this.src.slice(1, this.src.length - 1);
            } else {
                this.quote = "";
            }
        }
    }
    toString() {
        const [gapType, gapScope, gapFrom] = this.gaps;
        return (this.type = "dynamic"
            ? [this.quote, this.src, this.quote]
            : [
                  this.type,
                  gapType,
                  this.scope,
                  gapScope,
                  this.from,
                  gapFrom,
                  this.quote,
                  this.src,
                  this.quote,
              ]).join("");
    }
}
/**
 *
 * @param {*} code
 * @param {(token:Token)=>Token} callback
 */
async function replaceImport(code, callback) {
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

replaceImport(
    `
import src from "./image.jpg";
import src from "./image.css";
import("every");
`,
    (md) => {
        if (md.type != "dynamic" && !/\.(js|jsx|ts|tsx)$/.test(md.src)) {
            md.toString = () =>
                `const ${md.scope} = new URL(${
                    md.quote + md.src + md.quote
                },import.meta.url)`;
        }
        return md;
    }
).then((s) => {
    console.log(s + "");
});
