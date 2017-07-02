'use strict';

test('Parsimmon.alt', function(){
  var toNode = function(nodeType){
    return function(value) {
      return {type: nodeType, value: value};
    };
  };

  var stringParser = Parsimmon.seq(
    Parsimmon.string('"'),
    Parsimmon.regexp(/[^"]*/),
    Parsimmon.string('"')
  ).map(toNode('string'));

  var identifierParser =
    Parsimmon.regexp(/[a-zA-Z]*/)
      .map(toNode('identifier'));

  var parser = Parsimmon.alt(stringParser, identifierParser);

  assert.deepEqual(
    parser.parse('"a string, to be sure"').value,
    {
      type: 'string',
      value: ['"', 'a string, to be sure', '"']
    }
  );

  assert.deepEqual(
    parser.parse('anIdentifier').value,
    {
      type: 'identifier',
      value: 'anIdentifier'
    }
  );

  assert.throws(function() {
    Parsimmon.alt('not a parser');
  });


  assert.strictEqual(Parsimmon.alt().parse('').status, false);
});
