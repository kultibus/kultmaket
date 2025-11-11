// modules/mobile-menu.js

class MobileMenu {
    constructor(scrollManager) {
        this.body = document.body;
        this.menuToggle = document.querySelector("[data-menu-toggler]");
        this.menuClose = document.querySelectorAll("[data-menu-close]");
        this.menuContainer = document.querySelector("[data-menu-container]");
        this.breakpointTablet = 768;
        this.breakpointLaptop = 1024;
        this.scrollManager = scrollManager;

        this.init();
    }

    init() {
        this.bindEvents();
        this.handleResize(); // Initial check
    }

    bindEvents() {
        // Toggle menu
        if (this.menuToggle) {
            this.menuToggle.addEventListener("click", () => this.toggleMenu());
        }

        // Close menu on close button
        if (this.menuClose.length > 0) {
            this.menuClose.forEach(element =>
                element.addEventListener("click", () => this.closeMenu())
            );
        }

        // Close menu on outside click
        if (this.menuContainer) {
            document.addEventListener("click", e => this.handleOutsideClick(e));
        }

        // Close menu on ESC
        document.addEventListener("keydown", e => this.handleEscape(e));

        // Close menu on resize
        window.addEventListener("resize", () => this.handleResize());
    }

    toggleMenu() {
        if (this.body.classList.contains("menu-opened")) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.body.classList.add("menu-opened");
        // Блокируем скролл
        if (this.scrollManager) {
            this.scrollManager.lockScroll();
        }
    }

    closeMenu() {
        this.body.classList.remove("menu-opened");
        // Разблокируем скролл
        if (this.scrollManager) {
            this.scrollManager.unlockScroll();
        }
    }

    handleOutsideClick(e) {
        if (
            this.menuContainer &&
            !this.menuContainer.contains(e.target) &&
            this.menuToggle &&
            !this.menuToggle.contains(e.target) &&
            this.body.classList.contains("menu-opened")
        ) {
            this.closeMenu();
        }
    }

    handleEscape(e) {
        if (e.key === "Escape" && this.body.classList.contains("menu-opened")) {
            this.closeMenu();
        }
    }

    handleResize() {
        const width = window.innerWidth;

        // Close menu on tablet and larger screens
        if (
            width >= this.breakpointTablet &&
            this.body.classList.contains("menu-opened")
        ) {
            this.closeMenu();
        }

        // Ensure menu is closed on laptop and larger screens
        if (width >= this.breakpointLaptop) {
            this.closeMenu();
        }
    }
}

export default MobileMenu;