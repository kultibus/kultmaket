// modules/smooth-scroll.js

class SmoothScroll {
    constructor() {
        this.duration = 800;
        this.offset = 0;
        this.header = document.querySelector('header');
        this.init();
    }

    init() {
        this.bindEvents();
        this.calculateOffset();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            
            if (link && link.getAttribute('href') !== '#') {
                e.preventDefault();
                this.scrollToTarget(link.getAttribute('href'));
            }
        });

        window.addEventListener('resize', () => {
            this.calculateOffset();
        });
    }

    calculateOffset() {
        if (this.header) {
            // Всегда используем текущую высоту хедера
            this.offset = this.header.offsetHeight;
        }
    }

    scrollToTarget(target) {
        const targetElement = document.querySelector(target);
        
        if (targetElement) {
            const startPosition = window.pageYOffset;
            let startTime = null;
            let lastScrollPosition = startPosition;

            const animation = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                
                // ПЕРЕСЧИТЫВАЕМ OFFSET НА КАЖДОМ КАДРЕ АНИМАЦИИ
                this.calculateOffset();
                
                // Вычисляем целевую позицию с учетом текущего offset
                const currentTargetPosition = targetElement.getBoundingClientRect().top + 
                                           window.pageYOffset - this.offset;
                
                const distance = currentTargetPosition - startPosition;
                const run = this.easeInOutQuad(timeElapsed, startPosition, distance, this.duration);
                
                window.scrollTo(0, run);
                
                // Сохраняем текущую позицию для отслеживания направления
                const currentScrollPosition = window.pageYOffset;
                
                if (timeElapsed < this.duration) {
                    requestAnimationFrame(animation);
                }
            }

            requestAnimationFrame(animation);
        }
    }

    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
}

export default SmoothScroll;