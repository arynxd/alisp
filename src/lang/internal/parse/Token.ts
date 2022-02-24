export type TokenType =
    | "StartList"
    | "EndList"
    | "Symbol"
    | "String"
    | "Integer"
    | "NullPtr"
    | "Boolean"
    | "Eof";

export class Token {
    constructor(
        public readonly type: TokenType,
        public readonly identifier: string,
        public readonly value: unknown,
        public readonly line: number,
        public readonly startCol: number,
        public readonly filePath: string,
        public readonly containingSrc: string
    ) {}

    get endCol() {
        return this.startCol + this.identifier.length;
    }
}
