import * as fs from 'fs';
import { Page } from 'playwright';

export class PlayWrightExecutor {
  private fileSuffix: number = 0;

  constructor(private page: Page, private path: String, private ssNamePrefix: String, private browserName: string) { }

  public async exposeFunctions() {
    await this.page.exposeFunction('makeScreenshot', this.makeScreenshotAsync);
    await this.page.exposeFunction('click', this.clickAsync);
    await this.page.exposeFunction('hover', this.hoverAsync);
    await this.page.exposeFunction('wait', this.waitForSelectorAsync);
    await this.page.exposeFunction('waitForNotFound', this.waitForNotFoundAsync);
    await this.page.exposeFunction('elementScreenshot', this.elementScreenshotAsync);
    await this.page.exposeFunction('done', this.doneAsync);
    await this.page.exposeFunction('setElementText', this.setElementTextAsync);
    await this.page.exposeFunction('pressKey', this.pressKeyAsync);
    await this.page.exposeFunction('executeScript', this.executeScriptAsync);
    await this.page.exposeFunction('focus', this.focusAsync);
    await this.page.exposeFunction('mouseDown', this.mouseDownAsync);
    await this.page.exposeFunction('mouseUp', this.mouseUpAsync);
  }

  mouseUpAsync = async (selector: string) => {
    console.log(`mouseUp element \"${selector}\"...`);
    await this.page.mouse.up();
    console.log(`mouseUped element \"${selector}\"...`);
  }

  mouseDownAsync = async (selector: string) => {
    let element;
    if (selector.charAt(0) === '#') {
      console.log(`Finding element by id: id=${selector.substring(1, selector.length)}`);
      element = await this.page.$(`id=${selector.substring(1, selector.length)}`)
    } else {
      element = await this.page.$(`${selector}`);
    }
    console.log(`mouseDown element: ${element}...`);
    const box = await element.boundingBox();
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    console.log(`mouseDowned element ${element}...`);
  }

  focusAsync = async (selector: string) => {
    console.log(`Focusing element \"${selector}\"...`);
    await this.page.focus(selector);
    console.log(`Focused element \"${selector}\"...`);
  }

  executeScriptAsync = async (script: string) => {
    console.log(`Executing script \"${script}\"...`);
    await this.page.evaluate(script);
    console.log(`Executed script \"${script}\"...`);
  }

  pressKeyAsync = async (selector: string, key: string) => {
    console.log(`Pressing key ${key} element  ${selector}...`);
    await this.page.press(selector, key);
    console.log(`Key ${key} pressed`);
  }

  setElementTextAsync = async (selector: string, text: string) => {
    console.log(`Setting text for element  ${selector}...`);
    const element = await this.page.$(`${selector}`);
    await element.fill(text);
    console.log('Text inserted');
  }

  clickAsync = async (selector: string) => {
    console.log(`Clicking element for  ${selector}...`);
    const element = await this.page.$(`${selector}`);
    await element.click({
      force: true
    });
    console.log('Item clicked');
  }

  makeScreenshotAsync = async (testName: string) => {
    let screenshotPath = this.getScreenshotPath(testName);

    await this.page.screenshot({
      path: `${screenshotPath}.png`
    });
    console.log('Screenshot taken', `${screenshotPath}.png`);
  }

  elementScreenshotAsync = async (selector: string, testName: String) => {
    console.log(`Selecting element for  ${selector}...`);
    const element = await this.page.$(`${selector}`);
    let screenshotPath = this.getScreenshotPath(testName);

    await element.screenshot({
      path: `${screenshotPath}.png`
    });
    console.log('Screenshot taken', `${screenshotPath}.png`);
  }

  hoverAsync = async (selector: string) => {
    console.log(`Hovering element for  ${selector}...`);
    const element = await this.page.$(`${selector}`);
    await element.hover({
      force: true
    });
    console.log(`Hovered element ${selector}...`);
  }

  waitForSelectorAsync = async (selector: string) => {
    console.log(`Waiting for element for  ${selector}...`);
    await this.page.waitForSelector(`${selector}`);
  }

  waitForNotFoundAsync = async (selector: string) => {
    console.log(`Waiting for element for  ${selector}... to detach`);
    await this.page.waitForSelector(`${selector}`, { state: 'detached' });
  }

  doneAsync = async () => {
    console.log(`StoryRunner done`);
    console.log(`Closing the page and the browser`);
    await this.page.close();
    console.log(`Page is closed`);
  }

  public getScreenshotPath(testName: String) {
    this.ssNamePrefix = this.ssNamePrefix.replace(/:/g, "-");
    testName = testName.replace(/:/g, "-");
    let screenshotPath = `${this.path}\\${this.ssNamePrefix}^^${testName}^^${this.browserName}`;

    //INFO: Append file prefix if screenshot with same name exist.
    if (fs.existsSync(screenshotPath + ".png")) {
      console.log("FILE EXISTS");
      screenshotPath = screenshotPath + '_' + (++this.fileSuffix);
    }

    console.log(`screenshotPath ${screenshotPath}`);
    return screenshotPath;
  }
}