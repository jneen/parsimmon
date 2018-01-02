"use strict";

suite("Parsimmon.range", function() {
  var codes = {
    a: "a".charCodeAt(0),
    z: "z".charCodeAt(0),
    MIN: 0,
    MAX: 255
  };
  var a2z = Parsimmon.range("a", "z");

  test("should reject characters before the range", function() {
    for (var i = codes.MIN; i < codes.a; i++) {
      var s = String.fromCharCode(i);
      assert.strictEqual(a2z.parse(s).status, false);
    }
  });

  test("should reject characters after the range", function() {
    for (var i = codes.z + 1; i <= codes.MAX; i++) {
      var s = String.fromCharCode(i);
      assert.strictEqual(a2z.parse(s).status, false);
    }
  });

  test("should accept characters in the range", function() {
    for (var i = codes.a; i <= codes.z; i++) {
      var s = String.fromCharCode(i);
      assert.strictEqual(a2z.parse(s).status, true);
    }
  });
});
