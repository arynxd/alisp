import type { FunctionExecutionContext } from "../../runtime";

function strict(ctx: FunctionExecutionContext) {
    ctx.runtime.strict = true;
}

export const mod = {
    name: "strict",
    func: strict,
};
