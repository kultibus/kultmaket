// modules/scroll-manager.js

class ScrollManager {
    constructor() {
        this.body = document.body;
        this.scrollbarWidth = 0;
        this.lpElements = document.querySelectorAll('[data-lp]');
        this.lpFixedElements = document.querySelectorAll('[data-lp-fixed]');
        this.isLocked = false;
        
        this.init();
    }

    init() {
        this.calculateScrollbarWidth();
        this.applyInitialCompensation();
    }

    calculateScrollbarWidth() {
        // Создаем временный элемент для вычисления ширины скроллбара
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        outer.appendChild(inner);

        this.scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

        outer.parentNode.removeChild(outer);
    }

    applyInitialCompensation() {
        // Добавляем компенсирующий padding для элементов с data-lp
        this.lpElements.forEach(element => {
            element.style.paddingRight = this.scrollbarWidth + 'px';
        });

        // Добавляем отрицательный margin для body
        this.body.style.marginRight = '-' + this.scrollbarWidth + 'px';
    }

    lockScroll() {
        if (this.isLocked) return;

        this.body.classList.add('scroll-locked');
        
        // Убираем отрицательный margin
        this.body.style.marginRight = '0';
        
        // Добавляем компенсирующий padding для fixed элементов
        this.lpFixedElements.forEach(element => {
            element.style.paddingRight = this.scrollbarWidth + 'px';
        });

        this.isLocked = true;
    }

    unlockScroll() {
        if (!this.isLocked) return;

        this.body.classList.remove('scroll-locked');
        
        // Восстанавливаем отрицательный margin
        this.body.style.marginRight = '-' + this.scrollbarWidth + 'px';
        
        // Убираем компенсирующий padding с fixed элементов
        this.lpFixedElements.forEach(element => {
            element.style.paddingRight = '';
        });

        this.isLocked = false;
    }

    getScrollbarWidth() {
        return this.scrollbarWidth;
    }
}

export default ScrollManager;