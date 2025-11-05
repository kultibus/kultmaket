export class FormHandler {
  constructor() {
    this.forms = [];
    this.phoneMask = '+7 (___) ___-__-__';
  }

  init() {
    this.forms = document.querySelectorAll('form');
    
    this.forms.forEach(form => {
      this.initForm(form);
    });
  }

  initForm(form) {
    const phoneInputs = form.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
      this.initPhoneMask(input);
    });
    
    form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    form.addEventListener('input', (e) => this.handleInput(e));
  }

  initPhoneMask(input) {
    input.addEventListener('input', (e) => {
      const numbers = e.target.value.replace(/\D/g, '');
      let formatted = this.phoneMask;
      
      numbers.split('').forEach(number => {
        formatted = formatted.replace('_', number);
      });
      
      e.target.value = formatted;
    });

    input.addEventListener('focus', () => {
      if (!input.value) {
        input.value = this.phoneMask;
      }
    });

    input.addEventListener('blur', () => {
      if (input.value === this.phoneMask) {
        input.value = '';
      }
    });
  }

  handleInput(e) {
    if (e.target.type === 'tel') {
      this.validatePhone(e.target);
    } else if (e.target.name === 'name') {
      this.validateName(e.target);
    }
  }

  validatePhone(input) {
    const numbers = input.value.replace(/\D/g, '');
    const isValid = numbers.length === 11;
    
    this.showFieldError(input, isValid, 'Введите корректный номер телефона');
    return isValid;
  }

  validateName(input) {
    const isValid = /^[а-яА-ЯёЁ\s\-]+$/.test(input.value.trim());
    this.showFieldError(input, isValid, 'Только кириллические символы');
    return isValid;
  }

  showFieldError(input, isValid, message) {
    const errorElement = input.parentNode.querySelector('.form-error');
    
    if (!isValid && input.value.trim()) {
      input.classList.add('invalid');
      if (errorElement) errorElement.textContent = message;
    } else {
      input.classList.remove('invalid');
      if (errorElement) errorElement.textContent = '';
    }
  }

  async handleSubmit(e, form) {
    e.preventDefault();
    
    if (!this.validateForm(form)) {
      this.showMessage(form, 'Пожалуйста, заполните все поля правильно', 'error');
      return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    try {
      await this.sendFormData(new FormData(form));
      this.showMessage(form, 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.', 'success');
      form.reset();
    } catch (error) {
      this.showMessage(form, 'Ошибка отправки. Пожалуйста, попробуйте еще раз или позвоните нам.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  validateForm(form) {
    let isValid = true;
    
    form.querySelectorAll('input[required]').forEach(input => {
      if (input.type === 'tel') {
        if (!this.validatePhone(input)) isValid = false;
      } else if (input.type === 'text' && input.name === 'name') {
        if (!this.validateName(input)) isValid = false;
      } else if (!input.value.trim()) {
        isValid = false;
        input.classList.add('invalid');
      }
    });
    
    const agreement = form.querySelector('input[name="agreement"]');
    if (agreement && !agreement.checked) {
      isValid = false;
      this.showFieldError(agreement, false, 'Необходимо согласие');
    }
    
    return isValid;
  }

  async sendFormData(formData) {
    // Имитация отправки данных
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form data:', {
          name: formData.get('name'),
          phone: formData.get('phone')
        });
        resolve();
      }, 1000);
    });
  }

  showMessage(form, message, type) {
    const oldMessage = form.querySelector('.form-message');
    if (oldMessage) oldMessage.remove();
    
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message--${type}`;
    messageEl.textContent = message;
    
    form.appendChild(messageEl);
    
    setTimeout(() => messageEl.remove(), 5000);
  }
}