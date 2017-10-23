"use strict";

test("takeWhile", function() {
  var parser = Parsimmon.takeWhile(function(ch) {
    return ch !== ".";
  }).skip(Parsimmon.all);
  assert.equal(parser.parse("abc").value, "abc");
  assert.equal(parser.parse("abc.").value, "abc");
  assert.equal(parser.parse(".").value, "");
  assert.equal(parser.parse("").value, "");
  assert.throws(function() {
    Parsimmon.takeWhile("not a function");
  });
});
