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

  private mouseUpAsync = async () => {
    try {
      await this.page.mouse.up();
    } catch (err) {
      console.error("ERROR: mouseUp: ", err.message);
      throw err;
    }
  }

  private mouseDownAsync = async (selector: string) => {
    try {
      let element;
      if (selector.charAt(0) === '#') {
        element = await this.page.$(`id=${selector.substring(1, selector.length)}`)
      } else {
        element = await this.page.$(`${selector}`);
      }
      const box = await element.boundingBox();
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
    } catch (err) {
      console.error("ERROR: mouseDown: ", err.message);
      throw err;
    }
  }

  private focusAsync = async (selector: string) => {
    try {
      await this.page.focus(selector);
    } catch (err) {
      console.error("ERROR: focus: ", err.message);
      throw err;
    }
  }

  private executeScriptAsync = async (script: string) => {
    try {
      await this.page.evaluate(script);
    } catch (err) {
      console.error("ERROR: executeScript: ", err.message);
      throw err;
    }
  }

  private pressKeyAsync = async (selector: string, key: string) => {
    try {
      await this.page.press(selector, key);
    } catch (err) {
      console.error("ERROR: pressKey: ", err.message);
      throw err;
    }
  }

  private setElementTextAsync = async (selector: string, text: string) => {
    try {
      const element = await this.page.$(`${selector}`);
      await element.fill(text);
    } catch (err) {
      console.error("ERROR: setElementText: ", err.message);
      throw err;
    }
  }

  private clickAsync = async (selector: string) => {
    try {
      const element = await this.page.$(`${selector}`);
      await element.click({
        force: true
      });
      console.log("element clicked");
    } catch (err) {
      console.error("ERROR: click: ", err.message);
      throw err;
    }
  }

  private makeScreenshotAsync = async (testName: string) => {
    try {
      let screenshotPath = this.getScreenshotPath(testName);

      await this.page.screenshot({
        path: `${screenshotPath}.png`
      });
    } catch (err) {
      console.error("ERROR: PAGE_SCREENSHOT: ", err.message);
      throw err;
    }
  }

  private elementScreenshotAsync = async (selector: string, testName: string) => {
    try {
      let element = await this.page.$(`${selector}`);
      if (await element.isVisible()) {
        let screenshotPath = this.getScreenshotPath(testName);

        await element.screenshot({
          path: `${screenshotPath}.png`
        });
      } else {
        console.log("ERROR: Element NOT VISIBLE: CAPTURING PAGE");
        await this.makeScreenshotAsync(testName);
      }

    } catch (err) {
      console.error("ERROR: ELEMENT_SCREENSHOT: ", err.message);
      console.info("Trying full page screenshot");
      await this.makeScreenshotAsync(testName);
    }

  }

  private hoverAsync = async (selector: string) => {
    try {
      const element = await this.page.$(`${selector}`);
      await element.hover({
        force: true
      });
    } catch (err) {
      console.error("ERROR: HOVER: ", err.message);
      throw err;
    }

  }

  private waitForSelectorAsync = async (selector: string) => {
    try {
      await this.page.waitForSelector(`${selector}`);
    } catch (err) {
      console.error("ERROR: waitForSelector: ", err.message);
      throw err;
    }
  }

  private waitForNotFoundAsync = async (selector: string) => {
    try {
      await this.page.waitForSelector(`${selector}`, { state: 'detached' });
    } catch (err) {
      console.error("ERROR: waitForNotFound: ", err.message);
      throw err;
    }
  }

  private doneAsync = async () => {
    try {
      await this.page.close();
    } catch (err) {
      console.error("ERROR: completed steps: ", err.message);
      throw err;
    }
  }

  private getScreenshotPath(testName: String) {
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