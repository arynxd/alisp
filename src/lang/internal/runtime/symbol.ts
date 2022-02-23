import type { FunctionExecutionContext } from "../../runtime";
import { Module } from "./module";
import type { Runtime } from "./runtime";

export class SymbolTable {
    private readonly symbols: Map<string, Symbol>;

    constructor(private readonly runtime: Runtime, public readonly inheritedSymbols?: SymbolTable) {
        this.symbols = new Map();
    }

    public has(key: string): boolean {
        return (this.symbols.has(key) || this.inheritedSymbols?.has(key)) ?? false;
    }

    public get(key: string): Symbol {
        return this.symbols.get(key) || this.inheritedSymbols?.get(key);
    }

    public set(key: string, value: Symbol) {
        this.symbols.set(key, value);
    }
}

export function isLispFunction(fn: Symbol | LispFunction): fn is LispFunction {
    return (
        typeof fn === "object" &&
        fn !== null &&
        "name" in fn &&
        "execute" in fn &&
        typeof fn.name === "string" &&
        typeof fn.execute === "function"
    );
}

export function isModule(mod: Symbol | Module): mod is Module {
    return mod instanceof Module;
}

export type LispFunction = {
    name: string;
    execute: (ctx: FunctionExecutionContext) => Symbol;
};

export type NamedSymbol = {
    name: string;
    symbol: Symbol;
};

export function isNamed(sym: Symbol | NamedSymbol): sym is NamedSymbol {
    return typeof sym === "object" && sym !== null && "name" in sym && typeof sym.name === "string";
}

export type Symbol =
    | number
    | string
    | boolean
    | null
    | undefined
    | LispFunction
    | Module
    | Symbol[];
