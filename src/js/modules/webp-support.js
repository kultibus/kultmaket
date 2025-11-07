// src/js/modules/webp-support.js

/**
 * Модуль определения поддержки WebP формата браузером
 */

import { STATE_CLASSES } from '../constants.js';
import { Helpers } from '../core/utils.js';

class WebPSupport {
  constructor(options = {}) {
    this.options = {
      addBodyClass: options.addBodyClass !== undefined ? options.addBodyClass : true,
      localStorageKey: options.localStorageKey || 'webp-support',
      cacheResult: options.cacheResult !== undefined ? options.cacheResult : true,
      ...options
    };

    this.supportsWebP = null;
    this.isChecking = false;
    this.checkPromise = null;

    this.init();
  }

  /**
   * Инициализация модуля WebP поддержки
   */
  async init() {
    // Проверяем кэш если включено кэширование
    if (this.options.cacheResult) {
      const cachedResult = this.getCachedResult();
      
      if (cachedResult !== null) {
        this.supportsWebP = cachedResult;
        this.applyResult();
        console.log(`WebP support (from cache): ${this.supportsWebP}`);
        return;
      }
    }

    // Выполняем проверку
    await this.checkWebPSupport();
    
    console.log(`WebP support: ${this.supportsWebP}`);
  }

  /**
   * Получение кэшированного результата
   */
  getCachedResult() {
    try {
      if (!this.options.localStorageKey) return null;
      
      const cached = localStorage.getItem(this.options.localStorageKey);
      
      if (cached === 'true') return true;
      if (cached === 'false') return false;
      
      return null;
    } catch (error) {
      // localStorage может быть недоступен
      console.warn('WebPSupport: Cannot access localStorage', error);
      return null;
    }
  }

  /**
   * Сохранение результата в кэш
   */
  setCachedResult(supportsWebP) {
    try {
      if (!this.options.localStorageKey) return;
      
      localStorage.setItem(
        this.options.localStorageKey, 
        supportsWebP.toString()
      );
    } catch (error) {
      console.warn('WebPSupport: Cannot write to localStorage', error);
    }
  }

  /**
   * Проверка поддержки WebP
   */
  async checkWebPSupport() {
    // Если проверка уже выполняется, возвращаем существующий промис
    if (this.checkPromise) {
      return this.checkPromise;
    }

    this.isChecking = true;
    
    this.checkPromise = new Promise(async (resolve) => {
      try {
        // Используем helper из utils или собственную реализацию
        const supportsWebP = await Helpers.checkWebPSupport();
        
        this.supportsWebP = supportsWebP;
        this.isChecking = false;
        
        // Применяем результат
        this.applyResult();
        
        // Кэшируем результат если включено
        if (this.options.cacheResult) {
          this.setCachedResult(supportsWebP);
        }
        
        resolve(supportsWebP);
      } catch (error) {
        console.error('WebPSupport: Error checking WebP support', error);
        
        // В случае ошибки предполагаем отсутствие поддержки
        this.supportsWebP = false;
        this.isChecking = false;
        this.applyResult();
        
        resolve(false);
      }
    });

    return this.checkPromise;
  }

  /**
   * Применение результата проверки
   */
  applyResult() {
    if (this.supportsWebP === null) return;

    if (this.options.addBodyClass) {
      this.updateBodyClass();
    }

    // Отправка события с результатом
    this.emitWebPSupportEvent();
  }

  /**
   * Обновление класса на body
   */
  updateBodyClass() {
    const body = document.body;
    
    // Удаляем оба класса на всякий случай
    body.classList.remove(STATE_CLASSES.BODY.WEBP);
    body.classList.remove(STATE_CLASSES.BODY.NO_WEBP);
    
    // Добавляем соответствующий класс
    if (this.supportsWebP) {
      body.classList.add(STATE_CLASSES.BODY.WEBP);
    } else {
      body.classList.add(STATE_CLASSES.BODY.NO_WEBP);
    }
  }

  /**
   * Отправка события о поддержке WebP
   */
  emitWebPSupportEvent() {
    const event = new CustomEvent('webp:support', {
      detail: {
        supportsWebP: this.supportsWebP,
        timestamp: Date.now()
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * Принудительная повторная проверка поддержки WebP
   */
  async recheck() {
    // Очищаем кэш
    if (this.options.cacheResult) {
      try {
        localStorage.removeItem(this.options.localStorageKey);
      } catch (error) {
        console.warn('WebPSupport: Cannot clear cache', error);
      }
    }
    
    // Сбрасываем состояние
    this.supportsWebP = null;
    this.checkPromise = null;
    
    // Выполняем проверку заново
    return await this.checkWebPSupport();
  }

  /**
   * Получение текущего статуса поддержки WebP
   */
  getSupportStatus() {
    return this.supportsWebP;
  }

  /**
   * Проверка выполняется ли проверка в данный момент
   */
  isCheckingInProgress() {
    return this.isChecking;
  }

  /**
   * Ожидание завершения проверки
   */
  async waitForCheck() {
    if (this.checkPromise) {
      return await this.checkPromise;
    }
    
    return this.supportsWebP;
  }

  /**
   * Установка поддержки WebP вручную (для тестирования)
   */
  setSupportManually(supportsWebP) {
    this.supportsWebP = Boolean(supportsWebP);
    this.applyResult();
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Получение CSS класса для использования в стилях
   */
  getBodyClass() {
    if (this.supportsWebP === null) return '';
    
    return this.supportsWebP 
      ? STATE_CLASSES.BODY.WEBP 
      : STATE_CLASSES.BODY.NO_WEBP;
  }

  /**
   * Проверка возможности использования WebP для конкретного изображения
   */
  async checkImageSupport(imageUrl) {
    if (this.supportsWebP === false) {
      return false;
    }
    
    if (this.supportsWebP === true) {
      return true;
    }
    
    // Если статус неизвестен, ждем завершения проверки
    await this.waitForCheck();
    return this.supportsWebP;
  }

  /**
   * Деструктор
   */
  destroy() {
    // WebPSupport не требует сложной очистки
    this.supportsWebP = null;
    this.isChecking = false;
    this.checkPromise = null;
    
    console.log('WebPSupport destroyed');
  }
}

export default WebPSupport;