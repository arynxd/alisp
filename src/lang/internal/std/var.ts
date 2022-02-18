import type { FunctionExecutionContext } from "../../runtime";
import { isNonEmptyString, isValidSymbol } from "../util";

function _var(ctx: FunctionExecutionContext) {
    const key = ctx.reduceOne(0);

    if (!isNonEmptyString(key)) {
        ctx.error(`'var' key was not a valid symbol`, 'runtime')
    }

    if (!isValidSymbol(key)) {
        ctx.error(`'var' key was not a valid symbol`, 'runtime')
    }

    if (!ctx.has(1)) {
        ctx.error("'var' value was not provided", 'runtime')
    }

    const value = ctx.reduceOne(1);

    ctx.symbols.inheritedSymbols?.set(key, value);

    return value;
}

export const mod = {
    name: "_var",
    func: _var,
};
