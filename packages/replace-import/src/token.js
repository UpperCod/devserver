export class Token {
    /**
     *
     * @param {string} code
     * @param {import("es-module-lexer").ImportSpecifier} part
     */
    constructor(code, part) {
        this.src = code.slice(part.s, part.e);
        this.input = code.slice(part.ss, part.se);
        this.parse(this.input || this.src);
        this.mark = this.type ? [part.ss, part.se] : [part.s, part.e];
    }
    /**
     *  @param {string} input
     */
    parse(input) {
        const [, type, scope = "", quote = ""] = input.match(
            /(\w+)\s*(?:(.+)\s*from){0,1}\s*("|')/
        );
        this.scope = scope.trim();
        this.quote = quote;
        this.type = type == "import" || type == "export" ? type : "";
        if (!this.type) {
            this.src =
                this.src[0] == this.quote
                    ? this.src.slice(1, this.src.length - 1)
                    : this.src;
        }
    }
    toString() {
        const { type, scope, src, quote } = this;
        return (
            (type ? type + " " + (scope ? scope + " from " : "") : "") +
            (quote + src + quote)
        );
    }
}
