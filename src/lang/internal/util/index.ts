import {
    Expr,
    ListExpr,
    LiteralExpr,
    SymbolExpr,
} from "../parse/Expr";
import type { Runtime } from "../runtime/runtime";

export function stringify(
    v: unknown,
    runtime: Runtime
): string {
    if (typeof v === "function")
        return `fn ${v.name || "(anonymous)"}`;

    if (typeof v === "string") return v.toString();

    if (typeof v === "number") return v.toString();

    if (typeof v === "boolean") return v.toString();

    if (Array.isArray(v))
        return `(${v
            .map((a) => stringify(a, runtime))
            .join(" ")})`;

    if (v === null || v === undefined) return "nptr";

    return runtime.errorHandler.report("internal")(
        `Attempted to stringify unhandled type of value ${v}`
    );
}

export function isListExpr(expr: Expr): expr is ListExpr {
    return expr instanceof ListExpr;
}

export function isSymbolExpr(expr: Expr): expr is SymbolExpr {
    return expr instanceof SymbolExpr;
}

export function isLiteralExpr(expr: Expr): expr is LiteralExpr {
    return expr instanceof LiteralExpr;
}

export function isNonEmptyString(
    value: unknown
): value is string {
    return typeof value === "string" && !!value;
}

export function isValidSymbol(c: string) {
    return /[^\(\)"'\s]/.test(c);
}
