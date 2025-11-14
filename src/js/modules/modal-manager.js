// modules/modal.js

class ModalManager {
    constructor(scrollManager) {
        this.scrollManager = scrollManager;
        this.targetId = "";
        this.isModalOpened = false;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Open modal on target button click
        document.addEventListener("click", e => {
            const targetButton = e.target.closest("[data-target]");
            if (targetButton) {
                this.openModal(targetButton);
            }
        });

        // Close modal on close button click
        document.addEventListener("click", e => {
            const closeButton = e.target.closest("[data-target-close]");
            if (closeButton) {
                this.closeModal(closeButton);
            }
        });

        // Close modal on outside click
        document.addEventListener("click", e => {
            this.handleOutsideClick(e);
        });

        // Close modal on ESC
        document.addEventListener("keydown", e => this.handleEscape(e));
    }

    openModal(button) {
        this.targetId = button.getAttribute("data-target");
        const modal = document.querySelector(this.targetId);

        if (modal) {
            // Open target modal
            modal.classList.add("active");
            this.isModalOpened = true;

            // Блокируем скролл
            if (this.scrollManager) {
                this.scrollManager.lockScroll();
            }
        }
    }

    closeModal() {
        const modal = document.querySelector(this.targetId);

        if (modal) {
            modal.classList.remove("active");
            this.targetId = "";
            this.isModalOpened = false;

            // Разблокируем скролл
            if (this.scrollManager) {
                this.scrollManager.unlockScroll();
            }
        }
    }

    handleOutsideClick(e) {
        if (
            this.isModalOpened &&
            !e.target.closest("[data-modal-container]") &&
            !e.target.closest("[data-modal-close]") &&
            !e.target.closest("[data-target]")
        ) {
            this.closeModal();
        }
    }

    handleEscape(e) {
        if (e.key === "Escape" && this.isModalOpened) {
            this.closeModal();
        }
    }
}

export default ModalManager;
