import type { ReportErrorFunc } from "../error";
import {
    Expr,
    ListExpr,
    LiteralExpr,
    SymbolExpr,
} from "../parse/Expr";

export function stringify(v: unknown, reportError: ReportErrorFunc): string {
    if (typeof v === "function")
        return `fn ${v.name || "(anonymous)"}>`;

    if (typeof v === "string") return v.toString();

    if (typeof v === "number") return v.toString();

    if (typeof v === "boolean") return v.toString();

    if (Array.isArray(v))
        return `(${v.map(a => stringify(a, reportError)).join(" ")})`;

    if (v === null || v === undefined) return "nil";

    reportError(`Attempted to stringify unhandled type of value ${v}`, 'internal')
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
    return /[^\d\(\)"'\s]/.test(c);
}
