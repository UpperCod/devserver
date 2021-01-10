export class Token {
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
        return (this.type == "dynamic"
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
              ]
        ).join("");
    }
}
