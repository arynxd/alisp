import { Runtime } from "../internal/runtime/runtime";
import { Parser } from "../internal/parse/Parser";
import { isLispFunction, LispFunction, Symbol, SymbolTable } from "../internal/runtime/symbol";
import { Lexer } from "../internal/parse/Lexer";
import { Expr, ListExpr, LiteralExpr, SymbolExpr } from "../internal/parse/Expr";
import { stringify } from "../internal/util";
import { loadStdLib } from "../internal/runtime/std";
import { StackEntry } from "./callstack";
import { Token } from "../internal/parse/Token";

export function execute(src: string) {
    const runtime = new Runtime();
    runtime.currentFile = "<anonymous>";
    runtime.currentSrc = src;

    const interpreter = new Interpreter(runtime);

    loadStdLib(runtime).then((std) => {
        std.forEach((fn) => {
            runtime.globalSymbols.set(fn.name, fn);
        });

        interpreter.interpret(src);
    });
}

class Interpreter {
    constructor(private readonly runtime: Runtime) {}

    public symbols = new SymbolTable(this.runtime, this.runtime.globalSymbols);

    public interpret(src: string) {
        const lexer = new Lexer(src, this.runtime);
        const tokens = lexer.lex();

        const parser = new Parser(tokens, this.runtime);
        const ast = parser.parse();

        this.runtime.callStack.push(
            new StackEntry(
                new Token(
                    "StartList",
                    "main",
                    undefined,
                    0,
                    0,
                    this.runtime.currentFile,
                    this.runtime.currentSrc
                )
            )
        );

        const result = stringify(this.evaluate(ast, this.runtime), this.runtime);

        console.log(`Result: ${result}`);
    }

    public evaluate(expr: Expr, runtime: Runtime): Symbol {
        if (!expr) {
            return undefined;
        }

        if (expr instanceof ListExpr) {
            return this.evaluateList(expr, runtime);
        } else if (expr instanceof LiteralExpr) {
            return this.evaluateLiteral(expr);
        } else if (expr instanceof SymbolExpr) {
            return this.evaluateSymbol(expr, runtime);
        }

        return runtime.errorHandler.report("internal")(`unkown Expr ${expr}`);
    }

    private evaluateList(expr: ListExpr, runtime: Runtime) {
        if (this.runtime.callStack.callAmount >= this.runtime.maxStackSize) {
            runtime.errorHandler.report("runtime")("stack overflow");
        }

        this.runtime.callStack.callAmount++;

        const oldSymbols = this.symbols;
        const [head, ...exprs] = expr.list;

        try {
            if (head instanceof SymbolExpr) {
                this.runtime.callStack.push(new StackEntry(head.wrappingToken));

                const maybeFn = this.evaluateSymbol(head, runtime);

                this.symbols = new SymbolTable(this.runtime, this.symbols);

                if (maybeFn === undefined) {
                    // always report non existent symbols

                    this.runtime.errorHandler.report("runtime")(
                        `symbol '${head.wrappingToken.identifier}' does not exist`
                    );
                }

                if (!isLispFunction(maybeFn)) {
                    if (this.runtime.strict && exprs.length > 0) {
                        this.runtime.errorHandler.report("runtime")(
                            `symbol '${head.wrappingToken.identifier}' was not a function`
                        );
                    }
                    return maybeFn; // return the value if we dont see a function, but a value exists
                }

                const ctx = new FunctionExecutionContext(this, runtime, exprs, maybeFn);

                return maybeFn.execute(ctx);
            }
        } finally {
            this.symbols = oldSymbols;
            this.runtime.callStack.pop(); // only pop after recursion has finished
            this.runtime.callStack.callAmount--;
        }

        return expr.list.map((ex) => this.evaluate(ex, runtime));
    }

    private evaluateLiteral(expr: LiteralExpr) {
        return expr.literal as Symbol;
    }

    private evaluateSymbol(expr: SymbolExpr, runtime: Runtime) {
        const name = expr.wrappingToken.identifier;

        const fn = this.runtime.interceptorController.get("symbol-lookup");

        if (fn) {
            const ret = fn.intercept(expr)
            
            if (ret !== "no-op") {
                return ret
            }
        }

        if (name.includes(runtime.moduleDenotion)) {
            // handle module lookup
            const parts = name.split(runtime.moduleDenotion);

            if (parts.length < 2) {
                return runtime.errorHandler.report("runtime")(
                    `symbol ${name} was invalid for module lookup`
                );
            }

            const module = runtime.moduleController.get(parts[0]);
            const val = module.get(parts[1]);

            if (!val) {
                return runtime.errorHandler.report("runtime")(
                    `symbol ${parts[1]} is not exported by ${parts[0]}`
                );
            }

            return val;
        }

        return this.symbols.get(expr.wrappingToken.identifier);
    }
}

export class FunctionExecutionContext {
    constructor(
        private readonly interpreter: Interpreter,
        public readonly runtime: Runtime,
        private readonly exprs: Expr[],
        private readonly fn: LispFunction
    ) {}

    get symbols() {
        return this.interpreter.symbols;
    }

    public reduceOne(index: number) {
        return this.interpreter.evaluate(this.exprs[index], this.runtime);
    }

    public reduceAll() {
        return this.exprs.map((ex) => this.interpreter.evaluate(ex, this.runtime));
    }

    public has(index: number) {
        return this.exprs.length > index;
    }

    public arg(index: number) {
        return this.exprs[index];
    }

    public evaluate(expr: Expr): Symbol {
        return this.interpreter.evaluate(expr, this.runtime);
    }

    public interpret(src: string) {
        this.interpreter.interpret(src);
    }

    public setSymbols(newSymbols: SymbolTable) {
        this.interpreter.symbols = newSymbols;
    }

    public readonly error = this.runtime.errorHandler.report.bind(this.runtime.errorHandler);
}
