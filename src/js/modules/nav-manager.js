import EventBus from './event-bus.js';

class NavManager {
  constructor() {
    this.isMenuOpen = false;
    this.breakpoint = 768;
    this.init();
  }

  init() {
    this.bindEvents();
    this.closeMenu(); // Изначально закрыто
  }

  bindEvents() {
    // Делегирование событий
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-menu-toggle]')) {
        this.toggleMenu();
        return;
      }
      
      if (e.target.closest('[data-menu-close]')) {
        this.closeMenu();
        return;
      }
      
      if (e.target.closest('.menu-link')) {
        this.handleMenuLinkClick(e);
      }
    });

    // Оптимизированный resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.handleResize(), 100);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    document.body.classList.add('menu-opened');
    document.body.classList.remove('menu-closed');
    this.isMenuOpen = true;
    EventBus.emit('menu:change', true);
  }

  closeMenu() {
    document.body.classList.add('menu-closed');
    document.body.classList.remove('menu-opened');
    this.isMenuOpen = false;
    EventBus.emit('menu:change', false);
  }

  handleMenuLinkClick(e) {
    const link = e.target.closest('.menu-link');
    const href = link.getAttribute('href');
    
    if (link && !link.hasAttribute('data-menu-close') && href && href.startsWith('#')) {
      e.preventDefault();
      this.smoothScroll(href);
      this.closeMenu();
    }
  }

  smoothScroll(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  handleResize() {
    if (window.innerWidth > this.breakpoint && this.isMenuOpen) {
      this.closeMenu();
    }
  }
}

export default NavManager;