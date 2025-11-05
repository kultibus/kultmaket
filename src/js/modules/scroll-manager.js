export class ScrollManager extends BaseModule {
  constructor(options = {}) {
    super();
    this.options = {
      threshold: 100,
      throttleDelay: 16,
      ...options
    };

    this.state = {
      lastScrollY: 0,
      isScrolled: false,
      ticking: false
    };
  }

  init() {
    if (this.isInitialized) return;

    this.resetScrollState();
    this.setupScrollListener();
    this.setupLoadListener();
    
    this.isInitialized = true;
  }

  setupScrollListener() {
    const throttledHandler = this.throttle(
      () => this.handleScroll(), 
      this.options.throttleDelay
    );
    
    window.addEventListener('scroll', throttledHandler, { passive: true });
  }

  setupLoadListener() {
    window.addEventListener('load', () => this.checkScrollState());
  }

  handleScroll() {
    if (!this.state.ticking) {
      requestAnimationFrame(() => this.updateScrollState());
      this.state.ticking = true;
    }
  }

  updateScrollState() {
    const currentScrollY = window.pageYOffset;
    const scrollDirection = currentScrollY > this.state.lastScrollY ? 'down' : 'up';
    const shouldBeScrolled = this.shouldAddScrollClass(currentScrollY, scrollDirection);

    if (shouldBeScrolled !== this.state.isScrolled) {
      this.toggleScrollClass(shouldBeScrolled);
      this.state.isScrolled = shouldBeScrolled;
    }

    this.state.lastScrollY = currentScrollY;
    this.state.ticking = false;
  }

  shouldAddScrollClass(currentScrollY, scrollDirection) {
    return scrollDirection === 'down' && currentScrollY > this.options.threshold;
  }

  toggleScrollClass(shouldAdd) {
    document.body.classList.toggle('scroll', shouldAdd);
  }

  checkScrollState() {
    const currentScrollY = window.pageYOffset;
    const shouldBeScrolled = currentScrollY > this.options.threshold;

    if (shouldBeScrolled !== this.state.isScrolled) {
      this.toggleScrollClass(shouldBeScrolled);
      this.state.isScrolled = shouldBeScrolled;
    }

    this.state.lastScrollY = currentScrollY;
  }

  setThreshold(threshold) {
    this.options.threshold = threshold;
    this.checkScrollState();
  }

  resetScrollState() {
    document.body.classList.remove('scroll');
    this.state = {
      lastScrollY: 0,
      isScrolled: false,
      ticking: false
    };
  }

  destroy() {
    this.resetScrollState();
    super.destroy();
  }
}