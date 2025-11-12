// modules/smooth-scroll.js

class SmoothScroll {
    constructor() {
        this.duration = 800;
        this.offset = 0; // Дополнительное смещение (например, для фиксированного хедера)
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

        // Пересчитываем offset при ресайзе (на случай изменения высоты хедера)
        window.addEventListener('resize', () => {
            this.calculateOffset();
        });
    }

    calculateOffset() {
        // Автоматически вычисляем высоту фиксированного хедера
        const header = document.querySelector('header');
        if (header && window.getComputedStyle(header).position === 'fixed') {
            this.offset = header.offsetHeight;
        }
    }

    scrollToTarget(target) {
        const targetElement = document.querySelector(target);
        
        if (targetElement) {
            const targetPosition = targetElement.getBoundingClientRect().top + 
                                 window.pageYOffset - this.offset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;

            const animation = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = this.easeInOutQuad(timeElapsed, startPosition, distance, this.duration);
                window.scrollTo(0, run);
                
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