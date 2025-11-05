export class LazyLoading {
  constructor() {
    this.images = [];
    this.observer = null;
  }

  init() {
    this.images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      this.initIntersectionObserver();
    } else {
      this.loadAllImages();
    }
  }

  initIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '50px 0px' });

    this.images.forEach(img => this.observer.observe(img));
  }

  loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
    img.classList.add('loaded');
  }

  loadAllImages() {
    this.images.forEach(img => this.loadImage(img));
  }
}