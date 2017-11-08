"use strict";

test("Parsimmon.isParser", function() {
  assert.strictEqual(Parsimmon.isParser(undefined), false);
  assert.strictEqual(Parsimmon.isParser({}), false);
  assert.strictEqual(Parsimmon.isParser(null), false);
  assert.strictEqual(Parsimmon.isParser(Parsimmon.string("x")), true);
  assert.strictEqual(Parsimmon.isParser(Parsimmon.regexp(/[0-9]/)), true);
});
