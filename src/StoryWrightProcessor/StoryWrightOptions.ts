/**
 * Interface object to pass arguments to story processor.
 */
export interface StoryWrightOptions {
  url: string;
  screenShotDestPath: string;
  browsers: Array<string>;
  headless: boolean;
  concurrency: number;
  skipSteps: boolean;
  partitionIndex: number;
  totalPartitions: number;
  waitTimeScreenshot: number;
  excludePatterns: Array<string>;
  bailOnStoriesError: boolean;
  /**
   * NOTE: `component` is deprecated and will be removed in next major. SB will no longer support exposing storyFn() so we won't be able to obtain dynamically steps from <StoryWright/> props.
   */
  stepsApi: "component" | "parameters";
}
