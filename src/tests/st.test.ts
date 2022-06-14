import {Keys} from "../StoryWright/Keys";
import {partitionArray} from "../utils";
import {BrowserUtils} from "../StoryWrightProcessor/BrowserUtils";
import * as playwright from "playwright";

test('string returning hello there jest', () => {
    expect(Keys.alt).toMatch('Alt');
});

test('string returning hello there jest', () => {
    expect(partitionArray(["a","b","c","d","e","f","g","h","i","j","k","l","m",],2,4)).toEqual(["e","f","g","h"]);
});

test('string returning hello there jest', () => {
    const mock = spyOn(playwright.chromium, "launch");
    BrowserUtils.getBrowserInstance("chromium",false);
    const mock1 = spyOn(playwright.firefox, "launch");
    BrowserUtils.getBrowserInstance("firefox",false);
    const mock2 = spyOn(playwright.webkit, "launch");
    BrowserUtils.getBrowserInstance("webkit",false);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock1).toHaveBeenCalledTimes(1);
    expect(mock2).toHaveBeenCalledTimes(1);
});