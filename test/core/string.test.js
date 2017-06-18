test('Parsimmon.string', function() {
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
