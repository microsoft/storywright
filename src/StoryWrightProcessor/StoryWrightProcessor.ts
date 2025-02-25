import { join, resolve } from "path";
import { Browser, BrowserContext, Page } from "playwright";
import { BrowserUtils } from "./BrowserUtils";
import { PlayWrightExecutor } from "./PlayWrightExecutor";
import { StoryWrightOptions } from "./StoryWrightOptions";
import { partitionArray, Story } from "../utils";
import { readFileSync, existsSync } from "fs";

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
        const context = await browser.newContext();
        const page: Page = await context.newPage();

        const STORY_URL = "https://stories/";
        await page.route(`${STORY_URL}**`, async (route, request) => {
          const url = request.url();
          const urlPath = url.slice(STORY_URL.length).split("?")[0].split("/");
          const path = join(options.url, ...urlPath);
          if (existsSync(path)) {
            route.fulfill({ path });
          } else {
            console.log(`Local file not found -> Abort request for ${url}`);
            route.abort();
          }
        });

        await page.goto(join(STORY_URL, "iframe.html"));

        let stories: Story[];
        try {
          const getStoriesScript = readFileSync(
            join(__dirname, "GetStories.js"),
            "utf8"
          );
          const { storiesWithSteps, errors } = await page.evaluate<{
            storiesWithSteps: Story[];
            errors: string[];
          }>(getStoriesScript);
          stories = storiesWithSteps;

          if (errors.length) {
            console.warn('-'.repeat(60));
            console.warn(
              `🚨 [${errors.length}] errors occurred while processing Stories to obtain Steps definitions:\n`
            );
            console.warn(errors.join('\n'));
            console.warn('-'.repeat(60),'\n');

            if(options.bailOnStoriesError){
              process.exit(1)
            }
          }

        } catch (err) {
          // If getting stories from ifram.html is not sucessfull for storybook 7, try to get stories from stories.json
          // NOTE: this wont process Steps !
          const storiesJsonPath = resolve(options.url, "stories.json");
          if (!existsSync(storiesJsonPath)) {
            console.log("stories.json not found at ", storiesJsonPath);
            throw err;
          }
          const rawStoriesObject: {
            stories: unknown;
          } = require(storiesJsonPath);
          stories = Object.values(rawStoriesObject.stories ?? {});
          console.log(`${stories.length} stories found`);
          console.warn("NOTE: stories Steps will not be processed");
        }
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
        //options.url = "dist/storybook";
        let storyIndex = 0;
        let position = 0;
        while (position < stories.length) {
          // Execute stories in batches concurrently in tabs.
          const itemsForBatch = stories.slice(
            position,
            position + options.concurrency
          );
          await Promise.all(
            itemsForBatch.map(async (story: Story) => {
              const id = story["id"];
              const tags = story["tags"];
              if (tags && tags.includes("no-screenshot")) {
                console.log(
                  `StoryId: ${id} has tag no-screenshot hence skipping.`
                );
                return;
              }
              // Set story category and name as prefix for screenshot name.
              const ssNamePrefix = `${story["kind"]}.${story["name"]}`
                .replaceAll("/", "-")
                .replaceAll("\\", "-"); //INFO: '/' or "\\" in screenshot name creates a folder in screenshot location. Replacing with '-'
              for (let excludePattern of options.excludePatterns) {
                // regex test to check if exclude pattern is present in ssNamePrefix
                let regex = new RegExp(excludePattern);
                if (regex.test(ssNamePrefix)) {
                  console.log(
                    `Skipping story ${ssNamePrefix} as it matches exclude pattern ${excludePattern}`
                  );
                  return;
                }
              }

              let context: BrowserContext;
              try {
                context = await browser.newContext();
                const page = await context.newPage();
                const STORY_URL = "https://stories/";
                await page.route(`${STORY_URL}**`, async (route, request) => {
                  const url = request.url();
                  const urlPath = url
                    .slice(STORY_URL.length)
                    .split("?")[0]
                    .split("/");
                  const path = join(options.url, ...urlPath);
                  if (existsSync(path)) {
                    route.fulfill({ path });
                  } else {
                    console.log(
                      `Local file not found -> Abort request for ${url}`
                    );
                    route.abort();
                  }
                });

                // TODO : Move these values in config.
                // TODO : Expose a method in Steps to set viewport size.
                await page.setViewportSize({
                  width: 1920,
                  height: 964,
                });

                // Add basic CSS normalization
                await page.addInitScript(() => {
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
                  const playWrightExecutor: PlayWrightExecutor =
                    new PlayWrightExecutor(
                      page,
                      ssNamePrefix,
                      browserName,
                      options,
                      story
                    );
                  await playWrightExecutor.exposeFunctions();
                  await page.goto(join(STORY_URL, `iframe.html?id=${id}`));
                  await playWrightExecutor.processStory();
                  console.log(`story:${++storyIndex}/${stories.length}  ${id}`);
                }
              } catch (err) {
                console.log(
                  `**ERROR** for story ${ssNamePrefix} ${story["id"]} ${storyIndex}/${stories.length} ${err}`
                );

                if(options.bailOnStoriesError){
                  process.exit(1);
                }
              } finally {
                if (context != null) {
                  await context.close();
                }
              }
            })
          ).catch((reason) => {
            console.log(`**ERROR** ${reason}`);
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
