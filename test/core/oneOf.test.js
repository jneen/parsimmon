"use strict";

suite("oneOf", function() {
  test("matches ONLY the characters specified", function() {
    var parser = Parsimmon.oneOf("abc");
    var a = "a".charCodeAt(0);
    var c = "c".charCodeAt(0);
    for (var i = 0; i < 255; i++) {
      var s = String.fromCharCode(i);
      if (a <= i && i <= c) {
        assert.strictEqual(parser.parse(s).status, true);
      } else {
        assert.strictEqual(parser.parse(s).status, false);
      }
    }
  });
});
