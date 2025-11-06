import { MobileMenu } from "./modules/mobile-menu.js";
import { ModalManager } from "./modules/modal-manager.js";

// Инициализация при полной загрузке DOM
document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();

    const modalManager = new ModalManager();

    // Здесь будут другие инициализации
});

/**
 * Инициализация мобильного меню
 */
function initMobileMenu() {
    try {
        const mobileMenu = new MobileMenu();

        // Можно слушать кастомные события для аналитики
        window.addEventListener("mobileMenu:open", () => {
            console.log("Мобильное меню открыто");
            // Здесь можно добавить отправку в аналитику
        });

        window.addEventListener("mobileMenu:close", () => {
            console.log("Мобильное меню закрыто");
            // Здесь можно добавить отправку в аналитику
        });

        // Делаем доступным глобально для отладки
        window.mobileMenu = mobileMenu;
    } catch (error) {
        console.error("Ошибка инициализации мобильного меню:", error);
    }
}

// Экспорт для использования в других модулях (если понадобится)
export { initMobileMenu };
