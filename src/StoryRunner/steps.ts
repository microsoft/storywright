export function Steps() {
  this.steps = [];
}

Steps.prototype.url = function(url) {
  var step = {
    type: 'url',
    url: url
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.snapshot = function(name, opts) {
  var step = {
    type: 'saveScreenshot',
    name: name,
    locator:{}
  };
  if (opts && typeof opts.cropTo === 'string') {
    step.type = 'cropScreenshot';
    step.locator = {
      type: 'css selector',
      value: opts.cropTo
    };
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.click = function(selector, options) {
  var step = {
    type: 'clickElement',
    locator: {
      type: 'css selector',
      value: selector
    },
    maxTime:''
  };
  if (options && options.maxTime) {
    step.maxTime = options.maxTime;
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.hover = function(selector) {
  var step = {
    type: 'moveTo',
    locator: {
      type: 'css selector',
      value: selector
    }
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.mouseDown = function(selector) {
  var step = {
    type: 'clickAndHoldElement',
    locator:{}
  };
  if (selector) {
    step.locator = {
      type: 'css selector',
      value: selector
    };
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.mouseUp = function(selector) {
  var step = {
    type: 'releaseElement',
    locator:{}
  };
  if (selector) {
    step.locator = {
      type: 'css selector',
      value: selector
    };
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.setValue = function(selector, text, options) {
  var step = {
    type: 'setElementText',
    locator: {
      type: 'css selector',
      value: selector
    },
    text: text,
    isPassword:false
  };
  if (options && options.isPassword) {
    step.isPassword = true;
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.clearValue = function(selector) {
  var step = {
    type: 'clearElementText',
    locator: {
      type: 'css selector',
      value: selector
    }
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.keys = function(selector, keys) {
  var step = {
    type: 'sendKeys',
    locator: {
      type: 'css selector',
      value: selector
    },
    keys: keys
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.focus = function(selector) {
  return this.keys(selector, '');
};

// isAsync requires a "done()" method to be called
Steps.prototype.executeScript = function(code, isAsync) {
  var step = {
    type: 'executeScript',
    code: code,
    isAsync:false
  };
  if (isAsync === true) {
    step.isAsync = true;
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.ignore = function(selector) {
  var step = {
    type: 'ignoreElements',
    locator: {
      type: 'css selector',
      value: selector
    }
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.clearIgnores = function() {
  var step = {
    type: 'clearIgnores'
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.wait = function(msOrSelector, options) {
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
        type: 'css selector',
        value: msOrSelector
      }
    };
    if (options && options.maxTime) {
      step.maxTime = options.maxTime;
    }
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.waitForNotFound = function(selector, options) {
  var step = {
    type: 'waitForElementNotPresent',
    locator: {
      type: 'css selector',
      value: selector
    },
    maxTime:''
  };
  if (options && options.maxTime) {
    step.maxTime = options.maxTime;
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.rtl = function() {
  var step = {
    type: 'executeScript',
    code: 'document.documentElement.dir = "rtl";'
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.ltr = function() {
  var step = {
    type: 'executeScript',
    code: 'document.documentElement.dir = "ltr";'
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.cssAnimations = function(isEnabled) {
  var step = {
    type: 'cssAnimations',
    isEnabled: isEnabled
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.end = function() {
  return this.steps;
};
