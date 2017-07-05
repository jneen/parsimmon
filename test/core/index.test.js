'use strict';

suite('index', function() {

  test('should work in general', function() {
    var parser = Parsimmon.regexp(/^[x\n]*/).then(Parsimmon.index);
    assert.deepEqual(parser.parse('').value, {
      offset: 0,
      line: 1,
      column: 1
    });
    assert.deepEqual(parser.parse('xx').value, {
      offset: 2,
      line: 1,
      column: 3
    });
    assert.deepEqual(parser.parse('xx\nxx').value, {
      offset: 5,
      line: 2,
      column: 3
    });
  });

  test('should pass state through', function() {
    function test(n) {
      return Parsimmon(function(input, i, state) {
        assert.strictEqual(state, n);
        return Parsimmon.makeSuccess(i, undefined, state);
      });
    }
    test(10)
      .then(Parsimmon.index)
      .then(test(10))
      .tryParse('', 10);
  });

});
