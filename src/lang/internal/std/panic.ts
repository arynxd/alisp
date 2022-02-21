import type { FunctionExecutionContext } from "../../runtime";

function panic(ctx: FunctionExecutionContext) {
    ctx.error("panic")(ctx.reduceOne(0)?.toString() ?? "nptr");
}

export const mod = {
    name: "panic",
    func: panic,
};
