import type { FunctionExecutionContext } from "../../runtime";
import {
    LispFunction,
    SymbolTable,
} from "../runtime/symbol";
import {
    isListExpr,
    isNonEmptyString,
    isSymbolExpr,
} from "../util";

function _module(ctx: FunctionExecutionContext) {
    // TODO:
    //   - enforce top level only for module start

    const _moduleName = ctx.arg(0);

    if (
        !isSymbolExpr(_moduleName) ||
        !isNonEmptyString(_moduleName.wrappingToken.identifier)
    ) {
        return ctx.error("runtime")(
            "'module' name was not a string"
        );
    }

    const _moduleBody = ctx.arg(1);

    if (!isListExpr(_moduleBody)) {
        return ctx.error("runtime")(
            "'module' body was not a list"
        );
    }

    if (_moduleBody.list.length === 0 && ctx.runtime.strict) {
        return ctx.error("runtime")(
            "'module' body was empty and empty modules are forbidden in strict mode"
        );
    }

    const moduleName = _moduleName.wrappingToken.identifier;
    const moduleBody = _moduleBody;

    const wrappedSyms = new SymbolTable(
        ctx.runtime,
        ctx.symbols
    ); //FIXME: should ctx.symbols be passed here?

    const doExport: LispFunction = {
        name: "export",
        execute: (exportCtx) => {
            const mod =
                ctx.runtime.moduleController.get(moduleName);
            const exports = exportCtx.reduceAll();
            //TODO: this shouldnt reduce, but use the raw exprs and check for non compliance

            if (
                exports.length === 0 &&
                exportCtx.runtime.strict
            ) {
                exportCtx.error("runtime")(
                    "'export' had no values which is forbidden in strict mode"
                );
            }

            exports.forEach(mod.addExport.bind(mod));
        },
    };

    wrappedSyms.set("export", doExport);

    const oldSyms = ctx.symbols;
    ctx.setSymbols(wrappedSyms);
    ctx.evaluate(moduleBody);
    ctx.setSymbols(oldSyms);

    return undefined
}

export const mod = {
    name: "module",
    func: _module,
};