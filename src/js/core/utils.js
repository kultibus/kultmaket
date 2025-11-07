// src/js/core/utils.js

/**
 * Вспомогательные утилиты для работы модулей
 */

import { BREAKPOINTS, PERFORMANCE, KEY_CODES } from "../constants.js";

/**
 * DOM утилиты
 */
export const DOM = {
    /**
     * Безопасный поиск элемента
     * @param {string} selector - CSS селектор
     * @param {HTMLElement} context - Контекст поиска (по умолчанию document)
     * @returns {HTMLElement|null}
     */
    find(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return null;
        }
    },

    /**
     * Безопасный поиск всех элементов
     * @param {string} selector - CSS селектор
     * @param {HTMLElement} context - Контекст поиска (по умолчанию document)
     * @returns {NodeList}
     */
    findAll(selector, context = document) {
        try {
            return context.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return [];
        }
    },

    /**
     * Проверка поддержки CSS свойства
     * @param {string} property - CSS свойство
     * @returns {boolean}
     */
    supportsCSS(property) {
        return typeof CSS !== "undefined" && CSS.supports(property, "initial");
    },

    /**
     * Получение ширины скроллбара
     * @returns {number}
     */
    getScrollbarWidth() {
        // Создаем временный элемент для измерения
        const outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.overflow = "scroll";
        document.body.appendChild(outer);

        const inner = document.createElement("div");
        outer.appendChild(inner);

        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

        // Удаляем временные элементы
        outer.parentNode.removeChild(outer);

        return scrollbarWidth;
    },

    /**
     * Проверка является ли элемент видимым
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    isVisible(element) {
        return !!(
            element.offsetWidth ||
            element.offsetHeight ||
            element.getClientRects().length
        );
    },
};

/**
 * Утилиты для работы с событиями
 */
export const Events = {
    /**
     * Обертка для addEventListener с поддержкой passive
     * @param {HTMLElement} element
     * @param {string} event
     * @param {Function} handler
     * @param {Object} options
     */
    on(element, event, handler, options = {}) {
        const passive = options.passive ?? true;
        element.addEventListener(event, handler, { passive, ...options });
    },

    /**
     * Обертка для removeEventListener
     * @param {HTMLElement} element
     * @param {string} event
     * @param {Function} handler
     * @param {Object} options
     */
    off(element, event, handler, options = {}) {
        element.removeEventListener(event, handler, options);
    },
};

/**
 * Производительность
 */
export const Performance = {
    /**
     * Debounce функция
     * @param {Function} func - Функция для выполнения
     * @param {number} wait - Время задержки
     * @param {boolean} immediate - Немедленное выполнение
     * @returns {Function}
     */
    debounce(func, wait = PERFORMANCE.DEBOUNCE.RESIZE, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    /**
     * Throttle функция
     * @param {Function} func - Функция для выполнения
     * @param {number} limit - Лимит времени
     * @returns {Function}
     */
    throttle(func, limit = PERFORMANCE.THROTTLE.SCROLL_MANAGER) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /**
     * Анимация через requestAnimationFrame
     * @param {Function} callback - Функция анимации
     * @returns {number} - ID анимации
     */
    raf(callback) {
        return requestAnimationFrame(callback);
    },

    /**
     * Отмена анимации
     * @param {number} id - ID анимации
     */
    cancelRaf(id) {
        cancelAnimationFrame(id);
    },
};

/**
 * Валидация
 */
export const Validation = {
    /**
     * Проверка на число
     * @param {*} value
     * @returns {boolean}
     */
    isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    /**
     * Проверка на мобильное устройство
     * @returns {boolean}
     */
    isMobile() {
        // ИЗМЕНИТЬ брейкпоинт для мобильных
        return window.innerWidth < BREAKPOINTS.LAPTOP;
    },

    /**
     * Валидация data-атрибута
     * @param {HTMLElement} element
     * @param {string} attribute
     * @param {string} type - Тип значения ('number', 'string', 'boolean')
     * @returns {boolean}
     */
    validateDataAttribute(element, attribute, type = "string") {
        if (!element || !element.hasAttribute(attribute)) {
            return false;
        }

        const value = element.getAttribute(attribute);

        switch (type) {
            case "number":
                return this.isNumber(value);
            case "boolean":
                return value === "true" || value === "false";
            case "string":
                return value.length > 0;
            default:
                return true;
        }
    },
};

/**
 * Помощники
 */
export const Helpers = {
    /**
     * Генерация уникального ID
     * @param {string} prefix - Префикс для ID
     * @returns {string}
     */
    generateId(prefix = "module") {
        return `${prefix}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
    },

    /**
     * Проверка поддержки WebP
     * @returns {Promise<boolean>}
     */
    checkWebPSupport() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src =
                "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        });
    },

    /**
     * Плавная прокрутка к элементу
     * @param {HTMLElement} targetElement
     * @param {number} duration
     * @param {number} offset
     */
    smoothScrollTo(targetElement, duration = 800, offset = 0) {
        const targetPosition =
            targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition - offset;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(
                timeElapsed,
                startPosition,
                distance,
                duration
            );
            window.scrollTo(0, run);
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return (c / 2) * t * t + b;
            t--;
            return (-c / 2) * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    },

    /**
     * Получение кода клавиши
     * @param {KeyboardEvent} event
     * @returns {string}
     */
    getKeyCode(event) {
        return event.key || event.keyCode || event.which;
    },

    /**
     * Проверка нажатия ESC
     * @param {KeyboardEvent} event
     * @returns {boolean}
     */
    isEscapeKey(event) {
        return (
            this.getKeyCode(event) === KEY_CODES.ESC || event.key === "Escape"
        );
    },
};

export default {
    DOM,
    Events,
    Performance,
    Validation,
    Helpers,
};
