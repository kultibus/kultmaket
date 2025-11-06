import EventBus from './event-bus.js';

class ScrollLock {
  constructor() {
    this.scrollbarWidth = 0;
    this.isLocked = false;
    this.init();
  }

  getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  init() {
    this.scrollbarWidth = this.getScrollbarWidth();
    this.compensateScrollbar();
    this.observeBodyClasses();
    this.bindEvents();
  }

  bindEvents() {
    EventBus.on('menu:change', (isOpen) => {
      this.handleMenuChange(isOpen);
    });
    
    EventBus.on('modal:change', (isOpen) => {
      this.handleModalChange(isOpen);
    });
  }

  compensateScrollbar() {
    const scrollbarWidth = this.scrollbarWidth;
    
    // data-lp элементы получают постоянный компенсирующий padding
    const lpElements = document.querySelectorAll('[data-lp]');
    lpElements.forEach(element => {
      element.style.paddingRight = `${scrollbarWidth}px`;
    });

    // body получает отрицательный компенсирующий margin
    document.body.style.marginRight = `-${scrollbarWidth}px`;
  }

  observeBodyClasses() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          this.handleBodyClassChange();
        }
      });
    });

    observer.observe(document.body, { attributes: true });
  }

  handleBodyClassChange() {
    const hasMenuOpened = document.body.classList.contains('menu-opened');
    const hasModalOpened = document.body.classList.contains('modal-opened');
    
    this.toggleScrollLock(hasMenuOpened || hasModalOpened);
  }

  handleMenuChange(isOpen) {
    this.toggleScrollLock(isOpen);
  }

  handleModalChange(isOpen) {
    this.toggleScrollLock(isOpen);
  }

  toggleScrollLock(shouldLock) {
    if (shouldLock && !this.isLocked) {
      this.lockScroll();
    } else if (!shouldLock && this.isLocked) {
      this.unlockScroll();
    }
  }

  lockScroll() {
    const scrollbarWidth = this.scrollbarWidth;
    
    // data-lp-fixed элементы получают компенсирующий padding
    const lpFixedElements = document.querySelectorAll('[data-lp-fixed]');
    lpFixedElements.forEach(element => {
      element.style.paddingRight = `${scrollbarWidth}px`;
    });

    // body теряет отрицательный компенсирующий margin
    document.body.style.marginRight = '0';
    
    document.body.classList.add('scroll-locked');
    this.isLocked = true;
  }

  unlockScroll() {
    const scrollbarWidth = this.scrollbarWidth;
    
    // data-lp-fixed элементы теряют компенсирующий padding
    const lpFixedElements = document.querySelectorAll('[data-lp-fixed]');
    lpFixedElements.forEach(element => {
      element.style.paddingRight = '';
    });

    // body получает отрицательный компенсирующий margin
    document.body.style.marginRight = `-${scrollbarWidth}px`;
    
    document.body.classList.remove('scroll-locked');
    this.isLocked = false;
  }

  updateScrollbarWidth() {
    this.scrollbarWidth = this.getScrollbarWidth();
    this.compensateScrollbar();
    
    if (this.isLocked) {
      this.lockScroll();
    }
  }
}

export default ScrollLock;