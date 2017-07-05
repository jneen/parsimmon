'use strict';

suite('Parsimmon.string', function() {

  test('should work in general', function() {
    var parser = Parsimmon.string('x');
    var res = parser.parse('x');
    assert.ok(res.status);
    assert.equal(res.value, 'x');

    res = parser.parse('y');
    assert.deepEqual(res, {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1
      },
      expected: ['\'x\'']
    });

    assert.equal(
      'expected \'x\' at line 1 column 1, got \'y\'',
      Parsimmon.formatError('y', res)
    );

    assert.throws(function() { Parsimmon.string(34); });
  });

  test('should pass state through', function() {
    function test(n) {
      return Parsimmon(function(input, i, state) {
        assert.strictEqual(state, n);
        return Parsimmon.makeSuccess(i, undefined, state);
      });
    }
    var inc = Parsimmon(function(input, i, state) {
      return Parsimmon.makeSuccess(i, null, state + 1);
    });
    var parser = Parsimmon.string('a');
    test(0).then(parser).skip(test(0)).tryParse('a', 0);
    inc.then(parser).skip(test(1)).tryParse('a', 0);
  });

});
