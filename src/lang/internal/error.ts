import type { Token } from "./parse/Token";

export type ErrorType =
    | "syntax"
    | "runtime"
    | "internal"
    | "panic";

export type ReportErrorFunc = (
    message: string,
    type: ErrorType,
    src?: string,
    token?: Token
) => never;
