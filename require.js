// CommonJS compatible module loading.
// (Except from require.paths, it's compliant with spec 1.1.1.)
this.require = (function(){
  // require/load/import a module
  // require(id[, parentId]) -> [object module-api]
  // @throws Error /module not found (json-rep-of-id)/
  function require (id, parentId) {
    var originalInputId = id; // for "not found" error message
    if (id.charAt(0) === '.') {
      id = normalizeId(id, parentId);
    }
    if (!require.modules.hasOwnProperty(id)) {
      throw new Error('module not found '+JSON.stringify(originalInputId));
    }
    var mod = require.modules[id];
    if (mod.exports === undefined) {
      var _require = function (_id) {
        //console.log('_require', _id, 'from', id);
        return require(_id, id);
      };
      var block = mod.block; delete mod.block;
      mod.exports = {};
      if (require.initFilter) {
        block = require.initFilter(block);
      }
      block(_require, mod, mod.exports);
    }
    return mod.exports;
  }
  // define a module
  // define(String id, block(require, module, exports){...})
  function define (id, block) {
    var mod = {id: String(id), block: block};
    require.modules[mod.id] = mod;
  }
  function normalizeTerms (parts) {
    /* This function:
    Copyright 2009, 2010 Ryan Lienhart Dahl. All rights reserved.
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to
    deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
    sell copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
    IN THE SOFTWARE. */
    var directories = [], prev;
    for (var i = 0, l = parts.length - 1; i <= l; ++i) {
      var directory = parts[i];
      // if it's blank, but not the first thing, and not the last thing, skip it
      if (directory === "" && i !== 0 && i !== l) continue;
      // if it's a dot, and there was some previous dir already, then skip it
      if (directory === "." && prev !== undefined) continue;
      // if it starts with "", and is a . or .., then skip it.
      if (directories.length === 1 && directories[0] === ""
          && (directory === "." || directory === "..")) {
        continue;
      }
      if (directory === ".." && directories.length && prev !== ".."
          && prev !== "." && prev !== undefined && prev !== "") {
        directories.pop();
        prev = directories.slice(-1)[0];
      } else {
        if (prev === ".") directories.pop();
        directories.push(directory);
        prev = directory;
      }
    }
    return directories;
  }
  function normalizeId(id, parentId) {
    id = id.replace(/\/+$/g, '');
    return normalizeTerms((parentId ? parentId + '/../' + id : id).split('/'))
           .join('/');
  }
  require.modules = {};
  //require.paths = []; // when/if we have remote loading
  require.define = define;
  return require;
})(); // require

// Optional require.load
(function(){
  if (typeof XMLHttpRequest == "undefined") {
    // we make use of XHR
    XMLHttpRequest = function () {
      try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e) {}
      try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e) {}
      try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
      throw new Error("This browser does not support XMLHttpRequest.");
    };
  }
  /**
   * Load and define a module
   * load ( spec Object, Function(callback(err Error)) )
   * load ( specs Array, Function(callback(err Error)) )
   */
  function load (spec, callback) {
    if ((spec instanceof Array) ||
        Object.prototype.toString.call(spec) === "[object Array]") {
      if (callback) {
        // load multiple and join on callback
        var countdown = spec.length;
        for (var i=0;i<spec.length;++i) {(function(u){
          load(u, function (err) {
            if (err) {
              countdown = 0;
              //throw err;
              callback(err);
            } else if (--countdown === 0) {
              callback();
            }
          });
        })(spec[i]);}
      } else {
        // load multiple (blocking) -- don't use this for network resources
        for (var i=0;i<spec.length;++i) {
          load(spec[i]);
        }
      }
      return;
    } else if (typeof spec === 'string') {
      spec = {url:spec};
    }
    if (!spec.url && spec.id) {
      spec.url = spec.id + '.js';
    } else if (spec.url && !spec.id) {
      var m = /^[^\/]+\/\/[^\/]+\/(.+)$/.exec(spec.url);
      if (m) {
        spec.id = m[1];
      } else {
        spec.id = spec.url;
      }
      spec.id = spec.id.replace(/\.[^\.]+$/, '');
    } else if (!spec.url && !spec.id) {
      throw new TypeError('missing both "url" and "id"');
    }
    var xhr = new XMLHttpRequest();
    var async = !!callback;
    function evalResponse() {
      try {
        eval('require.define("'+spec.id+'", function (require, module, exports) {'+
             xhr.responseText+
             '});');
      } catch (err) {
        err.message += ' in '+spec.url;
        throw err;
      }
    }
    xhr.open('GET', spec.url, async);
    if (async) {
      xhr.onreadystatechange = function (ev) {  
        if (xhr.readyState == 4) {
          if ((xhr.status < 300 && xhr.status >= 200)
            || (xhr.status === 0 && !spec.url.match(/^(?:https?|ftp):\/\//i))) {
            try {
              evalResponse();
              callback(null);
            } catch (err) {
              callback(err);
            }
          } else {
            callback(new Error('failed to load remote module with HTTP'+
                               ' response status '+xhr.status+' '+
                               xhr.responseText));
          }
        }
      };
    }
    xhr.send(null);
    if (!async) {
      evalResponse();
    }
  }
  require.load = load;
})();
