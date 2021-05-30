import * as playwright from 'playwright';
import { Browser } from './Constants';
export class BrowserUtils {
    public static async getBrowserInstance(browserName: string, headless: boolean) {
        switch (browserName) {
            case Browser.Chromium:
                return await playwright.chromium.launch({ headless: headless, slowMo: 50 });
            case Browser.Firefox:
                return await playwright.firefox.launch({ headless: headless, slowMo: 50 });
        }
    }
}