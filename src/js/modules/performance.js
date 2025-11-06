class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.lazyLoadImages();
    this.observeIntersections();
    this.bindEvents();
  }

  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback для браузеров без IntersectionObserver
      images.forEach(img => this.loadImage(img));
    }
  }

  loadImage(img) {
    img.src = img.dataset.src;
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
    }
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
    
    img.onload = () => {
      img.classList.add('loaded');
    };
  }

  observeIntersections() {
    if ('IntersectionObserver' in window) {
      const elements = document.querySelectorAll('[data-observe]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      }, {
        threshold: 0.1
      });

      elements.forEach(el => observer.observe(el));
    }
  }

  bindEvents() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        EventBus.emit('window:resize');
      }, 100);
    });

    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.handleScroll();
      }, 10);
    });
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const direction = scrollY > (this.lastScrollY || 0) ? 'down' : 'up';
    
    document.body.classList.remove('scroll-up', 'scroll-down');
    document.body.classList.add(`scroll-${direction}`);
    
    this.lastScrollY = scrollY;
  }
}

export default PerformanceOptimizer;