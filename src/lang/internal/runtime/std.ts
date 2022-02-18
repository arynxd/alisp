import { readdir } from "fs/promises";
import { resolve } from "path";
import type { ReportErrorFunc } from "../error";
import { isLispFunction, LispFunction } from "./symbol";

export async function loadStdLib(reportError: ReportErrorFunc): Promise<LispFunction[]> {
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
            reportError(`Std module ${path} was not a LispFunction`, 'internal')
        }

        if (obj.name.startsWith("_")) {
            // allow use of reserved TS word by means of _ prefix
            obj.name = obj.name.slice(1);
        }

        out.push(obj);
    }

    return out;
}
