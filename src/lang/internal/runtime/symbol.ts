import type { FunctionExecutionContext } from "../../runtime";
import type { Runtime } from "./Runtime";

export class SymbolTable {
    private readonly symbols: Map<string, Symbol>;

    constructor(
        private readonly runtime: Runtime,
        public readonly inheritedSymbols?: SymbolTable
    ) {
        this.symbols = new Map();
    }

    public has(key: string): boolean {
        return (
            (this.symbols.has(key) ||
                this.inheritedSymbols?.has(key)) ??
            false
        );
    }

    public get(key: string): Symbol {
        return (
            this.symbols.get(key) ||
            this.inheritedSymbols?.get(key)
        );
    }

    public set(key: string, value: Symbol) {
        this.symbols.set(key, value);
    }
}

export function isLispFunction(
    fn: Symbol | LispFunction
): fn is LispFunction {
    return (
        typeof fn === "object" &&
        fn !== null &&
        "name" in fn &&
        "execute" in fn &&
        typeof fn.name === "string" &&
        typeof fn.execute === "function"
    );
}

export type LispFunction = {
    name: string;
    execute: (ctx: FunctionExecutionContext) => Symbol;
};

export type Symbol =
    | number
    | string
    | boolean
    | null
    | void
    | LispFunction
    | Symbol[];
