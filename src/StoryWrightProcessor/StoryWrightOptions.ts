/**
 * Interface object to pass arguments to story processor.
 */
export interface StoryWrightOptions {
  url: string;
  screenShotDestPath: string;
  browsers: Array<string>;
  report: string,
  parseDom: boolean;
  headless: boolean;
  concurrency: number;
  skipSteps: boolean;
  partitionIndex: number;
  totalPartitions: number;
  waitTimeScreenshot: number;
}
