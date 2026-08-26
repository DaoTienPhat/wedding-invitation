const translations = globalThis.translations || {};
const storageKey = 'weddingLocale';
const defaultLocale = (globalThis.navigator?.language?.toLowerCase?.() || '').startsWith('vi') ? 'vi' : 'en';
let currentLocale = localStorage.getItem(storageKey) || defaultLocale;
let guestDetails = {
  pronoun: '',
  name: ''
};

function getLocaleData() {
  return translations[currentLocale] || translations[defaultLocale] || {};
}

function getText(path) {
  const parts = path.split('.');
  let value = getLocaleData();

  for (const part of parts) {
    value = value?.[part];
  }

  return value || path;
}

function updateGuestGreeting() {
  const guestGreeting = document.getElementById('guestGreeting');

  if (!guestGreeting) {
    return;
  }

  const personalizedGreeting = [guestDetails.pronoun, guestDetails.name].filter(Boolean).join(' ');
  guestGreeting.textContent = personalizedGreeting ? `${personalizedGreeting},` : getText('hero.greeting');
}

function renderCountdown() {
  const countdownElement = document.getElementById('countdown');

  if (!countdownElement || typeof simplyCountdown !== 'function') {
    return;
  }

  countdownElement.innerHTML = '';

  const usePlural = (root, n) => {
    if (currentLocale === 'vi') {
      return root;
    }

    return n === 1 ? root : `${root}s`;
  };

  simplyCountdown('#countdown', {
    year: 2025,
    month: 5,
    day: 22,
    hours: 1,
    minutes: 0,
    seconds: 0,
    enableUtc: true,
    words: {
      days: { root: getText('countdown.day'), lambda: usePlural },
      hours: { root: getText('countdown.hour'), lambda: usePlural },
      minutes: { root: getText('countdown.minute'), lambda: usePlural },
      seconds: { root: getText('countdown.second'), lambda: usePlural }
    },
    plural: true,
    inline: false,
    inlineSeparator: ', ',
    inlineClass: 'simply-countdown-inline',
    refresh: 1000,
    sectionClass: 'simply-section',
    amountClass: 'simply-amount',
    wordClass: 'simply-word',
    zeroPad: false,
    removeZeroUnits: false,
    countUp: false,
    onEnd: () => {},
    onStop: () => {},
    onResume: () => {},
    onUpdate: () => {}
  });
}

function applyTranslations() {
  document.documentElement.lang = currentLocale;

  document.querySelectorAll('[data-image]').forEach((element) => {
    element.style.backgroundImage = `url(${element.dataset.image})`;
  });

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const text = getText(element.dataset.i18n);
    if (text !== undefined && text !== null) {
      element.textContent = text;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const text = getText(element.dataset.i18nPlaceholder);
    if (text !== undefined && text !== null) {
      element.setAttribute('placeholder', text);
    }
  });

  document.querySelectorAll('[data-i18n-caption]').forEach((element) => {
    const baseCaption = getText(element.dataset.i18nCaption);
    const captionNumber = element.dataset.captionNumber ? ` ${element.dataset.captionNumber}` : '';
    element.dataset.caption = `${baseCaption}${captionNumber}`.trim();
  });

  document.querySelectorAll('[data-lang]').forEach((button) => {
    const isActive = button.dataset.lang === currentLocale;
    button.classList.toggle('btn-dark', isActive);
    button.classList.toggle('btn-outline-dark', !isActive);
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  updateGuestGreeting();
  renderCountdown();
}

function getGuestDetailsFromUrl() {
  const nameParam = new URLSearchParams(globalThis.location.search);
  guestDetails = {
    pronoun: nameParam.get('p') || '',
    name: nameParam.get('n') || ''
  };

  const guestNameInput = document.getElementById('nama');
  if (guestNameInput && !guestNameInput.value) {
    guestNameInput.value = guestDetails.name;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  getGuestDetailsFromUrl();
  applyTranslations();

  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.lang !== currentLocale) {
        currentLocale = button.dataset.lang;
        localStorage.setItem(storageKey, currentLocale);
        applyTranslations();
      }
    });
  });
});

globalThis.weddingI18n = {
  getText,
  getLocale() {
    return currentLocale;
  },
  setLanguage(locale) {
    if (translations[locale]) {
      currentLocale = locale;
      localStorage.setItem(storageKey, locale);
      applyTranslations();
    }
  },
  refresh() {
    applyTranslations();
  }
};
