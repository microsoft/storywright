import TestExecutorActions from "./TestExecutorActions";
import { Keys } from "./Keys";
import { StepType } from "./StepTypes";

/**
 * Functions exposed in browser context called from React component.
 */
export class BrowserExecutor {
  public static async executesteps(steps: any[]) {
    if (steps === null || steps === undefined || steps.length == 0) {
      console.log(`Steps object is ${steps}`);
      await TestExecutorActions.makeScreenshot();
      await TestExecutorActions.done();
      return;
    }
    for (const step of steps) {
      const testName = step.name;
      switch (step["type"]) {
        case StepType.SaveScreenshot: {
          await TestExecutorActions.makeScreenshot(testName);
          break;
        }
        case StepType.CropScreenshot: {
          await TestExecutorActions.elementScreenshot(
            step.locator.value,
            testName
          );
          break;
        }
        case StepType.WaitForElementPresent: {
          await TestExecutorActions.wait(step.locator.value);
          break;
        }
        case StepType.ClickElement: {
          await TestExecutorActions.click(step.locator.value);
          break;
        }
        case StepType.WaitForElementNotPresent: {
          await TestExecutorActions.waitForNotFound(step.locator.value);
          break;
        }
        case StepType.MoveTo: {
          await TestExecutorActions.hover(step.locator.value);
          break;
        }
        case StepType.SetElementText: {
          await TestExecutorActions.setElementText(
            step.locator.value,
            step.text
          );
          break;
        }
        case StepType.SendKeys: {
          // No key value mean focus.
          if (step.keys === "") {
            await TestExecutorActions.focus(step.locator.value);
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
              await TestExecutorActions.setElementText(
                step.locator.value,
                step.keys
              );
            }
            else {
              await TestExecutorActions.pressKey(step.locator.value, keyToSend);
            }
          }
          break;
        }
        case StepType.ExecuteScript: {
          await TestExecutorActions.executeScript(step.code);
          break;
        }
        case StepType.ClickAndHoldElement: {
          await TestExecutorActions.mouseDown(step.locator.value);
          break;
        }
        case StepType.ReleaseElement: {
          await TestExecutorActions.mouseUp();
          break;
        }
        case StepType.WaitForTimeout: {
          await TestExecutorActions.waitForTimeout(step.waitTime);
          break;
        }
      }
    }
    // Once all steps are executed close the browser page.
    await TestExecutorActions.done();
  }
}
