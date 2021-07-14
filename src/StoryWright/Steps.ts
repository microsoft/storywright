type optionsObj = {
  [key: string]: any
}

export class Steps {
  steps = [];

  public snapshot(name: string, opts?: optionsObj) {
    var step = {
      type: 'saveScreenshot',
      name: name,
      locator: {}
    };
    if (opts && typeof opts.cropTo === 'string') {
      step.type = 'cropScreenshot';
      step.locator = {
        value: opts.cropTo
      };
    }
    this.steps.push(step);
    return this;
  }

  public url(url: string) {
    var step = {
      type: 'url',
      url: url
    };
    this.steps.push(step);
    return this;
  }

  public end() {
    return this.steps;
  }

  public click(selector: string, options?: optionsObj) {
    var step = {
      type: 'clickElement',
      locator: {
        value: selector
      },
      maxTime: ''
    };
    if (options && options.maxTime) {
      step.maxTime = options.maxTime;
    }
    this.steps.push(step);
    return this;
  }

  public hover(selector: string) {
    var step = {
      type: 'moveTo',
      locator: {
        value: selector
      }
    };
    this.steps.push(step);
    return this;
  }

  public mouseDown(selector: string) {
    var step = {
      type: 'clickAndHoldElement',
      locator: {}
    };
    if (selector) {
      step.locator = {
        value: selector
      };
    }
    this.steps.push(step);
    return this;
  }

  public mouseUp(selector: string) {
    var step = {
      type: 'releaseElement',
      locator: {}
    };
    if (selector) {
      step.locator = {
        value: selector
      };
    }
    this.steps.push(step);
    return this;
  }

  public setValue(selector: string, text: string, options?: optionsObj) {
    var step = {
      type: 'setElementText',
      locator: {
        value: selector
      },
      text: text,
      isPassword: false
    };
    if (options && options.isPassword) {
      step.isPassword = true;
    }
    this.steps.push(step);
    return this;
  }

  public clearValue(selector: string) {
    var step = {
      type: 'clearElementText',
      locator: {
        value: selector
      }
    };
    this.steps.push(step);
    return this;
  }

  public keys(selector: string, keys: string) {
    var step = {
      type: 'sendKeys',
      locator: {
        value: selector
      },
      keys: keys
    };
    this.steps.push(step);
    return this;
  }

  public focus(selector: string) {
    return this.keys(selector, '');
  }

  public executeScript(code: string) {
    var step = {
      type: 'executeScript',
      code: code
    };
    this.steps.push(step);
    return this;
  }

  public wait(msOrSelector, options?: optionsObj) {
    var step;
    if (typeof msOrSelector === 'number') {
      step = {
        type: 'pause',
        waitTime: msOrSelector
      };
    } else {
      step = {
        type: 'waitForElementPresent',
        locator: {
          value: msOrSelector
        }
      };
      if (options && options.maxTime) {
        step.maxTime = options.maxTime;
      }
    }
    this.steps.push(step);
    return this;
  }

  public waitForNotFound(selector: string, options?: optionsObj) {
    var step = {
      type: 'waitForElementNotPresent',
      locator: {
        value: selector
      },
      maxTime: ''
    };
    if (options && options.maxTime) {
      step.maxTime = options.maxTime;
    }
    this.steps.push(step);
    return this;
  }

  public cssAnimations(isEnabled: boolean) {
    var step = {
      type: 'cssAnimations',
      isEnabled: isEnabled
    };
    this.steps.push(step);
    return this;
  }
}

export interface Locator {
  type: 'css selector';
  value: string;
}

export type StepType = 'url' |
  'saveScreenshot' |
  'cropScreenshot' |
  'clickElement' |
  'moveTo' |
  'clickAndHoldElement' |
  'releaseElement' |
  'setElementText' |
  'sendKeys' |
  'executeScript' |
  'ignoreElements' |
  'pause' |
  'waitForElementPresent' |
  'waitForElementNotPresent' |
  'cssAnimations';

export interface Step {
  type: StepType;
  locator?: Locator;
  url?: string;
  name?: string;
  text?: string;
  isPassword?: boolean;
  keys?: string;
  code?: string;
  isAsync?: boolean;
  waitTime?: number;
  isEnabled?: boolean;
}