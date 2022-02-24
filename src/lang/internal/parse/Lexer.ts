import type { Runtime } from "../runtime/runtime";
import { isValidSymbol } from "../util";
import { Token, TokenType } from "./Token";

export class Lexer {
    constructor(public readonly src: string, private readonly runtime: Runtime) {}

    private readonly tokens: Token[] = [];

    private absolutePosition = 0;
    private currentTokenStartPosition = 0;
    private currentLine = 1;

    public lex() {
        while (!this.isEOF()) {
            this.currentTokenStartPosition = this.absolutePosition;

            this.nextToken();
        }

        this.pushToken("Eof");

        this.ensureMatchingParens();
        return this.tokens;
    }

    private nextToken() {
        const lookup = new Map([
            [
                "(",
                () => {
                    this.pushToken("StartList");
                },
            ],
            [
                ")",
                () => {
                    this.pushToken("EndList");
                },
            ],
            [
                '"',
                () => {
                    this.nextAsString();
                },
            ],
            [
                " ",
                () => {
                    // no-op, the lexer will advance by itself
                },
            ],
            [
                "+",
                () => {
                    this.pushToken("Symbol", "+");
                },
            ],
            [
                "\n",
                () => {
                    this.currentLine++;
                },
            ],
            [
                "\t",
                () => {
                    // no-op, the lexer will advance by itself
                },
            ],
            [
                "\v",
                () => {
                    // no-op, the lexer will advance by itself
                },
            ],
            [
                "\r",
                () => {
                    // no-op, the lexer will advance by itself
                },
            ],
            [
                "\f",
                () => {
                    // no-op, the lexer will advance by itself
                },
            ],
        ]);

        const char = this.nextChar();
        const action = lookup.get(char);

        if (action) {
            action();
        } else {
            if (this.isDigit(char)) {
                this.nextAsInt();
            } else if (isValidSymbol(char)) {
                this.nextAsSymbol();
            } else {
                this.runtime.errorHandler.report("syntax")(
                    `Unknown char ${char}`,
                    new Token(
                        "String",
                        char,
                        char,
                        this.currentLine,
                        this.absolutePosition,
                        this.runtime.currentFile,
                        this.runtime.currentSrc
                    )
                );
            }
        }
    }

    private nextAsSymbol() {
        while (isValidSymbol(this.peekChar())) this.nextChar();

        const symbol = this.currentTokenAsString();

        // presume its a symbol if its not reserved
        const type = this.keyWordOrUndefined(symbol) ?? "Symbol";

        if (type === "Boolean") {
            this.pushToken(type, Boolean(symbol));
        } else {
            this.pushToken(type, symbol);
        }
    }

    private nextAsInt() {
        while (this.isDigit(this.peekChar())) this.nextChar();

        const num = this.currentTokenAsString();

        this.pushToken("Integer", Number(num));
    }

    private nextAsString() {
        this.absolutePosition++;
        this.currentTokenStartPosition++; // skip "

        while (this.peekChar() !== '"' && !this.isEOF() && this.peekChar() !== "\n") {
            this.nextChar();
        }

        if (this.isEOF() || this.peekChar() === "\n") {
            this.runtime.errorHandler.report("syntax")(
                "Unterminated string literal",
                new Token(
                    "String",
                    this.currentTokenAsString(),
                    this.currentTokenAsString(),
                    this.currentLine,
                    this.absolutePosition,
                    this.runtime.currentFile,
                    this.runtime.currentSrc
                )
            );
        }

        const str = this.currentTokenAsString();

        this.pushToken("String", str);

        this.nextChar(); // skip "
    }

    private currentTokenAsString() {
        return this.src.substring(this.currentTokenStartPosition, this.absolutePosition);
    }

    private pushToken(type: TokenType, value?: unknown) {
        const identifier = this.currentTokenAsString();

        if (type === "Eof") {
            this.tokens.push(
                new Token(
                    type,
                    "eof",
                    undefined,
                    this.currentLine,
                    this.currentTokenStartPosition,
                    this.runtime.currentFile,
                    this.runtime.currentSrc
                )
            );
        } else {
            this.tokens.push(
                new Token(
                    type,
                    identifier,
                    value,
                    this.currentLine,
                    this.currentTokenStartPosition,
                    this.runtime.currentFile,
                    this.runtime.currentSrc
                )
            );
        }
    }

    private nextChar() {
        return this.src[this.absolutePosition++];
    }

    private peekChar() {
        return this.src[this.absolutePosition];
    }

    private keyWordOrUndefined(maybeKeyword: string): TokenType | undefined {
        const lookup = new Map([
            ["nptr", "NullPtr"],
            ["true", "Boolean"],
            ["false", "Boolean"],
        ]);

        return lookup.get(maybeKeyword) as TokenType | undefined;
    }

    private isEOF() {
        return this.absolutePosition >= this.src.length;
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

    private ensureMatchingParens() {
        const stack: number[] = [];

        this.tokens.forEach((token, idx) => {
            if (token.type === "StartList") {
                stack.push(idx);
            } else if (token.type === "EndList") {
                if (!stack.length) {
                    this.runtime.errorHandler.report("syntax")(
                        "Unmatched list expression",
                        this.tokens[idx]
                    );
                }
                stack.pop();
            }
        });

        if (stack.length) {
            this.runtime.errorHandler.report("syntax")(
                "Unmatched list expression",
                this.tokens[stack.pop()!]
            );
        }
    }
}
