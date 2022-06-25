import { StoryWrightOptions } from "../StoryWrightProcessor/StoryWrightOptions";
import { StoryWrightProcessor } from "../StoryWrightProcessor/StoryWrightProcessor";
import { BrowserName } from "../StoryWrightProcessor/Constants";
import { resolve } from "path";



test("test if screenshots are captured partition 1", async ()=>{
    jest.setTimeout(60000);
    const url = "file:///" + resolve("storybook-static");
    const storyWrightOptions: StoryWrightOptions = {
        url: url,
        screenShotDestPath: "screenshots",
        browsers: [BrowserName.Chromium],
        headless: true,
        concurrency: 4,
        skipSteps: false,
        partitionIndex: 1,
        totalPartitions: 1,
        waitTimeScreenshot: 1000
      };
    
    await StoryWrightProcessor.process(storyWrightOptions);
});