"use strict";

testSetScenario(function() {
  describe("parser.wrap", function() {
    it("should remove different stuff from the begin and end", function() {
      var lParen = Parsimmon.string("(");
      var rParen = Parsimmon.string(")");
      var parser = Parsimmon.letters.wrap(lParen, rParen);
      var value = parser.tryParse("(heyyy)");
      assert.strictEqual(value, "heyyy");
    });
  });
});
