import type { FunctionExecutionContext } from "../../runtime";
import type { NamedSymbol } from "../runtime/symbol";
import { isNonEmptyString, isSymbolExpr } from "../util";

function named(ctx: FunctionExecutionContext) {
    const _name = ctx.arg(0);

    if (!isSymbolExpr(_name) || !isNonEmptyString(_name.wrappingToken.identifier)) {
        return ctx.error("runtime")("'name' name was not a symbol");
    }

    const value = ctx.reduceOne(1);

    const sym: NamedSymbol = {
        name: _name.wrappingToken.identifier,
        symbol: value,
    };

    return sym;
}

export const mod = {
    name: "named",
    func: named,
};
