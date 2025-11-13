// main.js
import MobileMenu from "./modules/mobile-menu.js";
import ModalManager from "./modules/modal-manager.js";
import ScrollManager from "./modules/scroll-manager.js";
import SmoothScroll from "./modules/smooth-scroll.js";
import HeaderScroll from "./modules/header-scroll.js";
import Parallax from "./modules/parallax.js"; // Добавляем импорт
import ModalFeedback from "./modules/modal-feedback.js";

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
    // Инициализация менеджера скролла
    const scrollManager = new ScrollManager();

    // Инициализация мобильного меню с передачей менеджера скролла
    new MobileMenu(scrollManager);

    // Инициализация модальных окон с передачей менеджера скролла
    new ModalManager(scrollManager);

    // Инициализация плавной прокрутки
    new SmoothScroll();

    // Инициализация скролла хедера
    new HeaderScroll();

    // Инициализация parallax эффекта
    new Parallax();

    // Инициализация формы обратной связи
    new ModalFeedback();

    console.log("Application initialized successfully");
});
