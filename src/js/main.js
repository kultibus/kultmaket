// main.js

import MobileMenu from "./modules/mobile-menu.js";
import Modal from "./modules/modal.js";
import ScrollManager from "./modules/scroll-manager.js";
import SmoothScroll from "./modules/smooth-scroll.js";

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
    // Инициализация менеджера скролла
    const scrollManager = new ScrollManager();

    // Инициализация мобильного меню с передачей менеджера скролла
    new MobileMenu(scrollManager);

    // Инициализация модальных окон с передачей менеджера скролла
    new Modal(scrollManager);

    // Инициализация плавной прокрутки
    new SmoothScroll();

    console.log("Application initialized successfully");
});
