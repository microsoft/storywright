import { Page, chromium } from "playwright";
import { join } from "path";

async function main(): Promise<void> {
    try {
        const headless = false;
        const browser = await chromium.launch({ args: ["--allow-file-access-from-files"], headless });
        const context = await browser.newContext();
        const page: Page = await context.newPage();
        await page.goto(join("file:///C:/GIT/repoissue/storybook", `iframe.html?id=avatar-converged--size-active-badge`));
        await page.waitForTimeout(2000);
        
        let selector: string = ".testWrapper";
        selector = curateSelector(selector);
        let element = await page.$(selector);
        if (await element.isVisible()) {
            let screenshotPath = "playwright-chrome.png";
            await element.screenshot({
                path: screenshotPath,
            });
        } else {
            console.log("ERROR: Element NOT VISIBLE: CAPTURING PAGE");
        }
        await page.close();
        await context.close();
        await browser.close();
    } catch (err) {
        console.error(err);
    }
}

function curateSelector(selector: string) {
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

main();
