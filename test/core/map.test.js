'use strict';

suite('map', function() {

  test('with a function, pipes the value in and uses that return value', function() {
    var piped;
    var parser =
      Parsimmon.string('x')
        .map(function(x) {
          piped = x;
          return 'y';
        });
    assert.deepEqual(
      parser.parse('x'),
      {status: true, value: 'y'}
    );
    assert.equal(piped, 'x');
  });

  test('asserts that a function was given', function() {
    assert.throws(function() {
      Parsimmon.string('x').map('not a function');
    });
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
    test(0).then(Parsimmon.any.map(always10)).skip(test(0)).tryParse('a', 0);
    inc.then(Parsimmon.any.map(always10)).skip(test(1)).tryParse('b', 0);
  });

});
