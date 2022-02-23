import type { FunctionExecutionContext } from "../../runtime";

function endl(_: FunctionExecutionContext) {
    return "\n"
}

export const mod = {
    name: "endl",
    func: endl,
};
