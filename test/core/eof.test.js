'use strict';

suite('eof', function() {

  test('should work in general', function() {
    var parser =
      Parsimmon.optWhitespace
        .skip(Parsimmon.eof)
        .or(Parsimmon.all.result('default'));

    assert.equal(parser.parse('  ').value, '  ');
    assert.equal(parser.parse('x').value, 'default');
  });

  test('should pass state through', function() {
    function test(n) {
      return Parsimmon(function(input, i, state) {
        assert.strictEqual(state, n);
        return Parsimmon.makeSuccess(i, undefined, state);
      });
    }
    test(10)
      .then(Parsimmon.eof)
      .then(test(10))
      .tryParse('', 10);
  });

});
