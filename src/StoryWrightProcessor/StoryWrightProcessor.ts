import { join } from 'path';
import { Browser, Page } from 'playwright';
import { BrowserUtils } from './BrowserUtils';
import exposePlaywright from './playwrightMethods';
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
    try {
      const browsers: string[] = options.browsers;
      for (const browserName of browsers) {
        console.log(browserName);
        const browser: Browser = await BrowserUtils.getBrowserInstance(browserName, options.headless);
        const context = await browser.newContext();
        const page: Page = await context.newPage();

        await page.goto(join(options.url, 'iframe.html'));
        const stories: object[] = await page.evaluate(
          '(__STORYBOOK_CLIENT_API__?.raw() || []).map(e => ({id: e.id, kind: e.kind, name: e.name}))'
        );
        await page.close();
        console.log(`${stories.length} stories found`);
        let screenshotIndex = 0;
        let position = 0;
        while (position < stories.length) {
          const itemsForBatch = stories.slice(position, position + options.concurrency);
          await Promise.all(
            itemsForBatch.map(async (story: object, index: number) => {
              const id: string = story['id'];
              const ssNamePrefix = `${story['kind']}#${story['name']}`;
              const logPrefix = `story:${index + 1}/${stories.length}`;
              if (
                id.includes('header') &&
                !id.includes('headerribbontoggle') &&
                !id.includes('sharedheaderplaceholder')
                //  || id.includes('documenttitle')
              ) {
                //console.log(`header encountered. Returning: ${id}`);
                return;
              }
              try {
                console.log('async');
                const page = await context.newPage();
                await page.setViewportSize({
                  width: 1920,
                  height: 964,
                });
                await exposePlaywright(page, options.screenShotDestPath, ssNamePrefix, browserName);

                console.log('Rendering story: ');
                await page.goto(join(options.url, `iframe.html?id=${id}`));
                console.log(`${Date.now()}  ${new Date().toUTCString()}:: Page closed 1 == ${await page.isClosed()}`);
                screenshotIndex++;
                console.log(`${logPrefix} screenshot:${screenshotIndex}/${stories.length}  ${id}`);
                await page.waitForEvent('close');
                console.log(`${Date.now()} ${new Date().toUTCString()}:: Page closed 2 == ${await page.isClosed()}`);
              } catch (err) {
                console.log(`${logPrefix} **ERROR** ${err}`);
              }
            })
          ).catch(reason => {
            console.log(reason);
          });
          position += options.concurrency;
        }
      }
    }
    catch (err) {
      console.log(`** ERROR ** ${err}`);
    }
    finally {
      console.log('Closing midgard-stories process');
    }
  }
}