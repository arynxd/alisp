import type { FunctionExecutionContext } from "../../runtime";
import { isNonEmptyString, isValidSymbol } from "../util";

function _var(ctx: FunctionExecutionContext) {
    const key = ctx.reduceOne(0);

    if (!isNonEmptyString(key)) {
        return ctx.error("runtime")(
            `'var' key was not a valid symbol`
        );
    }

    if (!isValidSymbol(key)) {
        return ctx.error("runtime")(
            `'var' key was not a valid symbol`
        );
    }

    if (!ctx.has(1)) {
        return ctx.error("runtime")(
            "'var' value was not provided"
        );
    }

    const value = ctx.reduceOne(1);

    ctx.symbols.inheritedSymbols?.set(key, value);

    return value;
}

export const mod = {
    name: "_var",
    func: _var,
};
