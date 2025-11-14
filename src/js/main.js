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
    const formManager = new FormManager(); // Передаем modalManager для координации
    new ModalManager(scrollManager, formManager);

    new MobileMenu(scrollManager);
    new SmoothScroll();
    new HeaderScroll();
    new Parallax();

    console.log("Application initialized successfully");
});
