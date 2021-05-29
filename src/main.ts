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
        describe: 'Command to run',
        nargs: 1,
        type: "string"
    })
    .option('destpath', {
        alias: 'screenshotdestpath',
        default: 'dist/screenshots/storybook',
        describe: 'Command to run',
        nargs: 1,
        type: "string"
    })
    .option('browsers', {
        alias: 'browsers',
        default: [Browser.Chromium, Browser.Firefox],
        describe: 'Command to run',
        nargs: 1,
        type: "array",
        coerce: array => {
            return array.flatMap(v => v.split(','))
        },
        choices: [Browser.Chromium, Browser.Firefox]
    })
    .example('$0', 'Captures screenshot for all stories using default static storybook path dist/iframe.html')
    .example('$0 -url https://localhost:5555', 'Captures screenshot for all stories from given storybook url').argv;

console.log(args);

let url = (args.url.indexOf("http") > -1) ? args.url : resolve(args.url);
console.log(`================ Starting story right execution =================`);
console.log(`Storybook url = ${url}`);
console.log(`Screenshot destination path = ${args.destpath}`);
console.log(`Browsers = ${args.browsers}`);
console.log(`================ Starting story right execution =================`);

const storyWrightOptions: StoryWrightOptions = {
    url: url,
    screenShotDestPath: args.destpath,
    browsers: args.browsers
};

StoryWrightProcessor.process(storyWrightOptions);