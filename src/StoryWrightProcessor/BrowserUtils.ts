import * as playwright from 'playwright';
import { Browser } from './Constants';
export class BrowserUtils {
    /**
     * Returns browser instance for given browser name
     * @param browserName Name of browser - firefox,chromium
     * @param headless Whether to start in headless mode
     * @returns Playwright browser instance
     */
    public static async getBrowserInstance(browserName: string, headless: boolean) {
        switch (browserName) {
            case Browser.Chromium:
                return await playwright.chromium.launch({ headless: headless });
            case Browser.Firefox:
                return await playwright.firefox.launch({ headless: headless });
        }
    }
}