// @ts-check

getStoriesWithSteps();

function getStoriesWithSteps() {
  return getPageStories().then((stories) => {
    /**
     * @type {Array<import('../utils').Story>}
     */
    const storiesWithSteps = [];
    /**
     * @type {string[]} story ids that failed while processing parameters
     */
    const errors = [];
    for (let story of Object.values(stories)) {
      try {
        const steps = story.parameters?.storyWright?.steps;
        if (Array.isArray(steps)) {
          story.steps = steps;
        }
      } catch (ex) {
        errors.push(story["id"]);
        console.error("Error processing 'parameters' of: " + story["id"]);
        console.error(ex);
      }

      storiesWithSteps.push(story);
    }

    return { storiesWithSteps, errors };
  });
}

/**
 *
 * @returns {Promise<{[story_id:string]: import('../utils').Story}>}
 */
function getPageStories() {
  return window["__STORYBOOK_PREVIEW__"].extract();
}
