
import type { FunctionExecutionContext } from "../../runtime";

function panic(ctx: FunctionExecutionContext) {
    ctx.error(ctx.reduceOne(0)?.toString() ?? "nil", "panic")
}

export const mod = {
    name: "panic",
    func: panic,
};
