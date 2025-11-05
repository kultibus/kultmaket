export class WebPSupport extends BaseModule {
  constructor() {
    super();
    this.SUPPORT_CLASSES = {
      supported: 'webp',
      unsupported: 'no-webp'
    };
    this.STORAGE_KEY = 'webpSupport';
    this.TEST_IMAGE = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }

  async init() {
    if (this.isInitialized) return;
    
    const supported = await this.getWebPSupport();
    this.applySupportClass(supported);
    this.isInitialized = true;
  }

  async getWebPSupport() {
    // Проверяем кэш
    const cached = this.getCachedSupport();
    if (cached !== null) return cached;

    // Выполняем тест
    return await this.testWebP();
  }

  getCachedSupport() {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      return cached !== null ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  testWebP() {
    return new Promise(resolve => {
      const img = new Image();
      
      const cleanup = () => {
        img.onload = img.onerror = null;
      };

      img.onload = () => {
        cleanup();
        resolve(img.width > 0 && img.height > 0);
      };
      
      img.onerror = () => {
        cleanup();
        resolve(false);
      };
      
      img.src = this.TEST_IMAGE;
    });
  }

  applySupportClass(supported) {
    const { supported: supportedClass, unsupported: unsupportedClass } = this.SUPPORT_CLASSES;
    
    document.body.classList.remove(supportedClass, unsupportedClass);
    document.body.classList.add(supported ? supportedClass : unsupportedClass);

    this.cacheSupport(supported);
  }

  cacheSupport(supported) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(supported));
    } catch {
      // Ignore storage errors
    }
  }
}