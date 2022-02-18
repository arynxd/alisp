import type { ReportErrorFunc } from "../error";
import { isValidSymbol } from "../util";
import { Token, TokenType } from "./Token";

export class Lexer {
    constructor(
        public readonly src: string,
        private readonly reportError: ReportErrorFunc
    ) {}

    private readonly tokens: Token[] = [];
    private pos = 0;
    private tokenStart = 0;
    private startCol = 0;
    private line = 1;

    public lex() {
        while (!this.isEOF()) {
            this.tokenStart = this.pos;

            this.nextToken();
        }

        this.pushToken("Eof");

        return this.tokens;
    }

    private nextToken() {
        const lookup = new Map([
            ["(", () => this.pushToken("StartList")],
            [")", () => this.pushToken("EndList")],
            ['"', () => this.nextAsString()],
            [" ", () => this.startCol++],
            ["+", () => this.pushToken("Symbol", "+")],
            ["\n", () => (this.line++, (this.startCol = 1))],
            ["\t", () => this.startCol++],
            ["\v", () => this.startCol++],
            ["\r", () => this.startCol++],
            ["\f", () => this.startCol++],
        ]);

        const char = this.nextChar();
        const action = lookup.get(char);

        if (action) {
            action();
        } else {
            if (this.isDigit(char)) {
                this.nextAsInt();
            } else if (this.isAlpha(char)) {
                this.nextAsSymbol();
            } else {
                this.reportError(
                    `Unknown char ${char}`,
                    "syntax",
                    this.src,
                    new Token(
                        "String",
                        char,
                        char,
                        this.line,
                        this.startCol
                    )
                );
            }
        }
    }

    private nextAsSymbol() {
        while (isValidSymbol(this.peekChar())) this.nextChar();

        const symbol = this.src.substring(
            this.tokenStart,
            this.pos
        );

        // presume its a symbol if its not reserved
        const type =
            this.keyWordOrUndefined(symbol) ?? "Symbol";

        this.pushToken(type, symbol);
    }

    private nextAsInt() {
        while (this.isDigit(this.peekChar())) this.nextChar();

        const num = this.src.substring(
            this.tokenStart,
            this.pos
        );

        this.pushToken("Integer", Number(num));
    }

    private nextAsString() {
        this.nextChar(); // skip "
        this.tokenStart++;

        while (
            this.peekChar() !== '"' &&
            !this.isEOF() &&
            this.peekChar() !== "\n"
        ) {
            this.nextChar();
        }

        if (this.isEOF() || this.peekChar() === "\n") {
            this.reportError(
                "Unterminated string literal",
                "syntax",
                this.src,
                new Token(
                    "String",
                    this.src.substring(
                        this.tokenStart,
                        this.pos
                    ),
                    this.src.substring(
                        this.tokenStart,
                        this.pos
                    ),
                    this.line,
                    this.startCol
                )
            );
        }

        const str = this.src.substring(
            this.tokenStart,
            this.pos
        );

        this.pushToken("String", str);

        this.nextChar(); // skip "
    }

    private pushToken(type: TokenType, value?: unknown) {
        const identifier = this.src.substring(
            this.tokenStart,
            this.pos
        );

        this.tokens.push(
            new Token(
                type,
                identifier,
                value,
                this.line,
                this.startCol
            )
        );
    }

    private nextChar() {
        return this.src[this.pos++];
    }

    private peekChar() {
        return this.src[this.pos];
    }

    private keyWordOrUndefined(
        maybeKeyword: string
    ): TokenType | undefined {
        const lookup = new Map([["nil", "Nil"]]);

        return lookup.get(maybeKeyword) as
            | TokenType
            | undefined;
    }

    private isEOF() {
        return this.pos >= this.src.length;
    }

    private isDigit(c: string) {
        return /^\d$/.test(c);
    }

    private isAlpha(c: string) {
        return /^[a-zA-Z_]$/.test(c);
    }

    private isAlphaNumeric(c: string) {
        return /^\w$/.test(c);
    }
}
