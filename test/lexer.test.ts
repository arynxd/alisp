import { expect } from 'chai'
import { describe, it } from 'mocha'
import { Lexer } from '../src/lang/internal/parse/Lexer'
import { LanguageError, newRuntime } from './util'

const runtime = newRuntime()
const newLexer = (src: string) => new Lexer(src, runtime)

const expectLexerError = (lexer: Lexer) => {
    expect(lexer.lex.bind(lexer)).to.throw(LanguageError)
}

describe("lexer tests", () => {
    it("has an unclosed string", () => {
        expectLexerError(newLexer(`(")`))
    })

    it("has an invalid number literal", () => {
        expectLexerError(newLexer(`(2.1)`))
    })
})