// main.js

import MobileMenu from './modules/mobile-menu.js';
import Modal from './modules/modal.js';
import ScrollManager from './modules/scroll-manager.js';

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  // Инициализация менеджера скролла
  const scrollManager = new ScrollManager();
  
  // Инициализация мобильного меню с передачей менеджера скролла
  new MobileMenu(scrollManager);
  
  // Инициализация модальных окон с передачей менеджера скролла
  new Modal(scrollManager);
  
  console.log('Application initialized successfully');
});