// src/js/modules/nav-manager.js

/**
 * Менеджер навигации с улучшенной доступностью и производительностью
 */

import { DATA_ATTRIBUTES, STATE_CLASSES, BREAKPOINTS, EVENTS } from '../constants.js';
import eventBus from '../core/event-bus.js';
import { DOM, Events, Performance, Validation, Helpers } from '../core/utils.js';

class NavManager {
  constructor(options = {}) {
    this.options = {
      mobileBreakpoint: options.mobileBreakpoint || BREAKPOINTS.MOBILE,
      closeOnResize: options.closeOnResize !== undefined ? options.closeOnResize : true,
      closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
      ...options
    };

    this.isMenuOpen = false;
    this.toggleElements = [];
    this.closeElements = [];
    this.menuElement = null;

    this.init();
  }

  /**
   * Инициализация менеджера навигации
   */
  init() {
    this.findElements();
    
    if (!this.toggleElements.length) {
      console.warn('NavManager: No toggle elements found');
      return;
    }

    this.setupEventListeners();
    this.setInitialState();
    
    console.log('NavManager initialized');
  }

  /**
   * Поиск необходимых элементов
   */
  findElements() {
    // Элементы для открытия/закрытия меню
    this.toggleElements = DOM.findAll(`[${DATA_ATTRIBUTES.MENU_TOGGLE}]`);
    this.closeElements = DOM.findAll(`[${DATA_ATTRIBUTES.MENU_CLOSE}]`);
    
    // Основной элемент меню (первый найденный с ролью navigation)
    this.menuElement = DOM.find('nav, [role="navigation"]');
  }

