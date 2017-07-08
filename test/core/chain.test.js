'use strict';

suite('chain', function() {

  test('asserts that a parser is returned', function() {
    var parser1 = Parsimmon.letter.chain(function() { return 'not a parser'; });
    assert.throws(function() { parser1.parse('x'); });

    assert.throws(function() { Parsimmon.letter.then('x'); });
  });

  test('with a function that returns a parser, continues with that parser', function() {
    var piped;
    var parser = Parsimmon.string('x').chain(function(x) {
      piped = x;
      return Parsimmon.string('y');
    });

    assert.deepEqual(parser.parse('xy'), {status: true, value: 'y'});
    assert.equal(piped, 'x');
    assert.ok(!parser.parse('x').status);
  });

  test('should pass state through', function() {
    function test(n) {
      return Parsimmon(function(input, i, state) {
        assert.strictEqual(state, n);
        return Parsimmon.makeSuccess(i, undefined, state);
      });
    }
    function always10() {
      return 10;
    }
    var inc = Parsimmon(function(input, i, state) {
      return Parsimmon.makeSuccess(i, null, state + 1);
    });
    Parsimmon.any.chain(function() {
      return test()
    })
    test(0).then(Parsimmon.any.map(always10)).skip(test(0)).tryParse('a', 0);
    inc.then(Parsimmon.any.map(always10)).skip(test(1)).tryParse('b', 0);
  });

});
