// Упрощенная версия проверки WebP
export class WebPSupport {
    init() {
        this.checkWebP();
    }

    async checkWebP() {
        try {
            const supported = await this.testWebP();
            document.body.classList.add(supported ? "webp" : "no-webp");

            // Кэшируем результат
            try {
                localStorage.setItem("webpSupport", supported);
            } catch (e) {
                // Ignore storage errors
            }
        } catch (error) {
            document.body.classList.add("no-webp");
        }
    }

    testWebP() {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img.width > 0 && img.height > 0);
            img.onerror = () => resolve(false);
            img.src =
                "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        });
    }
}
