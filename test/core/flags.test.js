"use strict";

testSetScenario(function() {
  describe("Parsimmon.flags()", function() {
    it("works in modern browsers", function() {
      var flags = Parsimmon.flags(/a/gim);
      assert.strictEqual(flags, "gim");
    });

    it("works on legacy browsers without Regexp.flags property", function() {
      var oldRegExp = /a/gim;

      // Simulate old RegExp without the flags property
      Object.defineProperty(oldRegExp, "flags", { value: undefined });
      assert.strictEqual(oldRegExp.flags, undefined);

      var flags = Parsimmon.flags(oldRegExp);
      assert.strictEqual(flags, "gim");
    });
  });
});
