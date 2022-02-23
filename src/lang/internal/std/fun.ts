import type { FunctionExecutionContext } from "../../runtime";

import { SymbolExpr } from "../parse/Expr";
import { LispFunction, Symbol, SymbolTable } from "../runtime/symbol";
import { isListExpr, isNonEmptyString, isSymbolExpr } from "../util";

function fun(ctx: FunctionExecutionContext) {
    /*
        (fun name (arg, arg2) (
            (print arg arg2)
        ))
    */

    const _name = ctx.arg(0);

    if (!isSymbolExpr(_name)) {
        return ctx.error("runtime")("'fun' name was not a valid symbol");
    }

    const name = _name.wrappingToken.identifier;

    if (!isNonEmptyString(name) || name.includes(ctx.runtime.moduleDenotion)) {
        return ctx.error("runtime")("'fun' name was not a valid symbol");
    }

    const args = ctx.arg(1);

    if (!isListExpr(args)) {
        return ctx.error("runtime")("'fun' args was not a list");
    }

    const body = ctx.arg(2);

    if (!isListExpr(body)) {
        return ctx.error("runtime")("'fun' body not a list");
    }

    for (const arg of args.list) {
        if (!(arg instanceof SymbolExpr)) {
            return ctx.error("runtime")(
                `'fun' arg was not a symbol, got ${arg.wrappingToken.identifier} instead`
            );
        }
    }

    const closure = new SymbolTable(ctx.runtime, ctx.symbols);

    const fn = (closureCtx: FunctionExecutionContext): Symbol => {
        args.list.forEach((param, index) => {
            const value = closureCtx.reduceOne(index);
            console.log(param, index, (closureCtx as any).exprs, value);

            if (ctx.runtime.strict && value === undefined) {
                return closureCtx.error("runtime")(
                    `argument ${param.wrappingToken.identifier} missing from args list`
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
