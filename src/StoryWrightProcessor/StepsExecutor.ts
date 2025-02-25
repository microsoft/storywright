import { Keys } from "./Keys";
import { StepType } from "./StepTypes";
import { PlayWrightExecutor } from "./PlayWrightExecutor";
import type { Step } from "../StoryWright/Steps";

/**
 * Functions exposed in browser context called from React component.
 */
export class StepsExecutor {
  public static async executesteps(steps: Step[], executor: PlayWrightExecutor) {

    if (steps[0]["type"] !== StepType.SaveScreenshot && steps[0]["type"] !== StepType.CropScreenshot) {
      await executor.makeScreenshot(steps[0].name);
    }
    for (const step of steps) {
      const testName = step.name;
      switch (step["type"]) {
        case StepType.SaveScreenshot: {
          await executor.makeScreenshot(testName);
          break;
        }
        case StepType.CropScreenshot: {
          await executor.elementScreenshot(
            step.locator.value,
            testName
          );
          break;
        }
        case StepType.WaitForElementPresent: {
          await executor.waitForSelector(step.locator.value);
          break;
        }
        case StepType.ClickElement: {
          await executor.click(step.locator.value);
          break;
        }
        case StepType.WaitForElementNotPresent: {
          await executor.waitForNotFound(step.locator.value);
          break;
        }
        case StepType.MoveTo: {
          await executor.hover(step.locator.value);
          break;
        }
        case StepType.SetElementText: {
          await executor.setElementText(
            step.locator.value,
            step.text
          );
          break;
        }
        case StepType.SendKeys: {
          // No key value mean focus.
          if (step.keys === "") {
            await executor.focus(step.locator.value);
          }
          else {
            let keyToSend;
            for (const key of Object.keys(Keys)) {
              if (Keys[key] == step.keys || key == step.keys) {
                keyToSend = Keys[key];
                break;
              }
            }
            // If no key found means set text in textbox.
            if (!keyToSend) {
              await executor.setElementText(
                step.locator.value,
                step.keys
              );
            }
            else {
              await executor.pressKey(step.locator.value, keyToSend);
            }
          }
          break;
        }
        case StepType.ExecuteScript: {
          await executor.executeScript(step.code);
          break;
        }
        case StepType.ClickAndHoldElement: {
          await executor.mouseDown(step.locator.value);
          break;
        }
        case StepType.ReleaseElement: {
          await executor.mouseUp();
          break;
        }
        case StepType.WaitForTimeout: {
          await executor.waitForTimeout(step.waitTime);
          break;
        }
      }
    }
    // Once all steps are executed close the browser page.
    await executor.done();
  }
}
