import type { FunctionExecutionContext } from "../../runtime";
import { isSymbolExpr } from "../util";

function _var(ctx: FunctionExecutionContext) {
    const key = ctx.arg(0);

    if (!isSymbolExpr(key)) {
        return ctx.error("runtime")(`'var' key was not a valid symbol, got ${key}`);
    }

    if (!ctx.has(1)) {
        return ctx.error("runtime")("'var' value was not provided");
    }

    const value = ctx.reduceOne(1);

    ctx.symbols.inheritedSymbols?.set(key.wrappingToken.identifier, value);

    return value;
}

export const mod = {
    name: "var",
    func: _var,
};
