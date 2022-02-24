import { ListExpr, LiteralExpr, SymbolExpr } from "../src/lang/internal/parse/Expr";
import { Token, TokenType } from "../src/lang/internal/parse/Token";
import { Runtime } from "../src/lang/internal/runtime/runtime";
import { Symbol } from "../src/lang/internal/runtime/symbol";

export class LanguageError extends Error { }

export function newRuntime(): Runtime {
    const runtime = new Runtime()

    // set runtime errors to throw errors rather than exiting
    runtime.interceptorController.set("error", {
        type: "error",
        intercept:  (msg: string) => {
            throw new LanguageError(msg)
        }
    })

    return runtime
}
