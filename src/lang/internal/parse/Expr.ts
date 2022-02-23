import type { Token } from "./Token";

export abstract class Expr {
    abstract wrappingToken: Token;
}

export class SymbolExpr extends Expr {
    constructor(public readonly wrappingToken: Token) {
        super();
    }
}

export class ListExpr extends Expr {
    public constructor(public readonly wrappingToken: Token, public readonly list: Expr[]) {
        super();
    }
}

export class LiteralExpr extends Expr {
    public constructor(public readonly wrappingToken: Token, public readonly literal: unknown) {
        super();
    }
}
