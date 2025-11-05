export class Parallax extends BaseModule {
  constructor(options = {}) {
    super();
    this.options = {
      speed: 0.4,
      mobileBreakpoint: 768,
      throttleDelay: 16,
      ...options
    };

    this.elements = [];
    this.isEnabled = !this.isMobile();
  }

  init() {
    if (this.isInitialized || !this.isEnabled) return;

    this.elements = this.initializeElements();
    if (this.elements.length === 0) return;

    this.setupEventListeners();
    this.updateParallax(); // Initial position
    
    this.isInitialized = true;
  }

  initializeElements() {
    const elements = this.safeQuerySelectorAll('[data-parallax]');
    
    return elements.map(element => {
      const speed = parseFloat(element.dataset.speed) || this.options.speed;
      const direction = element.dataset.direction || 'vertical'; // vertical, horizontal, both
      
      return {
        element,
        speed,
        direction,
        originalPosition: this.getOriginalPosition(element)
      };
    });
  }

  getOriginalPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  }

  setupEventListeners() {
    // Оптимизированный обработчик скролла
    const throttledUpdate = this.throttle(
      () => this.updateParallax(),
      this.options.throttleDelay
    );

    window.addEventListener('scroll', throttledUpdate, { passive: true });
    
    // Переинициализация при ресайзе
    window.addEventListener('resize', 
      this.debounce(() => this.handleResize(), 250)
    );
  }

  handleResize() {
    // Проверяем, нужно ли переключить режим (мобильный/десктоп)
    const shouldBeEnabled = !this.isMobile();
    
    if (shouldBeEnabled !== this.isEnabled) {
      this.isEnabled = shouldBeEnabled;
      
      if (this.isEnabled) {
        this.enableParallax();
      } else {
        this.disableParallax();
      }
    } else if (this.isEnabled) {
      // Обновляем позиции элементов при ресайзе
      this.elements.forEach(item => {
        item.originalPosition = this.getOriginalPosition(item.element);
      });
      this.updateParallax();
    }
  }

  enableParallax() {
    this.elements.forEach(item => {
      item.element.style.willChange = 'transform';
      item.element.style.transform = 'translate3d(0, 0, 0)';
    });
    this.updateParallax();
  }

  disableParallax() {
    this.elements.forEach(item => {
      item.element.style.willChange = '';
      item.element.style.transform = '';
    });
  }

  updateParallax() {
    if (!this.isEnabled) return;

    const scrolled = window.pageYOffset;
    const viewportHeight = window.innerHeight;

    this.elements.forEach(item => {
      const { element, speed, direction, originalPosition } = item;
      
      // Проверяем, находится ли элемент в viewport
      const elementTop = originalPosition.top;
      const elementBottom = elementTop + element.offsetHeight;
      const viewportTop = scrolled;
      const viewportBottom = scrolled + viewportHeight;

      // Параллакс только для видимых элементов
      if (elementBottom < viewportTop || elementTop > viewportBottom) {
        return;
      }

      let xPos = 0;
      let yPos = 0;

      switch (direction) {
        case 'horizontal':
          xPos = scrolled * speed;
          break;
        case 'both':
          xPos = scrolled * speed * 0.5;
          yPos = scrolled * speed;
          break;
        case 'vertical':
        default:
          yPos = scrolled * speed;
          break;
      }

      // Применяем трансформацию
      element.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    });
  }

  isMobile() {
    return window.innerWidth < this.options.mobileBreakpoint;
  }

  // Метод для ручного обновления позиций
  refresh() {
    this.elements.forEach(item => {
      item.originalPosition = this.getOriginalPosition(item.element);
    });
    this.updateParallax();
  }

  // Добавление нового элемента параллакса
  addElement(element, options = {}) {
    if (!element || !this.isEnabled) return;

    const speed = options.speed || parseFloat(element.dataset.speed) || this.options.speed;
    const direction = options.direction || element.dataset.direction || 'vertical';

    const newElement = {
      element,
      speed,
      direction,
      originalPosition: this.getOriginalPosition(element)
    };

    this.elements.push(newElement);
    this.updateParallax(); // Обновляем позицию сразу
  }

  // Удаление элемента
  removeElement(element) {
    const index = this.elements.findIndex(item => item.element === element);
    if (index !== -1) {
      // Сбрасываем трансформацию
      element.style.transform = '';
      element.style.willChange = '';
      this.elements.splice(index, 1);
    }
  }

  destroy() {
    this.disableParallax();
    this.elements = [];
    super.destroy();
  }
}