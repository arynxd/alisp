import { exit } from "process";
import type { Token } from "../parse/Token";
import type { Runtime } from "./runtime";

export type ErrorType = "syntax" | "runtime" | "internal" | "panic";

type ReportErrorFunc<T extends ErrorType> = {
    syntax: ReportSyntaxErrorFunc;
    runtime: ReportGeneralErrorFunc;
    internal: ReportGeneralErrorFunc;
    panic: ReportGeneralErrorFunc;
}[T];

export type ReportSyntaxErrorFunc = (message: string, token: Token) => never;

export type ReportGeneralErrorFunc = (message: string) => never;

export class ErrorHandler {
    constructor(public readonly runtime: Runtime) {}

    private getSurroundingContext(token: Token): string {
        const snippets = token.containingSrc.split("\n");

        let out = (snippets[token.line - 2] ?? "") + "\n";

        let spaces = token.startCol < 5 ? 0 : token.startCol - 2;
        let arrowCount = token.identifier.length + 5;

        const arrows = " ".repeat(spaces) + "^".repeat(arrowCount);

        out += (snippets[token.line - 1] ?? "") + "\n";
        out += arrows + "\n";
        out += (snippets[token.line] ?? "") + "\n";
        return out;
    }

    public report<T extends ErrorType>(type: T): ReportErrorFunc<T> {
        const interceptor = this.runtime.interceptorController.get("error")

        if (interceptor) {
            return interceptor.intercept
        }
        
        if (type === "syntax") {
            const fun: ReportSyntaxErrorFunc = (message, token) => {
                console.error(`a syntax error has occurred : ${message}`);

                console.error(`  @ line ${token.line} of ${this.runtime.currentFile}`);

                const context = this.getSurroundingContext(token);

                console.error(context);

                exit(1);
            };

            //NOTE: TS cant determine that 'type' is associated with this function
            //      so will try to intersect them, causing an error.
            // @ts-ignore
            return fun;
        } else {
            const fun: ReportGeneralErrorFunc = (message) => {
                if (type === "panic") {
                    console.error(`panic! : ${message}`);
                } else {
                    console.error(`a ${type} error has occurred : ${message}`);
                }

                let entry = this.runtime.callStack.pop();

                if (!entry) {
                    console.error("stack was empty, this is a bug");
                    exit(1);
                }

                const context = this.getSurroundingContext(entry.token);

                console.error(context);

                console.error("stack::");

                while (entry) {
                    console.error(
                        `  ${entry.token.identifier} @ line ${entry.token.line} of ${entry.token.filePath}`
                    );
                    entry = this.runtime.callStack.pop();
                }
                exit(1);
            };
            //NOTE: TS cant determine that 'type' is associated with this function
            //      so will try to intersect them, causing an error.
            // @ts-ignore
            return fun;
        }
    }
}
