export class ScrollManager {
    constructor() {
        this.body = document.body;
        this.lastScrollY = 0;
        this.scrollThreshold = 100; // px
        this.ticking = false;
        this.isScrolled = false; // Флаг состояния

        this.init();
    }

    init() {
        // Принудительно убираем класс scroll при инициализации
        this.body.classList.remove("scroll");
        this.isScrolled = false;

        // Добавить обработчик скролла
        window.addEventListener("scroll", () => this.handleScroll(), {
            passive: true,
        });

        // Принудительно убираем класс scroll после полной загрузки страницы
        window.addEventListener("load", () => {
            this.body.classList.remove("scroll");
            this.isScrolled = false;
        });
    }

    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.updateScrollState());
            this.ticking = true;
        }
    }

    updateScrollState() {
        const currentScrollY =
            window.pageYOffset || document.documentElement.scrollTop;
        const scrollDirection =
            currentScrollY > this.lastScrollY ? "down" : "up";

        // Добавляем класс при скролле вниз после порога
        if (
            scrollDirection === "down" &&
            currentScrollY > this.scrollThreshold
        ) {
            if (!this.isScrolled) {
                this.body.classList.add("scroll");
                this.isScrolled = true;
            }
        }
        // Убираем класс при скролле вверх (независимо от позиции)
        else if (scrollDirection === "up") {
            if (this.isScrolled) {
                this.body.classList.remove("scroll");
                this.isScrolled = false;
            }
        }

        this.lastScrollY = currentScrollY;
        this.ticking = false;
    }

    // Публичный метод для принудительной проверки состояния
    checkScrollState() {
        const currentScrollY =
            window.pageYOffset || document.documentElement.scrollTop;

        // Принудительно обновляем состояние based on current position
        if (currentScrollY > this.scrollThreshold) {
            this.body.classList.add("scroll");
            this.isScrolled = true;
        } else {
            this.body.classList.remove("scroll");
            this.isScrolled = false;
        }

        this.lastScrollY = currentScrollY;
    }

    // Публичный метод для изменения порога
    setThreshold(threshold) {
        this.scrollThreshold = threshold;
        this.checkScrollState();
    }

    // Публичный метод для принудительного сброса состояния
    resetScrollState() {
        this.body.classList.remove("scroll");
        this.isScrolled = false;
        this.lastScrollY = 0;
    }

    // Уничтожение экземпляра
    destroy() {
        window.removeEventListener("scroll", () => this.handleScroll());
        window.removeEventListener("load", () => this.checkScrollState());
        this.body.classList.remove("scroll");
        this.isScrolled = false;
    }
}
