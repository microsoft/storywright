import * as fs from 'fs';
import { Page } from 'playwright';

/**
 * Class containing playwright exposed functions.
 */
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

  mouseUpAsync = async () => {
    await this.page.mouse.up();
  }

  mouseDownAsync = async (selector: string) => {
    let element;
    if (selector.charAt(0) === '#') {
      element = await this.page.$(`id=${selector.substring(1, selector.length)}`)
    } else {
      element = await this.page.$(`${selector}`);
    }
    const box = await element.boundingBox();
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
  }

  focusAsync = async (selector: string) => {
    await this.page.focus(selector);
  }

  executeScriptAsync = async (script: string) => {
    await this.page.evaluate(script);
  }

  pressKeyAsync = async (selector: string, key: string) => {
    await this.page.press(selector, key);
  }

  setElementTextAsync = async (selector: string, text: string) => {
    const element = await this.page.$(`${selector}`);
    await element.fill(text);
  }

  clickAsync = async (selector: string) => {
    const element = await this.page.$(`${selector}`);
    await element.click({
      force: true
    });
  }

  makeScreenshotAsync = async (testName: string) => {
    let screenshotPath = this.getScreenshotPath(testName);

    await this.page.screenshot({
      path: `${screenshotPath}.png`
    });
  }

  elementScreenshotAsync = async (selector: string, testName: String) => {
    const element = await this.page.$(`${selector}`);
    let screenshotPath = this.getScreenshotPath(testName);

    await element.screenshot({
      path: `${screenshotPath}.png`
    });
    console.log('Screenshot taken', `${screenshotPath}.png`);
  }

  hoverAsync = async (selector: string) => {
    const element = await this.page.$(`${selector}`);
    await element.hover({
      force: true
    });
  }

  waitForSelectorAsync = async (selector: string) => {
    await this.page.waitForSelector(`${selector}`);
  }

  waitForNotFoundAsync = async (selector: string) => {
    await this.page.waitForSelector(`${selector}`, { state: 'detached' });
  }

  doneAsync = async () => {
    await this.page.close();
  }

  public getScreenshotPath(testName: String) {
    this.ssNamePrefix = this.ssNamePrefix.replace(/:/g, "-");
    testName = testName.replace(/:/g, "-");
    let screenshotPath = `${this.path}\\${this.ssNamePrefix}^^${testName}^^${this.browserName}`;

    //INFO: Append file prefix if screenshot with same name exist.
    if (fs.existsSync(screenshotPath + ".png")) {
      screenshotPath = screenshotPath + '_' + (++this.fileSuffix);
    }

    console.debug(`ScreenshotPath ${screenshotPath}`);
    return screenshotPath;
  }
}