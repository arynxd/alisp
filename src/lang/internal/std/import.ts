import { readFileSync } from "fs";
import type { FunctionExecutionContext } from "../../runtime";
import { isNonEmptyString } from "../util";

function _import(ctx: FunctionExecutionContext) {
    const path = ctx.reduceOne(0);

    if (!isNonEmptyString(path)) {
        return ctx.error("runtime")(
            "'import' path was not a string"
        );
    }

    let code: string;

    try {
        code = readFileSync(path, {
            encoding: "ascii",
        });
    } catch (ex) {
        return ctx.error("runtime")(
            "Could not import " + path + " because " + ex
        );
    }

    ctx.setSymbols(ctx.symbols.inheritedSymbols!);

    ctx.runtime.currentFile = path;
    ctx.interpret(code);

    return undefined;
}

export const mod = {
    name: "import",
    func: _import,
};
