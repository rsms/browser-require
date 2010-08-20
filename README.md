# browser-require

CommonJS module `require` for web browsers.

## Examples and usage

Firt off, you need to load `require.js` -- i.e. `<script src="require.js"></script>` -- then...

### Embedded module definitions

    <script>
    require.define('foo', function(require, module, exports){
      exports.hello = "hello from the foo module";
    });
    var foo = require('foo');
    alert(foo.hello);
    </script>

> Pssst! You can find more examples in the `example` directory.

### Loading (and defining) remote modules

foo.js

    exports.hello = "hello from the foo module";

index.html

    <script>
    require.load('foo.js', function (err) {
      if (err) throw err;
      var foo = require('foo');
      alert(foo.hello);
    });
    </script>

#### Multiple remote modules can be loaded in parallel

    <script>
    require.load([
      'foo.js',
      'bar/baz.js',
      {id: 'user-agent', url:'http://internets.com/lib/ua.js'}
      {'http://moset.com/strkit/formatting.js'}
    ], function (err) {
      if (err) throw err;
      var foo = require('foo'),
          baz = require('bar/baz'),
          userAgent = require('user-agent'),
          formatting = require('strkit/formatting');
      alert(foo.hello);
      // ...
    });
    </script>

#### Remote modules can also be loaded synchronously

> **Warning:** synchronous loading will block until they complete. This should only be used when loading files from reliable/fast sources (like localhost or file://).

    <script>
    require.load(['foo.js', 'bar/baz.js']);
    var foo = require('foo'),
        baz = require('bar/baz');
    alert(foo.hello);
    // ...
    </script>

## MIT license

Copyright (c) 2010 Rasmus Andersson <http://hunch.se/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
