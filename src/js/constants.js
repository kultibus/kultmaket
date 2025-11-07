// src/js/constants.js

/**
 * Основные константы приложения
 */

// Брейкпоинты
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200
};

// Data-атрибуты
export const DATA_ATTRIBUTES = {
  // ScrollLock
  LOCK_PADDING: 'data-lp',
  LOCK_PADDING_FIXED: 'data-lp-fixed',
  
  // ScrollManager
  STEP: 'data-step',
  ANCHOR: 'data-anchor',
  
  // Parallax
  PARALLAX: 'data-parallax',
  PARALLAX_SPEED: 'data-speed',
  
  // NavManager
  MENU_TOGGLE: 'data-menu-toggle',
  MENU_CLOSE: 'data-menu-close',
  
  // ModalManager
  MODAL_TARGET: 'data-target',
  MODAL_CLOSE: 'data-modal-close'
};

// Классы состояний
export const STATE_CLASSES = {
  // Body классы
  BODY: {
    SCROLL_LOCKED: 'scroll-locked',
    SCROLL_UP: 'scroll-up',
    SCROLL_DOWN: 'scroll-down',
    MENU_OPENED: 'menu-opened',
    MENU_CLOSED: 'menu-closed',
    MODAL_OPENED: 'modal-opened',
    MODAL_CLOSED: 'modal-closed',
    WEBP: 'webp',
    NO_WEBP: 'nowebp'
  },
  
  // Модальные окна
  MODAL: {
    ACTIVE: 'active'
  },
  
  // Степы
  STEP: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    UPCOMING: 'upcoming'
  }
};

// Настройки скролла
export const SCROLL_CONFIG = {
  THRESHOLD: 10, // Порог срабатывания scroll-up/scroll-down (px)
  DURATION: 800, // Длительность плавной прокрутки (ms)
  OFFSET: 0,     // Смещение для якорных ссылок (px)
  
  // Intersection Observer для steps
  OBSERVER: {
    THRESHOLD: 0.5,    // 50% видимости
    ROOT_MARGIN: '0px'
  }
};

// Настройки параллакса
export const PARALLAX_CONFIG = {
  DEFAULT_SPEED: 0.5,
  MOBILE_DISABLED: true,
  THROTTLE: 16 // ~60fps
};

// Настройки производительности
export const PERFORMANCE = {
  DEBOUNCE: {
    RESIZE: 100,    // Для NavManager
    SCROLL: 16,     // Для scroll событий
    PARALLAX: 16    // Для параллакса
  },
  THROTTLE: {
    SCROLL_MANAGER: 16,
    PARALLAX: 16
  }
};

// Состояния скролла (для State Machine)
export const SCROLL_STATES = {
  ENABLED: 'scroll-enabled',
  DISABLED_BY_MENU: 'scroll-disabled-by-menu',
  DISABLED_BY_MODAL: 'scroll-disabled-by-modal'
};

// Коды клавиш
export const KEY_CODES = {
  ESC: 27,
  ENTER: 13,
  SPACE: 32
};

// Event names для Event Bus
export const EVENTS = {
  // Навигация
  MENU: {
    OPENED: 'menu:opened',
    CLOSED: 'menu:closed',
    TOGGLED: 'menu:toggled'
  },
  
  // Модалки
  MODAL: {
    OPENED: 'modal:opened',
    CLOSED: 'modal:closed'
  },
  
  // Скролл
  SCROLL: {
    LOCKED: 'scroll:locked',
    UNLOCKED: 'scroll:unlocked',
    DIRECTION_CHANGED: 'scroll:direction-changed'
  },
  
  // Состояния
  STATE: {
    CHANGED: 'state:changed'
  }
};

export default {
  BREAKPOINTS,
  DATA_ATTRIBUTES,
  STATE_CLASSES,
  SCROLL_CONFIG,
  PARALLAX_CONFIG,
  PERFORMANCE,
  SCROLL_STATES,
  KEY_CODES,
  EVENTS
};