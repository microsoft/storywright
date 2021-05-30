import TestExecutorActions from './TestExecutorActions';

const executesteps = async (steps: Array<any>) => {
  console.log('TestExecutorActions: ', TestExecutorActions);
  console.log(`${Date.now()} :: Sleeping start`);
  //await new Promise(r => setTimeout(r, 15000));
  console.log(`${Date.now()} :: Sleeping end`);
  if (steps === null) {
    console.log("Steps object is null");
    return;
  }
  let i = 0;
  console.log(`steps.length: `, steps.length);

  for (let j = 0; j < steps.length; j++) {
    console.log('steps: ', steps[j]);
    if (steps[j]['type'] === 'saveScreenshot') {
      console.log('Taking cropScreenshot');
      await TestExecutorActions.makeScreenshot(`Document Title _${++i}`, 'testPath', () => {
        console.log('Taking cropScreenshot');
      });
    } else if (steps[j]['type'] === 'cropScreenshot') {
      console.info('selector, testName: ', steps[j]);
      const selector = steps[j].locator.value;
      const testName = steps[j].name;
      await TestExecutorActions.elementScreenshot(selector, testName, () => {
        console.log('element screenshot');
      });
    } else if (steps[j]['type'] === 'waitForElementPresent') {
      const selector = steps[j].locator.value;
      console.info(`waiting for element: ${selector}`);
      await TestExecutorActions.wait(selector, () => {
        console.log('element screenshot');
      });
    } else if (steps[j]['type'] === 'clickElement') {
      await TestExecutorActions.click(steps[j].locator.value, () => {
        console.log('Clicking element');
      });
    } else if (steps[j]['type'] === 'waitForElementNotPresent') {
      await TestExecutorActions.waitForNotFound(steps[j].locator.value, () => {
        console.log('waitForElementNotPresent');
      });
    } else if (steps[j]['type'] === 'moveTo') {
      await TestExecutorActions.hover(steps[j].locator.value, () => {
        console.log('hover');
      });
    } else if (steps[j]['type'] === 'setElementText') {
      await TestExecutorActions.setElementText(steps[j].locator.value, steps[j].text, () => {
        console.log('hover');
      });
    } else if (steps[j]['type'] === 'sendKeys') {
      if (steps[j].keys === '') {
        await TestExecutorActions.focus(steps[j].locator.value, () => {
          console.log('focusing element');
        });
      } else {
        await TestExecutorActions.pressKey(steps[j].locator.value, steps[j].keys, () => {
          console.log('pressing keys');
        });
      }

    } else if (steps[j]['type'] === 'executeScript') {
      await TestExecutorActions.executeScript(steps[j].code, () => {
        console.log('executing script');
      });
    }
    else {
      console.log(`step not found`);
    }
  }
  await TestExecutorActions.done(true, () => {
    console.log('Calling done');
  });
};

export default executesteps;
