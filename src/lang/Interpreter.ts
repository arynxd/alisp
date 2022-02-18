import { RuntimeError } from "./error";
import { Expr, ListExpr, LiteralExpr, SymbolExpr } from "./Expr";
import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { stddef, stdget, stdprint } from "./std";

type VarType = number | Function | void | undefined | null | VarType[]

export class Interpreter {
    constructor(public readonly src: string) { }
    
    public readonly symbolTable = new Map<string, VarType>()

    public interpret() {
        this.initStd()

        const lexer = new Lexer(this.src)
        const tokens = lexer.lex()

        const parser = new Parser(tokens)
        const ast = parser.parse()

        const result = this.stringify(this.evaluate(ast))
        console.log(`Result: ${result}`);
    }

    private initStd() {
        const stdlib = [
            stdprint,
            stddef,
            stdget
        ]

        stdlib.forEach(fn => {
            if (this.symbolTable.has(fn.name)) {
                throw new RuntimeError(`Redefinition of symbol ${fn.name}`)
            }

            this.symbolTable.set(fn.name, fn.run)
        })
    }

    public evaluate(expr: Expr): VarType {
        if (!expr) {
            return undefined
        }

        if (expr instanceof ListExpr) {
            return this.evaluateList(expr)
        }
        else if (expr instanceof LiteralExpr) {
            return this.evaluateLiteral(expr)
        }
        else if (expr instanceof SymbolExpr) {
            return this.evaluateSymbol(expr)
        }
        
        throw new RuntimeError(`Unkown Expr ${expr}`)
    }

    private evaluateList(expr: ListExpr) {
        const [head, ...args] = expr.rest

        if (head instanceof SymbolExpr) {
            const identifier = head.wrappingToken.identifier

            if (!this.symbolTable.has(identifier)) {
                throw new RuntimeError(`Symbol ${identifier} was not found`)
            }

            const maybeFn = this.evaluateSymbol(head)
           
            if (typeof maybeFn === "function") {
                return maybeFn.call(this, ...args) as VarType
            }
            
            throw new RuntimeError(`Symbol ${identifier} was not a function`)
        }
        
        return expr.rest.map(this.evaluate.bind(this))
    }

    private evaluateLiteral(expr: LiteralExpr) {
        return expr.literal as VarType
    }

    private evaluateSymbol(expr: SymbolExpr) {
        return this.symbolTable.get(expr.wrappingToken.identifier)
    }
    
    public stringify(v: unknown): string {
        if (typeof v === "function") return `fn ${v.name || "(anonymous)"}>`;

        if (typeof v === "string") return v.toString();

        if (typeof v === "number") return v.toString();

        if (typeof v === "boolean") return v.toString();

        if (Array.isArray(v)) return `(${v.map(this.stringify.bind(this)).join(" ")})`;

        if (v === null || v === undefined) return "nil";

        throw new RuntimeError(`Attempted to stringify unhandled type of value ${v}`);
    }
}