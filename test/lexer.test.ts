import { expect } from "chai";
import { describe, it, xit } from "mocha";
import { Lexer } from "../src/lang/internal/parse/Lexer";
import { Token } from "../src/lang/internal/parse/Token";
import { LanguageError, newRuntime } from "./util";

const runtime = newRuntime();
const newLexer = (src: string) => new Lexer(src, runtime);

const expectLexerError = (lexer: Lexer) => {
    expect(lexer.lex.bind(lexer)).to.throw(LanguageError);
};

describe("lexer tests", () => {
    it("has an unclosed string", () => {
        expectLexerError(newLexer(`(")`));
    });

    it("has an unclosed list", () => {
        expectLexerError(newLexer("("));
    });

    it("has an empty list", () => {
        const toks = newLexer("()").lex();

        expect(toks).not.empty;

        expect(toks[0]).to.deep.equal(
            new Token("StartList", "(", undefined, 1, 0, "<anonymous>", "<nptr>")
        );
        expect(toks[1]).to.deep.equal(
            new Token("EndList", ")", undefined, 1, 1, "<anonymous>", "<nptr>")
        );
        expect(toks[2]).to.deep.equal(
            new Token("Eof", "eof", undefined, 1, 1, "<anonymous>", "<nptr>")
        );
    });

    it("has a list with 1 integer", () => {
        const toks = newLexer("(1)").lex();

        expect(toks).not.empty;

        expect(toks[0]).to.deep.equal(
            new Token("StartList", "(", undefined, 1, 0, "<anonymous>", "<nptr>")
        );
        expect(toks[1]).to.deep.equal(new Token("Integer", "1", 1, 1, 1, "<anonymous>", "<nptr>"));
        expect(toks[2]).to.deep.equal(
            new Token("EndList", ")", undefined, 1, 2, "<anonymous>", "<nptr>")
        );
        expect(toks[3]).to.deep.equal(
            new Token("Eof", "eof", undefined, 1, 2, "<anonymous>", "<nptr>")
        );
    });

    it("has a list with 2 integers", () => {
        const toks = newLexer("(1 2)").lex();

        expect(toks).not.empty;

        expect(toks[0]).to.deep.equal(
            new Token("StartList", "(", undefined, 1, 0, "<anonymous>", "<nptr>")
        );
        expect(toks[1]).to.deep.equal(new Token("Integer", "1", 1, 1, 1, "<anonymous>", "<nptr>"));

        // space

        expect(toks[2]).to.deep.equal(new Token("Integer", "2", 2, 1, 3, "<anonymous>", "<nptr>"));
        expect(toks[3]).to.deep.equal(
            new Token("EndList", ")", undefined, 1, 4, "<anonymous>", "<nptr>")
        );
        expect(toks[4]).to.deep.equal(
            new Token("Eof", "eof", undefined, 1, 4, "<anonymous>", "<nptr>")
        );
    });

    it("has a list with 1 large value integer", () => {
        const toks = newLexer("(123456789)").lex();

        expect(toks).not.empty;

        expect(toks[0]).to.deep.equal(
            new Token("StartList", "(", undefined, 1, 0, "<anonymous>", "<nptr>")
        );
        expect(toks[1]).to.deep.equal(
            new Token("Integer", "123456789", 123456789, 1, 1, "<anonymous>", "<nptr>")
        );
        expect(toks[2]).to.deep.equal(
            new Token("EndList", ")", undefined, 1, 10, "<anonymous>", "<nptr>")
        );
        expect(toks[3]).to.deep.equal(
            new Token("Eof", "eof", undefined, 1, 10, "<anonymous>", "<nptr>")
        );
    });

    it("has a list with 1 symbol and no arguments", () => {
        const toks = newLexer("(sym)").lex();

        expect(toks[0]).to.deep.equal(
            new Token("StartList", "(", undefined, 1, 0, "<anonymous>", "<nptr>")
        );
        expect(toks[1]).to.deep.equal(
            new Token("Symbol", "sym", "sym", 1, 1, "<anonymous>", "<nptr>")
        );
        expect(toks[2]).to.deep.equal(
            new Token("EndList", ")", undefined, 1, 4, "<anonymous>", "<nptr>")
        );
        expect(toks[3]).to.deep.equal(
            new Token("Eof", "eof", undefined, 1, 4, "<anonymous>", "<nptr>")
        );
    });

    it("has a list with 1 symbol and 1 argument", () => {
        const toks = newLexer('(sym "arg")').lex();

        expect(toks[0]).to.deep.equal(
            new Token("StartList", "(", undefined, 1, 0, "<anonymous>", "<nptr>")
        );
        expect(toks[1]).to.deep.equal(
            new Token("Symbol", "sym", "sym", 1, 1, "<anonymous>", "<nptr>")
        );

        // space

        expect(toks[2]).to.deep.equal(
            new Token("String", "arg", "arg", 1, 6, "<anonymous>", "<nptr>")
        );
        expect(toks[3]).to.deep.equal(
            new Token("EndList", ")", undefined, 1, 10, "<anonymous>", "<nptr>")
        );
        expect(toks[4]).to.deep.equal(
            new Token("Eof", "eof", undefined, 1, 10, "<anonymous>", "<nptr>")
        );
    });

    xit("has a module definition with no exports", () => {});

    xit("has a module definition with 1 function export", () => {});

    xit("has a module definition with 1 function export and 1 named export", () => {});
});
