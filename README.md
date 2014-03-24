# cjs-umd

Bundle [CommonJS](http://en.wikipedia.org/wiki/CommonJS) source files into a single [UMD](https://github.com/umdjs/umd) file with the option to define external dependencies that will not be included.

## Why?

Write your library source files with the very convenient `var foo = require('./foo')` and `module.exports = {bar: 'bar'}` syntax.

Combine these source files into a single bundle, that can be used in [Node](http://nodejs.org/), [Browserify](http://browserify.org/), [RequireJS](http://requirejs.org/), or simply via the `window` object.

You can have dependencies like [Lo-Dash](http://lodash.com/) and [Moment.js](Moment.js), but not want to bundle them. Declare them via the `dependencies` option, and they will not be included but fetched via `require`, `define`, or from the `window` object, depending on which environment the bundle is used in.

## Install

Install globally (and use command-line tool directly with `$ cjs-umd`):

```bash
$ npm install -g git://github.com/nicolashery/cjs-umd.git
```

Or locally (command-line tool then available at `$ ./node_modules/.bin/cjs-umd`):

```bash
$ npm install git://github.com/nicolashery/cjs-umd.git
```

## Usage

### Command-line

```bash
$ cjs-umd \
  --input src/index.js \
  --output dist/robot.js \
  --exports robot \
  --dependencies lodash:_,moment
```

### Node

```bash
var bundle = require('cjs-umd');

var options = {
  input: 'src/index.js',
  output: 'dist/robot.js',
  exports: 'robot',
  dependencies: [
    {name: 'lodash', exports: '_'},
    {name: 'moment'}
  ]
};

bundle(options, function(err) {
  if (err) {
    console.error(err.stack);
  }
});
```

## Options

```javascript
{
  input: 'src/index.js',
  output: 'dist/robot.js',

  exports: 'robot',
  // Name to expose on the `window` object

  dependencies: [
    {name: 'lodash', exports: '_'},
    {name: 'moment'}
  ],
  // Optional list of external dependencies you don't want to include in bundle
  // If one exposes a different name on the `window` object, use `exports`

  transform: [],
  // Optional list of transform streams to pass source files through
  // (Not available from command-line tool)

  quoteChar: '\'',
  // Quote character used in your `require()` statements
  // Default: ('),

  requireDepFunctionName: '_requireDep',
  // Name of function used to require external dependencies by `umd-wrap`

  pureCjsTailLengthToReplace: 19
  // Used to tweak the pure-cjs bundle
  // No reason to touch this, but could be usefull if `pure-cjs` changes
}
```

Any other options will be passed to [umd-wrap](https://github.com/nicolashery/umd-wrap).

## How does it work?

1. Source files are searched for `require('lodash')` statements (for each dependency defined in `dependencies` option), and replaced with a custom function `_requireDep('lodash')`.

2. Everything is compiled into a single bundle thanks to the [pure-cjs](https://github.com/RReverser/pure-cjs) builder.

3. The pure-cjs bundle is wrapped in a UMD statement using [umd-wrap](https://github.com/nicolashery/umd-wrap).

## Examples

To run the examples you will need to clone this repo and install dependencies:

```bash
$ git clone https://github.com/nicolashery/cjs-umd.git
$ cd cjs-umd/
$ npm install
```

### Bundle

```bash
$ cd examples/
# Using the command-line tool
$ . make-bundle.sh
# Using the Node API
$ node make-bundle.js
```

### Node

```bash
$ cd examples/node/
$ node run
```

### Global (`window`)

Open the `examples/global/index.html` in a browser and look at the console output.

### Browserify

You need to have Browserify installed:

```bash
$ npm install -g browserify
```

Create the Browserify bundle:

```bash
$ cd examples/browserify/
$ . make-bundle.sh
```

Open the `examples/browserify/index.html` in a browser and look at the console output.

### RequireJS

You need to have RequireJS installed:

```bash
$ npm install -g requirejs
```

Create the RequireJS bundle:

```bash
$ cd examples/requirejs/
$ . make-bundle.sh
```

Open the `examples/requirejs/index.html` in a browser and look at the console output.

## License

MIT