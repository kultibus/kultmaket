// src/js/modules/modal-manager.js

/**
 * Менеджер модальных окон с улучшенной доступностью и производительностью
 */

import { DATA_ATTRIBUTES, STATE_CLASSES, EVENTS } from '../constants.js';
import eventBus from '../core/event-bus.js';
import { DOM, Events, Performance, Validation, Helpers } from '../core/utils.js';

class ModalManager {
  constructor(options = {}) {
    this.options = {
      closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
      closeOnBackdrop: options.closeOnBackdrop !== undefined ? options.closeOnBackdrop : true,
      closeOnResize: options.closeOnResize !== undefined ? options.closeOnResize : false,
      ...options
    };

    this.activeModal = null;
    this.previouslyFocusedElement = null;
    this.modalStack = [];
    this.targetElements = [];
    this.closeElements = [];

    this.init();
  }

  /**
   * Инициализация менеджера модальных окон
   */
  init() {
    this.findElements();
    
    if (!this.targetElements.length) {
      console.log('ModalManager: No modal trigger elements found');
      return;
    }

    this.setupEventListeners();
    this.setInitialState();
    
    console.log('ModalManager initialized');
  }

  /**
   * Поиск необходимых элементов
   */
  findElements() {
    // Элементы для открытия модалок
    this.targetElements = DOM.findAll(`[${DATA_ATTRIBUTES.MODAL_TARGET}]`);
    
    // Элементы для закрытия модалок
    this.closeElements = DOM.findAll(`[${DATA_ATTRIBUTES.MODAL_CLOSE}]`);
  }

  /**
   * Настройка начального состояния
   */
  setInitialState() {
    document.body.classList.add(STATE_CLASSES.BODY.MODAL_CLOSED);
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Обработчики для открытия модалок
    this.targetElements.forEach(element => {
      Events.on(element, 'click', (event) => {
        event.preventDefault();
        this.openModal(element);
      });
    });

    // Обработчики для закрытия модалок
    this.closeElements.forEach(element => {
      Events.on(element, 'click', (event) => {
        event.preventDefault();
        this.closeModal();
      });
    });

    // Закрытие по ESC
    if (this.options.closeOnEscape) {
      Events.on(document, 'keydown', (event) => {
        this.handleKeydown(event);
      });
    }

    // Закрытие при клике на бэкдроп
    if (this.options.closeOnBackdrop) {
      Events.on(document, 'click', (event) => {
        this.handleBackdropClick(event);
      });
    }

    // Обработка ресайза
    if (this.options.closeOnResize) {
      Events.on(window, 'resize', Performance.debounce(() => {
        if (this.activeModal) {
          this.closeModal();
        }
      }, 100));
    }

    // Обработка событий из других модулей
    eventBus.on(EVENTS.MENU.OPENED, () => {
      if (this.activeModal) {
        this.closeModal();
      }
    });

    // Реинициализация при изменении контента
    eventBus.on('content:changed', () => {
      this.findElements();
      this.setupEventListeners();
    });
  }

  /**
   * Обработка нажатия клавиш
   */
  handleKeydown(event) {
    // Закрытие по ESC
    if (Helpers.isEscapeKey(event) && this.activeModal) {
      event.preventDefault();
      this.closeModal();
      return;
    }

    // Ловушка фокуса внутри модалки
    if (this.activeModal && event.key === 'Tab') {
      this.handleFocusTrap(event);
    }
  }

  /**
   * Обработка клика на бэкдроп
   */
  handleBackdropClick(event) {
    if (!this.activeModal) return;

    const clickedElement = event.target;
    const isBackdropClick = clickedElement === this.activeModal;
    const isCloseButtonClick = this.closeElements.some(element => 
      element.contains(clickedElement)
    );
    const isTargetElementClick = this.targetElements.some(element => 
      element.contains(clickedElement)
    );

    if (isBackdropClick && !isCloseButtonClick && !isTargetElementClick) {
      this.closeModal();
    }
  }

  /**
   * Ловушка фокуса внутри модалки
   */
  handleFocusTrap(event) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = this.activeModal.querySelectorAll(focusableSelectors);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Открытие модального окна
   */
  openModal(triggerElement) {
    const targetId = triggerElement.getAttribute(DATA_ATTRIBUTES.MODAL_TARGET);
    
    if (!targetId) {
      console.warn('ModalManager: No target ID specified');
      return;
    }

    const modalElement = document.getElementById(targetId);
    
    if (!modalElement) {
      console.warn(`ModalManager: Modal with ID "${targetId}" not found`);
      return;
    }

    // Закрываем предыдущую модалку если есть
    if (this.activeModal) {
      this.closeModal(false);
    }

    // Сохраняем текущий активный элемент
    this.previouslyFocusedElement = document.activeElement;
    
    // Устанавливаем новую активную модалку
    this.activeModal = modalElement;
    this.modalStack.push(modalElement);

    // Обновляем классы и атрибуты
    this.updateModalState(true);
    
    // Фокусируемся на первом элементе модалки
    this.focusFirstElement();
    
    // Отправка события
    eventBus.emit(EVENTS.MODAL.OPENED, {
      modal: modalElement,
      trigger: triggerElement,
      timestamp: Date.now()
    });

    console.log(`Modal opened: ${targetId}`);
  }

