const i18n = {
  locale: 'es',
  translations: {},

  async load(lang) {
    const res = await fetch(`/lang/${lang}.json`);
    if (!res.ok) {
      console.error(`[i18n] No se pudo cargar /lang/${lang}.json — status ${res.status}`);
      return;
    }
    this.translations = await res.json();
    this.locale = lang;
    document.documentElement.lang = lang;
    this.apply();
    localStorage.setItem('i18n_lang', lang);
  },

  t(key) {
    return this.translations[key] ?? key;
  },

  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.innerHTML = this.t(key);
    });
  }
};