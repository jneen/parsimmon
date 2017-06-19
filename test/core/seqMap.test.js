'use strict';

suite('Parsimmon.seqMap', function() {

  test('like Parsimmon.seq and .map but spreads arguments', function() {
    var add = function(a, b) { return a + b; };
    var parser = Parsimmon.seqMap(Parsimmon.of(1), Parsimmon.of(2), add);
    assert.equal(parser.parse('').value, 3);
  });

  test('works for 1 arguments', function() {
    var parser = Parsimmon.seqMap(function() { return 10; });
    assert.equal(parser.parse('').value, 10);
  });

  test('works for 100 arguments', function() {
    var sum = function() {
      var tot = 0;
      for (var i = 0; i < arguments.length; i++) {
        tot += arguments[i];
      }
      return tot;
    };
    var args = [];
    for (var i = 1; i <= 100; i++) {
      args.push(Parsimmon.of(i));
    }
    args.push(sum);
    var parser = Parsimmon.seqMap.apply(null, args);
    assert.equal(parser.parse('').value, 5050);
  });

  test('asserts the final argument is a function', function() {
    Parsimmon.seqMap(function() {});
    assert.throws(function() {
      Parsimmon.seqMap(1);
    });
  });

  test('asserts at least 1 argument', function() {
    assert.throws(function() {
      Parsimmon.seqMap();
    });
  });

});
