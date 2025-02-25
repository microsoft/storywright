#!/usr/bin/env node
import * as argv from "yargs";
import { BrowserName } from "./StoryWrightProcessor/Constants";
import { StoryWrightOptions } from "./StoryWrightProcessor/StoryWrightOptions";
import { StoryWrightProcessor } from "./StoryWrightProcessor/StoryWrightProcessor";
//import { resolve } from "path";
import { cpus } from "os";

const args = argv
  .help()
  .alias("help", "h")
  .usage("Usage: $0 [options]")
  .example([
    [
    "$0",
    "Captures screenshot for all stories using default static storybook path dist/iframe.html"
    ],
    [
    "$0 -url https://localhost:5555 --browsers chromium",
    "Captures screenshot for all stories from given storybook url for chromium browser"
    ]
  ])
  .option("url", {
    alias: "storybookurl",
    default: "dist",
    describe:
      "Url to storybook. Can be relative path to folder like dist or server url http://localhost:5555",
    nargs: 1,
    type: "string",
  })
  .option("destpath", {
    alias: "screenshotdestpath",
    default: "dist/screenshots/storybook",
    describe: "Output directory path where screenshots should be stored",
    nargs: 1,
    type: "string",
  })
  .option("browsers", {
    default: [BrowserName.Chromium, BrowserName.Firefox],
    describe: "Comma seperated list of browsers to support",
    nargs: 1,
    type: "array",
    coerce: (array) => {
      return array.flatMap((v) => v.split(","));
    },
    choices: [BrowserName.Chromium, BrowserName.Firefox, BrowserName.Webkit],
  })
  .option("excludePatterns", {
    default: [BrowserName.Chromium, BrowserName.Firefox],
    describe: "Comma seperated list of StoryName regex pattern to be excluded",
    nargs: 1,
    type: "array",
    coerce: (array) => {
      return array.flatMap((v) => v.split(","));
    }
  })
  .option("headless", {
    default: false,
    describe:
      "True if browser needs to be launched in headless mode else false",
    nargs: 1,
    type: "boolean",
  })
  .option("partitionIndex", {
    default: 1,
    describe:
      "Partition index (1 to totalPartitions) to run, used in conjunction with totalPartitions parameter to run specific partition of the stories. This can be used to distribute workloads across different machines, threads or workers.",
    type: "number",
  })
  .option("totalPartitions", {
    default: 1,
    describe:
      "Number of partitions, used in conjunction with partitionIndex parameter to run specific partition of the stories. This can be used to distribute workloads across different machines, threads or workers.",
    type: "number",
  })
  .option("concurrency", {
    default: 8,
    describe: "Number of browser tabs to open in parallel",
    nargs: 1,
    type: "number",
  })
  .option("skipSteps", {
    default: false,
    describe:
      "Take Screenshot of all Storybook stories with/without wrapped component",
    nargs: 1,
    type: "boolean",
  })
  .option("waitTimeScreenshot", {
    alias: "waitTimeScreenshot",
    default: 1000,
    describe:
      "Time to wait before taking screenshot",
    nargs: 1,
    type: "number",
  })
  .option("bailOnStoriesError", {
    default: false,
    describe:
      "Fail process if errors occurred while processing Stories or during making screenshots. Useful to make sure that your VR Test are valid and in CI scenarios.",
    type: "boolean",
  })
  .strict(true)
  .argv;


// When http(s) storybook url is passed no modification required.
// When file path is provided it needs to be converted to absolute path and file:/// needs to be added to support firefox browser.

//const url: string =
  //args.url.indexOf("http") > -1 ? args.url : "file:///" + resolve(args.url);

console.log(`================ StoryWright params =================`);
console.log(`Storybook url = ${args.url}`);
console.log(`Screenshot destination path = ${args.destpath}`);
console.log(`Browsers = ${args.browsers}`);
console.log(`Headless = ${args.headless}`);
console.log(`Concurrency = ${args.concurrency}`);
console.log(`Cores available on system  = ${cpus().length}`);
console.log(`SkipSteps = ${args.skipSteps}`);
console.log(`WaitTimeScreenshot = ${args.waitTimeScreenshot}`);
console.log(`ExcludePatterns = ${args.excludePatterns}`);
console.log(
  `================ Starting story right execution =================`
);

const storyWrightOptions: StoryWrightOptions = {
  url: args.url,
  screenShotDestPath: args.destpath,
  browsers: args.browsers,
  headless: args.headless,
  concurrency: args.concurrency,
  skipSteps: args.skipSteps,
  partitionIndex: args.partitionIndex,
  totalPartitions: args.totalPartitions,
  waitTimeScreenshot: args.waitTimeScreenshot,
  excludePatterns: args.excludePatterns,
  bailOnStoriesError: args.bailOnStoriesError
};

StoryWrightProcessor.process(storyWrightOptions);
