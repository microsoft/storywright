// @ts-check

/**
    * @typedef {{
                argTypeTargetsV7:boolean;
                buildStoriesJson:boolean;
                disallowImplicitActionsInRenderV8: boolean;
                legacyDecoratorFileOrder: boolean;
                storyStoreV7?: boolean;
                warnOnLegacyHierarchySeparator: boolean
            }} SbFeatures
*/



getStoriesWithSteps();

function getStoriesWithSteps() {
  /**
   * @type {SbFeatures}
   */
  const storybookFeatures = window["FEATURES"];

  return getPageStories(storybookFeatures).then((stories) => {
    /**
     * @type {typeof stories}
     */
    const storiesWithSteps = [];
    /**
     * @type {string[]} story ids that failed while processing storyFn
     */
    const errors = [];
    for (let story of stories) {
      try {
        if (usesNewParametersApi(story)) {
          const steps = story.parameters.storyWright.steps;
          if (Array.isArray(steps)) {
            story.steps = steps;
          }
        } else if (usesOldStoryFnCall(story)) {
          let res = story.storyFn();
          const steps = findSteps(res);
          if (steps !== undefined && steps !== null) {
            story.steps = steps;
          }
        }
      } catch (ex) {
        errors.push(story["id"]);
        console.error("Error processing render() method of: " + story["id"]);
        console.error(ex);
      }

      storiesWithSteps.push(story);
    }

    return { storiesWithSteps, errors };
  });
}

/**
 *
 * @param {import('../utils').Story} story
 * @returns
 */
function usesNewParametersApi(story) {
  return story.parameters && story.parameters.storyWright;
}
/**
 *
 * @param {import('../utils').Story} story
 * @returns
 */
function usesOldStoryFnCall(story) {
  return typeof story.storyFn === "function";
}

/**
 *
 * @param {Record<string,any>} res
 * @returns {import('../utils').Story['steps'] | undefined}
 */
function findSteps(res) {
  if (res.props && res.props.isStowrWrightComponent === true) {
    return res.props.steps;
  }
  if (res.props && res.props.children) {
    let children = res.props.children;
    if (
      typeof children === "object" &&
      typeof children.map === "function" &&
      children.length > 0
    ) {
      for (var i = 0, len = children.length; i < len; i++) {
        let steps = findSteps(children[i]);
        if (steps) return steps;
      }
    } else {
      let steps = findSteps(children);
      return steps;
    }
  }
}

/**
 *
 * @param {SbFeatures} features
 * @returns {Promise<Array<import('../utils').Story>>}
 */
function getPageStories(features) {
  /**
   * only SB v7 supports this configuration
   */
  const supportsStoryStoreV7config = typeof features.storyStoreV7 === "boolean";
  // NOTE:
  // storyStoreV7:
  //  - is configurable only in SB v7
  //  - is `true` by default SB v7
  //  - doesn't exist in SB v7 (enabled by default)

  // get page stories async obtained from multiple build chunks
  if (!supportsStoryStoreV7config || features.storyStoreV7) {
    return window["__STORYBOOK_CLIENT_API__"].storyStore
      .cacheAllCSFFiles()
      .then(() => {
        return window["__STORYBOOK_CLIENT_API__"].raw() || [];
      });
  }

  return Promise.resolve(window["__STORYBOOK_CLIENT_API__"]?.raw() || []);
}
