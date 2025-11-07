// src/js/modules/parallax.js

/**
 * Модуль параллакс-эффектов с оптимизацией производительности
 */

import { PARALLAX_CONFIG, BREAKPOINTS, DATA_ATTRIBUTES } from "../constants.js";
import { DOM, Performance, Events, Validation } from "../core/utils.js";

class Parallax {
    constructor(options = {}) {
        this.options = {
            speed: options.speed || PARALLAX_CONFIG.DEFAULT_SPEED,
            mobileDisabled:
                options.mobileDisabled !== undefined
                    ? options.mobileDisabled
                    : PARALLAX_CONFIG.MOBILE_DISABLED,
            throttle: options.throttle || PARALLAX_CONFIG.THROTTLE,
            ...options,
        };

        this.elements = [];
        this.isEnabled = true;
        this.rafId = null;
        this.lastScrollY = 0;

        this.init();
    }

    /**
     * Инициализация модуля параллакса
     */
    init() {
        if (this.shouldDisableOnMobile() && Validation.isMobile()) {
            console.log("Parallax disabled on mobile devices");
            this.isEnabled = false;
            return;
        }

        this.findElements();

        if (!this.elements.length) {
            console.log("No parallax elements found");
            return;
        }

        this.setupEventListeners();
        this.updateAllElements();

        console.log(
            `Parallax initialized with ${this.elements.length} elements`
        );
    }

    /**
     * Поиск элементов с параллаксом
     */
    findElements() {
        const parallaxElements = DOM.findAll(`[${DATA_ATTRIBUTES.PARALLAX}]`);

        parallaxElements.forEach(element => {
            const config = this.parseElementConfig(element);

            if (config) {
                this.elements.push({
                    element,
                    speed: config.speed,
                    originalPosition: this.getElementPosition(element),
                });
            }
        });
    }

    /**
     * Парсинг конфигурации элемента
     */
    parseElementConfig(element) {
        if (
            !Validation.validateDataAttribute(
                element,
                DATA_ATTRIBUTES.PARALLAX,
                "boolean"
            )
        ) {
            console.warn("Invalid parallax element:", element);
            return null;
        }

        let speed = this.options.speed;

        // Проверяем кастомную скорость
        if (element.hasAttribute(DATA_ATTRIBUTES.PARALLAX_SPEED)) {
            const customSpeed = parseFloat(
                element.getAttribute(DATA_ATTRIBUTES.PARALLAX_SPEED)
            );

            if (
                Validation.isNumber(customSpeed) &&
                customSpeed >= 0 &&
                customSpeed <= 2
            ) {
                speed = customSpeed;
            } else {
                console.warn(
                    `Invalid parallax speed for element: ${customSpeed}. Using default.`
                );
            }
        }

        return { speed };
    }

