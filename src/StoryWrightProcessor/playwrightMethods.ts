import * as fs from 'fs';
import { Page } from 'playwright';

const exposePlaywright = async (page: Page, path: String, ssNamePrefix: String, browserName: string): Promise<any | void> => {
  console.log('exposing playwright');

  return new Promise<void>(async resolve => {
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
    await page.exposeFunction('mouseDown', mouseDownAsync);
    await page.exposeFunction('mouseUp', mouseUpAsync);

    async function mouseUpAsync(selector: string) {
      console.log(`mouseUp element \"${selector}\"...`);
      await page.mouse.up();
      console.log(`mouseUped element \"${selector}\"...`);
    }

    async function mouseDownAsync(selector: string) {
      let element;
      if (selector.charAt(0) === '#') {
        console.log(`Finding element by id: id=${selector.substring(1, selector.length)}`);
        element = await page.$(`id=${selector.substring(1, selector.length)}`)
      } else {
        element = await page.$(`${selector}`);
      }
      console.log(`mouseDown element: ${element}...`);
      const box = await element.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      console.log(`mouseDowned element ${element}...`);
    }

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
      console.log(`screenshotPath, testName: ${screenshotsPath}`);
      if (!fs.existsSync(screenshotsPath)) {
        fs.mkdirSync(screenshotsPath, { recursive: true });
      }

      console.log(`Taking screenshot for ${testName}...`);
      ssNamePrefix = ssNamePrefix.replace(/#/g, "^^");
      await page.screenshot({
        // path: `${path}\\${ssNamePrefix}#${testName}#${'browserType'}.png`,
        path: `${path}\\${ssNamePrefix}^^${testName}^^${browserName}.png`
      });
      console.log('Screenshot taken', `${path}\${testName}.${browserName}.png`);
    }

    async function clickAsync(selector: string) {
      console.log(`Clicking element for  ${selector}...`);
      const element = await page.$(`${selector}`);
      await element.click({
        force: true
      });
      console.log('Item clicked');
    }

    async function elementScreenshotAsync(selector: string, testName: String) {
      console.log(`Selecting element for  ${selector}...`);
      console.log(`testName  ${testName}...`);
      const element = await page.$(`${selector}`);
      // await element.screenshot({ path: `${path}\\${ssNamePrefix^^${testName}^^${'browserType'}.png` });
      await element.screenshot({ path: `${path}\\${ssNamePrefix}^^${testName}^^${browserName}.png` });
      console.log('element screenshot taken: ', `${path}\\${ssNamePrefix}#${testName}#${browserName}.png`);
    }

    async function hoverAsync(selector: string) {
      console.log(`Hovering element for  ${selector}...`);
      const element = await page.$(`${selector}`);
      await element.hover({
        force: true
      });
      console.log(`Hovered element ${selector}...`);
    }

    async function waitForSelectorAsync(selector: string) {
      console.log(`Waiting for element for  ${selector}...`);
      await page.waitForSelector(`${selector}`);
    }

    async function waitForNotFoundAsync(selector: string) {
      console.log(`Waiting for element for  ${selector}... to detach`);
      //await page.waitForSelector(`${selector}`, 'detached');
    }

    async function doneAsync(shouldCloseWhenDone: string) {
      console.log(`StoryRunner done`);
      if (shouldCloseWhenDone) {
        console.log(`Closing the page`);
        await page.close();
      }
    }

    resolve();
  });
};

export default exposePlaywright;
