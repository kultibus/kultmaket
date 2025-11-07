// src/js/main.js

/**
 * Главный модуль приложения
 * Инициализация всех модулей и управление жизненным циклом
 */

import { EVENTS } from './constants.js';
import eventBus from './core/event-bus.js';
import stateManager from './core/state-manager.js';

// Импорт модулей
import ScrollManager from './modules/scroll-manager.js';
import Parallax from './modules/parallax.js';
import NavManager from './modules/nav-manager.js';
import ModalManager from './modules/modal-manager.js';
import WebPSupport from './modules/webp-support.js';

class App {
  constructor() {
    this.modules = new Map();
    this.isInitialized = false;
    
    // Автобиндинг методов
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    
    // Инициализация при полной загрузке DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.init);
    } else {
      setTimeout(this.init, 0);
    }
  }

  /**
   * Инициализация приложения
   */
  init() {
    if (this.isInitialized) return;
    
    console.log('App initialization started');
    
    try {
      // Инициализация core модулей (уже инициализированы автоматически)
      this.registerCoreModules();
      
      // Инициализация функциональных модулей
      this.initializeModules();
      
      this.setupGlobalEventListeners();
      this.emitAppReady();
      
      this.isInitialized = true;
      console.log('App initialized successfully');
      
    } catch (error) {
      console.error('App initialization failed:', error);
    }
  }

  /**
   * Регистрация core модулей
   */
  registerCoreModules() {
    // Core модули уже инициализированы, просто регистрируем их
    this.modules.set('eventBus', {
      instance: eventBus,
      name: 'EventBus'
    });
    
    this.modules.set('stateManager', {
      instance: stateManager,
      name: 'StateManager'
    });
  }

  /**
   * Инициализация всех функциональных модулей
   */
  initializeModules() {
    const moduleConfigs = [
      {
        key: 'webpSupport',
        Class: WebPSupport,
        name: 'WebPSupport',
        options: {}
      },
      {
        key: 'scrollManager',
        Class: ScrollManager,
        name: 'ScrollManager',
        options: {}
      },
      {
        key: 'parallax',
        Class: Parallax,
        name: 'Parallax',
        options: {}
      },
      {
        key: 'navManager',
        Class: NavManager,
        name: 'NavManager',
        options: {}
      },
      {
        key: 'modalManager',
        Class: ModalManager,
        name: 'ModalManager',
        options: {}
      }
    ];

    moduleConfigs.forEach(config => {
      try {
        const instance = new config.Class(config.options);
        this.modules.set(config.key, {
          instance,
          name: config.name
        });
        
        console.log(`✅ ${config.name} initialized`);
      } catch (error) {
        console.error(`❌ ${config.name} initialization failed:`, error);
      }
    });
  }

  /**
   * Настройка глобальных обработчиков событий
   */
  setupGlobalEventListeners() {
    // Обработка ошибок в модулях
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    // Обработка неперехваченных promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });

    // Деструктор при закрытии страницы
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });

    // События для отладки
    eventBus.on(EVENTS.STATE.CHANGED, (data) => {
      console.log('State changed:', data);
    });
  }

  /**
   * Отправка события готовности приложения
   */
  emitAppReady() {
    // Даем время на полную инициализацию всех модулей
    setTimeout(() => {
      eventBus.emit('app:ready', {
        timestamp: Date.now(),
        modules: Array.from(this.modules.keys())
      });
      
      document.documentElement.classList.add('app-ready');
    }, 100);
  }

  /**
   * Получение экземпляра модуля
   * @param {string} moduleKey - Ключ модуля
   * @returns {Object|null} - Экземпляр модуля
   */
  getModule(moduleKey) {
    const module = this.modules.get(moduleKey);
    return module ? module.instance : null;
  }

  /**
   * Получение списка всех модулей
   * @returns {Array} - Список модулей
   */
  getModules() {
    return Array.from(this.modules.entries()).map(([key, module]) => ({
      key,
      name: module.name,
      instance: module.instance
    }));
  }

  /**
   * Проверка инициализации модуля
   * @param {string} moduleKey - Ключ модуля
   * @returns {boolean}
   */
  isModuleInitialized(moduleKey) {
    const module = this.modules.get(moduleKey);
    return module && module.instance && typeof module.instance.destroy === 'function';
  }

  /**
   * Деструктор приложения
   */
  destroy() {
    if (!this.isInitialized) return;
    
    console.log('App destruction started');
    
    // Деструктор модулей в обратном порядке инициализации
    const modules = Array.from(this.modules.entries()).reverse();
    
    modules.forEach(([key, module]) => {
      try {
        if (module.instance && typeof module.instance.destroy === 'function') {
          module.instance.destroy();
          console.log(`✅ ${module.name} destroyed`);
        }
      } catch (error) {
        console.error(`❌ ${module.name} destruction failed:`, error);
      }
    });
    
    this.modules.clear();
    this.isInitialized = false;
    
    console.log('App destroyed');
  }

  /**
   * Переинициализация приложения
   */
  reinit() {
    this.destroy();
    setTimeout(this.init, 100);
  }
}

// Создаем и экспортируем глобальный экземпляр приложения
const app = new App();

// Экспорт для доступа извне (например, в консоли для отладки)
window.App = app;

export default app;