test('Parsimmon.formatError', function() {
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
