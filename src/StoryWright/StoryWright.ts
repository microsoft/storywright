import { createElement, Fragment } from "react";
var PropTypes = require('prop-types');
/**
 * Wrapper react component
 * @param p
 * @returns
 */
export const StoryWright = (p) => {
  return createElement(Fragment, null, p.children);
};

StoryWright.propTypes = {
  children: PropTypes.any,
  steps: PropTypes.array,
  isStowrWrightComponent: PropTypes.bool
};

StoryWright.defaultProps = {
  isStowrWrightComponent: true
};