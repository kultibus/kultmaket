// app.js
import { Header } from './modules/header.js';
import { Parallax } from './modules/parallax.js';
import { ScrollManager } from './modules/scroll-manager.js';
import { WebPSupport } from './modules/webp-support.js';

export class App {
  constructor() {
    this.modules = new Map();
    this.config = {
      debug: process.env.NODE_ENV === 'development'
    };
  }

  async init() {
    try {
      await this.initializeModules();
      this.log('App initialized successfully');
    } catch (error) {
      this.error('App initialization failed:', error);
    }
  }

  async initializeModules() {
    const moduleDefinitions = [
      { key: 'webp', class: WebPSupport, priority: 1 },
      { key: 'header', class: Header, priority: 2 },
      { key: 'scroll', class: ScrollManager, priority: 3 },
      { key: 'parallax', class: Parallax, priority: 4 }
    ];

    // Сортируем по приоритету
    moduleDefinitions.sort((a, b) => a.priority - b.priority);

    for (const { key, Class, options } of moduleDefinitions) {
      try {
        const instance = new Class(options);
        if (typeof instance.init === 'function') {
          await instance.init();
          this.modules.set(key, instance);
          this.log(`Module "${key}" initialized`);
        }
      } catch (error) {
        this.error(`Failed to initialize module "${key}":`, error);
      }
    }
  }

  getModule(key) {
    return this.modules.get(key);
  }

  log(...args) {
    if (this.config.debug) {
      console.log('[App]', ...args);
    }
  }

  error(...args) {
    console.error('[App]', ...args);
  }

  destroy() {
    this.modules.forEach((module, key) => {
      if (typeof module.destroy === 'function') {
        module.destroy();
        this.log(`Module "${key}" destroyed`);
      }
    });
    this.modules.clear();
  }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});