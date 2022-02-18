import { RuntimeError } from "./error";
import { Expr, LiteralExpr } from "./Expr";

export function requireLiteral(expr: Expr, message: string): LiteralExpr {
    if (!(expr instanceof LiteralExpr)) {
        throw new RuntimeError(message)
    }

    return expr
}

export function requireString(value: unknown,  message: string): string {
    if (typeof value !== 'string'){
        throw new RuntimeError(message)
    }

    return value
}