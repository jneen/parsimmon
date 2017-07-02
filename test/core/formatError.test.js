'use strict';

suite('formatError', function() {

  test('end of input', function() {
    var parser =
      Parsimmon.alt(
        Parsimmon.fail('a'),
        Parsimmon.fail('b'),
        Parsimmon.fail('c')
      );
    var expectation = 'expected one of a, b, c, got the end of the input';
    var input = '';
    var answer = Parsimmon.formatError(input, parser.parse(input));
    assert.deepEqual(answer, expectation);
  });

  test('middle of input', function() {
    var parser =
      Parsimmon.seq(
        Parsimmon.string('1'),
        Parsimmon.alt(
          Parsimmon.fail('a'),
          Parsimmon.fail('b'),
          Parsimmon.fail('c')
        )
      );
    var expectation =
      'expected one of a, b, c at line 1 column 2, got \'...x11111111111...\'';
    var input = '1x1111111111111111111111111111';
    var answer = Parsimmon.formatError(input, parser.parse(input));
    assert.deepEqual(answer, expectation);
  });

});
