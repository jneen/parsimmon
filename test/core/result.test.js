suite('result', function() {

  test('returns a constant result', function() {
    var oneParser = Parsimmon.string('x').result(1);
    assert.deepEqual(
      oneParser.parse('x'),
      {status: true, value: 1}
    );
  });

});
