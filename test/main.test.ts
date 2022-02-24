import { expect } from 'chai'
import { describe, it } from 'mocha'

describe.skip("sanity checks", () => {
    it("should pass", () => {
        expect(undefined, "undefined").to.be.undefined
    })
    it("should fail", () => {
        expect(undefined, "undefined").to.not.be.undefined
    })
})