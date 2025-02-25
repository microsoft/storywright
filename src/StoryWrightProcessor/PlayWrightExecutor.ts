import * as fs from "fs";
import { Page } from "playwright";
import { sep } from "path";
import { StoryWrightOptions } from "./StoryWrightOptions";
import { StepsExecutor } from "./StepsExecutor";
import type { Story } from "../utils";
/**
 * Class containing playwright exposed functions.
 */
class Busy {
  constructor(
    public pendingTimeouts: number,
    public pendingNetworkMap: Map<string, number>,
    public pendingDom: number
  ) {
  }
}

export class PlayWrightExecutor {
  private fileSuffix: number = 0;

  private isPageBusy: () => Promise<Busy>;

  constructor(
    private page: Page,
    private ssNamePrefix: string,
    private browserName: string,
    private options: StoryWrightOptions,
    private story: Story
  ) {
  }

  public async getIsPageBusyMethod() {

    const busy = new Busy(0, new Map<string, number>(), 0);

    this.page.on('request', (request) => {
      const url = request.url();
      const networkCount = busy.pendingNetworkMap.get(url);
      if (!networkCount || networkCount === 0) {
        busy.pendingNetworkMap.set(url, 1);
      }
      else {
        busy.pendingNetworkMap.set(url, networkCount + 1);
      }
    });

    this.page.on('response', (response) => {
      const url = response.url();
      const networkCount = busy.pendingNetworkMap.get(url);
      if (networkCount <= 1) {
        busy.pendingNetworkMap.delete(url);
      }
      else {
        busy.pendingNetworkMap.set(url, networkCount - 1);
      }
    });

    // Mainting set here instead in page initscript becuase its easy to debug and view logs here
    const timeoutIdSet = new Set();

    await this.page.exposeFunction("__pwBusy__", (key: string, timeoutId: number) => {
      if (key === "timeouts++") {
        timeoutIdSet.add(timeoutId);
        busy.pendingTimeouts++;
      } else if (key === "timeouts--") {
        if (timeoutIdSet.has(timeoutId)) {
          timeoutIdSet.delete(timeoutId);
          busy.pendingTimeouts--;
        }
      } else if (key === "dom++") {
        busy.pendingDom++;
      } else if (key === "dom--") {
        busy.pendingDom--;
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

      new MutationObserver(() => {
        window.__pwBusy__("dom++");
        requestAnimationFrame(() => { window.__pwBusy__("dom--"); });
      }).observe(document, { attributes: true, childList: true, subtree: true });

    }`);

    return async (): Promise<Busy> => {
      // Check if the network or CPU are idle
      await this.page.waitForLoadState("load");
      await this.page.waitForLoadState("networkidle");

      // Busy pending timeout is not expected so log it.
      if (busy.pendingTimeouts < 0) {
        console.log(`ERRR : Pending timeouts less than 0 ${busy.pendingTimeouts}`);
      }
      return busy;
    };
  };

  private delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  private async checkIfPageIsBusy(screenshotPath: string) {
    const timeout = Date.now() + 5000; // WHATEVER REASONABLE TIME WE DECIDE
    let isBusy: boolean;
    let busy: Busy;
    do {
      // Add a default wait for 1sec for css rendring, click or hover activities.
      // Ideally the test should be authored in such a way that it should wait for element to be visible and then take screenshot but that gets missed out in most test cases.
      // Also on hover activities where just some background changes its difficult for test author to write such waiting mechanism hence adding default 1 second wait.
      await this.delay(this.options.waitTimeScreenshot);
      busy = await this.isPageBusy();
      isBusy = busy.pendingTimeouts + busy.pendingNetworkMap.size + busy.pendingDom > 0;
    } while (isBusy && Date.now() < timeout);

    if (isBusy) {
      if (busy.pendingTimeouts > 0) {
        console.log(`E2223 : Page busy. Pending timeouts for ${this.page.url()} Path = ${screenshotPath}`);
      }
      else if (busy.pendingNetworkMap.size > 0) {
        console.log(`E2223 : Page busy. Pending network for ${this.page.url()} Path = ${screenshotPath} PendingUrls = ${JSON.stringify(Array.from(busy.pendingNetworkMap))}`);
      }
      else if (busy.pendingDom > 0) {
        console.log(`E2223 : Page busy. Pending dom for ${this.page.url()} Path = ${screenshotPath}`);
      }
      else {
        console.log(`E2223 : Page busy for ${this.page.url()} Path = ${screenshotPath}`)
      }
    }
  }

  public async processStory() {
    const steps = this.story.steps;

    try {
      if (steps === null || steps === undefined || steps.length == 0) {
        await this.makeScreenshot();
        await this.done();
        return;
      }

      console.info(`steps: ${this.story.id} - start`);
      await StepsExecutor.executesteps(steps, this);
      console.info(`steps: ${this.story.id} - end`);
    } catch (err) {
      console.error("ERROR: completed steps: ", err.message);
      throw err;
    }
  }

  public async exposeFunctions() {
    this.isPageBusy = await this.getIsPageBusyMethod();
  }

  public waitForTimeout = async (waitTime: number) => {
    try {
      await this.page.waitForTimeout(waitTime);
    } catch (err) {
      console.error("ERROR: waitForTimeout: ", err.message);
      throw err;
    }
  }

  public mouseUp = async () => {
    try {
      await this.page.mouse.up();
    } catch (err) {
      console.error("ERROR: mouseUp: ", err.message);
      throw err;
    }
  };

  public mouseDown = async (selector: string) => {
    try {
      let element;
      selector = this.curateSelector(selector);
      element = await this.page.$(selector);
      const box = await element.boundingBox();
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
    } catch (err) {
      console.error(`ERROR: mouseDown: selector ${selector}`, err.message);
      throw err;
    }
  };

  public focus = async (selector: string) => {
    try {
      selector = this.curateSelector(selector);
      await this.page.focus(selector);
    } catch (err) {
      console.error(`ERROR: focus: selector ${selector}`, err.message);
      throw err;
    }
  };

  public executeScript = async (script: string) => {
    try {
      await this.page.evaluate(script);
    } catch (err) {
      console.error(`ERROR: executeScript: ${script}`, err.message);
      throw err;
    }
  };

  public pressKey = async (selector: string, key: string) => {
    try {
      selector = this.curateSelector(selector);
      await this.page.keyboard.press(key);
    } catch (err) {
      console.error(`ERROR: pressKey: selector ${selector}, key ${key}`, err.message);
      throw err;
    }
  };

  public setElementText = async (selector: string, text: string) => {
    try {
      selector = this.curateSelector(selector);
      const element = await this.page.$(selector);
      await element.fill(text);
    } catch (err) {
      console.error(`ERROR: setElementText : selector ${selector} : text ${text}`, err.message);
      throw err;
    }
  };

  public click = async (selector: string) => {
    try {
      selector = this.curateSelector(selector);
      const element = await this.page.$(selector);

      await element.click({
        force: true,
      });

      // Consecutive clicks or hover create timing issue hence adding small delay.
      let delay = 200;
      if (selector.includes("testButton")) {
        //This is a hacky fix for a very specific test scenario.
        delay = 6000;
      }
      console.log(`element ${selector} clicked`);
      await this.delay(delay);
    } catch (err) {
      console.error(`ERROR: clicking: ${selector}`, err.message);
      throw err;
    }
  };

  public makeScreenshot = async (testName?: string) => {
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

  public elementScreenshot = async (selector: string, testName: string) => {
    try {
      selector = this.curateSelector(selector);
      /**
       * Stories are loaded via native ESM (async), we need to wait for the JS to be loaded and applied on DOM
       */
      const element = await this.page.waitForSelector(selector);

      if (await element.isVisible()) {
        let screenshotPath = this.getScreenshotPath(testName);

        await this.checkIfPageIsBusy(screenshotPath);
        await element.screenshot({
          path: screenshotPath,
        });
      } else {
        console.log(`ERROR: Element NOT VISIBLE: CAPTURING PAGE ${selector}`);
        await this.makeScreenshot(testName);
      }
    } catch (err) {
      console.error(`ERROR: ELEMENT_SCREENSHOT: ${selector}`, err.message);
      console.info("Trying full page screenshot");
      await this.makeScreenshot(testName);
    }
  };

  public hover = async (selector: string) => {
    try {
      selector = this.curateSelector(selector);
      const element = await this.page.waitForSelector(selector);
      await element.hover({
        force: true,
      });
      // Consecutive clicks or hover create timing issue hence adding small delay.
      await this.delay(100);
    } catch (err) {
      console.error(`ERROR: HOVER: ${selector}`, err.message);
      throw err;
    }
  };

  public waitForSelector = async (selector: string) => {
    try {
      selector = this.curateSelector(selector);
      await this.page.waitForSelector(selector);
    } catch (err) {
      console.error(`ERROR: waitForSelector: ${selector}`, err.message);
      throw err;
    }
  };

  public waitForNotFound = async (selector: string) => {
    try {
      selector = this.curateSelector(selector);
      await this.page.waitForSelector(selector, { state: "detached" });
    } catch (err) {
      console.error(`ERROR: waitForNotFound: ${selector}`, err.message);
      throw err;
    }
  };

  public done = async () => {
    try {
      await this.page.close();
    } catch (err) {
      console.error("ERROR: completed steps: ", err.message);
      throw err;
    }
  };

  private getScreenshotPath(testName?: String) {
    this.ssNamePrefix = this.ssNamePrefix.replaceAll(/:/g, "-");
    this.ssNamePrefix = this.ssNamePrefix.replaceAll(/=/g, " ");
    this.ssNamePrefix = this.ssNamePrefix.replaceAll(/\"/g, " ");
    this.ssNamePrefix = this.ssNamePrefix.replaceAll(/</g, " ");
    this.ssNamePrefix = this.ssNamePrefix.replaceAll(/>/g, " ");
    let screenshotPath: string;

    if (testName) {
      testName = testName.replaceAll(/:/g, "-");
      testName = testName.replaceAll(/=/g, " ");
      testName = testName.replaceAll(/\"/g, " ");
      testName = testName.replaceAll(/</g, " ");
      testName = testName.replaceAll(/>/g, " ");
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
