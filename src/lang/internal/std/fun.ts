import type { FunctionExecutionContext } from "../../runtime";

import { SymbolExpr } from "../parse/Expr";
import {
    LispFunction,
    Symbol,
    SymbolTable,
} from "../runtime/symbol";
import {
    isListExpr,
    isNonEmptyString,
    isValidSymbol,
} from "../util";

function fun(ctx: FunctionExecutionContext) {
    /*
        (fun "name" (arg, arg2) (
            (print arg arg2)
        ))
    */

    const name = ctx.reduceOne(0);

    if (!isNonEmptyString(name)) {
        ctx.error(
            "'fun' name was not a filled string",
            "runtime"
        );
    }

    if (!isValidSymbol(name)) {
        ctx.error(
            "'fun' name was not a valid symbol",
            "runtime"
        );
    }

    const args = ctx.arg(1);

    if (!isListExpr(args)) {
        ctx.error("'fun' args was not a list", "runtime");
    }

    const body = ctx.arg(2);

    if (!isListExpr(body)) {
        ctx.error("'fun' args body not a list", "runtime");
    }

    for (const arg of args.list) {
        if (!(arg instanceof SymbolExpr)) {
            ctx.error(
                `'fun' arg was not a symbol, got ${arg.wrappingToken.identifier} instead`,
                "runtime"
            );
        }
    }

    const closure = new SymbolTable(ctx.runtime, ctx.symbols);

    const fn = (
        closureCtx: FunctionExecutionContext
    ): Symbol => {
        args.list.forEach((param, index) => {
            const value = closureCtx.reduceOne(index);

            if (ctx.runtime.strict && value === undefined) {
                closureCtx.error(
                    `Argument ${param.wrappingToken.identifier} missing from args list`,
                    "runtime"
                );
            }

            closure.set(param.wrappingToken.identifier, value);
        });

        const old = closureCtx.symbols;

        closureCtx.setSymbols(closure);

        try {
            return closureCtx.evaluate(body);
        } finally {
            closureCtx.setSymbols(old);
        }
    };

    const wrappedFn: LispFunction = {
        name,
        execute: fn,
    };

    ctx.symbols.inheritedSymbols?.set(name, wrappedFn);
}

export const mod = {
    name: "fun",
    func: fun,
};
