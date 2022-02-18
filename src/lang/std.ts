import { RuntimeError } from "./error";
import { Expr, LiteralExpr } from "./Expr";
import type { Interpreter } from "./Interpreter";
import { requireLiteral, requireString } from "./util";

export type StdFunction = {
    name: string,
    run: (this: Interpreter, ...args: Expr[]) => void
}

export const stdprint: StdFunction = {
    name: "print",
    run: function (...args) {
        args.map(this.evaluate.bind(this))
            .map(this.stringify.bind(this))
            .forEach(v => console.log(v))
    }
}

export const stddef: StdFunction = {
    name: "def",
    run: function (...args) {
        const key = requireString(
            requireLiteral(
                args[0], "'def' key was not a literal"
            ).literal, "'def' key was not a string"
        )

        const value = this.evaluate(args[1])

        this.symbolTable.set(key, value)
    }
}

export const stdget: StdFunction = {
    name: "get",
    run: function (...args) {
        const maybeKey = args[0]
        
        if (!(maybeKey instanceof LiteralExpr) || typeof maybeKey.literal !== 'string') {
            throw new RuntimeError("'get' key was not a string")
        }
        
        return this.symbolTable.get(maybeKey.literal)
    }
}