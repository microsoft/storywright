import * as fs from 'fs';
import { Page } from 'playwright';

const exposePlaywright = async (page: Page, path: String, ssNamePrefix: String, browserName: string): Promise<any | void> => {
  console.log('exposing playwright');
  let fileSuffix = 0;
  return new Promise<void>(async resolve => {
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

    async function clickAsync(selector: string) {
      console.log(`Clicking element for  ${selector}...`);
      const element = await page.$(`${selector}`);
      await element.click({
        force: true
      });
      console.log('Item clicked');
    }
    
    async function makeScreenshotAsync(testName: string) {
      let screenshotPath = getScreenshotPath(testName);

      await page.screenshot({
        path: `${screenshotPath}.png`
      });
      console.log('Screenshot taken', `${screenshotPath}.png`);
    }

    async function elementScreenshotAsync(selector: string, testName: String) {
      console.log(`Selecting element for  ${selector}...`);
      const element = await page.$(`${selector}`);
      let screenshotPath = getScreenshotPath(testName);

      await element.screenshot({
        path: `${screenshotPath}.png`
      });
      console.log('Screenshot taken', `${screenshotPath}.png`);
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
      await page.waitForSelector(`${selector}`, {state: 'detached'});
    }

    async function doneAsync() {
      console.log(`StoryRunner done`);
      console.log(`Closing the page and the browser`);
      await page.close();
      console.log(`Page is closed`);
    }
  
    function getScreenshotPath(testName: String){
      ssNamePrefix = ssNamePrefix.replace(/#/g, "^^").replace(/:/g, "-");
      testName = testName.replace(/#/g, "^^").replace(/:/g, "-");
      let screenshotPath = `${path}\\${ssNamePrefix}^^${testName}^^${browserName}`;

      //INFO: Append file prefix if screenshot with same name exist.
      if(fs.existsSync(screenshotPath + ".png")){
        console.log("FILE EXISTS");
        screenshotPath = screenshotPath + '_' +(++fileSuffix);
      }

      console.log(`screenshotPath ${screenshotPath}`);
      return screenshotPath;
    }

    resolve();
  });
};

export default exposePlaywright;
