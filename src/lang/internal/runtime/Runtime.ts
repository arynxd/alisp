import { SymbolTable } from "./symbol";

export class Runtime {
    public readonly globalSymbols: SymbolTable;

    public strict = false
    public maxStackSize = 100
    public currentFile = "<anonymous>"

    constructor() {
        this.globalSymbols = new SymbolTable(this);
    }
}
