'use strict';

suite('takeWhile', function() {

  test('should work in general', function() {
    var parser =
      Parsimmon.takeWhile(function(ch) {
        return ch !== '.';
      }).skip(Parsimmon.all);
    assert.equal(parser.parse('abc').value, 'abc');
    assert.equal(parser.parse('abc.').value, 'abc');
    assert.equal(parser.parse('.').value, '');
    assert.equal(parser.parse('').value, '');
    assert.throws(function() {
      Parsimmon.takeWhile('not a function');
    });
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
    var parser = Parsimmon.takeWhile(function(str) {
      return str < 'c';
    });
    test(0)
      .then(inc)
      .then(parser)
      .skip(test(1))
      .then(Parsimmon.string('c'))
      .tryParse('abc', 0);
  });

});
