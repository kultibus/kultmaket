// modules/modal.js

class Modal {
    constructor(scrollManager) {
        this.modals = [];
        this.scrollManager = scrollManager;
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
            const closeButton = e.target.closest("[data-modal-close]");
            if (closeButton) {
                this.closeAllModals();
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
        const targetId = button.getAttribute("data-target");
        const modal = document.querySelector(targetId);

        if (modal) {
            // Close all other modals first
            this.closeAllModals();

            // Open target modal
            modal.classList.add("active");
            this.modals.push(modal);

            // Блокируем скролл
            if (this.scrollManager) {
                this.scrollManager.lockScroll();
            }
        }
    }

    closeAllModals() {
        const allModals = document.querySelectorAll('[id*="modal-"]');

        allModals.forEach(modal => {
            modal.classList.remove("active");
        });

        this.modals = [];

        // Разблокируем скролл
        if (this.scrollManager) {
            this.scrollManager.unlockScroll();
        }
    }

    handleOutsideClick(e) {
        // Check if click is outside any modal container
        const modalContainers = document.querySelectorAll(
            "[data-modal-container]"
        );
        let clickedOutside = true;

        modalContainers.forEach(container => {
            if (container.contains(e.target)) {
                clickedOutside = false;
            }
        });

        // Check if click is on close button (already handled)
        if (e.target.closest("[data-modal-close]")) {
            clickedOutside = false;
        }

        // Check if click is on open button (already handled)
        if (e.target.closest("[data-target]")) {
            clickedOutside = false;
        }

        if (clickedOutside && this.modals.length > 0) {
            this.closeAllModals();
        }
    }

    handleEscape(e) {
        if (e.key === "Escape" && this.modals.length > 0) {
            this.closeAllModals();
        }
    }
}

export default Modal;