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
        return ctx.error("runtime")(
            "'fun' name was not a valid symbol"
        );
    }

    if (!isValidSymbol(name)) {
        return ctx.error("runtime")(
            "'fun' name was not a valid symbol"
        );
    }

    const args = ctx.arg(1);

    if (!isListExpr(args)) {
        return ctx.error("runtime")(
            "'fun' args was not a list"
        );
    }

    const body = ctx.arg(2);

    if (!isListExpr(body)) {
        return ctx.error("runtime")(
            "'fun' args body not a list"
        );
    }

    for (const arg of args.list) {
        if (!(arg instanceof SymbolExpr)) {
            return ctx.error("runtime")(
                `'fun' arg was not a symbol, got ${arg.wrappingToken.identifier} instead`
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
                return closureCtx.error("runtime")(
                    `Argument ${param.wrappingToken.identifier} missing from args list`
                );
            }

            closure.set(param.wrappingToken.identifier, value);
            return undefined;
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
    return undefined;
}

export const mod = {
    name: "fun",
    func: fun,
};
