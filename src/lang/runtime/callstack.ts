import type { Token } from "../internal/parse/Token";

export class CallStack {
    public callAmount = 0;
    private readonly stack: StackEntry[] = [];

    public push(entry: StackEntry) {
        this.stack.push(entry);
    }

    public pop(): StackEntry | undefined {
        return this.stack.pop();
    }
}

export class StackEntry {
    constructor(public readonly token: Token) {}
}
