'use strict';

suite('test', function() {

  test('it works in general', function() {
    var parser = Parsimmon.test(function(ch) { return ch !== '.'; });
    assert.equal(parser.parse('x').value, 'x');
    assert.equal(parser.parse('.').status, false);
    assert.throws(function() { Parsimmon.test('not a function'); });
  });

  test('should pass state through unchanged', function() {
    function test(n) {
      return Parsimmon(function(input, i, state) {
        assert.strictEqual(state, n);
        return Parsimmon.makeSuccess(i, undefined, state);
      });
    }
    var inc = Parsimmon(function(input, i, state) {
      return Parsimmon.makeSuccess(i, null, state + 1);
    });
    var parser = Parsimmon.test(function(str) {
      return str === 'b';
    });
    test(0)
      .then(inc)
      .then(parser)
      .skip(test(1))
      .tryParse('b', 0);
  });

});
