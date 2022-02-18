import type {
    ErrorType,
    ReportErrorFunc,
} from "../internal/error";
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
import { CallStack, StackEntry } from "./callstack";
import { Token } from "../internal/parse/Token";
import { exit } from "process";

export function execute(src: string) {
    const runtime = new Runtime();
    runtime.currentFile = "<anonymous>";

    const interpreter = new Interpreter(runtime);
    loadStdLib((message) => {
        console.error(
            `an error has occurred when loading the stdlib : ${message}`
        );
        exit(1);
    }).then((std) => {
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

    private callStack = new CallStack();

    public interpret(src: string) {
        const reportError: ReportErrorFunc = (
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
                if (maybeToken && maybeSrc && (type === 'syntax' || type === 'internal')) {
                    const snippet =
                        src.split("\n")[maybeToken.line - 1];

                    const arrows =
                        " ".repeat(maybeToken.startCol) +
                        "^".repeat(
                            maybeToken.identifier.length
                        );

                    console.error(snippet);
                    console.error(arrows);

                    console.error(`(${maybeToken.line}) (${this.runtime.currentFile})`);
                    
                    exit(1);
                }
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

        const lexer = new Lexer(src, reportError);
        const tokens = lexer.lex();

        const parser = new Parser(tokens, reportError);
        const ast = parser.parse();

        this.callStack.push(
            new StackEntry(
                this.runtime.currentFile,
                new Token("StartList", "main", undefined, 0, 0)
            )
        );

        const result = stringify(
            this.evaluate(ast, reportError),
            reportError
        );

        console.log(`Result: ${result}`);
    }

    public evaluate(
        expr: Expr,
        reportError: ReportErrorFunc
    ): Symbol {
        if (!expr) {
            return undefined;
        }

        if (expr instanceof ListExpr) {
            return this.evaluateList(expr, reportError);
        } else if (expr instanceof LiteralExpr) {
            return this.evaluateLiteral(expr);
        } else if (expr instanceof SymbolExpr) {
            return this.evaluateSymbol(expr, reportError);
        }

        reportError(`Unkown Expr ${expr}`, "internal");
    }

    private evaluateList(
        expr: ListExpr,
        reportError: ReportErrorFunc
    ) {
        if (
            this.callStack.callAmount >=
            this.runtime.maxStackSize
        ) {
            reportError("Stack overflow", "runtime");
        }

        this.callStack.callAmount++;

        const oldSymbols = this.symbols;
        const [head, ...exprs] = expr.list;

        this.callStack.push(
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
                    reportError(
                        `Symbol ${identifier} was not found`,
                        "runtime"
                    );
                }

                const maybeFn = this.evaluateSymbol(
                    head,
                    reportError
                );

                if (isLispFunction(maybeFn)) {
                    const ctx = new FunctionExecutionContext(
                        this,
                        this.runtime,
                        exprs,
                        maybeFn,
                        reportError
                    );

                    return maybeFn.execute(ctx);
                }

                reportError(
                    `Symbol ${identifier} was not a function`,
                    "runtime"
                );
            }
        } finally {
            this.symbols = oldSymbols;
            this.callStack.pop();
        }

        return expr.list.map((ex) =>
            this.evaluate(ex, reportError)
        );
    }

    private evaluateLiteral(expr: LiteralExpr) {
        return expr.literal as Symbol;
    }

    private evaluateSymbol(
        expr: SymbolExpr,
        reportError: ReportErrorFunc
    ) {
        const id = expr.wrappingToken.identifier;
        if (!this.symbols.has(id)) {
            reportError(
                `Symbol '${id}' does not exist`,
                "runtime"
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
        private readonly fn: LispFunction,
        public readonly reportError: ReportErrorFunc
    ) {}

    get symbols() {
        return this.interpreter.symbols;
    }

    public reduceOne(index: number) {
        return this.interpreter.evaluate(
            this.exprs[index],
            this.reportError
        );
    }

    public reduceAll() {
        return this.exprs.map((ex) =>
            this.interpreter.evaluate(ex, this.reportError)
        );
    }

    public has(index: number) {
        return this.exprs.length > index;
    }

    public arg(index: number) {
        return this.exprs[index];
    }

    public evaluate(expr: Expr): Symbol {
        return this.interpreter.evaluate(
            expr,
            this.reportError
        );
    }

    public interpret(src: string) {
        this.interpreter.interpret(src);
    }

    public setSymbols(newSymbols: SymbolTable) {
        this.interpreter.symbols = newSymbols;
    }

    public error(message: string, type: ErrorType): never {
        this.reportError(message, type);
    }
}
