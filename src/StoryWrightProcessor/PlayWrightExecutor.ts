import * as fs from "fs";
import { Page } from "playwright";
import { sep } from "path";
/**
 * Class containing playwright exposed functions.
 */
export class PlayWrightExecutor {
  private fileSuffix: number = 0;

  constructor(
    private page: Page,
    private path: string,
    private ssNamePrefix: string,
    private browserName: string
  ) {}

  public async exposeFunctions() {
    await this.page.exposeFunction("makeScreenshot", this.makeScreenshot);
    await this.page.exposeFunction("click", this.click);
    await this.page.exposeFunction("hover", this.hover);
    await this.page.exposeFunction("wait", this.waitForSelector);
    await this.page.exposeFunction("waitForNotFound", this.waitForNotFound);
    await this.page.exposeFunction("elementScreenshot", this.elementScreenshot);
    await this.page.exposeFunction("done", this.done);
    await this.page.exposeFunction("setElementText", this.setElementText);
    await this.page.exposeFunction("pressKey", this.pressKey);
    await this.page.exposeFunction("executeScript", this.executeScript);
    await this.page.exposeFunction("focus", this.focus);
    await this.page.exposeFunction("mouseDown", this.mouseDown);
    await this.page.exposeFunction("mouseUp", this.mouseUp);
    await this.page.exposeFunction("waitForTimeout", this.waitForTimeout);
  }

  private waitForTimeout = async (waitTime: number) => {
    try {
      await this.page.waitForTimeout(waitTime);
    } catch (err) {
      console.error("ERROR: waitForTimeout: ", err.message);
      throw err;
    }
  }

  private mouseUp = async () => {
    try {
      await this.page.mouse.up();
    } catch (err) {
      console.error("ERROR: mouseUp: ", err.message);
      throw err;
    }
  };

  private mouseDown = async (selector: string) => {
    try {
      let element;
      element = await this.page.$(selector);
      const box = await element.boundingBox();
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
    } catch (err) {
      console.error("ERROR: mouseDown: ", err.message);
      throw err;
    }
  };

  private focus = async (selector: string) => {
    try {
      await this.page.focus(selector);
    } catch (err) {
      console.error("ERROR: focus: ", err.message);
      throw err;
    }
  };

  private executeScript = async (script: string) => {
    try {
      await this.page.evaluate(script);
    } catch (err) {
      console.error("ERROR: executeScript: ", err.message);
      throw err;
    }
  };

  private pressKey = async (selector: string, key: string) => {
    try {
      await this.page.press(selector, key);
    } catch (err) {
      console.error("ERROR: pressKey: ", err.message);
      throw err;
    }
  };

  private setElementText = async (selector: string, text: string) => {
    try {
      const element = await this.page.$(selector);
      await element.fill(text);
    } catch (err) {
      console.error("ERROR: setElementText: ", err.message);
      throw err;
    }
  };

  private click = async (selector: string) => {
    try {
      console.log("selector: ", selector);
      selector = this.curateSelector(selector);
      console.log("final selector: ", selector);
      const element = await this.page.$(selector);
      await element.click({
        force: true,
      });
      console.log("element clicked");
    } catch (err) {
      console.error("ERROR: click: ", err.message);
      throw err;
    }
  };

  private makeScreenshot = async (testName?: string) => {
    try {
      let screenshotPath = this.getScreenshotPath(testName);

      await this.page.screenshot({
        path: screenshotPath,
      });
    } catch (err) {
      console.error("ERROR: PAGE_SCREENSHOT: ", err.message);
      throw err;
    }
  };

  private elementScreenshot = async (selector: string, testName: string) => {
    try {
      let element = await this.page.$(selector);
      if (await element.isVisible()) {
        let screenshotPath = this.getScreenshotPath(testName);

        await element.screenshot({
          path: screenshotPath,
        });
      } else {
        console.log("ERROR: Element NOT VISIBLE: CAPTURING PAGE");
        await this.makeScreenshot(testName);
      }
    } catch (err) {
      console.error("ERROR: ELEMENT_SCREENSHOT: ", err.message);
      console.info("Trying full page screenshot");
      await this.makeScreenshot(testName);
    }
  };

  private hover = async (selector: string) => {
    try {
      console.log(`selector: ${selector}`);
      const element = await this.page.$(selector);
      await element.hover({
        force: true,
      });
    } catch (err) {
      console.error("ERROR: HOVER: ", err.message);
      throw err;
    }
  };

  private waitForSelector = async (selector: string) => {
    try {
      await this.page.waitForSelector(selector);
    } catch (err) {
      console.error("ERROR: waitForSelector: ", err.message);
      throw err;
    }
  };

  private waitForNotFound = async (selector: string) => {
    try {
      await this.page.waitForSelector(selector, { state: "detached" });
    } catch (err) {
      console.error("ERROR: waitForNotFound: ", err.message);
      throw err;
    }
  };

  private done = async () => {
    try {
      await this.page.close();
    } catch (err) {
      console.error("ERROR: completed steps: ", err.message);
      throw err;
    }
  };

  private getScreenshotPath(testName?: String) {
    this.ssNamePrefix = this.ssNamePrefix.replace(/:/g, "-");
    let screenshotPath: string;

    if (testName) {
      testName = testName.replace(/:/g, "-");
      screenshotPath = this.removeNonASCIICharacters(`${this.path}${sep}${this.ssNamePrefix}.${testName}.${this.browserName}`);
    } else {
      screenshotPath = this.removeNonASCIICharacters(`${this.path}${sep}${this.ssNamePrefix}.${this.browserName}`);
    }

    //INFO: Append file prefix if screenshot with same name exist.
    if (fs.existsSync(screenshotPath + ".png")) {
      screenshotPath = screenshotPath + "_" + ++this.fileSuffix;
    }

    screenshotPath += ".png";

    console.debug(`ScreenshotPath ${screenshotPath}`);
    return screenshotPath;
  }

  // INFO: Removes non-ASCII characters
  private removeNonASCIICharacters(name: string){
    return name.replace(/[^\x00-\x7F]/g,"");
  }

  // INFO: Add double quotes around selector if missing
  private curateSelector(selector: string){
    let newSelector = "";

    if(selector.indexOf("=") == -1){
      return selector;
    }
    newSelector = selector.substring(0, selector.indexOf("=")+1);

    while(selector.indexOf("[") > -1 && selector.indexOf("=") > -1){
      let temp = selector.substring(selector.indexOf("=") + 1, selector.indexOf("]"));

      if(!(temp.charAt(0) == '"' || temp.charAt(0) == '\'')){
        temp = '"' + temp + '"';
      }
      newSelector += temp + "]";
      selector = selector.substring(selector.indexOf("]")+1, selector.length);
    }
    if(selector.length > 0){
      newSelector += selector;
    }

    return newSelector;
  }
}
