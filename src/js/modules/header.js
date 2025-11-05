export class Header {
    constructor() {
        this.burger = document.querySelector(".burger");
        this.nav = document.querySelector(".nav");
        this.body = document.body;
        this.isOpen = false;
        this.scrollbarWidth = 0;
        this.fixedElements = [];
        this.lpElements = [];
    }

    init() {
        this.calculateScrollbarWidth();
        this.addEventListeners();

        // Пересчитываем при ресайзе
        window.addEventListener("resize", () => this.calculateScrollbarWidth());

        // this.body.style.paddingRight = `-${this.scrollbarWidth}px`;
        // this.body.style.paddingRight = `${this.scrollbarWidth}px`;

        this.fixedElements = document.querySelectorAll("[data-lp-fixed]");
        this.lpElements = document.querySelectorAll("[data-lp]");
        this.body.style.marginRight = `-${this.scrollbarWidth}px`;

        if (this.lpElements.length) {
            this.lpElements.forEach(element => {
                element.style.paddingRight = `${this.scrollbarWidth}px`;
            });
        }
    }

    // Вычисляем точную ширину скроллбара
    calculateScrollbarWidth() {
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;
        // document.documentElement.style.setProperty(
        //     "--scrollbar-width",
        //     `${scrollbarWidth}px`
        // );
        this.scrollbarWidth = scrollbarWidth;
    }

    addEventListeners() {
        // Бургер меню
        if (this.burger) {
            this.burger.addEventListener("click", () => this.toggleMenu());
        }

        // Закрытие меню при клике на ссылку
        document.querySelectorAll(".nav__link").forEach(link => {
            link.addEventListener("click", () => this.closeMenu());
        });

        // Закрытие при клике вне меню
        document.addEventListener("click", e => {
            if (
                this.isOpen &&
                !this.nav.contains(e.target) &&
                !this.burger.contains(e.target)
            ) {
                this.closeMenu();
            }
        });

        // Закрытие по ESC
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && this.isOpen) {
                this.closeMenu();
            }
        });

        // Скролл

        // Плавная прокрутка для якорных ссылок
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener("click", e => {
                const href = link.getAttribute("href");
                if (href !== "#") {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth" });
                        this.closeMenu();
                    }
                }
            });
        });
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
        console.log(this.containers);
    }

    openMenu() {
        this.isOpen = true;

        this.body.classList.add("locked");
        // this.body.style.paddingRight = `${this.scrollbarWidth}px`;
        this.body.style.marginRight = "0px";

        if (this.fixedElements.length) {
            this.fixedElements.forEach(element => {
                element.style.paddingRight = `${this.scrollbarWidth}px`;
            });
        }

        // if (this.lpElements.length) {
        //     this.lpElements.forEach(element => {
        //         element.style.paddingRight = `${this.scrollbarWidth * 2}px`;
        //     });
        // }

        // Открываем меню
        this.burger.classList.add("active");
        this.nav.classList.add("active");

        // Обновляем ARIA атрибуты
        // this.burger.setAttribute("aria-expanded", "true");
        // this.nav.setAttribute("aria-hidden", "false");
    }

    closeMenu() {
        this.isOpen = false;

        // Закрываем меню
        this.burger.classList.remove("active");
        this.nav.classList.remove("active");

        // Разблокируем скролл
        this.body.classList.remove("locked");
        this.body.style.marginRight = `-${this.scrollbarWidth}px`;

        if (this.fixedElements.length) {
            this.fixedElements.forEach(element => {
                element.style.paddingRight = "0px";
            });
        }

        // if (this.lpElements.length) {
        //     this.lpElements.forEach(element => {
        //         element.style.paddingRight = `${this.scrollbarWidth}px`;
        //     });
        // }

        // Обновляем ARIA атрибуты
        // this.burger.setAttribute("aria-expanded", "false");
        // this.nav.setAttribute("aria-hidden", "true");
    }
}
