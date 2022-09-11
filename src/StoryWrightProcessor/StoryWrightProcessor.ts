import { join } from "path";
import { Browser, BrowserContext, Page } from "playwright";
import { BrowserUtils } from "./BrowserUtils";
import { PlayWrightExecutor } from "./PlayWrightExecutor";
import { StoryWrightOptions } from "./StoryWrightOptions";
import { partitionArray } from "../utils";
import { sep } from "path";
// import * as fs from "fs";
// import { compareDoms } from "../DOMDiffing/domDiffingEngine";
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
              let context: BrowserContext;
              try {
                context = await browser.newContext();
                const page = await context.newPage();
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
                  await page.goto(join(options.url, `iframe.html?id=${id}`));
                  
                  // Add style to page
                  
                  const isPageBusy = await new PlayWrightExecutor(
                    page,
                    ssNamePrefix,
                    browserName,
                    options
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
                    ssNamePrefix,
                    browserName, 
                    options
                  ).exposeFunctions();
                  await page.goto(join(options.url, `iframe.html?id=${id}`));
                  
                  // Add style to make cursor transparent from input fields
                 
                  console.log(`story:${++storyIndex}/${stories.length}  ${id}`);

                  // Wait for close event to be fired from steps. Wait for 1 min 30 seconds.
                  await page.waitForEvent("close", { timeout: 90000 });
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

  // public static async runDomDiffing(options: StoryWrightOptions) {
  //   // console.log(`Starting DOM diffing: ${JSON.stringify(options.domDiffing)} ${JSON.stringify(options.report)}`);
  //   console.log(`Starting DOM diffing:`);
  //   const paths: string[] = options.domDiffing;
  //   let baseLineDOMPath: string = paths[0];
  //   let candidateDOMPath: string = paths[1];
  //   const screenshotsChanged: any[] = JSON.parse(fs.readFileSync(options.report, "utf-8"))["screenshotsChanged"];

  //   console.log(`baseLineDOMPath, candidateDOMPath, report: ${baseLineDOMPath}, ${candidateDOMPath} ${JSON.stringify(screenshotsChanged)}`);

  //   screenshotsChanged.forEach((screenshot: any) => {
  //     const domCSSFile = screenshot["imageName"].replace(".png", ".json");

  //     console.log(`domCSSFilename: ${domCSSFile}`);

  //     const baseLineDOMCSSsnap = baseLineDOMPath + "//" + domCSSFile;
  //     const candidateDOMCSSsnap = candidateDOMPath + "//" + domCSSFile;

  //     console.log(`baseLineDOMCSSsnap, candidateDOMCSSsnap: ${baseLineDOMCSSsnap}, ${candidateDOMCSSsnap}`);
  //     // console.log(compareDoms);

  //     let baselineDom = JSON.parse(fs.readFileSync(baseLineDOMCSSsnap, "utf-8"));
  //     let candidateDom = JSON.parse(fs.readFileSync(candidateDOMCSSsnap, "utf-8"));

  //     console.log(`baselineDom, candidateDom: ${baselineDom["html"]["uniqueId"]}`);
  //     console.log(`baselineDom, candidateDom: ${candidateDom["html"]["uniqueId"]}`);

  //     compareDoms(baselineDom, candidateDom);

  //     fs.writeFileSync(`C:/Users/vinodsharma/Documents/workspace/1JS/ooui/packages/visual-regression-tests/dist/result/${domCSSFile.replace("json", "")}_baseline.json`, JSON.stringify(baselineDom, null, 2));
  //     fs.writeFileSync(`C:/Users/vinodsharma/Documents/workspace/1JS/ooui/packages/visual-regression-tests/dist/result/${domCSSFile.replace("json", "")}_candidate.json`, JSON.stringify(candidateDom, null, 2));
  //   });
  // }
}
