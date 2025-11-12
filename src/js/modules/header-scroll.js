// modules/header-scroll.js

class HeaderScroll {
    constructor() {
        this.header = document.querySelector('header');
        this.scrollThreshold = 100; // Порог скролла в пикселях
        this.init();
    }

    init() {
        if (!this.header) {
            console.warn('Header element not found');
            return;
        }

        this.bindEvents();
        this.checkScroll(); // Проверяем начальную позицию
    }

    bindEvents() {
        window.addEventListener('scroll', () => this.checkScroll());
        window.addEventListener('resize', () => this.checkScroll());
    }

    checkScroll() {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollPosition > this.scrollThreshold) {
            this.addScrolledClass();
        } else {
            this.removeScrolledClass();
        }
    }

    addScrolledClass() {
        if (!this.header.classList.contains('scrolled')) {
            this.header.classList.add('scrolled');
        }
    }

    removeScrolledClass() {
        if (this.header.classList.contains('scrolled')) {
            this.header.classList.remove('scrolled');
        }
    }
}

export default HeaderScroll;