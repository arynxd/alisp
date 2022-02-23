import type { Runtime } from "./runtime";
import { isNamed, Symbol } from "./symbol";

export class Module {
    private readonly exports: Map<string, Symbol>;

    constructor(private readonly runtime: Runtime) {
        this.exports = new Map();
    }

    public addExport(sym: Symbol) {
        if (isNamed(sym)) {
            this.exports.set(sym.name, sym);
            return;
        }

        this.runtime.errorHandler.report("runtime")(
            `export ${sym} has no name so cannot be exported`
        );
    }

    public get(name: string) {
        return this.exports.get(name);
    }
}

export class ModuleController {
    private modules: Map<string, Module> = new Map();

    constructor(private readonly runtime: Runtime) {}

    public get(name: string) {
        const mod = this.modules.get(name) ?? new Module(this.runtime);
        this.modules.set(name, mod);
        return mod;
    }

    public has(name: string) {
        return this.modules.has(name);
    }
}
