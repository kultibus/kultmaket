// base-module.js
export class BaseModule {
  constructor() {
    this.isInitialized = false;
  }

  safeQuerySelector(selector, context = document) {
    return context.querySelector(selector);
  }

  safeQuerySelectorAll(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }

  throttle(callback, delay = 16) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback.apply(this, args);
      }
    };
  }

  debounce(callback, delay = 100) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => callback.apply(this, args), delay);
    };
  }
}