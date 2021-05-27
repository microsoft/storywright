import * as fs from 'fs';

const exposePlaywright = async (page: any, context: any, path: String, ssNamePrefix: String): Promise<any | void> => {
  console.log('exposing playwright');

  return new Promise<void>(async resolve => {
    context;
    // context.setDefaultNavigationTimeout(120000);
    await page.exposeFunction('makeScreenshot', makeScreenshotAsync);
    await page.exposeFunction('click', clickAsync);
    await page.exposeFunction('hover', hoverAsync);
    await page.exposeFunction('wait', waitForSelectorAsync);
    await page.exposeFunction('waitForNotFound', waitForNotFoundAsync);
    await page.exposeFunction('elementScreenshot', elementScreenshotAsync);
    await page.exposeFunction('done', doneAsync);
    await page.exposeFunction('setElementText', setElementTextAsync);
    await page.exposeFunction('pressKey', pressKeyAsync);
    await page.exposeFunction('executeScript', executeScriptAsync);
    await page.exposeFunction('focus', focusAsync);

    async function focusAsync(selector: string) {
      console.log(`Focusing element \"${selector}\"...`);
      await page.focus(selector);
      console.log(`Focused element \"${selector}\"...`);
    }

    async function executeScriptAsync(script: string) {
      console.log(`Executing script \"${script}\"...`);
      await page.evaluate(script);
      console.log(`Executed script \"${script}\"...`);
    }

    async function pressKeyAsync(selector: string, key: string) {
      console.log(`Pressing key ${key} element  ${selector}...`);
      await page.press(selector, key);
      console.log(`Key ${key} pressed`);
    }

    async function setElementTextAsync(selector: string, text: string) {
      console.log(`Setting text for element  ${selector}...`);
      const element = await page.$(`${selector}`);
      await element.fill(text);
      console.log('Text inserted');
    }

    async function makeScreenshotAsync(testName: string, screenshotsPath: string) {
      if (!fs.existsSync(screenshotsPath)) {
        fs.mkdirSync(screenshotsPath, { recursive: true });
      }

      console.log(`Taking screenshot for ${testName}...`);
      await page.screenshot({
        path: `${path}\\${ssNamePrefix}#${testName}#${'browserType'}.png`,
      });
      console.log('Screenshot taken', `${path}\${testName}.${'browserType'}.png`);
    }

    async function clickAsync(selector: string) {
      console.log(`Clicking element for  ${selector}...`);
      await page.click(`${selector}`);
      console.log('Item clicked');
    }

    async function elementScreenshotAsync(selector: string, testName: String) {
      console.log(`Selecting element for  ${selector}...`);
      console.log(`testName  ${testName}...`);
      const element = await page.$(`${selector}`);
      await element.screenshot({ path: `${path}\\${ssNamePrefix}#${testName}#${'browserType'}.png` });
      console.log('element screenshot taken: ', `${path}\\${ssNamePrefix}#${testName}#${'browserType'}.png`);
    }

    async function hoverAsync(selector: string) {
      console.log(`Hovering element for  ${selector}...`);
      await page.hover(`${selector}`);
    }

    async function waitForSelectorAsync(selector: string) {
      console.log(`Waiting for element for  ${selector}...`);
      await page.waitForSelector(`${selector}`);
    }

    async function waitForNotFoundAsync(selector: string) {
      console.log(`Waiting for element for  ${selector}... to detach`);
      await page.waitForSelector(`${selector}`, 'detached');
    }

    async function doneAsync(shouldCloseWhenDone: string) {
      console.log(`StoryRunner done`);
      if (shouldCloseWhenDone) {
        console.log(`Closing the page and the browser`);
        await page.close();
        console.log(`Page is closed`);
        // await browser.close();
        console.log(`Browser is closed`);
      }
      resolve();
    }

    resolve();
  });
};

export default exposePlaywright;
