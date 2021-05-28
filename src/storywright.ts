import { join } from 'path';
import * as playwright from 'playwright';
import { getCurrentPackageFolder, getPackageName } from './packageUtils';
import exposePlaywright from './playwrightMethods';

const currentPackage = getPackageName();

function signOff(): void {
  console.log(`Starting screenshot capturing of Storybook for "${currentPackage}"`);

  (async () => {
    const distPath = join(getCurrentPackageFolder(), 'dist');

    const screenshotsPath = join(distPath, 'screenshots', 'storybookTests');

    try {
      const browser = await playwright.chromium.launch({ headless: false, slowMo: 50 });
      const context = await browser.newContext();
      await context.setDefaultTimeout(90 * 1000);

      const page = await context.newPage();
      await page.goto(join(distPath, 'iframe.html'));
      // await page.waitForTimeout(1000 * 5);

      const path = join(screenshotsPath, 'chromium');
      //const stories: string[] = await page.evaluate('(__STORYBOOK_CLIENT_API__?.raw() || []).map(e => e.id)');
      const stories: object[] = await page.evaluate(
        '(__STORYBOOK_CLIENT_API__?.raw() || []).map(e => ({id: e.id, kind: e.kind, name: e.name}))'
      );

      console.log(`${currentPackage} ${stories.length} stories found`);
      let screenshotIndex = 0;
      let flag = process.argv.indexOf('--par') == -1 ? false : true;
      // let flag = true;
      console.log(`flag: ${flag}`);
      if (!flag) {
        await exposePlaywright(page, context, path, 'sample');
      }
      // exposePlaywright(page, context, path);
      const batchSize = 3;
      let position = 0;
      while (position < stories.length) {
        const itemsForBatch = stories.slice(position, position + batchSize);
        await Promise.all(
          itemsForBatch.map(async (story: object, index: number) => {
            const id: string = story['id'];
            const ssNamePrefix = `${story['kind']}#${story['name']}`;
            const logPrefix = `${currentPackage} story:${index + 1}/${stories.length}`;
            if (
              id.includes('header') &&
              !id.includes('headerribbontoggle') &&
              !id.includes('sharedheaderplaceholder')
              //  || id.includes('documenttitle')
            ) {
              console.log(`header encountered. Returning: ${id}`);
              return;
            }
            try {
              if (flag) {
                console.log('async');
                const page = await context.newPage();
                page.setViewportSize({
                  width: 1920,
                  height: 964,
                });
                await exposePlaywright(page, context, path, ssNamePrefix);
                console.log('Rendering story: ');
                await page.goto(join(distPath, `iframe.html?id=${id}`));
                await page.waitForTimeout(1000 * 5);
                // await page.screenshot({ path: `${path}${id}.png` });
                screenshotIndex++;
                // log(`screenshotIndex: , ${screenshotIndex}`);
                console.log(`${logPrefix} screenshot:${screenshotIndex}/${stories.length}  ${id}`);
              } else {
                console.log('sync');
                // const page = await context.newPage();
                // await exposePlaywright(page, context, path);
                screenshotIndex++;
                await page.goto(join(distPath, `iframe.html?id=${id}`));
                await page.waitForTimeout(1000 * 5);
                console.log(`screenshotIndex: , ${screenshotIndex}`);
                console.log('Rendering story: ');
                // await page.screenshot({ path: `${path}${id}.png` });

                // log(`${logPrefix} screenshot:${screenshotIndex}/${stories.length}  ${id}`);
              }
            } catch (err) {
              console.log(`${logPrefix} **ERROR** ${err}`);
            }
          })
        );
        position += batchSize;
      }
      if (stories.length > 0 && screenshotIndex === stories.length) {
        // exitCode = 0;
      }

      // await page.screenshot({ path: `${path}last-screenshot.png` });
      // await browser.close();
    } catch (err) {
      console.log(`** ERROR ** ${err}`);
    }

    console.log('Closing midgard-stories process');
  })();
}

if (process.argv.indexOf('--signoff') >= 0) {
  signOff();
}
