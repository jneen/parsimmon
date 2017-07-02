'use strict';

suite('Parsimmon.createLanguage', function() {

  setup(function() {
    Object.prototype.NASTY = 'dont extend Object.prototype please';
  });

  teardown(function() {
    delete Object.prototype.NASTY;
  });

  test('should return an object of parsers', function() {
    var lang = Parsimmon.createLanguage({
      a: function() {
        return Parsimmon.string('a');
      },
      b: function() {
        return Parsimmon.string('b');
      }
    });
    assert.ok(Parsimmon.isParser(lang.a));
    assert.ok(Parsimmon.isParser(lang.b));
  });

  test('should allow direct recursion in parsers', function() {
    var lang = Parsimmon.createLanguage({
      Parentheses: function(r) {
        return Parsimmon.alt(
          Parsimmon.string('()'),
          Parsimmon.string('(')
            .then(r.Parentheses)
            .skip(Parsimmon.string(')'))
        );
      }
    });
    lang.Parentheses.tryParse('(((())))');
  });

  test('should ignore non-own properties', function() {
    var obj = Object.create({
      foo: function() {
        return Parsimmon.of(1);
      }
    });
    var lang = Parsimmon.createLanguage(obj);
    assert.strictEqual(lang.foo, undefined);
  });

  test('should allow indirect recursion in parsers', function() {
    var lang = Parsimmon.createLanguage({
      Value: function(r) {
        return Parsimmon.alt(
          r.Number,
          r.Symbol,
          r.List
        );
      },
      Number: function() {
        return Parsimmon.regexp(/[0-9]+/).map(Number);
      },
      Symbol: function() {
        return Parsimmon.regexp(/[a-z]+/);
      },
      List: function(r) {
        return Parsimmon.string('(')
          .then(Parsimmon.sepBy(r.Value, r._))
          .skip(Parsimmon.string(')'));
      },
      _: function() {
        return Parsimmon.optWhitespace;
      }
    });
    lang.Value.tryParse('(list 1 2 foo (list nice 3 56 989 asdasdas))');
  });

});
