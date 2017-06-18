test('Parsimmon.makeSuccess', function() {
  var index = 11;
  var value = 'a lucky number';
  var result = Parsimmon.makeSuccess(index, value);
  assert.deepEqual(result, {
    status: true,
    index: index,
    value: value,
    furthest: -1,
    expected: []
  });
});
