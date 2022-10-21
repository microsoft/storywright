import { join } from "path";
import { Browser, BrowserContext, Page } from "puppeteer";
import { BrowserUtils } from "./BrowserUtils";
import { PlayWrightExecutor } from "./PlayWrightExecutor";
import { StoryWrightOptions } from "./StoryWrightOptions";
import { partitionArray } from "../utils";
import { readFileSync } from 'fs';

/**
 * Class containing StoryWright operations
 */
export class StoryWrightProcessor {
  /**
   *
   * @param options Storywright processing options
   */
  public static async process(options: StoryWrightOptions) {
    let startTime = Date.now();
    console.log("StoryWright processor started @ ", new Date());

    const browsers: string[] = options.browsers;
    for (const browserName of browsers) {
      let browser: Browser;
      try {
        console.log(`Starting browser test for ${browserName}`);
        browser = await BrowserUtils.getBrowserInstance(
          browserName,
          options.headless
        );
        const page: Page = await browser.newPage();
        var getStoriesScript = readFileSync(__dirname + '/GetStories.js', 'utf8');
        await page.goto(join(options.url, "iframe.html"));
        
        let stories: object[]= await page.evaluate(getStoriesScript) as object[];
        if (options.totalPartitions > 1) {
          console.log(
            "Starting partitioning with ",
            "Total partitions -",
            options.totalPartitions,
            "&",
            "Partition index to select -",
            options.partitionIndex,
            "&",
            "Total Stories length -",
            stories.length
          );
          stories = partitionArray(
            stories,
            options.partitionIndex,
            options.totalPartitions
          );
        }
        await page.close();
        console.log(`${stories.length} stories found`);
        let storyIndex = 0;
        let position = 0;
        while (position < stories.length) {
          // Execute stories in batches concurrently in tabs.
          const itemsForBatch = stories.slice(
            position,
            position + options.concurrency
          );
          await Promise.all(
            itemsForBatch.map(async (story: object) => {
              const id: string = story["id"];

              // Set story category and name as prefix for screenshot name.
              const ssNamePrefix = `${story["kind"]}.${story["name"]}`.replace("/", "-").replace("\\", "-"); //INFO: '/' or "\\" in screenshot name creates a folder in screenshot location. Replacing with '-'
              let context: BrowserContext;
              try {
                const page = await browser.newPage();
                // TODO : Move these values in config.
                // TODO : Expose a method in Steps to set viewport size.
                await page.setViewport({
                  width: 1920,
                  height: 964
                });
                // Add basic CSS normalization
                await page.evaluateOnNewDocument(() => {
                  document.addEventListener("DOMContentLoaded", () => {
                    const style = document.createElement("style");
                    style.textContent = `
                      /* Hide caret */
                      * { caret-color: transparent !important; }
                      /* Instant transitions and animations */
                      * > * { transition-duration: 0ms !important; animation-duration: 0ms !important; }
                    `;
                    document.head.appendChild(style);
                  });
                });

                //TODO: Take screenshots when user doesn't want steps to be executed.
                if (options.skipSteps) {

                } else {
                  const playWrightExecutor: PlayWrightExecutor = new PlayWrightExecutor(page, ssNamePrefix, browserName, options, story);
                  await playWrightExecutor.exposeFunctions();
                  await page.goto(join(options.url, `iframe.html?id=${id}`),{waitUntil:"domcontentloaded"});
                  
                  await playWrightExecutor.processStory();
                  console.log(`story:${++storyIndex}/${stories.length}  ${id}`);
                }
              } catch (err) {
                console.log(
                  `**ERROR** for story ${ssNamePrefix} ${story["id"]} ${storyIndex}/${stories.length} ${err}`
                );
              } finally {
                if (context != null) {
                  await context.close();
                }
              }
            })
          ).catch((reason) => {
            console.log(`**ERROR** ${reason}`);
            page.close();
          });
          position += options.concurrency;
        }
      } catch (err) {
        console.log(`** ERROR ** ${err}`);
      } finally {
        console.log("Closing process !!");
        if (browser != null && browser.isConnected()) {
          await browser.close();
        }
        let endTime = Date.now();
        console.log(
          "StoryWright took ",
          Math.round((endTime - startTime) / 1000),
          "secs to complete."
        );
        console.log("StoryWright processor completed @ ", new Date());
      }
    }
  }
}