  /**
   * Закрытие модального окна
   */
  closeModal(returnFocus = true) {
    if (!this.activeModal) return;

    const closedModal = this.activeModal;
    
    // Убираем из стека
    this.modalStack = this.modalStack.filter(modal => modal !== closedModal);
    
    // Обновляем активную модалку
    this.activeModal = this.modalStack.length > 0 
      ? this.modalStack[this.modalStack.length - 1] 
      : null;

    // Обновляем классы и атрибуты
    this.updateModalState(false);
    
    // Возвращаем фокус
    if (returnFocus && this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }

    // Отправка события
    eventBus.emit(EVENTS.MODAL.CLOSED, {
      modal: closedModal,
      timestamp: Date.now()
    });

    console.log('Modal closed');
  }

  /**
   * Обновление состояния модалки
   */
  updateModalState(isOpen) {
    if (isOpen) {
      // Закрываем все модалки
      DOM.findAll('.modal').forEach(modal => {
        modal.classList.remove(STATE_CLASSES.MODAL.ACTIVE);
      });
      
      // Открываем активную
      this.activeModal.classList.add(STATE_CLASSES.MODAL.ACTIVE);
      
      // Обновляем body классы
      document.body.classList.remove(STATE_CLASSES.BODY.MODAL_CLOSED);
      document.body.classList.add(STATE_CLASSES.BODY.MODAL_OPENED);
      
      // Обновляем accessibility
      this.activeModal.setAttribute('aria-hidden', 'false');
      this.activeModal.removeAttribute('inert');
    } else {
      // Закрываем все модалки
      DOM.findAll('.modal').forEach(modal => {
        modal.classList.remove(STATE_CLASSES.MODAL.ACTIVE);
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('inert', '');
      });
      
      // Обновляем body классы
      document.body.classList.remove(STATE_CLASSES.BODY.MODAL_OPENED);
      document.body.classList.add(STATE_CLASSES.BODY.MODAL_CLOSED);
    }

    // Обновляем инертность основного контента
    this.updateContentInert(isOpen);
  }

  /**
   * Обновление инертности основного контента
   */
  updateContentInert(isModalOpen) {
    const mainContent = DOM.find('main');
    
    if (mainContent) {
      if (isModalOpen) {
        mainContent.setAttribute('aria-hidden', 'true');
        mainContent.setAttribute('inert', '');
      } else {
        mainContent.removeAttribute('aria-hidden');
        mainContent.removeAttribute('inert');
      }
    }
  }

  /**
   * Фокусировка на первом элементе модалки
   */
  focusFirstElement() {
    if (!this.activeModal) return;

    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = this.activeModal.querySelectorAll(focusableSelectors);
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      // Если нет фокусируемых элементов, фокусируем саму модалку
      this.activeModal.setAttribute('tabindex', '-1');
      this.activeModal.focus();
    }
  }

  /**
   * Проверка открыта ли модалка
   */
  isOpen() {
    return this.activeModal !== null;
  }

  /**
   * Получение активной модалки
   */
  getActiveModal() {
    return this.activeModal;
  }

  /**
   * Принудительное закрытие всех модалок
   */
  closeAllModals() {
    while (this.activeModal) {
      this.closeModal(false);
    }
    
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }

  /**
   * Добавление триггера модалки
   */
  addTriggerElement(element) {
    if (this.targetElements.includes(element)) return;

    this.targetElements.push(element);
    Events.on(element, 'click', (event) => {
      event.preventDefault();
      this.openModal(element);
    });
  }

  /**
   * Удаление триггера модалки
   */
  removeTriggerElement(element) {
    const index = this.targetElements.indexOf(element);
    
    if (index !== -1) {
      Events.off(element, 'click', this.openModal);
      this.targetElements.splice(index, 1);
    }
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Деструктор
   */
  destroy() {
    // Закрываем все модалки
    this.closeAllModals();

    // Удаляем обработчики
    this.targetElements.forEach(element => {
      Events.off(element, 'click', this.openModal);
    });

    this.closeElements.forEach(element => {
      Events.off(element, 'click', this.closeModal);
    });

    Events.off(document, 'keydown', this.handleKeydown);
    Events.off(document, 'click', this.handleBackdropClick);
    Events.off(window, 'resize', this.handleResize);

    // Сбрасываем состояния
    this.targetElements = [];
    this.closeElements = [];
    this.activeModal = null;
    this.previouslyFocusedElement = null;
    this.modalStack = [];

    console.log('ModalManager destroyed');
  }
}

export default ModalManager;