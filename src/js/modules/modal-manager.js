import EventBus from "./event-bus.js";

class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.closeAllModals();
    }

    bindEvents() {
        document.addEventListener("click", e => {
            const targetTrigger = e.target.closest("[data-target]");
            const closeTrigger = e.target.closest("[data-modal-close]");
            const modalBackground =
                e.target.classList.contains("active") &&
                e.target.hasAttribute("data-modal");

            if (targetTrigger) {
                this.openModal(targetTrigger);
                return;
            }

            if (closeTrigger || modalBackground) {
                this.closeModal();
                return;
            }
        });

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && this.activeModal) {
                this.closeModal();
            }
        });
    }

    openModal(trigger) {
        const modalId = trigger.dataset.target;
        // const modal = document.getElementById(modalId);
        const modal = document.querySelector(selector);

        if (modal) {
            this.closeAllModals();

            modal.classList.add("active");
            this.activeModal = modal;

            document.body.classList.add("modal-opened");
            document.body.classList.remove("modal-closed");

            EventBus.emit("modal:change", true);

            // Если меню открыто, закрываем его
            if (document.body.classList.contains("menu-opened")) {
                document.body.classList.add("menu-closed");
                document.body.classList.remove("menu-opened");
                EventBus.emit("menu:change", false);
            }
        }
    }

    closeModal() {
        if (this.activeModal) {
            this.activeModal.classList.remove("active");
            this.activeModal = null;

            document.body.classList.remove("modal-opened");
            document.body.classList.add("modal-closed");

            EventBus.emit("modal:change", false);
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll("[data-modal].active");
        modals.forEach(modal => {
            modal.classList.remove("active");
        });

        this.activeModal = null;
        document.body.classList.remove("modal-opened");
        document.body.classList.add("modal-closed");

        EventBus.emit("modal:change", false);
    }
}

export default ModalManager;
