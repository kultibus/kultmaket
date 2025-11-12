// modules/parallax.js
class Parallax {
    constructor() {
        this.parallaxElements = document.querySelectorAll("[data-parallax]");
        this.breakpointLaptop = 1024;
        this.isEnabled = false;
        this.init();
    }

    init() {
        if (this.parallaxElements.length === 0) return;

        this.bindEvents();
        this.checkViewport();
    }

    bindEvents() {
        window.addEventListener("scroll", () => this.handleScroll());
        window.addEventListener("resize", () => {
            this.checkViewport();
            this.handleScroll(); // Обновляем позиции после ресайза
        });
    }

    checkViewport() {
        const width = window.innerWidth;

        if (width >= this.breakpointLaptop && !this.isEnabled) {
            this.enableParallax();
        } else if (width < this.breakpointLaptop && this.isEnabled) {
            this.disableParallax();
        }
    }

    enableParallax() {
        this.isEnabled = true;

        // Инициализируем начальные позиции
        this.parallaxElements.forEach(element => {
            element.style.transform = "translateY(0)";
            element.style.willChange = "transform";
        });

        this.handleScroll();
    }

    disableParallax() {
        this.isEnabled = false;

        // Сбрасываем трансформации
        this.parallaxElements.forEach(element => {
            element.style.transform = "";
            element.style.willChange = "";
        });
    }

    handleScroll() {
        if (!this.isEnabled) return;

        const scrollY = window.pageYOffset;

        this.parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute("data-speed")) || 0.5;
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            const elementHeight = rect.height;

            // Вычисляем смещение только когда элемент в зоне видимости
            if (
                scrollY + window.innerHeight > elementTop &&
                scrollY < elementTop + elementHeight
            ) {
                const scrolled = scrollY - elementTop;
                const translateY = scrolled * speed;

                element.style.transform = `translateY(${translateY}px)`;
            }
        });
    }
}

export default Parallax;
