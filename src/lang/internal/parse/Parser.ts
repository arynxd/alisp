import type { Runtime } from "../runtime/runtime";
import { Expr, ListExpr, LiteralExpr, SymbolExpr } from "./Expr";
import { Token, TokenType } from "./Token";

export class Parser {
    constructor(private readonly tokens: Token[], private readonly runtime: Runtime) {}

    private current = 0;

    public parse() {
        const expressions: Expr[] = [];

        while (!this.isEof()) {
            expressions.push(this.nextAsExpression());
        }

        return new ListExpr(
            new Token(
                "StartList",
                "(",
                undefined,
                0,
                0,
                this.runtime.currentFile,
                this.runtime.currentSrc
            ),
            expressions
        );
    }

    private nextAsExpression() {
        const startToken = this.requireNext("StartList");
        const listArgs: Expr[] = [];

        while (!this.hasNext("EndList")) {
            listArgs.push(this.nextAsArgument());
        }

        this.requireNext("EndList");
        return new ListExpr(startToken, listArgs);
    }

    private nextAsArgument() {
        if (this.advanceWhenHasAny("Integer", "String", "NullPtr")) {
            return new LiteralExpr(this.previous(), this.previous().value);
        }

        if (this.advanceWhenHasAny("Symbol")) {
            return new SymbolExpr(this.previous());
        }

        if (this.hasNext("StartList")) {
            return this.nextAsExpression();
        }

        return this.runtime.errorHandler.report("syntax")(
            `Unexected token ${this.peek().type}`,
            this.peek()
        );
    }

    private advanceWhenHasAny(...types: TokenType[]) {
        return types.some((t) => this.hasNext(t)) ? (this.advance(), true) : false;
    }

    private hasNext(type: TokenType) {
        return this.isEof() ? false : this.peek().type === type;
    }

    private requireNext(type: TokenType) {
        if (this.hasNext(type)) return this.advance();

        return this.runtime.errorHandler.report("syntax")(
            `Expected ${type} found ${this.peek().type}`,
            this.peek()
        );
    }

    private advance() {
        if (!this.isEof()) this.current++;

        return this.previous();
    }

    private isEof() {
        return this.peek().type === "Eof";
    }

    private peek() {
        return this.tokens[this.current];
    }

    private previous() {
        return this.tokens[this.current - 1];
    }
}