  /**
   * Настройка начального состояния
   */
  setInitialState() {
    document.body.classList.add(STATE_CLASSES.BODY.MENU_CLOSED);
    this.isMenuOpen = false;
    
    // Устанавливаем доступность
    this.updateAccessibility();
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Обработчики для toggle элементов
    this.toggleElements.forEach(element => {
      Events.on(element, 'click', (event) => {
        event.preventDefault();
        this.toggleMenu();
      });
    });

    // Обработчики для close элементов
    this.closeElements.forEach(element => {
      Events.on(element, 'click', (event) => {
        event.preventDefault();
        this.closeMenu();
      });
    });

    // Закрытие по ESC
    if (this.options.closeOnEscape) {
      Events.on(document, 'keydown', (event) => {
        if (Helpers.isEscapeKey(event) && this.isMenuOpen) {
          this.closeMenu();
        }
      });
    }

    // Автоматическое закрытие при ресайзе
    if (this.options.closeOnResize) {
      Events.on(window, 'resize', Performance.debounce(() => {
        if (this.isMenuOpen && window.innerWidth > this.options.mobileBreakpoint) {
          this.closeMenu();
        }
      }, 100));
    }

    // Обработка клика вне меню
    Events.on(document, 'click', (event) => {
      this.handleOutsideClick(event);
    });

    // Обработка событий из других модулей
    eventBus.on(EVENTS.MODAL.OPENED, () => {
      if (this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Реинициализация при изменении контента
    eventBus.on('content:changed', () => {
      this.findElements();
      this.setupEventListeners();
    });
  }

  /**
   * Переключение состояния меню
   */
  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  /**
   * Открытие меню
   */
  openMenu() {
    if (this.isMenuOpen) return;

    document.body.classList.remove(STATE_CLASSES.BODY.MENU_CLOSED);
    document.body.classList.add(STATE_CLASSES.BODY.MENU_OPENED);
    
    this.isMenuOpen = true;
    this.updateAccessibility();
    
    // Фокусировка на первом элементе меню при открытии
    this.focusFirstMenuItem();
    
    // Отправка события
    eventBus.emit(EVENTS.MENU.OPENED, {
      element: this.menuElement,
      timestamp: Date.now()
    });

    console.log('Menu opened');
  }

  /**
   * Закрытие меню
   */
  closeMenu() {
    if (!this.isMenuOpen) return;

    document.body.classList.remove(STATE_CLASSES.BODY.MENU_OPENED);
    document.body.classList.add(STATE_CLASSES.BODY.MENU_CLOSED);
    
    this.isMenuOpen = false;
    this.updateAccessibility();
    
    // Возврат фокуса на toggle элемент при закрытии
    this.returnFocusToToggle();
    
    // Отправка события
    eventBus.emit(EVENTS.MENU.CLOSED, {
      element: this.menuElement,
      timestamp: Date.now()
    });

    console.log('Menu closed');
  }

  /**
   * Обработка клика вне меню
   */
  handleOutsideClick(event) {
    if (!this.isMenuOpen) return;

    const clickedElement = event.target;
    const isClickInsideMenu = this.menuElement && this.menuElement.contains(clickedElement);
    const isClickOnToggle = this.toggleElements.some(element => element.contains(clickedElement));
    const isClickOnClose = this.closeElements.some(element => element.contains(clickedElement));

    if (!isClickInsideMenu && !isClickOnToggle && !isClickOnClose) {
      this.closeMenu();
    }
  }

  /**
   * Обновление accessibility атрибутов
   */
  updateAccessibility() {
    // Обновляем атрибуты для toggle элементов
    this.toggleElements.forEach(element => {
      element.setAttribute('aria-expanded', this.isMenuOpen);
      element.setAttribute('aria-label', this.isMenuOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    // Обновляем атрибуты для меню
    if (this.menuElement) {
      this.menuElement.setAttribute('aria-hidden', !this.isMenuOpen);
      
      if (this.isMenuOpen) {
        this.menuElement.removeAttribute('inert');
      } else {
        this.menuElement.setAttribute('inert', '');
      }
    }

    // Блокируем скролл для не-интерактивных элементов при открытом меню
    const mainContent = DOM.find('main');
    if (mainContent) {
      if (this.isMenuOpen) {
        mainContent.setAttribute('aria-hidden', 'true');
        mainContent.setAttribute('inert', '');
      } else {
        mainContent.removeAttribute('aria-hidden');
        mainContent.removeAttribute('inert');
      }
    }
  }

  /**
   * Фокусировка на первом элементе меню
   */
  focusFirstMenuItem() {
    if (!this.menuElement) return;

    const focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = this.menuElement.querySelectorAll(focusableSelectors);
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Возврат фокуса на toggle элемент
   */
  returnFocusToToggle() {
    if (this.toggleElements.length > 0) {
      this.toggleElements[0].focus();
    }
  }

  /**
   * Проверка открыто ли меню
   */
  isOpen() {
    return this.isMenuOpen;
  }

  /**
   * Принудительное открытие меню
   */
  forceOpen() {
    this.openMenu();
  }

  /**
   * Принудительное закрытие меню
   */
  forceClose() {
    this.closeMenu();
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Добавление toggle элемента
   */
  addToggleElement(element) {
    if (this.toggleElements.includes(element)) return;

    this.toggleElements.push(element);
    Events.on(element, 'click', (event) => {
      event.preventDefault();
      this.toggleMenu();
    });
    
    this.updateAccessibility();
  }

  /**
   * Удаление toggle элемента
   */
  removeToggleElement(element) {
    const index = this.toggleElements.indexOf(element);
    
    if (index !== -1) {
      Events.off(element, 'click', this.toggleMenu);
      this.toggleElements.splice(index, 1);
    }
  }

  /**
   * Деструктор
   */
  destroy() {
    // Удаляем обработчики с toggle элементов
    this.toggleElements.forEach(element => {
      Events.off(element, 'click', this.toggleMenu);
    });

    // Удаляем обработчики с close элементов
    this.closeElements.forEach(element => {
      Events.off(element, 'click', this.closeMenu);
    });

    // Удаляем глобальные обработчики
    Events.off(document, 'keydown', this.handleEscape);
    Events.off(window, 'resize', this.handleResize);
    Events.off(document, 'click', this.handleOutsideClick);

    // Сбрасываем состояния
    if (this.isMenuOpen) {
      this.closeMenu();
    }

    // Убираем accessibility атрибуты
    this.toggleElements.forEach(element => {
      element.removeAttribute('aria-expanded');
      element.removeAttribute('aria-label');
    });

    if (this.menuElement) {
      this.menuElement.removeAttribute('aria-hidden');
      this.menuElement.removeAttribute('inert');
    }

    this.toggleElements = [];
    this.closeElements = [];
    this.menuElement = null;

    console.log('NavManager destroyed');
  }
}

export default NavManager;