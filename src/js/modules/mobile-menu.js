export class MobileMenu {
  constructor() {
    this.selectors = {
      burger: '.burger',
      menu: '.menu',
      overlay: '.menu-overlay',
      body: 'body'
    };
    
    this.classes = {
      active: 'active',
      locked: 'locked'
    };
    
    this.burger = document.querySelector(this.selectors.burger);
    this.menu = document.querySelector(this.selectors.menu);
    this.overlay = this.createOverlay();
    this.body = document.body;
    
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    if (!this.burger || !this.menu) {
      console.warn('MobileMenu: Не найдены необходимые элементы DOM');
      return;
    }
    
    this.bindEvents();
  }
  
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
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
    this.burger.addEventListener('click', () => this.toggle());
    
    // Клик по оверлею
    this.overlay.addEventListener('click', () => this.close());
    
    // Клик по ссылкам меню (закрытие меню при переходе)
    this.menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.close());
    });
    
    // Клавиша Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Ресайз окна (закрываем меню при переходе в десктопный режим)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isOpen) {
        this.close();
      }
    });
  }
  
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  
  open() {
    this.burger.classList.add(this.classes.active);
    this.menu.classList.add(this.classes.active);
    this.body.classList.add(this.classes.locked);
    
    // Показываем оверлей с анимацией
    this.overlay.style.visibility = 'visible';
    setTimeout(() => {
      this.overlay.style.opacity = '1';
    }, 10);
    
    this.isOpen = true;
    
    // Улучшение доступности
    this.burger.setAttribute('aria-expanded', 'true');
    this.menu.setAttribute('aria-hidden', 'false');
    
    // Событие для аналитики
    this.dispatchEvent('mobileMenu:open');
  }
  
  close() {
    this.burger.classList.remove(this.classes.active);
    this.menu.classList.remove(this.classes.active);
    this.body.classList.remove(this.classes.locked);
    
    // Скрываем оверлей с анимацией
    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay.style.visibility = 'hidden';
    }, 300);
    
    this.isOpen = false;
    
    // Улучшение доступности
    this.burger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');
    
    // Событие для аналитики
    this.dispatchEvent('mobileMenu:close');
  }
  
  dispatchEvent(eventName) {
    const event = new CustomEvent(eventName, {
      detail: { isOpen: this.isOpen }
    });
    window.dispatchEvent(event);
  }
  
  // Публичный метод для внешнего контроля
  destroy() {
    this.burger.removeEventListener('click', this.toggle);
    this.overlay.removeEventListener('click', this.close);
    document.removeEventListener('keydown', this.handleEscape);
    window.removeEventListener('resize', this.handleResize);
    
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}