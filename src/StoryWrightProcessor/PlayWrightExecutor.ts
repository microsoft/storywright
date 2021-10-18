import * as fs from "fs";
import { Page, Frame } from "playwright";
import { sep } from "path";
/**
 * Class containing playwright exposed functions.
 */
export class PlayWrightExecutor {
  private fileSuffix: number = 0;
  private isPageBusy;

  constructor(
    private page: Page,
    private path: String,
    private ssNamePrefix: String,
    private browserName: string
  ) {
  }

  private async getIsPageBusyMethod() {
    const busy = {
      pendingPromises: 0,
      pendingTimeouts: 0,
      networkOrCpu: 0,
      mutatedDom: 0,
    };
  
    this.page.on("framenavigated", (frame: Frame) => {
      if (!frame.parentFrame()) {
        busy.pendingPromises = 0;
        busy.pendingTimeouts = 0;
        busy.networkOrCpu = 0;
        busy.mutatedDom = 0;
      }
    });
  
    await this.page.exposeFunction("__pwBusy__", (key: string) => {
      if (key === "promises++") {
        busy.pendingPromises++;
      } else if (key === "promises--") {
        busy.pendingPromises--;
      } else if (key === "timeouts++") {
        busy.pendingTimeouts++;
      } else if (key === "timeouts--") {
        busy.pendingTimeouts--;
      } else if (key === "dom++") {
        busy.mutatedDom++;
      } else if (key === "dom--") {
        busy.mutatedDom--;
      }
    });
  
    this.page.addInitScript(`{
        const _promiseConstructor = window.Promise.constructor;
        const _timeoutIds = new Set();
        const _setTimeout = window.setTimeout;
        const _clearTimeout = window.clearTimeout;
  
        new MutationObserver(() => {
          window.__pwBusy__("dom++");
          requestAnimationFrame(() => { window.__pwBusy__("dom--"); });
        }).observe(document, { attributes: true, childList: true, subtree: true });
  
        // Patch Promise constructor
        window.Promise.constructor = async (resolve, reject) => {
          window.__pwBusy__("promises++");
  
          const res = resolve && (async () => {
            let val;
            try {
              val = await resolve();
            } catch(err) {
              throw err;
            } finally {
              window.__pwBusy__("promises--");
            }
            return val;
          });
  
          const rej = reject && (async () => {
            let val;
            try {
              val = await reject();
            } catch(err) {
              throw err;
            } finally {
              window.__pwBusy__("promises--");
            }
            return val;
          });
  
          return _promiseConstructor.call(this, res, rej);
        };
  
        // Path window.clearTimeout
        window.clearTimeout = (id) => {
          _clearTimeout(id);
          if (_timeoutIds.has(id)) {
            _timeoutIds.delete(id);
            window.__pwBusy__("timeouts--");
          }
        };
        // Patch window.setTimeout in the near future
        window.setTimeout = (...args) => {
          const ms = args[1];
          const isInNearFuture = ms < 1000 * 5;
          if (isInNearFuture) {
            window.__pwBusy__("timeouts++");
            const fn = args[0];
            if (typeof(fn) === "function") {
              args[0]  = () => {
                try {
                  fn();
                } catch(err) {
                } finally {
                  window.__pwBusy__("timeouts--");
                }
              };
            } else {
              args[0]  = "try{" + args[0] + "; }catch(err){};window.__pwBusy__('timeouts--');";
            }
          }
  
          const timeoutId = _setTimeout.apply(this, args);
  
          if (isInNearFuture) {
            _timeoutIds.add(timeoutId);
          }
  
          return timeoutId;
        };
    }`);
  
    return async (): Promise<boolean> => {
      // Check if the network or CPU are idle
      const now = Date.now();
      await this.page.waitForLoadState("networkidle");
      await this.page.evaluate(`new Promise(resolve => {
        window.requestIdleCallback(() => { resolve(); });
      })`);
      busy.networkOrCpu = Math.max(0, Date.now() - now - 3); // Allow a short delay due to node/browser bridge
  
      const isBusy =
        busy.networkOrCpu +
          busy.mutatedDom +
          busy.pendingPromises +
          busy.pendingTimeouts >
        0;
  
      return isBusy;
    };
  };

  private async checkIfPageIsBusy() {
    // Wait while the page is busy before screenshot'ing the story
    let busyTime = 0;
    const busyTimeout = 1000; // WHATEVER REASONABLE TIME WE DECIDE
    const startBusyTime = Date.now();
    do {
      await this.page.waitForTimeout(50);
      busyTime = Date.now() - startBusyTime;
    } while (busyTime < busyTimeout && (await this.isPageBusy()));
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
      if (selector.charAt(0) === "#") {
        element = await this.page.$(
          `id=${selector.substring(1, selector.length)}`
        );
      } else {
        element = await this.page.$(selector);
      }
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
      await this.checkIfPageIsBusy();
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

        await this.checkIfPageIsBusy();
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
      screenshotPath = `${this.path}${sep}${this.ssNamePrefix}.${testName}.${this.browserName}`;
    } else {
      screenshotPath = `${this.path}${sep}${this.ssNamePrefix}.${this.browserName}`;
    }

    //INFO: Append file prefix if screenshot with same name exist.
    if (fs.existsSync(screenshotPath + ".png")) {
      screenshotPath = screenshotPath + "_" + ++this.fileSuffix;
    }

    screenshotPath += ".png";

    console.debug(`ScreenshotPath ${screenshotPath}`);
    return screenshotPath;
  }
}
