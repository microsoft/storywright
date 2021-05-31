const TestExecutorWindow = (window as unknown) as {
  makeScreenshot: (testName: string) => Promise<void>;
  done: () => Promise<void>;
  hover: (selector: string) => Promise<void>;
  click: (selector: string) => Promise<void>;
  wait: (selector: string) => Promise<void>;
  waitForNotFound: (selector: string) => Promise<void>;
  elementScreenshot: (selector: string, testName: string) => Promise<void>;
  moveTo: (selector: string) => Promise<void>;
  setElementText: (selector: string, text: string) => Promise<void>;
  pressKey: (selector: string, key: string) => Promise<void>;
  mouseDown: (selector: string) => Promise<void>;
  mouseUp: () => Promise<void>;
  executeScript: (script: string) => Promise<void>;
  focus: (script: string) => Promise<void>;
};

export default {
  focus: async (selector: string, callback: () => void): Promise<any> => {
    await TestExecutorWindow.focus(selector).then(callback);
  },
  executeScript: async (script: string, callback: () => void): Promise<any> => {
    await TestExecutorWindow.executeScript(script).then(callback);
  },
  mouseDown: async (selector: string, callback: () => void): Promise<any> => {
    await TestExecutorWindow.mouseDown(selector).then(callback);
  },
  mouseUp: async (callback: () => void): Promise<any> => {
    await TestExecutorWindow.mouseUp().then(callback);
  },
  pressKey: async (selector: string, key: string, callback: () => void): Promise<any> => {
    await TestExecutorWindow.pressKey(selector, key).then(callback);
  },
  makeScreenshot: async (testName: string, callback: () => void): Promise<any> => {
    await TestExecutorWindow.makeScreenshot(testName).then(callback);
  },
  done: async (callback: () => void) => {
    await TestExecutorWindow.done().then(callback);
  },
  hover: async (selector: string, callback: () => void) => {
    await TestExecutorWindow.hover(selector).then(callback);
  },
  wait: async (selector: string, callback: () => void) => {
    await TestExecutorWindow.wait(selector).then(callback);
  },
  waitForNotFound: async (selector: string, callback: () => void) => {
    await TestExecutorWindow.waitForNotFound(selector).then(callback);
  },
  click: async (selector: string, callback: () => void) => {
    await TestExecutorWindow.click(selector).then(callback);
  },
  elementScreenshot: async (selector: string, testName: string, callback: () => void) => {
    await TestExecutorWindow.elementScreenshot(selector, testName).then(callback);
  },
  setElementText: async (selector: string, text: string, callback: () => void) => {
    await TestExecutorWindow.setElementText(selector, text).then(callback);
  },
};