    /**
     * Получение исходной позиции элемента
     */
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            height: rect.height,
        };
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        if (!this.isEnabled) return;

        // Оптимизированный обработчик скролла
        this.handleScroll = Performance.throttle(() => {
            this.lastScrollY = window.pageYOffset;

            if (!this.rafId) {
                this.rafId = Performance.raf(() => {
                    this.updateAllElements();
                    this.rafId = null;
                });
            }
        }, this.options.throttle);

        Events.on(window, "scroll", this.handleScroll);

        // Обновление при ресайзе
        this.handleResize = Performance.debounce(() => {
            this.updateElementPositions();

            // ИЗМЕНИТЬ условие отключения
            if (
                this.shouldDisableOnMobile() &&
                window.innerWidth < BREAKPOINTS.LAPTOP
            ) {
                this.disable();
            } else if (
                !this.isEnabled &&
                window.innerWidth >= BREAKPOINTS.LAPTOP
            ) {
                this.enable();
            }
        }, 150);

        Events.on(window, "resize", this.handleResize);

        // Отключение при скролл-блокировке для производительности
        Events.on("scroll:locked", () => {
            this.pause();
        });

        Events.on("scroll:unlocked", () => {
            this.resume();
        });
    }

    /**
     * Проверка отключения на мобильных
     */
    shouldDisableOnMobile() {
        // ИЗМЕНИТЬ проверку брейкпоинта
        return (
            this.options.mobileDisabled &&
            window.innerWidth < BREAKPOINTS.LAPTOP
        );
    }

    /**
     * Обновление позиций всех элементов
     */
    updateAllElements() {
        if (!this.isEnabled) return;

        const scrollY = this.lastScrollY;
        const viewportHeight = window.innerHeight;

        this.elements.forEach(item => {
            this.updateElement(item, scrollY, viewportHeight);
        });
    }

    /**
     * Обновление конкретного элемента
     */
    updateElement(item, scrollY, viewportHeight) {
        const { element, speed, originalPosition } = item;

        // Проверяем видимость элемента для оптимизации
        if (
            !this.isElementInViewport(originalPosition, scrollY, viewportHeight)
        ) {
            return;
        }

        const elementTop = originalPosition.top;
        const elementHeight = originalPosition.height;

        // Вычисляем прогресс скролла относительно элемента
        const elementProgress =
            (scrollY + viewportHeight - elementTop) /
            (viewportHeight + elementHeight);

        // Ограничиваем прогресс между 0 и 1
        const clampedProgress = Math.max(0, Math.min(1, elementProgress));

        // Вычисляем смещение с учетом скорости
        const translateY = (1 - clampedProgress) * 100 * speed;

        // Применяем трансформацию
        this.applyTransform(element, translateY);
    }

    /**
     * Проверка видимости элемента в viewport'е
     */
    isElementInViewport(elementPos, scrollY, viewportHeight) {
        return (
            elementPos.top < scrollY + viewportHeight &&
            elementPos.top + elementPos.height > scrollY
        );
    }

    /**
     * Применение трансформации к элементу
     */
    applyTransform(element, translateY) {
        element.style.transform = `translate3d(0, ${translateY}px, 0)`;
    }

    /**
     * Обновление позиций элементов при ресайзе
     */
    updateElementPositions() {
        this.elements.forEach(item => {
            item.originalPosition = this.getElementPosition(item.element);
        });

        this.updateAllElements();
    }

    /**
     * Включение параллакса
     */
    enable() {
        if (this.isEnabled) return;

        this.isEnabled = true;
        this.setupEventListeners();
        this.updateAllElements();

        console.log("Parallax enabled");
    }

    /**
     * Отключение параллакса
     */
    disable() {
        if (!this.isEnabled) return;

        this.isEnabled = false;

        // Сбрасываем трансформации
        this.elements.forEach(item => {
            item.element.style.transform = "";
        });

        console.log("Parallax disabled");
    }

    /**
     * Пауза параллакса
     */
    pause() {
        if (this.rafId) {
            Performance.cancelRaf(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Возобновление параллакса
     */
    resume() {
        this.updateAllElements();
    }

    /**
     * Добавление нового элемента параллакса
     */
    addElement(element, customSpeed = null) {
        const config = this.parseElementConfig(element);

        if (!config) return false;

        if (customSpeed !== null) {
            config.speed = customSpeed;
        }

        this.elements.push({
            element,
            speed: config.speed,
            originalPosition: this.getElementPosition(element),
        });

        this.updateElement(
            this.elements[this.elements.length - 1],
            this.lastScrollY,
            window.innerHeight
        );

        return true;
    }

    /**
     * Удаление элемента параллакса
     */
    removeElement(element) {
        const index = this.elements.findIndex(item => item.element === element);

        if (index !== -1) {
            // Сбрасываем трансформацию
            element.style.transform = "";
            this.elements.splice(index, 1);
            return true;
        }

        return false;
    }

    /**
     * Получение количества элементов
     */
    getElementCount() {
        return this.elements.length;
    }

    /**
     * Обновление конфигурации
     */
    updateConfig(newOptions) {
        this.options = { ...this.options, ...newOptions };

        if (this.shouldDisableOnMobile() && Validation.isMobile()) {
            this.disable();
        }
    }

    /**
     * Деструктор
     */
    destroy() {
        this.pause();

        if (this.isEnabled) {
            Events.off(window, "scroll", this.handleScroll);
            Events.off(window, "resize", this.handleResize);
        }

        // Сбрасываем трансформации всех элементов
        this.elements.forEach(item => {
            item.element.style.transform = "";
        });

        this.elements = [];
        this.isEnabled = false;

        console.log("Parallax destroyed");
    }
}

export default Parallax;
