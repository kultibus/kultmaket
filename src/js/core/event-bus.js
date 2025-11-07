// src/js/core/event-bus.js

/**
 * Централизованная система событий для коммуникации между модулями
 */

class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
  }

  /**
   * Подписка на событие
   * @param {string} eventName - Название события
   * @param {Function} callback - Функция-обработчик
   * @param {Object} options - Дополнительные опции
   */
  on(eventName, callback, options = {}) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    
    const handler = {
      callback,
      context: options.context || null,
      once: options.once || false
    };
    
    this.events.get(eventName).add(handler);
    
    // Возвращаем функцию для отписки
    return () => this.off(eventName, callback);
  }

  /**
   * Подписка на событие (однократная)
   * @param {string} eventName - Название события
   * @param {Function} callback - Функция-обработчик
   */
  once(eventName, callback) {
    return this.on(eventName, callback, { once: true });
  }

  /**
   * Отписка от события
   * @param {string} eventName - Название события
   * @param {Function} callback - Функция-обработчик для удаления
   */
  off(eventName, callback) {
    if (!this.events.has(eventName)) return;
    
    const handlers = this.events.get(eventName);
    
    for (const handler of handlers) {
      if (handler.callback === callback) {
        handlers.delete(handler);
        break;
      }
    }
    
    // Удаляем пустой набор обработчиков
    if (handlers.size === 0) {
      this.events.delete(eventName);
    }
  }

  /**
   * Генерация события
   * @param {string} eventName - Название события
   * @param {*} data - Данные для передачи обработчикам
   */
  emit(eventName, data = null) {
    if (!this.events.has(eventName)) return;
    
    const handlers = this.events.get(eventName);
    const handlersToRemove = [];
    
    // Вызываем все обработчики
    handlers.forEach(handler => {
      try {
        handler.callback.call(handler.context, data);
        
        // Если однократный обработчик - помечаем для удаления
        if (handler.once) {
          handlersToRemove.push(handler);
        }
      } catch (error) {
        console.error(`Error in event handler for "${eventName}":`, error);
      }
    });
    
    // Удаляем однократные обработчики
    handlersToRemove.forEach(handler => {
      handlers.delete(handler);
    });
    
    // Удаляем пустой набор обработчиков
    if (handlers.size === 0) {
      this.events.delete(eventName);
    }
  }

  /**
   * Полная очистка всех подписок
   */
  destroy() {
    this.events.clear();
    this.onceEvents.clear();
  }

  /**
   * Проверка наличия подписчиков на событие
   * @param {string} eventName - Название события
   * @returns {boolean}
   */
  hasListeners(eventName) {
    return this.events.has(eventName) && this.events.get(eventName).size > 0;
  }

  /**
   * Получение количества подписчиков на событие
   * @param {string} eventName - Название события
   * @returns {number}
   */
  listenerCount(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).size : 0;
  }
}

// Создаем глобальный экземпляр Event Bus
const eventBus = new EventBus();

export default eventBus;