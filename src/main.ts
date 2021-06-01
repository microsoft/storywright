#!/usr/bin/env node
import * as argv from 'yargs';
import { Browser } from './StoryWrightProcessor/Constants';
import { StoryWrightOptions } from './StoryWrightProcessor/StoryWrightOptions';
import { StoryWrightProcessor } from './StoryWrightProcessor/StoryWrightProcessor';
import { resolve } from 'path';
const args = argv.usage('Usage: $0 [options]').help('h').alias('h', 'help')
    .option('url', {
        alias: 'storybookurl',
        default: 'dist',
        describe: 'Url to story book. Can be relative path to folder like dist or server url http://localhost:5555',
        nargs: 1,
        type: "string"
    })
    .option('destpath', {
        alias: 'screenshotdestpath',
        default: 'dist/screenshots/storybook',
        describe: 'Output directory path where screenshots should be stored',
        nargs: 1,
        type: "string"
    })
    .option('browsers', {
        alias: 'browsers',
        default: [Browser.Chromium, Browser.Firefox],
        describe: 'Comma seperated list of browsers to support',
        nargs: 1,
        type: "array",
        coerce: array => {
            return array.flatMap(v => v.split(','))
        },
        choices: [Browser.Chromium, Browser.Firefox]
    })
    .option('headless', {
        alias: 'headless',
        default: false,
        describe: 'True if browser needs to be launced in headless mode else false',
        nargs: 1,
        type: "boolean"
    })
    .option('concurrency', {
        alias: 'concurrency',
        default: 8,
        describe: 'Number of browser tabs to open in parallel',
        nargs: 1,
        type: "number"
    })
    .example('$0', 'Captures screenshot for all stories using default static storybook path dist/iframe.html')
    .example('$0 -url https://localhost:5555 --browsers chromium', 'Captures screenshot for all stories from given storybook url for chromium browser').argv;

// When http(s) storybook url is passed no modification required. 
// When file path is provided it needs to be converted to absolute path and file:/// needs to be added to support firefox browser.

const url: string = (args.url.indexOf("http") > -1) ? args.url : 'file:///' + resolve(args.url);

console.log(`================ StoryWright params =================`);
console.log(`Storybook url = ${url}`);
console.log(`Screenshot destination path = ${args.destpath}`);
console.log(`Browsers = ${args.browsers}`);
console.log(`Headless = ${args.headless}`);
console.log(`Concurrency = ${args.concurrency}`);
console.log(`================ Starting story right execution =================`);

const storyWrightOptions: StoryWrightOptions = {
    url: url,
    screenShotDestPath: args.destpath,
    browsers: args.browsers,
    headless: args.headless,
    concurrency: args.concurrency
};

StoryWrightProcessor.process(storyWrightOptions);