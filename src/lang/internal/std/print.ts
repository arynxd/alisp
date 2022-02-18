import type { FunctionExecutionContext } from "../../runtime";
import { stringify } from "../util";

function print(ctx: FunctionExecutionContext) {
    ctx.reduceAll()
        .map(v => stringify(v, ctx.reportError))
        .forEach((v) => console.log(v));
}

export const mod = {
    name: "print",
    func: print,
};
