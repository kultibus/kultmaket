import { Header } from "./modules/header.js";
import { Parallax } from "./modules/parallax.js";
import { FormHandler } from "./modules/form-handler.js";
import { LazyLoading } from "./modules/lazy-loading.js";
import { Analytics } from "./modules/analytics.js";
import { ScrollManager } from "./modules/scroll-manager.js";
import { WebPSupport } from "./modules/webp-support.js";

// Main Application
class App {
    constructor() {
        this.modules = [];
        this.init();
    }

    init() {
        // Инициализация всех модулей
        this.modules = [
            new WebPSupport(),
            // new Header(),
            // new ScrollManager(),
            // new Parallax(),
            // new FormHandler(),
            // new LazyLoading(),
            // new Analytics(),
        ];

        this.modules.forEach(module => {
            if (typeof module.init === "function") {
                module.init();
            }
        });
    }
}

// Запуск при полной загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
    new App();
});
