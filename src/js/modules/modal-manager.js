export class ModalManager {
    constructor() {
        this.init();
    }

    init() {
        // Инициализация при загрузке страницы
        document.addEventListener("DOMContentLoaded", () => {
            document.body.classList.add("modal-closed");
            this.bindEvents();
        });
    }

    bindEvents() {
        // Обработчик для открытия модального окна
        document.addEventListener("click", e => {
            const openButton = e.target.closest("[data-modal-form-open]");
            if (openButton) {
                this.openModal();
                return;
            }

            // Обработчик для закрытия модального окна
            const closeButton = e.target.closest("[data-modal-form-close]");
            if (closeButton) {
                this.closeModal();
            }
        });

        // Закрытие по ESC
        document.addEventListener("keydown", e => {
            if (
                e.key === "Escape" &&
                document.body.classList.contains("modal-opened")
            ) {
                this.closeModal();
            }
        });

        // Закрытие по клику на оверлей (опционально)
        document.addEventListener("click", e => {
            if (
                e.target.hasAttribute("data-modal-form-overlay") &&
                document.body.classList.contains("modal-opened")
            ) {
                this.closeModal();
            }
        });
    }

    openModal() {
        document.body.classList.remove("modal-closed");
        document.body.classList.add("modal-opened");

        // Добавляем класс locked только если нет открытого меню
        if (!document.body.classList.contains("menu-opened")) {
            document.body.classList.add("locked");
        }
    }

    closeModal() {
        document.body.classList.remove("modal-opened");
        document.body.classList.add("modal-closed");

        // Убираем класс locked только если нет открытого меню
        if (!document.body.classList.contains("menu-opened")) {
            document.body.classList.remove("locked");
        }
    }

    // Дополнительные методы для управления состоянием
    isModalOpen() {
        return document.body.classList.contains("modal-opened");
    }

    toggleModal() {
        if (this.isModalOpen()) {
            this.closeModal();
        } else {
            this.openModal();
        }
    }
}

// Инициализация
const modalManager = new ModalManager();

// Экспорт для использования в других модулях (если нужно)
export default modalManager;
