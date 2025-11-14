// modules/form-manager.js
class FormManager {
    constructor(modalManager) {
        this.modalManager = modalManager;
        this.init();
    }

    init() {
        this.bindFormEvents();
    }

    bindFormEvents() {
        // Обработка отправки формы обратной связи
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'modal-contact-form') {
                e.preventDefault();
                this.handleFeedbackSubmit(e.target);
            }
        });

        // Сброс формы при открытии модалки
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-target="#modal-feedback"]')) {
                this.resetFeedbackForm();
            }
        });
    }

    async handleFeedbackSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const success = document.getElementById('modal-success');
        
        this.showLoader(submitBtn);

        try {
            await this.submitFormData(form);
            this.showSuccessMessage(form, success);
        } catch (error) {
            this.showErrorMessage(form, 'Ошибка отправки формы');
        } finally {
            this.hideLoader(submitBtn);
        }
    }

    resetFeedbackForm() {
        const form = document.getElementById('modal-contact-form');
        const success = document.getElementById('modal-success');
        
        if (form && success) {
            success.classList.remove('active');
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
            form.reset();
            
            this.clearFormMessages(form);
        }
    }

    showLoader(button) {
        button.classList.add('btn--loading');
        button.disabled = true;
    }

    hideLoader(button) {
        button.classList.remove('btn--loading');
        button.disabled = false;
    }

    showSuccessMessage(form, successElement) {
        successElement.classList.add('active');
        form.style.opacity = '0.3';
        form.style.pointerEvents = 'none';
    }

    showErrorMessage(form, message) {
        const messageEl = form.querySelector('.form-message');
        messageEl.textContent = message;
        messageEl.className = 'form-message form-message--error';
    }

    clearFormMessages(form) {
        const messageEl = form.querySelector('.form-message');
        messageEl.textContent = '';
        messageEl.className = 'form-message';
    }

    async submitFormData(form) {
        // Имитация API запроса
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.validateForm(form) && Math.random() > 0.2) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Network error'));
                }
            }, 4000);
        });

        // Реальная реализация:
        // const formData = new FormData(form);
        // const response = await fetch('/api/feedback', {
        //     method: 'POST',
        //     body: formData
        // });
        // if (!response.ok) throw new Error('Network error');
        // return await response.json();
    }

    validateForm(form) {
        // Ваша логика валидации
        const inputs = form.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                this.markFieldInvalid(input);
            } else {
                this.markFieldValid(input);
            }
        });

        return isValid;
    }

    markFieldInvalid(input) {
        input.classList.add('invalid');
    }

    markFieldValid(input) {
        input.classList.remove('invalid');
    }
}

export default FormManager;