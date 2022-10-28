import { Page, firefox } from "playwright";
import { join } from "path";
const fs = require('fs');

async function main(): Promise<void> {
    try {
        const headless = true;
        const browser = await firefox.launch({ headless });
        const context = await browser.newContext();
        const page: Page = await context.newPage();
        const pagePath = join(`file:///${process.cwd()}/storybook`, `iframe.html?id=avatar-converged--size-active-badge`);
        await page.goto(pagePath);
        await page.waitForTimeout(4000);
        
        let selector: string = ".testWrapper";
        let element = await page.$(selector);
        if (await element.isVisible()) {
            let screenshotName = "playwright-firefox-run";
            let count = 1;
            while( fs.existsSync(`${screenshotName}_${count}_A.png`))
            {
                count++;
            }
            await element.screenshot({
                path: `${screenshotName}_${count}_A.png`,
            });
        } else {
            console.log("ERROR: Element NOT VISIBLE: CAPTURING PAGE");
        }


        await page.waitForTimeout(2000);

        if (await element.isVisible()) {
            let screenshotName = "playwright-firefox-run";
            let count = 1;
            while( fs.existsSync(`${screenshotName}_${count}_B.png`))
            {
                count++;
            }
            await element.screenshot({
                path: `${screenshotName}_${count}_B.png`,
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
