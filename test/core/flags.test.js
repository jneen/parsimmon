"use strict";

testSetScenario(function() {
  describe("Parsimmon.flags()", function() {
    it("works in modern browsers", function() {
      var flags = Parsimmon.flags(new RegExp("a", "gimuy"));
      assert.strictEqual(flags, "gimuy");
    });

    it("works on legacy browsers without Regexp.flags property with flags", function() {
      var oldRegExp = new RegExp("a", "gimuy");

      // Simulate old RegExp without the flags property
      Object.defineProperty(oldRegExp, "flags", { value: undefined });
      assert.strictEqual(oldRegExp.flags, undefined);

      var flags = Parsimmon.flags(oldRegExp);
      assert.strictEqual(flags, "gimuy");
    });

    it("works on legacy browsers without Regexp.flags property without flags", function() {
      var oldRegExp = new RegExp("a", "");

      // Simulate old RegExp without the flags property
      Object.defineProperty(oldRegExp, "flags", { value: undefined });
      assert.strictEqual(oldRegExp.flags, undefined);

      var flags = Parsimmon.flags(oldRegExp);
      assert.strictEqual(flags, "");
    });
  });
});
