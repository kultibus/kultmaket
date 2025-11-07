// src/js/modules/scroll-manager.js

/**
 * Менеджер скролла с улучшенной производительностью
 */

import { SCROLL_CONFIG, STATE_CLASSES, DATA_ATTRIBUTES, EVENTS } from '../constants.js';
import eventBus from '../core/event-bus.js';
import { DOM, Performance, Events, Helpers } from '../core/utils.js';

class ScrollManager {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || SCROLL_CONFIG.THRESHOLD,
      duration: options.duration || SCROLL_CONFIG.DURATION,
      offset: options.offset || SCROLL_CONFIG.OFFSET,
      ...options
    };

    this.lastScrollY = window.pageYOffset;
    this.direction = null;
    this.isScrolling = false;
    this.observer = null;
    this.stepElements = [];
    this.anchorLinks = [];

    this.init();
  }

  /**
   * Инициализация менеджера скролла
   */
  init() {
    this.findElements();
    this.setupScrollListener();
    this.setupAnchorLinks();
    this.setupIntersectionObserver();
    this.setupEventListeners();

    console.log('ScrollManager initialized');
  }

  /**
   * Поиск необходимых элементов
   */
  findElements() {
    this.stepElements = DOM.findAll(`[${DATA_ATTRIBUTES.STEP}]`);
    this.anchorLinks = DOM.findAll(`a[href^="#"]`);
  }

  /**
   * Настройка слушателя скролла
   */
  setupScrollListener() {
    this.handleScroll = Performance.throttle(() => {
      this.detectScrollDirection();
      this.handleScrollSteps();
    }, PERFORMANCE.THROTTLE.SCROLL_MANAGER);

    Events.on(window, 'scroll', this.handleScroll);
  }

  /**
   * Настройка якорных ссылок
   */
  setupAnchorLinks() {
    this.anchorLinks.forEach(link => {
      Events.on(link, 'click', (event) => {
        this.handleAnchorClick(event, link);
      });
    });
  }

  /**
   * Настройка Intersection Observer для steps
   */
  setupIntersectionObserver() {
    if (!this.stepElements.length || !('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activateStep(entry.target);
          }
        });
      },
      {
        threshold: SCROLL_CONFIG.OBSERVER.THRESHOLD,
        rootMargin: SCROLL_CONFIG.OBSERVER.ROOT_MARGIN
      }
    );

    this.stepElements.forEach(step => {
      this.observer.observe(step);
    });
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Реинициализация при изменении контента
    eventBus.on('content:changed', () => {
      this.findElements();
      this.setupAnchorLinks();
      this.setupIntersectionObserver();
    });

    // Обновление при ресайзе
    Events.on(window, 'resize', Performance.debounce(() => {
      this.lastScrollY = window.pageYOffset;
    }, PERFORMANCE.DEBOUNCE.RESIZE));
  }

  /**
   * Определение направления скролла
   */
  detectScrollDirection() {
    const currentScrollY = window.pageYOffset;
    const scrollDelta = currentScrollY - this.lastScrollY;

    // Игнорируем微小ые движения
    if (Math.abs(scrollDelta) <= this.options.threshold) {
      this.lastScrollY = currentScrollY;
      return;
    }

    const newDirection = scrollDelta > 0 ? 'down' : 'up';

    if (this.direction !== newDirection) {
      this.direction = newDirection;
      this.updateScrollClasses();
      this.emitScrollDirectionEvent();
    }

    this.lastScrollY = Math.max(0, currentScrollY);
    this.isScrolling = true;

    // Сброс флага скролла после остановки
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
      this.handleNoScroll();
    }, 100);
  }

  /**
   * Обновление классов скролла
   */
  updateScrollClasses() {
    const body = document.body;

    if (this.direction === 'down') {
      body.classList.remove(STATE_CLASSES.BODY.SCROLL_UP);
      body.classList.add(STATE_CLASSES.BODY.SCROLL_DOWN);
    } else {
      body.classList.remove(STATE_CLASSES.BODY.SCROLL_DOWN);
      body.classList.add(STATE_CLASSES.BODY.SCROLL_UP);
    }
  }

  /**
   * Обработка отсутствия скролла
   */
  handleNoScroll() {
    const body = document.body;

    if (!this.isScrolling) {
      body.classList.remove(STATE_CLASSES.BODY.SCROLL_UP);
      body.classList.remove(STATE_CLASSES.BODY.SCROLL_DOWN);
    }
  }

  /**
   * Отправка события изменения направления скролла
   */
  emitScrollDirectionEvent() {
    eventBus.emit(EVENTS.SCROLL.DIRECTION_CHANGED, {
      direction: this.direction,
      position: window.pageYOffset,
      timestamp: Date.now()
    });
  }

  /**
   * Обработка клика по якорной ссылке
   */
  handleAnchorClick(event, link) {
    const href = link.getAttribute('href');
    
    if (href === '#' || href === '') return;
    
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) return;
    
    event.preventDefault();
    
    Helpers.smoothScrollTo(targetElement, this.options.duration, this.options.offset);
    
    // Обновление URL без перезагрузки страницы
    history.pushState(null, null, href);
  }

  /**
   * Активация текущего step элемента
   */
  activateStep(activeStep) {
    // Снимаем активные классы со всех steps
    this.stepElements.forEach(step => {
      step.classList.remove(
        STATE_CLASSES.STEP.ACTIVE,
        STATE_CLASSES.STEP.COMPLETED,
        STATE_CLASSES.STEP.UPCOMING
      );
    });

    // Добавляем класс active текущему step
    activeStep.classList.add(STATE_CLASSES.STEP.ACTIVE);

    // Добавляем классы completed и upcoming
    let foundActive = false;
    
    this.stepElements.forEach(step => {
      if (step === activeStep) {
        foundActive = true;
      } else if (foundActive) {
        step.classList.add(STATE_CLASSES.STEP.UPCOMING);
      } else {
        step.classList.add(STATE_CLASSES.STEP.COMPLETED);
      }
    });

    // Отправляем событие активации step
    eventBus.emit('step:activated', {
      element: activeStep,
      index: Array.from(this.stepElements).indexOf(activeStep),
      total: this.stepElements.length
    });
  }

  /**
   * Обработка steps при скролле (fallback для старых браузеров)
   */
  handleScrollSteps() {
    if (this.observer || !this.stepElements.length) return;

    const scrollPosition = window.pageYOffset + window.innerHeight * 0.3;

    let activeStep = null;
    
    this.stepElements.forEach(step => {
      const stepTop = step.offsetTop;
      const stepHeight = step.offsetHeight;
      
      if (scrollPosition >= stepTop && scrollPosition < stepTop + stepHeight) {
        activeStep = step;
      }
    });

    if (activeStep) {
      this.activateStep(activeStep);
    }
  }

  /**
   * Прокрутка к элементу
   */
  scrollToElement(element, duration = null, offset = null) {
    const scrollDuration = duration !== null ? duration : this.options.duration;
    const scrollOffset = offset !== null ? offset : this.options.offset;
    
    Helpers.smoothScrollTo(element, scrollDuration, scrollOffset);
  }

  /**
   * Прокрутка к верхней части страницы
   */
  scrollToTop(duration = null) {
    const scrollDuration = duration !== null ? duration : this.options.duration;
    
    Helpers.smoothScrollTo(document.body, scrollDuration, 0);
  }

  /**
   * Получение текущей позиции скролла
   */
  getScrollPosition() {
    return window.pageYOffset;
  }

  /**
   * Получение направления скролла
   */
  getScrollDirection() {
    return this.direction;
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
    Events.off(window, 'scroll', this.handleScroll);
    
    this.anchorLinks.forEach(link => {
      Events.off(link, 'click', this.handleAnchorClick);
    });

    if (this.observer) {
      this.stepElements.forEach(step => {
        this.observer.unobserve(step);
      });
      this.observer.disconnect();
    }

    clearTimeout(this.scrollTimeout);

    // Убираем добавленные классы
    document.body.classList.remove(
      STATE_CLASSES.BODY.SCROLL_UP,
      STATE_CLASSES.BODY.SCROLL_DOWN
    );

    console.log('ScrollManager destroyed');
  }
}

export default ScrollManager;