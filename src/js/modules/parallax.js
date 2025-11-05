export class Parallax {
    constructor() {
        this.elements = [];
        this.isMobile = window.innerWidth < 768;
    }

    init() {
        if (this.isMobile) return;

        this.elements = document.querySelectorAll("[data-parallax]");

        if (this.elements.length) {
            window.addEventListener("scroll", () => this.updateParallax());
            this.updateParallax();
        }
    }

    updateParallax() {
        const scrolled = window.pageYOffset;

        // this.elements.forEach(element => {
        //   const speed = element.dataset.speed || 0.4;
        //   const yPos = -(scrolled * speed);
        //   element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        // });

        this.elements.forEach(element => {
            const speed = element.dataset.speed || 0.4;
            const yPos = scrolled * speed;
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }
}
