import type { FunctionExecutionContext } from "../../runtime";
import { stringify } from "../util";

function print(ctx: FunctionExecutionContext) {
    ctx.reduceAll()
        .map((v) => stringify(v, ctx.runtime))
        .forEach((v) => process.stdout.write(v));
}

export const mod = {
    name: "print",
    func: print,
};
