import type { FunctionExecutionContext } from "../../runtime";

function plus(ctx: FunctionExecutionContext) {
    const lhs = ctx.reduceOne(0)
    const rhs = ctx.reduceOne(1)

    if (typeof lhs !== 'number') {
        ctx.error("lhs was not an integer", 'runtime')
    }

    if (typeof rhs !== 'number') {
        ctx.error("rhs was not an integer", 'runtime')
    }

    return lhs + rhs
}

export const mod = {
    name: "+",
    func: plus,
};
