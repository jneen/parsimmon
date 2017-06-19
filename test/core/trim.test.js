'use strict';

suite('parser.trim', function() {

  test('should remove stuff from the begin and end', function() {
    var parser = Parsimmon.letters.trim(Parsimmon.whitespace);
    var value = parser.tryParse('\t\n NICE    \t\t ');
    assert.strictEqual(value, 'NICE');
  });

});
