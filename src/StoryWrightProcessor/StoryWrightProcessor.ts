import { join } from "path";
import { Browser, Page } from "playwright";
import { BrowserUtils } from "./BrowserUtils";
import { PlayWrightExecutor } from "./PlayWrightExecutor";
import { StoryWrightOptions } from "./StoryWrightOptions";
import { partitionArray } from "../utils";
import { sep } from "path";

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

        await page.goto(join(options.url, "iframe.html"));
        let stories: object[] = await page.evaluate(
         "(__STORYBOOK_CLIENT_API__?.raw() || []).map(e => ({id: e.id, kind: e.kind, name: e.name}))"
        );
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
              const ssNamePrefix = `${story["kind"]}.${story["name"]}`.replace("/", "-").replace("\\","-"); //INFO: '/' or "\\" in screenshot name creates a folder in screenshot location. Replacing with '-'
              let page: Page;
              try {
                page = await context.newPage();
                // TODO : Move these values in config.
                // TODO : Expose a method in Steps to set viewport size.
                await page.setViewportSize({
                  width: 1920,
                  height: 964,
                });

                // Add basic CSS normalization
                page.addInitScript(() => {
                  document.addEventListener("DOMContentLoaded", () => {
                    const style = document.createElement("style");
                    style.textContent = `
                      /* Hide caret */
                      * { caret-color: transparent !important; }
                      /* Instant transitions and animations */
                      * > * { transition-duration: 0.0001ms !important; animation-duration: 0ms !important; }
                    `;
                    document.head.appendChild(style);
                  });
                });

                //TODO: Take screenshots when user doesn't want steps to be executed.
                if (options.skipSteps) {
                  await page.goto(join(options.url, `iframe.html?id=${id}`));
                  
                  // Add style to page
                  
                  const isPageBusy = await new PlayWrightExecutor(
                    page,
                    options.screenShotDestPath,
                    ssNamePrefix,
                    browserName
                  ).getIsPageBusyMethod();                  

                  let busyTime = 0;
                  const busyTimeout = 1000 * 5; // WHATEVER REASONABLE TIME WE DECIDE
                  const startBusyTime = Date.now();
                  do {
                    await page.waitForTimeout(50);
                    busyTime = Date.now() - startBusyTime;
                  } while (busyTime < busyTimeout && (await isPageBusy()));

                  console.log(`story:${++storyIndex}/${stories.length}  ${id}`);
                  await page.screenshot({
                    path:
                      options.screenShotDestPath + sep + ssNamePrefix + ".png",
                  });
                } else {
                  await new PlayWrightExecutor(
                    page,
                    options.screenShotDestPath,
                    ssNamePrefix,
                    browserName
                  ).exposeFunctions();
                  await page.goto(join(options.url, `iframe.html?id=${id}`));
                  
                  // Add style to make cursor transparent from input fields
                 
                  console.log(`story:${++storyIndex}/${stories.length}  ${id}`);

                  // Wait for close event to be fired from steps. Default timeout is 30 seconds.
                  await page.waitForEvent("close");
                }
              } catch (err) {
                console.log(
                  `**ERROR** for story ${ssNamePrefix} ${story["id"]} ${storyIndex}/${stories.length} ${err}`
                );
              } finally {
                if (page != null && !page.isClosed()) {
                  await page.close();
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
