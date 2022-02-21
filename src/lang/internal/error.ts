import { exit } from "process";
import type { Token } from "./parse/Token";

export type ErrorType =
    | "syntax"
    | "runtime"
    | "internal"
    | "panic";

type ReportErrorFunc<T extends ErrorType> = {
    syntax: ReportSyntaxlErrorFunc;
    runtime: ReportGeneralErrorFunc;
    internal: ReportGeneralErrorFunc;
    panic: ReportGeneralErrorFunc;
}[T];

export type ReportSyntaxlErrorFunc = (
    message: string,
    token: Token
) => never;

export type ReportGeneralErrorFunc = (message: string) => never;

export class ErrorHandler {
    constructor(
        public readonly file: string,
        public readonly src: string
    ) {}

    public report<T extends ErrorType>(
        type: T
    ): ReportErrorFunc<T> {
        if (type === "syntax") {
            const fun: ReportSyntaxlErrorFunc = (
                message,
                token
            ) => {
                console.error("Syntax error");

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
                    console.error(
                        `a ${type} error has occurred : ${message}`
                    );
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

/**
 * const reportError: ReportErrorFunc = (
            message,
            type,
            maybeSrc,
            maybeToken
        ) => {
            console.error();

            if (type === "panic") {
                console.error(`panic! : ${message}`);
            } else {
                console.error(
                    `a ${type} error has occurred : ${message}`
                );
            }

            let entry = this.callStack.pop();

            if (!entry) {
                console.error("stack was empty, this is a bug");
                exit(1);
            }

            const snippet =
                src.split("\n")[entry.token.line - 1];

            const arrows =
                " ".repeat(entry.token.startCol) +
                "^".repeat(entry.token.identifier.length);

            console.error(snippet);
            console.error(arrows);

            console.error("stack::");

            while (entry) {
                console.error(
                    `  => ${entry.token.identifier} (${entry.token.line}) (${entry.filePath})`
                );
                entry = this.callStack.pop();
            }
            exit(1);
        };
 */
