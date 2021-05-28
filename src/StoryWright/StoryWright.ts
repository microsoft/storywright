import {createElement, useEffect } from 'react';
import executeSteps from './executeSteps';

export const StoryWright = p => {

  useEffect(() => {
    console.log('steps:', p);
    executeSteps(p.steps);
  }, []);
  return createElement('div', null, p.children);
};

// exports.default = StoryRunner;
// exports.Steps = require('./steps');

// module.exports = extend(exports.default, exports);
