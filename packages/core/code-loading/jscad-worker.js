// jscad-worker.js
//
// == OpenJSCAD.org, Copyright (c) 2013-2016, Licensed under MIT License
const {isCSG, isCAG} = require('@jscad/csg')
const oscad = require('@jscad/csg/api')
const createJscadFunction = require('./jscad-function')
const { toArray } = require('../utils/arrays')

/**
 * Create an worker (thread) for processing the JSCAD script into CSG/CAG objects
 */
module.exports = function (self) {
  self.onmessage = function (e) {
    if (e.data instanceof Object) {
      var data = e.data
      if (data.cmd === 'render') {
        const {source, parameters, options} = e.data
        const include = x => x

        const globals = options.implicitGlobals ? { oscad } : {}
        const func = createJscadFunction(source, globals)

        const handleObjects = (objects) => {
          objects = toArray(objects)
            .map(function (object) {
              if (isCSG(object) || isCAG(object)) {
                return object.toCompactBinary()
              }
          })
          if (objects.length === 0) {
            // TODO does the Promise handle this?
            throw new Error('The JSCAD script must return one or more CSG or CAG solids.')
          }
          self.postMessage({cmd: 'rendered', objects})
        }

        let objects = func(parameters, include, globals)
        if (objects.then) {
          objects.then(function(objects) {
            handleObjects(objects)
          }).catch (function (err) {
            // TODO handle errors better
            //console.log("jscad worker got promise error");
            //console.log(err);
              throw new Error(`Error: ${err}`);
          });
        } else {
          handleObjects(objects);
        }
      }
    }
  }
}
