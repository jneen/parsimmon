suite('skip', function() {

  test('uses the previous return value', function() {
    var parser = Parsimmon.string('x').skip(Parsimmon.string('y'));
    assert.deepStrictEqual(
      parser.parse('xy'),
      {status: true, value: 'x'}
    );
    assert.strictEqual(
      parser.parse('x').status,
      false
    );
  });

  test('asserts that a parser was given', function() {
    assert.throws(function() {
      Parsimmon.string('x').skip('not a parser');
    });
  });

});
