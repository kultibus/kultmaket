export class Analytics {
  constructor() {
    this.goals = {
      'header-order': 'Заказ из хедера',
      'hero-discuss': 'Обсудить проект (герой)',
      'hero-portfolio': 'Портфолио (герой)',
      'form-submit': 'Отправка формы',
      'portfolio-project': 'Просмотр проекта портфолио'
    };
  }

  init() {
    this.trackClicks();
    this.trackForms();
    this.trackScroll();
  }

  trackClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-analytics]');
      
      if (target) {
        const goal = target.dataset.analytics;
        this.sendEvent(goal);
      }
    });
  }

  trackForms() {
    document.addEventListener('submit', (e) => {
      if (e.target.tagName === 'FORM') {
        this.sendEvent('form-submit');
      }
    });
  }

  trackScroll() {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.sendEvent(`view-${entry.target.id}`);
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
  }

  sendEvent(action) {
    // Google Analytics (фейковые ключи)
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        'event_category': 'Engagement',
        'event_label': this.goals[action] || action
      });
    }

    // Яндекс.Метрика (фейковые ключи)
    if (typeof ym !== 'undefined') {
      ym(123456, 'reachGoal', action);
    }

    console.log('Analytics event:', action, this.goals[action] || action);
  }
}