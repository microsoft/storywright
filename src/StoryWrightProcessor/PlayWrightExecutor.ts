import * as fs from "fs";
import { Page } from "playwright";
import { sep } from "path";
import { StoryWrightOptions } from "./StoryWrightOptions";
/**
 * Class containing playwright exposed functions.
 */
export class PlayWrightExecutor {
  private fileSuffix: number = 0;

  //Marking in public temporarily just to avoid tsc compilation error
  public isPageBusy;

  constructor(
    private page: Page,
    private ssNamePrefix: string,
    private browserName: string,
    private options: StoryWrightOptions
  ) {
  }

  public async getIsPageBusyMethod() {
    const busy = {
      pendingPromises: 0,
      pendingTimeouts: 0,
      networkOrCpu: 0,
      mutatedDom: 0,
    };

    // Mainting set here instead in page initscript becuase its easy to debug and view logs here
    const timeoutIdSet = new Set();

    await this.page.exposeFunction("__pwBusy__", (key: string, timeoutId: number) => {
      if (key === "promises++") {
        busy.pendingPromises++;
      } else if (key === "promises--") {
        busy.pendingPromises--;
      } else if (key === "timeouts++") {
        timeoutIdSet.add(timeoutId);
        busy.pendingTimeouts++;
      } else if (key === "timeouts--") {
        if (timeoutIdSet.has(timeoutId)) {
          timeoutIdSet.delete(timeoutId);
          busy.pendingTimeouts--;
        }
      } else if (key === "dom++") {
        busy.mutatedDom++;
      } else if (key === "dom--") {
        busy.mutatedDom--;
      }
    });

    await this.page.addInitScript(`{
      const _setTimeout = window.setTimeout;
      const _clearTimeout = window.clearTimeout;

      window.clearTimeout = (timeoutId) => {
        _clearTimeout(timeoutId);
        window.__pwBusy__("timeouts--",timeoutId);
      }

      window.setTimeout = function(fn, delay, params) {
        const isInNearFuture = delay < 1000 * 7;
        var timeoutId = _setTimeout(function() {
          try {
            fn && fn(params);
          }
          finally {
            window.__pwBusy__("timeouts--",timeoutId);
          }
        }, delay);
        if (isInNearFuture) {
          window.__pwBusy__("timeouts++",timeoutId);
        }
        return timeoutId;
      }
    }`);

    return async (): Promise<boolean> => {
      // Check if the network or CPU are idle
      const now = Date.now();
      await this.page.waitForLoadState("load");
      await this.page.waitForLoadState("networkidle");
      await this.page.evaluate(`new Promise(resolve => {
        window.requestIdleCallback(() => { resolve(); });
      })`);
      busy.networkOrCpu = Math.max(0, Date.now() - now - 3); // Allow a short delay due to node/browser bridge

      //Temporarity remove network and other checks
      const isBusy =
        busy.pendingTimeouts >
        0;

      // Busy pending timeout is not expected so log it.
      if (busy.pendingTimeouts < 0) {
        console.log(`ERRR : Pending timeouts less than 0 ${busy.pendingTimeouts}`);
      }
      return isBusy;
    };
  };

  private async checkIfPageIsBusy(screenshotPath: string) {
    const timeout = Date.now() + 8000; // WHATEVER REASONABLE TIME WE DECIDE
    let isBusy: boolean;
    do {
      // Add a default wait for 1sec for css rendring, click or hover activities. 
      // Ideally the test should be authored in such a way that it should wait for element to be visible and then take screenshot but that gets missed out in most test cases.
      // Also on hover activities where just some background changes its difficult for test author to write such waiting mechanism hence adding default 1 second wait.
      await this.page.waitForTimeout(this.options.waitTimeScreenshot);
      isBusy = await this.isPageBusy();
    } while (isBusy && Date.now() < timeout);

    if (isBusy) {
      console.log(`E2223 : Page busy for ${this.page.url()} Path = ${screenshotPath}`)
    }
  }

  public async exposeFunctions() {
    this.isPageBusy = await this.getIsPageBusyMethod();
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
      selector = this.curateSelector(selector);
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
      selector = this.curateSelector(selector);
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
      selector = this.curateSelector(selector);
      await this.page.keyboard.press(key);
    } catch (err) {
      console.error("ERROR: pressKey: ", err.message);
      throw err;
    }
  };

  private setElementText = async (selector: string, text: string) => {
    try {
      selector = this.curateSelector(selector);
      const element = await this.page.$(selector);
      await element.fill(text);
    } catch (err) {
      console.error("ERROR: setElementText: ", err.message);
      throw err;
    }
  };

  private click = async (selector: string) => {
    try {
      selector = this.curateSelector(selector);
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
      await this.checkIfPageIsBusy(screenshotPath);
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
      selector = this.curateSelector(selector);
      let element = await this.page.$(selector);
      if (await element.isVisible()) {
        let screenshotPath = this.getScreenshotPath(testName);

        await this.checkIfPageIsBusy(screenshotPath);
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
      selector = this.curateSelector(selector);
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
      selector = this.curateSelector(selector);
      await this.page.waitForSelector(selector);
    } catch (err) {
      console.error("ERROR: waitForSelector: ", err.message);
      throw err;
    }
  };

  private waitForNotFound = async (selector: string) => {
    try {
      selector = this.curateSelector(selector);
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
      screenshotPath = this.removeNonASCIICharacters(`${this.options.screenShotDestPath}${sep}${this.ssNamePrefix}.${testName}.${this.browserName}`);
    } else {
      screenshotPath = this.removeNonASCIICharacters(`${this.options.screenShotDestPath}${sep}${this.ssNamePrefix}.${this.browserName}`);
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
  private removeNonASCIICharacters(name: string) {
    return name.replace(/[^\x00-\x7F]/g, "");
  }


  /*  This will insert double quotes around selector string, if missing.
      Eg: buttonbutton[data-id=ex123][attr=ex432] will be changed to button[data-id="ex123"][attr="ex432"] 
  */
  private curateSelector(selector: string) {
    //No need to check if selector doesn't contain equals to (=)
    if (selector.indexOf("=") == -1) {
      return selector;
    }

    let newSelector = "";
    newSelector = selector.substring(0, selector.indexOf("=") + 1);

    //Loop through all attributes 
    while (selector.indexOf("[") > -1 && selector.indexOf("=") > -1) {
      /*  Pulls out chars b/w equals to (=) and closing square bracket (])
          Eg: button[data-id=ex123] will give "ex123" to temp
      */
      let temp = selector.substring(selector.indexOf("=") + 1, selector.indexOf("]"));

      // Check if temp is not surrounded by either double/single quotes
      if (!(temp.charAt(0) == '"' || temp.charAt(0) == '\'')) {
        temp = '"' + temp + '"';
      }

      newSelector += temp + "]";

      // Move to the next chunk to curate 
      // Eg: If buttonbutton[data-id=ex123][attr=ex432] then move selector to [attr=432]
      selector = selector.substring(selector.indexOf("]") + 1, selector.length);
    }
    if (selector.length > 0) {
      newSelector += selector;
    }

    return newSelector;
  }
}
