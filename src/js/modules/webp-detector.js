class WebPDetector {
  constructor() {
    this.init();
  }

  async init() {
    const supportsWebP = await this.checkWebPSupport();
    if (supportsWebP) {
      document.body.classList.add('webp');
      document.body.classList.remove('nowebp');
    } else {
      document.body.classList.add('nowebp');
      document.body.classList.remove('webp');
    }
  }

  checkWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
}

export default WebPDetector;