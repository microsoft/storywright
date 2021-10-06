const TestExecutorWindow = window as unknown as {
  makeScreenshot: (testName?: string) => Promise<void>;
  done: () => Promise<void>;
  hover: (selector: string) => Promise<void>;
  click: (selector: string) => Promise<void>;
  wait: (selector: string) => Promise<void>;
  waitForTimeout: (waitTime: number) => Promise<void>;
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
  focus: async (selector: string): Promise<any> => {
    await TestExecutorWindow.focus(selector);
  },
  executeScript: async (script: string): Promise<any> => {
    await TestExecutorWindow.executeScript(script);
  },
  mouseDown: async (selector: string): Promise<any> => {
    await TestExecutorWindow.mouseDown(selector);
  },
  mouseUp: async (): Promise<any> => {
    await TestExecutorWindow.mouseUp();
  },
  pressKey: async (selector: string, key: string): Promise<any> => {
    await TestExecutorWindow.pressKey(selector, key);
  },
  makeScreenshot: async (testName?: string): Promise<any> => {
    await TestExecutorWindow.makeScreenshot(testName);
  },
  done: async () => {
    await TestExecutorWindow.done();
  },
  hover: async (selector: string) => {
    await TestExecutorWindow.hover(selector);
  },
  wait: async (selector: string) => {
    await TestExecutorWindow.wait(selector);
  },
  waitForTimeout: async (waitTime: number) => {
    await TestExecutorWindow.waitForTimeout(waitTime);
  },
  waitForNotFound: async (selector: string) => {
    await TestExecutorWindow.waitForNotFound(selector);
  },
  click: async (selector: string) => {
    await TestExecutorWindow.click(selector);
  },
  elementScreenshot: async (selector: string, testName: string) => {
    await TestExecutorWindow.elementScreenshot(selector, testName);
  },
  setElementText: async (selector: string, text: string) => {
    await TestExecutorWindow.setElementText(selector, text);
  },
};
