import { Expr, ListExpr, LiteralExpr, SymbolExpr } from "../parse/Expr";
import type { Runtime } from "../runtime/runtime";
import { isLispFunction, isNamed, Symbol } from "../runtime/symbol";

export function stringify(v: Symbol, runtime: Runtime): string {
    if (isLispFunction(v)) return `fn ${v.name || "(anonymous)"}`;

    if (typeof v === "string") return v;

    if (typeof v === "number") return v.toString();

    if (typeof v === "boolean") return v ? "true" : "false";

    if (Array.isArray(v)) return `(${v.map((a) => stringify(a, runtime)).join(" ")})`;

    if (v === null || v === undefined) return "nptr";

    if (isNamed(v)) {
        return v.symbol?.toString() ?? "nptr";
    }
    return runtime.errorHandler.report("internal")(
        `attempted to stringify unhandled type of value ${typeof v}`
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

export function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && !!value;
}

export function isValidSymbol(c: string) {
    return /[^\(\)"'\s]/.test(c);
}
