import { optWhitespace } from '../..';
import json from './structures';

let parser = optWhitespace.then(json);

var source = process.argv[2] || __dirname+'/../../package.json';
var result = parser.parse(require('fs').readFileSync(source, 'utf-8'));

console.log(result);
