// main.js
import MobileMenu from "./modules/mobile-menu.js";
import ModalManager from "./modules/modal-manager.js";
import ScrollManager from "./modules/scroll-manager.js";
import SmoothScroll from "./modules/smooth-scroll.js";
import HeaderScroll from "./modules/header-scroll.js";
import Parallax from "./modules/parallax.js";
import FormManager from "./modules/form-manager.js"; // Новый импорт

document.addEventListener("DOMContentLoaded", () => {
    const scrollManager = new ScrollManager();
    const modalManager = new ModalManager(scrollManager);
    
    new MobileMenu(scrollManager);
    new SmoothScroll();
    new HeaderScroll();
    new Parallax();
    new FormManager(modalManager); // Передаем modalManager для координации

    console.log("Application initialized successfully");
});