type optionsObj = {
  cropTo?: string;
  maxTime?: string;
  isPassword?: boolean;
  [key: string]: unknown;
};

export class Steps {
  steps: Step[] = [];

  public snapshot(name: string, opts?: optionsObj) {
    const step = {
      type: "saveScreenshot",
      name: name,
      locator: {},
    } as Step;
    if (opts && typeof opts.cropTo === "string") {
      step.type = "cropScreenshot";
      step.locator = {
        value: opts.cropTo,
      };
    }
    this.steps.push(step);
    return this;
  }

  public url(url: string) {
    const step = {
      type: "url",
      url: url,
    } as Step;
    this.steps.push(step);
    return this;
  }

  public end() {
    return this.steps;
  }

  public click(selector: string, options?: optionsObj) {
    const step = {
      type: "clickElement",
      locator: {
        value: selector,
      },
      maxTime: "",
    } as Step;
    if (options && options.maxTime) {
      step.maxTime = options.maxTime;
    }
    this.steps.push(step);
    return this;
  }

  public hover(selector: string) {
    const step = {
      type: "moveTo",
      locator: {
        value: selector,
      },
    } as Step;
    this.steps.push(step);
    return this;
  }

  public mouseDown(selector: string) {
    const step = {
      type: "clickAndHoldElement",
      locator: {},
    } as Step;
    if (selector) {
      step.locator = {
        value: selector,
      };
    }
    this.steps.push(step);
    return this;
  }

  public mouseUp(selector: string) {
    const step = {
      type: "releaseElement",
      locator: {},
    } as Step;
    if (selector) {
      step.locator = {
        value: selector,
      };
    }
    this.steps.push(step);
    return this;
  }

  public setValue(selector: string, text: string, options?: optionsObj) {
    const step = {
      type: "setElementText",
      locator: {
        value: selector,
      },
      text: text,
      isPassword: false,
    } as Step;
    if (options && options.isPassword) {
      step.isPassword = true;
    }
    this.steps.push(step);
    return this;
  }

  public clearValue(selector: string) {
    const step = {
      type: "clearElementText",
      locator: {
        value: selector,
      },
    } as Step;
    this.steps.push(step);
    return this;
  }

  public keys(selector: string, keys: string) {
    const step = {
      type: "sendKeys",
      locator: {
        value: selector,
      },
      keys: keys,
    } as Step;
    this.steps.push(step);
    return this;
  }

  public focus(selector: string) {
    return this.keys(selector, "");
  }

  public executeScript(code: string) {
    const step = {
      type: "executeScript",
      code: code,
    } as Step;
    this.steps.push(step);
    return this;
  }

  public wait(msOrSelector, options?: optionsObj) {
    let step: Step;
    if (typeof msOrSelector === "number") {
      step = {
        type: "pause",
        waitTime: msOrSelector,
      };
    } else {
      step = {
        type: "waitForElementPresent",
        locator: {
          value: msOrSelector,
        },
      };
      if (options && options.maxTime) {
        step.maxTime = options.maxTime;
      }
    }
    this.steps.push(step);
    return this;
  }

  public waitForNotFound(selector: string, options?: optionsObj) {
    const step = {
      type: "waitForElementNotPresent",
      locator: {
        value: selector,
      },
      maxTime: "",
    } as Step;
    if (options && options.maxTime) {
      step.maxTime = options.maxTime;
    }
    this.steps.push(step);
    return this;
  }

  public cssAnimations(isEnabled: boolean) {
    const step = {
      type: "cssAnimations",
      isEnabled: isEnabled,
    } as Step;
    this.steps.push(step);
    return this;
  }
}

export interface Locator {
  // FIXME: this is never set - remove ?
  type?: "css selector";
  value: string;
}

export type StepType =
  | "url"
  | "saveScreenshot"
  | "cropScreenshot"
  | "clickElement"
  | "moveTo"
  | "clickAndHoldElement"
  | "releaseElement"
  | "setElementText"
  | "sendKeys"
  | "executeScript"
  | "ignoreElements"
  | "pause"
  | "waitForElementPresent"
  | "waitForElementNotPresent"
  | "cssAnimations"
  | "clearElementText";

export interface Step {
  type: StepType;
  locator?: Locator;
  url?: string;
  name?: string;
  text?: string;
  isPassword?: boolean;
  maxTime?: string;
  keys?: string;
  code?: string;
  isAsync?: boolean;
  waitTime?: number;
  isEnabled?: boolean;
}

interface Parameters {
 [name: string]: any
}

export interface StoryParameters extends Parameters {
  storyWright?: { steps: Step[] };
}
