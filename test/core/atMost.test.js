'use strict';

test('atMost', function() {
  var atMostTwo = Parsimmon.letter.atMost(2);
  assert.deepEqual(atMostTwo.parse('').value, []);
  assert.deepEqual(atMostTwo.parse('a').value, ['a']);
  assert.deepEqual(atMostTwo.parse('ab').value, ['a', 'b']);
  assert.ok(!atMostTwo.parse('abc').status);
});
