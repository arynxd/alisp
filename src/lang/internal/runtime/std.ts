import { readdir } from "fs/promises";
import { resolve } from "path";
import type { Runtime } from "./Runtime";
import { isLispFunction, LispFunction } from "./symbol";

export async function loadStdLib(
    runtime: Runtime
): Promise<LispFunction[]> {
    let paths = await readdir(resolve(__dirname, "..", "std"));
    paths = paths.filter((p) => p.endsWith(".js"));

    const out: LispFunction[] = [];

    for (const path of paths) {
        let mod = await import(
            resolve(__dirname, "..", "std", path)
        );

        mod = mod.mod;

        const obj = {
            name: mod.name,
            execute: mod.func,
        };

        if (!isLispFunction(obj)) {
            runtime.errorHandler.report("internal")(
                `Std module ${path} was not a LispFunction`
            );
        }

        if (obj.name.startsWith("_")) {
            // allow use of reserved TS word by means of _ prefix
            obj.name = obj.name.slice(1);
        }

        out.push(obj);
    }

    return out;
}
