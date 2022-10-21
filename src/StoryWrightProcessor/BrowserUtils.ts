import * as puppeteer from "puppeteer";
import { BrowserName } from "./Constants";
export class BrowserUtils {
  /**
   * Returns browser instance for given browser name
   * @param browserName Name of browser - firefox,chromium
   * @param headless Whether to start in headless mode
   * @returns Playwright browser instance
   */
  public static async getBrowserInstance(
    browserName: string,
    headless: boolean
  ) {
    switch (browserName) {
      case BrowserName.Chromium:
        return await puppeteer.launch({ args: ["--disable-gpu, --allow-file-access-from-files"], headless });
      case BrowserName.Firefox:
        return await puppeteer.launch({ headless });
      case BrowserName.Webkit:
        return await puppeteer.launch({ headless });
    }
  }
}
