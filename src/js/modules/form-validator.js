// modules/form-validator.js
class FormValidator {
    constructor() {
        this.config = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/,
                messages: {
                    required: 'Имя обязательно для заполнения',
                    minLength: 'Имя должно содержать минимум 2 символа',
                    maxLength: 'Имя не должно превышать 50 символов',
                    pattern: 'Имя может содержать только буквы и дефисы'
                }
            },
            phone: {
                required: true,
                pattern: /^[\d\+\(\)\-\s]+$/,
                minLength: 11,
                cleanPattern: /[^\d]/g,
                messages: {
                    required: 'Телефон обязателен для заполнения',
                    pattern: 'Введите корректный номер телефона',
                    minLength: 'Телефон должен содержать 11 цифр'
                }
            },
            agreement: {
                required: true,
                messages: {
                    required: 'Необходимо согласие с политикой конфиденциальности'
                }
            }
        };
        
        this.errors = new Map();
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Real-time валидация с дебаунсом
        document.addEventListener('input', this.debounce((e) => {
            if (e.target.matches('[data-validation]')) {
                this.validateField(e.target);
            }
        }, 300));

        // Валидация при потере фокуса
        document.addEventListener('blur', (e) => {
            if (e.target.matches('[data-validation]')) {
                this.validateField(e.target, true);
            }
        }, true);
    }

    validateField(field, showMessage = false) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.config[fieldName];
        
        if (!rules) return true;

        const error = this.getFieldError(fieldName, value, field.type === 'checkbox' ? field.checked : value);
        
        this.updateFieldUI(field, error, showMessage);
        return !error;
    }

    getFieldError(fieldName, value, checked = null) {
        const rules = this.config[fieldName];
        
        // Проверка чекбокса
        if (fieldName === 'agreement') {
            if (rules.required && !checked) {
                return rules.messages.required;
            }
            return null;
        }

        // Проверка текстовых полей
        if (rules.required && !value) {
            return rules.messages.required;
        }

        if (value) {
            if (rules.minLength && value.length < rules.minLength) {
                return rules.messages.minLength;
            }

            if (rules.maxLength && value.length > rules.maxLength) {
                return rules.messages.maxLength;
            }

            if (rules.pattern && !rules.pattern.test(value)) {
                return rules.messages.pattern;
            }

            // Специфичная валидация для телефона
            if (fieldName === 'phone') {
                const cleanPhone = value.replace(rules.cleanPattern, '');
                if (cleanPhone.length < rules.minLength) {
                    return rules.messages.minLength;
                }
            }
        }

        return null;
    }

    updateFieldUI(field, error, showMessage = false) {
        const errorElement = field.closest('.form-group').querySelector('[data-error]');
        
        field.classList.toggle('invalid', !!error);
        field.classList.toggle('valid', !error);
        
        if (showMessage || error) {
            errorElement.textContent = error || '';
            errorElement.classList.toggle('visible', !!error);
        }

        // ARIA атрибуты
        field.setAttribute('aria-invalid', !!error);
        field.setAttribute('aria-describedby', error ? errorElement.id : '');
    }

    validateAll(form) {
        const fields = form.querySelectorAll('[data-validation]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field, true)) {
                isValid = false;
                
                // Фокус на первое невалидное поле
                if (isValid === false) {
                    field.focus();
                    isValid = null; // Чтобы фокус сработал только один раз
                }
            }
        });

        return isValid;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    resetForm(form) {
        const fields = form.querySelectorAll('[data-validation]');
        const errors = form.querySelectorAll('[data-error]');
        
        fields.forEach(field => {
            field.classList.remove('invalid', 'valid');
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
        });
        
        errors.forEach(error => {
            error.textContent = '';
            error.classList.remove('visible');
        });
        
        this.errors.clear();
    }
}

export default FormValidator;