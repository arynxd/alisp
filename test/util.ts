import { Runtime } from "../src/lang/internal/runtime/runtime";

export class LanguageError extends Error { }

export function newRuntime(): Runtime {
    const runtime = new Runtime()

    // set runtime errors to throw errors rather than exiting
    runtime.interceptorController.set("error", {
        type: "error",
        intercept:  (msg: string) => {
            throw new LanguageError(msg)
        }
    })

    return runtime
}