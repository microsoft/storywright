import { createElement, Fragment, useEffect } from "react";
import { BrowserExecutor } from "./BrowserExecutor";

/**
 * Wrapper react component
 * @param p
 * @returns
 */
export const StoryWright = (p) => {
  let i = 0;
  useEffect(() => {
    console.log(`i: ${++i}`);
    console.log(`p.steps: ${JSON.stringify(p.steps)}`);
    BrowserExecutor.executesteps(p.steps);
  }, []);

  return createElement(Fragment, null, p.children);
};
