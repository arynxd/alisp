import { readFileSync } from "fs";
import type { FunctionExecutionContext } from "../../runtime";
import { isNonEmptyString } from "../util";

function _import(ctx: FunctionExecutionContext) {
    const path = ctx.reduceOne(0);

    if (!isNonEmptyString(path)) {
        ctx.error("'import' path was not a string", 'runtime')
    }

    let code: string;

    try {
        code = readFileSync(path, {
            encoding: "ascii",
        });
    } catch (ex) {
        ctx.error("Could not import " + path + " because " + ex, 'runtime')
    }

    ctx.setSymbols(ctx.symbols.inheritedSymbols!);

    ctx.runtime.currentFile = path
    ctx.interpret(code);
}

export const mod = {
    name: "import",
    func: _import,
};
