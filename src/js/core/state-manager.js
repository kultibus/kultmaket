// src/js/core/state-manager.js

/**
 * Менеджер состояний для управления скроллом и глобальными состояниями
 */

import { SCROLL_STATES, STATE_CLASSES, EVENTS } from '../constants.js';
import eventBus from './event-bus.js';
import { DOM, Helpers } from './utils.js';

class StateManager {
  constructor() {
    this.currentState = SCROLL_STATES.ENABLED;
    this.scrollbarWidth = 0;
    this.isInitialized = false;
    
    // Элементы для компенсации скроллбара
    this.lockPaddingElements = [];
    this.lockPaddingFixedElements = [];
    
    this.init();
  }

  /**
   * Инициализация менеджера состояний
   */
  init() {
    if (this.isInitialized) return;
    
    this.calculateScrollbarWidth();
    this.findLockPaddingElements();
    this.setupEventListeners();
    
    // Устанавливаем начальное состояние
    this.setState(SCROLL_STATES.ENABLED);
    this.isInitialized = true;
    
    console.log('StateManager initialized');
  }

  /**
   * Вычисление ширины скроллбара
   */
  calculateScrollbarWidth() {
    this.scrollbarWidth = DOM.getScrollbarWidth();
  }

  /**
   * Поиск элементов для компенсации скроллбара
   */
  findLockPaddingElements() {
    this.lockPaddingElements = DOM.findAll('[data-lp]');
    this.lockPaddingFixedElements = DOM.findAll('[data-lp-fixed]');
  }

  /**
   * Настройка слушателей событий
   */
  setupEventListeners() {
    // Слушаем события от других модулей
    eventBus.on(EVENTS.MENU.OPENED, () => {
      this.setState(SCROLL_STATES.DISABLED_BY_MENU);
    });

    eventBus.on(EVENTS.MENU.CLOSED, () => {
      this.setState(SCROLL_STATES.ENABLED);
    });

    eventBus.on(EVENTS.MODAL.OPENED, () => {
      this.setState(SCROLL_STATES.DISABLED_BY_MODAL);
    });

    eventBus.on(EVENTS.MODAL.CLOSED, () => {
      this.setState(SCROLL_STATES.ENABLED);
    });

    // Обновляем элементы при ресайзе
    window.addEventListener('resize', () => {
      this.calculateScrollbarWidth();
      this.updateLockPadding();
    });
  }

  /**
   * Установка нового состояния
   * @param {string} newState - Новое состояние из SCROLL_STATES
   */
  setState(newState) {
    if (this.currentState === newState) return;
    
    const previousState = this.currentState;
    this.currentState = newState;
    
    this.handleStateChange(previousState, newState);
    this.emitStateEvent(previousState, newState);
  }

  /**
   * Обработка изменения состояния
   * @param {string} previousState - Предыдущее состояние
   * @param {string} newState - Новое состояние
   */
  handleStateChange(previousState, newState) {
    // Убираем классы предыдущего состояния
    this.removeStateClasses(previousState);
    
    // Добавляем классы нового состояния
    this.addStateClasses(newState);
    
    // Обновляем компенсацию скроллбара
    this.updateLockPadding();
    
    // Блокируем/разблокируем скролл
    this.updateScrollLock();
  }

  /**
   * Удаление классов предыдущего состояния
   * @param {string} state 
   */
  removeStateClasses(state) {
    const body = document.body;
    
    switch (state) {
      case SCROLL_STATES.DISABLED_BY_MENU:
        body.classList.remove(STATE_CLASSES.BODY.MENU_OPENED);
        body.classList.add(STATE_CLASSES.BODY.MENU_CLOSED);
        break;
        
      case SCROLL_STATES.DISABLED_BY_MODAL:
        body.classList.remove(STATE_CLASSES.BODY.MODAL_OPENED);
        body.classList.add(STATE_CLASSES.BODY.MODAL_CLOSED);
        break;
        
      case SCROLL_STATES.ENABLED:
        body.classList.remove(STATE_CLASSES.BODY.SCROLL_LOCKED);
        break;
    }
  }

  /**
   * Добавление классов нового состояния
   * @param {string} state 
   */
  addStateClasses(state) {
    const body = document.body;
    
    switch (state) {
      case SCROLL_STATES.DISABLED_BY_MENU:
        body.classList.remove(STATE_CLASSES.BODY.MENU_CLOSED);
        body.classList.add(STATE_CLASSES.BODY.MENU_OPENED);
        body.classList.add(STATE_CLASSES.BODY.SCROLL_LOCKED);
        break;
        
      case SCROLL_STATES.DISABLED_BY_MODAL:
        body.classList.remove(STATE_CLASSES.BODY.MODAL_CLOSED);
        body.classList.add(STATE_CLASSES.BODY.MODAL_OPENED);
        body.classList.add(STATE_CLASSES.BODY.SCROLL_LOCKED);
        break;
        
      case SCROLL_STATES.ENABLED:
        body.classList.remove(STATE_CLASSES.BODY.SCROLL_LOCKED);
        break;
    }
  }

  /**
   * Обновление компенсации скроллбара
   */
  updateLockPadding() {
    const hasScrollbar = document.body.scrollHeight > window.innerHeight;
    const scrollbarWidth = hasScrollbar ? this.scrollbarWidth : 0;
    
    // Постоянная компенсация для элементов с data-lp
    this.lockPaddingElements.forEach(element => {
      element.style.paddingRight = `${scrollbarWidth}px`;
    });
    
    // Компенсация только при заблокированном скролле
    if (this.currentState !== SCROLL_STATES.ENABLED) {
      this.lockPaddingFixedElements.forEach(element => {
        element.style.paddingRight = `${scrollbarWidth}px`;
      });
      document.body.style.marginRight = '0';
    } else {
      this.lockPaddingFixedElements.forEach(element => {
        element.style.paddingRight = '';
      });
      document.body.style.marginRight = `-${scrollbarWidth}px`;
    }
  }

  /**
   * Блокировка/разблокировка скролла
   */
  updateScrollLock() {
    if (this.currentState !== SCROLL_STATES.ENABLED) {
      this.lockScroll();
    } else {
      this.unlockScroll();
    }
  }

  /**
   * Блокировка скролла
   */
  lockScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }

  /**
   * Разблокировка скролла
   */
  unlockScroll() {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }

  /**
   * Отправка события о изменении состояния
   * @param {string} previousState 
   * @param {string} newState 
   */
  emitStateEvent(previousState, newState) {
    eventBus.emit(EVENTS.STATE.CHANGED, {
      previous: previousState,
      current: newState,
      timestamp: Date.now()
    });
    
    if (newState === SCROLL_STATES.ENABLED) {
      eventBus.emit(EVENTS.SCROLL.UNLOCKED);
    } else {
      eventBus.emit(EVENTS.SCROLL.LOCKED, { reason: newState });
    }
  }

  /**
   * Получение текущего состояния
   * @returns {string}
   */
  getState() {
    return this.currentState;
  }

  /**
   * Проверка заблокирован ли скролл
   * @returns {boolean}
   */
  isScrollLocked() {
    return this.currentState !== SCROLL_STATES.ENABLED;
  }

  /**
   * Очистка и деструктор
   */
  destroy() {
    this.unlockScroll();
    
    // Убираем все стили
    this.lockPaddingElements.forEach(element => {
      element.style.paddingRight = '';
    });
    
    this.lockPaddingFixedElements.forEach(element => {
      element.style.paddingRight = '';
    });
    
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    
    this.isInitialized = false;
  }
}

// Создаем глобальный экземпляр State Manager
const stateManager = new StateManager();

export default stateManager;