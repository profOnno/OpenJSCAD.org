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
            throw new Error('The JSCAD script must return one or more CSG or CAG solids.')
          }
          self.postMessage({cmd: 'rendered', objects})
        }

        let objects = func(parameters, include, globals)
        if (objects.then) {
          objects.then((objects) => {
            handleObjects(objects)
          })
          .catch ((err) => {
              // check https://stackoverflow.com/questions/30715367/why-can-i-not-throw-inside-a-promise-catch-handler
              setTimeout(() => {
                throw err
              },0);
          });

        } else {
          handleObjects(objects);
        }
      }
    }
  }
}
