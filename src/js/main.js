import EventBus from "./modules/event-bus.js";
import ScrollLock from "./modules/scroll-lock.js";
import NavManager from "./modules/nav-manager.js";
import ModalManager from "./modules/modal-manager.js";
import WebPDetector from "./modules/webp-detector.js";
import PerformanceOptimizer from "./modules/performance.js";

class App {
    constructor() {
        this.modules = new Map();
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            try {
                this.initializeModules();
                this.bindGlobalEvents();
            } catch (error) {
                console.error("Failed to initialize app:", error);
            }
        });
    }

    initializeModules() {
        // Инициализация модулей
        this.modules.set("scrollLock", new ScrollLock());
        this.modules.set("navManager", new NavManager());
        this.modules.set("modalManager", new ModalManager());
        this.modules.set("webpDetector", new WebPDetector());
        this.modules.set("performance", new PerformanceOptimizer());

        console.log("All modules initialized successfully");
    }

    bindGlobalEvents() {
        // Глобальные обработчики событий
        EventBus.on("module:error", error => {
            console.error("Module error:", error);
        });

        // Обновление ширины скроллбара при ресайзе
        EventBus.on("window:resize", () => {
            const scrollLock = this.modules.get("scrollLock");
            if (scrollLock) {
                scrollLock.updateScrollbarWidth();
            }
        });
    }

    getModule(name) {
        return this.modules.get(name);
    }
}

// Инициализация приложения
new App();
