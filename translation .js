export const currentLang = {
  code: localStorage.getItem('site_lang') || 'en'
};

export function getText(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[currentLang.code] || field['en'] || '';
}

export function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'am') return;
  currentLang.code = lang;
  localStorage.setItem('site_lang', lang);
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

export const staticUI = {
  en: {
    navHome: "Home",
    navProducts: "Products",
    navGallery: "Gallery",
    navContact: "Contact Us",
    navAdmin: "Admin",
    contactTitle: "Get in Touch",
    sendBtn: "Send Message",
    origin: "Origin",
    process: "Process",
    altitude: "Altitude"
  },
  am: {
    navHome: "ዋና ገፅ",
    navProducts: "ምርቶች",
    navGallery: "ጋለሪ",
    navContact: "ያግኙን",
    navAdmin: "አስተዳዳሪ",
    contactTitle: "መልእክት ይላኩልን",
    sendBtn: "መልእክት ላክ",
    origin: "መነሻ ቦታ",
    process: "አዘጋጃጀት",
    altitude: "ከፍታ"
  }
};
