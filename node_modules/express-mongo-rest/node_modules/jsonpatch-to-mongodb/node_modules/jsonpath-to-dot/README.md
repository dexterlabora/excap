# jsonpath-to-dot

[![build status](https://secure.travis-ci.org/imlucas/jsonpath-to-dot.png)](http://travis-ci.org/imlucas/jsonpath-to-dot)

Convert a JSONPath into dotnotation.

## Example

```javascript
var toDot = require('jsonpath-to-dot');
console.log(toDot('/tags'));
// 'tags'
console.log(toDot('/tags/1'));
// 'tags'
console.log(toDot('/tags/blah'));
// 'tags.blah'
```

## Install

```
npm install --save jsonpath-to-dot
```

## Test

```
npm test
```

## License

MIT
