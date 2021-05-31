import { join } from 'path';
import { Browser, Page } from 'playwright';
import { BrowserUtils } from './BrowserUtils';
import { PlayWrightExecutor } from './PlayWrightExecutor';
import { StoryWrightOptions } from './StoryWrightOptions'

/**
 * Class containing StoryWright operations
 */
export class StoryWrightProcessor {
  /**
   * 
   * @param options Storywright processing options
   */
  public static async process(options: StoryWrightOptions) {

    const browsers: string[] = options.browsers;
    for (const browserName of browsers) {
      let browser: Browser;
      try {
        console.log(`Starting browser test for ${browserName}`);
        browser = await BrowserUtils.getBrowserInstance(browserName, options.headless);
        const context = await browser.newContext();
        const page: Page = await context.newPage();

        await page.goto(join(options.url, 'iframe.html'));
        const stories: object[] = await page.evaluate(
          '(__STORYBOOK_CLIENT_API__?.raw() || []).map(e => ({id: e.id, kind: e.kind, name: e.name}))'
        );
        await page.close();
        console.log(`${stories.length} stories found`);
        let storyIndex = 0;
        let position = 0;
        while (position < stories.length) {
          // Execute stories in batches concurrently in tabs.
          const itemsForBatch = stories.slice(position, position + options.concurrency);
          await Promise.all(
            itemsForBatch.map(async (story: object) => {
              const id: string = story['id'];
              // Set story category and name as prefix for screenshot name.
              const ssNamePrefix = `${story['kind']}^^${story['name']}`;
              let page: Page;
              try {
                page = await context.newPage();
                // TODO : Move these values in config.
                // TODO : Expose a method in Steps to set viewport size.
                await page.setViewportSize({
                  width: 1920,
                  height: 964,
                });
                await new PlayWrightExecutor(page, options.screenShotDestPath, ssNamePrefix, browserName).exposeFunctions();
                await page.goto(join(options.url, `iframe.html?id=${id}`));
                console.log(`story:${++storyIndex}/${stories.length}  ${id}`);

                // Wait for close event to be fired from steps. Default timeout is 30 seconds.
                await page.waitForEvent('close');
              } catch (err) {
                console.log(`**ERROR** for story ${ssNamePrefix} ${storyIndex}/${stories.length} ${err}`);
              }
              finally {
                if (page != null && !page.isClosed()) {
                  page.close();
                }
              }
            })
          ).catch(reason => {
            console.log(`**ERROR** ${reason}`);
          });
          position += options.concurrency;
        }
      }
      catch (err) {
        console.log(`** ERROR ** ${err}`);
      }
      finally {
        console.log('Closing process !!');
        if (browser != null && browser.isConnected) {
          browser.close();
        }
      }
    }
  }
}