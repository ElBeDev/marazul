import { translations, type Lang } from './translations'

const STORAGE_KEY = 'marazul-lang'

function getLang(): Lang {
  return (localStorage.getItem(STORAGE_KEY) as Lang) || 'en'
}

function setLang(lang: Lang) {
  localStorage.setItem(STORAGE_KEY, lang)
  applyLang(lang)
  updateToggle(lang)
}

function applyLang(lang: Lang) {
  const t = translations[lang]
  document.documentElement.lang = lang

  // innerHTML replacements (support <br/>, <em>, etc.)
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n!
    if (t[key] !== undefined) el.innerHTML = t[key]
  })

  // placeholder replacements
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-i18n-ph]').forEach(el => {
    const key = (el as HTMLElement).dataset.i18nPh!
    if (t[key] !== undefined) el.placeholder = t[key]
  })
}

function updateToggle(lang: Lang) {
  document.querySelectorAll<HTMLButtonElement>('.lang-btn').forEach(btn => {
    btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang)
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang))
  })
}

export function initI18n() {
  // Build toggle HTML if not already in DOM
  document.querySelectorAll<HTMLElement>('#langToggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-lang]')
      if (btn?.dataset.lang) setLang(btn.dataset.lang as Lang)
    })
  })

  // Apply on load
  const lang = getLang()
  applyLang(lang)
  updateToggle(lang)
}
