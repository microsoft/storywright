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

main();
