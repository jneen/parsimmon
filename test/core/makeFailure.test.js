'use strict';

test('Parsimmon.makeFailure', function() {
  var furthest = 4444;
  var expected = 'waiting in the clock tower';
  var result = Parsimmon.makeFailure(furthest, expected, undefined);
  assert.deepEqual(result, {
    status: false,
    index: -1,
    value: null,
    furthest: furthest,
    expected: [expected],
    state: undefined
  });
});
