"use strict";

testSetScenario(function() {
  describe("flags()", function() {
    it("works in modern browsers", function() {
      assert.throws(function() {
        Parsimmon.regexp(new RegExp("a", "g"));
      });
      assert.doesNotThrow(function() {
        Parsimmon.regexp(new RegExp("a", "i"));
      });
      assert.doesNotThrow(function() {
        Parsimmon.regexp(new RegExp("a", "m"));
      });
      assert.doesNotThrow(function() {
        Parsimmon.regexp(new RegExp("a", "u"));
      });
      assert.throws(function() {
        Parsimmon.regexp(new RegExp("a", "y"));
      });
    });

    it("works on legacy browsers without Regexp.flags property with flags", function() {
      var oldRegExpG = new RegExp("a", "g");
      var oldRegExpI = new RegExp("a", "i");
      var oldRegExpM = new RegExp("a", "m");
      var oldRegExpU = new RegExp("a", "u");
      var oldRegExpY = new RegExp("a", "y");
      var oldRegExps = [
        oldRegExpG,
        oldRegExpI,
        oldRegExpM,
        oldRegExpU,
        oldRegExpY
      ];

      // Simulate old RegExp without the flags property
      oldRegExps.map(function(r) {
        Object.defineProperty(r, "flags", { value: undefined });
        assert.strictEqual(r.flags, undefined);
      });

      assert.throws(function() {
        Parsimmon.regexp(oldRegExpG);
      });
      assert.doesNotThrow(function() {
        Parsimmon.regexp(oldRegExpI);
      });
      assert.doesNotThrow(function() {
        Parsimmon.regexp(oldRegExpM);
      });
      assert.doesNotThrow(function() {
        Parsimmon.regexp(oldRegExpU);
      });
      assert.throws(function() {
        Parsimmon.regexp(oldRegExpY);
      });
    });

    it("works on legacy browsers without Regexp.flags property without flags", function() {
      var oldRegExp = new RegExp("a", "");

      // Simulate old RegExp without the flags property
      Object.defineProperty(oldRegExp, "flags", { value: undefined });
      assert.strictEqual(oldRegExp.flags, undefined);

      assert.doesNotThrow(function() {
        Parsimmon.regexp(oldRegExp);
      });
    });
  });
});
