import { BrowserUtils } from "../StoryWrightProcessor/BrowserUtils";
import * as playwright from "playwright";


test('test all browser gets allocated based on param', () => {
    const chromiumSpy = spyOn(playwright.chromium,"launch");
    BrowserUtils.getBrowserInstance("chromium", true);
    const firefoxSpy = spyOn(playwright.firefox,"launch");
    BrowserUtils.getBrowserInstance("firefox", true);
    const webkitSpy = spyOn(playwright.webkit,"launch");
    BrowserUtils.getBrowserInstance("webkit", true);
    expect(chromiumSpy).toHaveBeenCalledTimes(1);
    expect(firefoxSpy).toHaveBeenCalledTimes(1);
    expect(webkitSpy).toHaveBeenCalledTimes(1);
});

test('test multiple invocations of browser', () => {
    const chromiumSpy = spyOn(playwright.chromium,"launch");
    BrowserUtils.getBrowserInstance("chromium", true);
    BrowserUtils.getBrowserInstance("chromium", true);
    BrowserUtils.getBrowserInstance("chromium", true);
    expect(chromiumSpy).toHaveBeenCalledTimes(3);
});