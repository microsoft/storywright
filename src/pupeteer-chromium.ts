import { Page, launch } from "puppeteer";
import { join } from "path";
const fs = require('fs');

async function main(): Promise<void> {
    try {
        const headless = false;
        const browser = await launch({ headless });
        const page: Page = await browser.newPage();
        const pagePath = join(`file:///${process.cwd()}/storybook`, `iframe.html?id=avatar-converged--size-active-badge`);
        await page.goto(pagePath);
        await page.waitForTimeout(4000);

        let selector: string = ".testWrapper";
        let element = await page.$(selector);

        let screenshotName = "pupeteer-chrome-run";
        let count = 1;
        while (fs.existsSync(`${screenshotName}_${count}_A.png`)) {
            count++;
        }
        await element.screenshot({
            path: `${screenshotName}_${count}_A.png`,
        });



        await page.waitForTimeout(2000);

        screenshotName = "pupeteer-chrome-run";
        count = 1;
        while (fs.existsSync(`${screenshotName}_${count}_B.png`)) {
            count++;
        }
        await element.screenshot({
            path: `${screenshotName}_${count}_B.png`,
        });


        await page.close();
        await browser.close();
    } catch (err) {
        console.error(err);
    }
}

main();
