'use strict';

suite('Parsimmon.seq', function() {

  test('should work in general', function() {
    var parser =
      Parsimmon.seq(
        Parsimmon.string('('),
        Parsimmon.regexp(/[^)]/).many().map(function(xs) {
          return xs.join('');
        }),
        Parsimmon.string(')')
      );

    assert.deepEqual(
      parser.parse('(string between parens)').value,
      ['(', 'string between parens', ')']
    );

    assert.deepEqual(
      parser.parse('(string'),
      {
        status: false,
        index: {
          offset: 7,
          line: 1,
          column: 8
        },
        expected: ['\')\'', '/[^)]/']
      }
    );

    assert.deepEqual(
      parser.parse('starts wrong (string between parens)'),
      {
        status: false,
        index: {
          offset: 0,
          line: 1,
          column: 1
        },
        expected: ['\'(\'']
      }
    );

    assert.throws(function() {
      Parsimmon.seq('not a parser');
    });
  });

  test('should pass state through each parser', function() {
    function test(n) {
      return Parsimmon(function(input, i, state) {
        assert.strictEqual(state, n);
        return Parsimmon.makeSuccess(i, undefined, state);
      });
    }
    var inc = Parsimmon(function(input, i, state) {
      return Parsimmon.makeSuccess(i, null, state + 1);
    });
    var parser = Parsimmon.seq(
      test(0).then(inc).then(Parsimmon.any).skip(test(1)),
      test(1).then(inc).then(Parsimmon.any).skip(test(2)),
      test(2).then(inc).then(Parsimmon.any).skip(test(3))
    ).then(test(3));
    parser.tryParse('abc', 0);
  });

});
