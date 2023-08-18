/**
 * Interface object to pass arguments to story processor.
 */
export interface StoryWrightOptions {
  url: string;
  screenShotDestPath: string;
  browsers: Array<string>;
  skipDomParsing: Array<string>;
  parseDom: boolean;
  compressDom: boolean;
  headless: boolean;
  concurrency: number;
  skipSteps: boolean;
  partitionIndex: number;
  totalPartitions: number;
  waitTimeScreenshot: number;
}
