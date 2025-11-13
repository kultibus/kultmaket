class ModalFeedback {
    constructor() {
        this.modal = document.getElementById("modal-feedback");
        this.form = document.getElementById("modal-contact-form");
        this.submitBtn = document.getElementById("modal-submit-btn");
        this.success = document.getElementById("modal-success");
        this.formMessage = this.form.querySelector(".form-message");

        this.init();
    }

    init() {
        this.form.addEventListener("submit", this.handleSubmit.bind(this));

        // Закрытие модального окна при клике на кнопку "Понятно"
        this.success
            .querySelector("[data-modal-close]")
            .addEventListener("click", () => {
                this.closeAll();
            });

        // Сброс состояния формы при открытии модального окна
        if (this.modal) {
            // Используем MutationObserver для отслеживания открытия модального окна
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (
                        mutation.attributeName === "class" &&
                        this.modal.classList.contains("active")
                    ) {
                        this.resetFormState();
                    }
                });
            });

            observer.observe(this.modal, { attributes: true });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) return;

        // Показываем лоадер на кнопке
        this.showLoader();

        try {
            // Имитация отправки формы
            await this.submitForm();

            // Показываем успешное сообщение
            this.showSuccess();
        } catch (error) {
            this.showError(
                "Произошла ошибка при отправке. Попробуйте еще раз."
            );
        } finally {
            this.hideLoader();
        }
    }

    showLoader() {
        this.submitBtn.classList.add("btn--loading");
        this.submitBtn.disabled = true;
    }

    hideLoader() {
        this.submitBtn.classList.remove("btn--loading");
        this.submitBtn.disabled = false;
    }

    showSuccess() {
        this.success.classList.add("active");
        this.form.style.opacity = "0.3";
        this.form.style.pointerEvents = "none";
    }

    showError(message) {
        this.formMessage.textContent = message;
        this.formMessage.className = "form-message form-message--error";
    }

    resetFormState() {
        this.success.classList.remove("active");
        this.form.style.opacity = "1";
        this.form.style.pointerEvents = "auto";
        this.formMessage.textContent = "";
        this.formMessage.className = "form-message";
        this.hideLoader();
    }

    closeAll() {
        this.resetFormState();
        this.form.reset();

        // Закрыть модальное окно через существующий класс Modal
        const modalInstance = document.querySelector(".modal.active");
        if (modalInstance) {
            modalInstance.classList.remove("active");
        }

        // Разблокировать скролл
        document.body.classList.remove("scroll-locked");
    }

    validateForm() {
        // Ваша существующая валидация
        // Верните true для демонстрации
        return true;
    }

    async submitForm() {
        // Имитация API запроса
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Для демонстрации иногда показываем ошибку
                if (Math.random() > 0.2) {
                    resolve({ success: true });
                } else {
                    reject(new Error("Network error"));
                }
            }, 2000);
        });

        // Реальная отправка:
        // const formData = new FormData(this.form);
        // const response = await fetch('/api/feedback', {
        //     method: 'POST',
        //     body: formData
        // });
        // if (!response.ok) throw new Error('Network error');
        // return await response.json();
    }
}

// Инициализация после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
    new ModalFeedback();
});

export default ModalFeedback;
