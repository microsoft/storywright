import TestExecutorActions from './TestExecutorActions';

const executesteps = async steps => {
  console.log('TestExecutorActions: ', TestExecutorActions);

  let i = 0;
  // steps = steps.steps;
  console.log('steps.length: ', steps);

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
      if(steps[j].keys === ''){
        await TestExecutorActions.focus(steps[j].locator.value, () => {
          console.log('focusing element');
        });
      }else{
        await TestExecutorActions.pressKey(steps[j].locator.value, steps[j].keys, () => {
          console.log('pressing keys');
        });
      }
      
    } else if (steps[j]['type'] === 'executeScript') {
      await TestExecutorActions.executeScript(steps[j].code, () => {
        console.log('executing script');
      });
    } 
    // else if (steps[j]['type'] === 'clickAndHoldElement') {
    //   await TestExecutorActions.mouseDown(steps[j].code, () => {
    //     console.log('clickAndHoldElement');
    //   })
    // } 
    else {
      console.log(`step not found`);
    }
  }
};

export default executesteps;
