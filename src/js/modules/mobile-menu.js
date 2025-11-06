export class MobileMenu {
    constructor() {
        this.selectors = {
            burger: ".burger",
            menu: ".menu",
            overlay: ".menu-overlay",
            body: "body",
            lpContainers: ".lp-element", // Постоянная компенсация
            lp2Containers: ".lp2-element", // Временная компенсация при открытии меню
        };

        this.classes = {
            active: "active",
            locked: "locked",
            menuOpen: "menu-opened",
            scrollCompensated: "scroll-compensated",
        };

        this.burger = document.querySelector(this.selectors.burger);
        this.menu = document.querySelector(this.selectors.menu);
        this.overlay = this.createOverlay();
        this.body = document.body;
        this.lpContainers = document.querySelectorAll(
            this.selectors.lpContainers
        );
        this.lp2Containers = document.querySelectorAll(
            this.selectors.lp2Containers
        );

        this.isOpen = false;
        this.scrollbarWidth = this.getScrollbarWidth();
        this.isCompensated = false;

        this.init();
    }

    init() {
        if (!this.burger || !this.menu) {
            console.warn("MobileMenu: Не найдены необходимые элементы DOM");
            return;
        }

        // Инициализируем постоянную компенсацию при загрузке
        this.initPermanentCompensation();
        this.bindEvents();
    }

    /**
     * Получает ширину скроллбара для текущего браузера
     */
    getScrollbarWidth() {
        const outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.overflow = "scroll";
        outer.style.width = "100px";
        outer.style.position = "absolute";
        outer.style.top = "-9999px";
        document.body.appendChild(outer);

        const inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);

        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.parentNode.removeChild(outer);

        return scrollbarWidth;
    }

    /**
     * Инициализация постоянной компенсации скроллбара
     */
    initPermanentCompensation() {
        if (this.scrollbarWidth > 0) {
            // Добавляем отрицательный margin к body
            this.body.style.marginRight = `-${this.scrollbarWidth}px`;

            // Добавляем постоянный компенсирующий padding к .lp-element
            this.lpContainers.forEach(container => {
                const currentPadding =
                    window.getComputedStyle(container).paddingRight;
                const currentPaddingValue = parseFloat(currentPadding) || 0;
                container.style.paddingRight = `${
                    currentPaddingValue + this.scrollbarWidth
                }px`;
                container.dataset.originalPaddingRight = currentPadding;
            });

            this.body.classList.add(this.classes.scrollCompensated);
            this.isCompensated = true;

            console.log(
                `Permanent scrollbar compensation applied: ${this.scrollbarWidth}px`
            );
        }
    }

    /**
     * Включаем временную компенсацию при открытии меню
     */
    enableTemporaryCompensation() {
        if (this.scrollbarWidth > 0) {
            // Убираем отрицательный margin с body
            this.body.style.marginRight = "0";

            // Добавляем компенсирующий padding к .lp2-element
            this.lp2Containers.forEach(container => {
                const currentPadding =
                    window.getComputedStyle(container).paddingRight;
                const currentPaddingValue = parseFloat(currentPadding) || 0;
                container.style.paddingRight = `${
                    currentPaddingValue + this.scrollbarWidth
                }px`;
                container.dataset.tempPaddingRight = currentPadding;
            });

            this.body.classList.add(this.classes.menuOpen);
        }
    }

    /**
     * Отключаем временную компенсацию при закрытии меню
     */
    disableTemporaryCompensation() {
        if (this.scrollbarWidth > 0) {
            // Возвращаем отрицательный margin к body
            this.body.style.marginRight = `-${this.scrollbarWidth}px`;

            // Убираем компенсирующий padding с .lp2-element
            this.lp2Containers.forEach(container => {
                const originalPadding = container.dataset.tempPaddingRight;
                container.style.paddingRight = originalPadding || "";
                delete container.dataset.tempPaddingRight;
            });

            this.body.classList.remove(this.classes.menuOpen);
        }
    }

    createOverlay() {
        const overlay = document.createElement("div");
        overlay.className = "menu-overlay";
        overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 998;
    `;
        document.body.appendChild(overlay);
        return overlay;
    }

    bindEvents() {
        // Клик по бургеру
        this.burger.addEventListener("click", () => this.toggle());

        // Клик по оверлею
        this.overlay.addEventListener("click", () => this.close());

        // Клик по ссылкам меню (закрытие меню при переходе)
        this.menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => this.close());
        });

        // Клавиша Escape
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && this.isOpen) {
                this.close();
            }
        });

        // Ресайз окна (закрываем меню при переходе в десктопный режим)
        window.addEventListener("resize", () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        // Включаем временную компенсацию
        this.enableTemporaryCompensation();

        // Блокируем скролл
        this.body.classList.add(this.classes.locked);

        // Активируем меню и бургер
        this.burger.classList.add(this.classes.active);
        this.menu.classList.add(this.classes.active);

        // Показываем оверлей с анимацией
        this.overlay.style.visibility = "visible";
        setTimeout(() => {
            this.overlay.style.opacity = "1";
        }, 10);

        this.isOpen = true;

        // Улучшение доступности
        this.burger.setAttribute("aria-expanded", "true");
        this.menu.setAttribute("aria-hidden", "false");

        // Событие для аналитики
        this.dispatchEvent("mobileMenu:open");
    }

    close() {
        // Деактивируем меню и бургер
        this.burger.classList.remove(this.classes.active);
        this.menu.classList.remove(this.classes.active);

        // Разблокируем скролл
        this.body.classList.remove(this.classes.locked);

        // Отключаем временную компенсацию
        this.disableTemporaryCompensation();

        // Скрываем оверлей с анимацией
        this.overlay.style.opacity = "0";
        setTimeout(() => {
            this.overlay.style.visibility = "hidden";
        }, 300);

        this.isOpen = false;

        // Улучшение доступности
        this.burger.setAttribute("aria-expanded", "false");
        this.menu.setAttribute("aria-hidden", "true");

        // Событие для аналитики
        this.dispatchEvent("mobileMenu:close");
    }

    dispatchEvent(eventName) {
        const event = new CustomEvent(eventName, {
            detail: { isOpen: this.isOpen },
        });
        window.dispatchEvent(event);
    }

    // Публичный метод для внешнего контроля
    destroy() {
        // Восстанавливаем оригинальные стили перед уничтожением
        if (this.isOpen) {
            this.close();
        }

        // Восстанавливаем оригинальные padding для .lp-element
        this.lpContainers.forEach(container => {
            const originalPadding = container.dataset.originalPaddingRight;
            if (originalPadding !== undefined) {
                container.style.paddingRight = originalPadding;
            }
        });

        // Убираем отрицательный margin с body
        this.body.style.marginRight = "";

        this.burger.removeEventListener("click", this.toggle);
        this.overlay.removeEventListener("click", this.close);
        document.removeEventListener("keydown", this.handleEscape);
        window.removeEventListener("resize", this.handleResize);

        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}
