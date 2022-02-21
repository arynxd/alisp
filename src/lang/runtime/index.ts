import { Runtime } from "../internal/runtime/Runtime";
import { Parser } from "../internal/parse/Parser";
import {
    isLispFunction,
    LispFunction,
    Symbol,
    SymbolTable,
} from "../internal/runtime/symbol";
import { Lexer } from "../internal/parse/Lexer";
import {
    Expr,
    ListExpr,
    LiteralExpr,
    SymbolExpr,
} from "../internal/parse/Expr";
import { stringify } from "../internal/util";
import { loadStdLib } from "../internal/runtime/std";
import { StackEntry } from "./callstack";
import { Token } from "../internal/parse/Token";

export function execute(src: string) {
    const runtime = new Runtime();
    runtime.currentFile = "<anonymous>";

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

    public symbols = new SymbolTable(
        this.runtime,
        this.runtime.globalSymbols
    );

    public interpret(src: string) {
        const lexer = new Lexer(src, this.runtime);
        const tokens = lexer.lex();

        const parser = new Parser(tokens, this.runtime);
        const ast = parser.parse();

        this.runtime.callStack.push(
            new StackEntry(
                this.runtime.currentFile,
                new Token("StartList", "main", undefined, 0, 0)
            )
        );

        const result = stringify(
            this.evaluate(ast, this.runtime),
            this.runtime
        );

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

        runtime.errorHandler.report("internal")(
            `Unkown Expr ${expr}`
        );
    }

    private evaluateList(expr: ListExpr, runtime: Runtime) {
        if (
            this.runtime.callStack.callAmount >=
            this.runtime.maxStackSize
        ) {
            runtime.errorHandler.report("runtime")(
                "Stack overflow"
            );
        }

        this.runtime.callStack.callAmount++;

        const oldSymbols = this.symbols;
        const [head, ...exprs] = expr.list;

        this.runtime.callStack.push(
            new StackEntry(
                this.runtime.currentFile,
                head.wrappingToken
            )
        );

        try {
            if (head instanceof SymbolExpr) {
                this.symbols = new SymbolTable(
                    this.runtime,
                    this.symbols
                );

                const identifier =
                    head.wrappingToken.identifier;

                if (!this.symbols.has(identifier)) {
                    runtime.errorHandler.report("runtime")(
                        `Symbol ${identifier} was not found`
                    );
                }

                const maybeFn = this.evaluateSymbol(
                    head,
                    runtime
                );

                if (isLispFunction(maybeFn)) {
                    const ctx = new FunctionExecutionContext(
                        this,
                        runtime,
                        exprs,
                        maybeFn
                    );

                    return maybeFn.execute(ctx);
                }

                runtime.errorHandler.report("runtime")(
                    `Symbol ${identifier} was not a function`
                );
            }
        } finally {
            this.symbols = oldSymbols;
            this.runtime.callStack.pop(); // only pop after recursion has finished
        }

        return expr.list.map((ex) =>
            this.evaluate(ex, runtime)
        );
    }

    private evaluateLiteral(expr: LiteralExpr) {
        return expr.literal as Symbol;
    }

    private evaluateSymbol(expr: SymbolExpr, runtime: Runtime) {
        const id = expr.wrappingToken.identifier;
        if (!this.symbols.has(id)) {
            runtime.errorHandler.report("runtime")(
                `Symbol '${id}' does not exist`
            );
        }
        return this.symbols.get(id);
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
        return this.interpreter.evaluate(
            this.exprs[index],
            this.runtime
        );
    }

    public reduceAll() {
        return this.exprs.map((ex) =>
            this.interpreter.evaluate(ex, this.runtime)
        );
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

    public readonly error =
        this.runtime.errorHandler.report.bind(
            this.runtime.errorHandler
        );
}
