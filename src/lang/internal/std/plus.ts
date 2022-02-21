import type { FunctionExecutionContext } from "../../runtime";

function plus(ctx: FunctionExecutionContext) {
    const lhs = ctx.reduceOne(0);
    const rhs = ctx.reduceOne(1);

    if (typeof lhs !== "number") {
        return ctx.error("runtime")("lhs was not an integer");
    }

    if (typeof rhs !== "number") {
        return ctx.error("runtime")("rhs was not an integer");
    }

    return lhs + rhs;
}

export const mod = {
    name: "+",
    func: plus,
};
