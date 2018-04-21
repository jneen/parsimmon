"use strict";

suite("fantasy-land/* method aliases", function() {
  function makeTester(name) {
    return function() {
      var flName = "fantasy-land/" + name;
      var parser = Parsimmon.of("burrito");
      assert.ok(parser[name]);
      assert.ok(parser[flName]);
    };
  }
  var methods = ["ap", "chain", "concat", "empty", "map", "of", "empty"];
  for (var i = 0; i < methods.length; i++) {
    test("fantasy-land/" + methods[i] + " alias", makeTester(methods[i]));
  }

  test("Fantasy Land Parsimmon.of alias", function() {
    assert.ok(Parsimmon.of);
    assert.ok(Parsimmon.any.of);
  });
});
