import { createElement, useEffect } from 'react';
import { BrowserExecutor } from './BrowserExecutor';

export const StoryWright = p => {

  useEffect(() => {
    BrowserExecutor.executesteps(p.steps);
  }, []);
  return createElement('div', null, p.children);
};
