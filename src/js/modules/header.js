export class Header extends BaseModule {
  constructor() {
    super();
    this.selectors = {
      burger: '.burger',
      nav: '.nav',
      navLink: '.nav__link',
      anchorLink: 'a[href^="#"]',
      fixedElement: '[data-lp-fixed]',
      lpElement: '[data-lp]'
    };
    
    this.state = {
      isOpen: false,
      scrollbarWidth: 0
    };
  }

  init() {
    if (this.isInitialized) return;

    this.elements = this.initializeElements();
    if (!this.elements.burger || !this.elements.nav) return;

    this.calculateScrollbarWidth();
    this.setupEventListeners();
    this.setupResizeObserver();
    
    this.isInitialized = true;
  }

  initializeElements() {
    const elements = {};
    
    Object.keys(this.selectors).forEach(key => {
      const selector = this.selectors[key];
      if (key === 'navLink' || key === 'anchorLink' || key === 'fixedElement' || key === 'lpElement') {
        elements[key] = this.safeQuerySelectorAll(selector);
      } else {
        elements[key] = this.safeQuerySelector(selector);
      }
    });

    return elements;
  }

  setupEventListeners() {
    const { burger, navLink, anchorLink } = this.elements;

    // Бургер меню
    burger.addEventListener('click', () => this.toggleMenu());

    // Закрытие меню при клике на ссылку
    navLink.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Плавная прокрутка
    anchorLink.forEach(link => {
      link.addEventListener('click', (e) => this.handleAnchorClick(e, link));
    });

    // Закрытие при клике вне меню
    document.addEventListener('click', (e) => this.handleOutsideClick(e));

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => this.handleEscapeKey(e));
  }

  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(
        this.debounce(() => this.calculateScrollbarWidth(), 250)
      );
      this.resizeObserver.observe(document.body);
    } else {
      window.addEventListener('resize', 
        this.debounce(() => this.calculateScrollbarWidth(), 250)
      );
    }
  }

  calculateScrollbarWidth() {
    this.state.scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    this.applyScrollbarCompensation();
  }

  applyScrollbarCompensation() {
    const { fixedElement, lpElement } = this.elements;
    const { scrollbarWidth } = this.state;

    document.body.style.marginRight = `-${scrollbarWidth}px`;

    lpElement.forEach(element => {
      element.style.paddingRight = `${scrollbarWidth}px`;
    });
  }

  handleAnchorClick(e, link) {
    const href = link.getAttribute('href');
    if (href === '#') return;

    e.preventDefault();
    const target = this.safeQuerySelector(href);
    
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      this.closeMenu();
    }
  }

  handleOutsideClick(e) {
    const { nav, burger } = this.elements;
    const { isOpen } = this.state;

    if (isOpen && !nav.contains(e.target) && !burger.contains(e.target)) {
      this.closeMenu();
    }
  }

  handleEscapeKey(e) {
    if (e.key === 'Escape' && this.state.isOpen) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    this.state.isOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    const { burger, nav, fixedElement } = this.elements;
    const { scrollbarWidth } = this.state;

    this.state.isOpen = true;
    document.body.classList.add('locked');
    document.body.style.marginRight = '0px';

    fixedElement.forEach(element => {
      element.style.paddingRight = `${scrollbarWidth}px`;
    });

    burger.classList.add('active');
    nav.classList.add('active');
    
    // ARIA атрибуты
    burger.setAttribute('aria-expanded', 'true');
    nav.setAttribute('aria-hidden', 'false');
  }

  closeMenu() {
    const { burger, nav, fixedElement } = this.elements;
    const { scrollbarWidth } = this.state;

    this.state.isOpen = false;
    burger.classList.remove('active');
    nav.classList.remove('active');
    
    document.body.classList.remove('locked');
    document.body.style.marginRight = `-${scrollbarWidth}px`;

    fixedElement.forEach(element => {
      element.style.paddingRight = '0px';
    });

    // ARIA атрибуты
    burger.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    super.destroy();
  }
}