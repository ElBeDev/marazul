import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ================================================================
   SMOOTH SCROLL — Lenis + GSAP ticker integration
   ================================================================ */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// Anchor links: smooth lenis navigation
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')
    if (!id || id === '#') return
    const target = document.querySelector(id)
    if (target) {
      e.preventDefault()
      lenis.scrollTo(target as HTMLElement, { offset: -72, duration: 1.4 })
    }
  })
})

/* ================================================================
   NAV — transparent → opaque on scroll
   ================================================================ */
const nav = document.getElementById('nav') as HTMLElement

ScrollTrigger.create({
  start: 'top -56',
  onEnter:     () => nav.classList.add('scrolled'),
  onLeaveBack: () => nav.classList.remove('scrolled'),
})

/* ================================================================
   HAMBURGER / MOBILE MENU
   ================================================================ */
const hamburger  = document.getElementById('hamburger')  as HTMLButtonElement
const mobileMenu = document.getElementById('mobileMenu') as HTMLElement

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open')
  hamburger.setAttribute('aria-expanded', String(open))
  mobileMenu.setAttribute('aria-hidden', String(!open))
})

document.querySelectorAll<HTMLElement>('[data-close]').forEach((el) => {
  el.addEventListener('click', () => {
    mobileMenu.classList.remove('open')
    hamburger.setAttribute('aria-expanded', 'false')
    mobileMenu.setAttribute('aria-hidden', 'true')
  })
})

document.addEventListener('click', (e) => {
  if (!nav.contains(e.target as Node)) {
    mobileMenu.classList.remove('open')
    hamburger.setAttribute('aria-expanded', 'false')
    mobileMenu.setAttribute('aria-hidden', 'true')
  }
})

/* ================================================================
   SPLIT TEXT UTILITY — word-level clip-path reveal
   ================================================================ */
function splitWords(el: HTMLElement): HTMLElement[] {
  const raw = el.innerHTML
  // preserve <br> and <em> tags
  const parts = raw.split(/(<br\s*\/?>|<em>.*?<\/em>)/gi)
  el.innerHTML = parts.map((part) => {
    if (/^<br/i.test(part)) return part
    if (/^<em>/i.test(part)) {
      return `<span class="word"><span class="word-inner">${part}</span></span>`
    }
    return part
      .split(' ')
      .filter(Boolean)
      .map((w) => `<span class="word"><span class="word-inner">${w}</span></span>`)
      .join(' ')
  }).join('')
  return Array.from(el.querySelectorAll('.word-inner')) as HTMLElement[]
}

/* ================================================================
   HERO ANIMATION — entrance timeline
   ================================================================ */
const heroTitle = document.querySelector<HTMLElement>('.hero-title')

if (heroTitle) {
  const words = splitWords(heroTitle)

  const tl = gsap.timeline({ delay: 0.15 })

  tl.set(words, { yPercent: 115, opacity: 0 })
    .to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.07,
    })
    .to('.hero-eyebrow', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
    }, 0.3)
    .to('.hero-sub', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
    }, 0.45)
    .to('.hero-actions', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
    }, 0.55)
    .to('.hero-strip', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, 0.65)

  // Initial states for non-title elements
  gsap.set('.hero-eyebrow',  { opacity: 0 })
  gsap.set('.hero-sub',      { opacity: 0, y: 20 })
  gsap.set('.hero-actions',  { opacity: 0, y: 20 })
  gsap.set('.hero-strip',    { opacity: 0, y: 16 })
}

/* ================================================================
   HERO IMAGE CAROUSEL — auto-advance destinations
   ================================================================ */
const heroSlideEls = document.querySelectorAll<HTMLElement>('.hero-slide')
const heroDotEls   = document.querySelectorAll<HTMLButtonElement>('.hero-dot')
let heroIdx = 0
let heroCarouselTimer: ReturnType<typeof setInterval> | null = null

function goHeroSlide(next: number): void {
  heroSlideEls[heroIdx]?.classList.remove('active')
  heroDotEls[heroIdx]?.classList.remove('active')
  heroIdx = (next + heroSlideEls.length) % heroSlideEls.length
  heroSlideEls[heroIdx]?.classList.add('active')
  heroDotEls[heroIdx]?.classList.add('active')
}

heroDotEls.forEach((dot) => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset['slide'] ?? '0', 10)
    goHeroSlide(idx)
    if (heroCarouselTimer) clearInterval(heroCarouselTimer)
    heroCarouselTimer = setInterval(() => goHeroSlide(heroIdx + 1), 4500)
  })
})

if (heroSlideEls.length > 1) {
  heroCarouselTimer = setInterval(() => goHeroSlide(heroIdx + 1), 4500)
}

/* ================================================================
   HERO IMAGE — parallax on scroll
   ================================================================ */
const heroImgInners = document.querySelectorAll<HTMLElement>('.hero-slide img')
heroImgInners.forEach((el) => {
  gsap.to(el, {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })
})

/* ================================================================
   SECTION HEADING REVEALS — word split + clip-path
   ================================================================ */
document.querySelectorAll<HTMLElement>('.reveal-heading').forEach((el) => {
  const words = splitWords(el)
  gsap.set(words, { yPercent: 115 })

  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter: () => {
      gsap.to(words, {
        yPercent: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
      })
    },
  })
})

/* ================================================================
   LABEL FADE-IN
   ================================================================ */
document.querySelectorAll<HTMLElement>('.label').forEach((el) => {
  gsap.from(el, {
    opacity: 0,
    y: 12,
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
  })
})

/* ================================================================
   BENEFITS — staggered slide-in from left
   ================================================================ */
gsap.from('.benefit-card', {
  opacity: 0,
  y: 32,
  duration: 0.7,
  ease: 'power3.out',
  stagger: 0.08,
  scrollTrigger: {
    trigger: '.benefits-list',
    start: 'top 82%',
    once: true,
  },
})

gsap.from('.benefits-sub', {
  opacity: 0,
  y: 20,
  duration: 0.7,
  ease: 'power2.out',
  scrollTrigger: { trigger: '.benefits-sub', start: 'top 88%', once: true },
})

/* ================================================================
   STATS — count-up animation
   ================================================================ */
document.querySelectorAll<HTMLElement>('.count-num').forEach((el) => {
  const target = parseFloat(el.dataset['target'] ?? '0')
  const suffix = el.dataset['suffix'] ?? ''

  const formatNum = (val: number): string => {
    if (target >= 100000) return (val / 1000).toFixed(0) + 'K'
    return Math.round(val).toLocaleString()
  }

  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: target,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate() {
          el.textContent = formatNum(obj.val) + suffix
        },
      })
    },
  })
})

/* ================================================================
   HOW IT WORKS — stagger steps
   ================================================================ */
gsap.from('.hiw-step', {
  opacity: 0,
  y: 40,
  duration: 0.8,
  ease: 'power3.out',
  stagger: 0.15,
  scrollTrigger: {
    trigger: '.hiw-steps',
    start: 'top 80%',
    once: true,
  },
})

/* ================================================================
   RESORT WEEKS — tab switching with GSAP crossfade
   ================================================================ */
const tabs   = document.querySelectorAll<HTMLButtonElement>('.rw-tab')
const panels = document.querySelectorAll<HTMLElement>('.rw-panel')

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const id = tab.dataset['tab']
    if (!id) return

    // deactivate all
    tabs.forEach((t) => {
      t.classList.remove('active')
      t.setAttribute('aria-selected', 'false')
    })
    const currentPanel = document.querySelector<HTMLElement>('.rw-panel.active')

    // activate tab
    tab.classList.add('active')
    tab.setAttribute('aria-selected', 'true')

    const nextPanel = document.getElementById(`panel-${id}`)
    if (!nextPanel || nextPanel === currentPanel) return

    // crossfade
    if (currentPanel) {
      gsap.to(currentPanel, {
        opacity: 0,
        y: -12,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          currentPanel.classList.remove('active')
          nextPanel.classList.add('active')
          gsap.fromTo(nextPanel,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
          )
        },
      })
    } else {
      nextPanel.classList.add('active')
      gsap.fromTo(nextPanel,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      )
    }
  })
})

/* ================================================================
   TESTIMONIAL CAROUSEL — auto-advance with GSAP crossfade
   ================================================================ */
const slides       = document.querySelectorAll<HTMLElement>('.quote-slide')
const countDisplay = document.getElementById('quoteCount') as HTMLElement
const prevBtn      = document.getElementById('quotePrev')  as HTMLButtonElement
const nextBtn      = document.getElementById('quoteNext')  as HTMLButtonElement

let current   = 0
let autoTimer: ReturnType<typeof setInterval> | null = null

function goToSlide(next: number, dir: 1 | -1 = 1): void {
  const from = slides[current]
  current = (next + slides.length) % slides.length
  const to   = slides[current]

  if (!from || !to || from === to) return

  gsap.to(from, {
    opacity: 0,
    y: dir * -20,
    duration: 0.35,
    ease: 'power2.in',
    onComplete: () => {
      from.classList.remove('active')
      to.classList.add('active')
      gsap.fromTo(to,
        { opacity: 0, y: dir * 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      )
      countDisplay.textContent = `${current + 1} / ${slides.length}`
    },
  })
}

function startAuto(): void {
  autoTimer = setInterval(() => goToSlide(current + 1, 1), 5000)
}
function resetAuto(): void {
  if (autoTimer) clearInterval(autoTimer)
  startAuto()
}

prevBtn.addEventListener('click', () => { goToSlide(current - 1, -1); resetAuto() })
nextBtn.addEventListener('click', () => { goToSlide(current + 1,  1); resetAuto() })

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  { goToSlide(current - 1, -1); resetAuto() }
  if (e.key === 'ArrowRight') { goToSlide(current + 1,  1); resetAuto() }
})

startAuto()

/* ================================================================
   CTA — parallax image
   ================================================================ */
const ctaImg = document.getElementById('ctaImg')
if (ctaImg) {
  gsap.to(ctaImg, {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.cta-full',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })
}

/* ================================================================
   CTA TEXT — reveal
   ================================================================ */
gsap.from('.cta-text p, .cta-btns', {
  opacity: 0,
  y: 24,
  duration: 0.8,
  ease: 'power3.out',
  stagger: 0.12,
  scrollTrigger: {
    trigger: '.cta-text',
    start: 'top 80%',
    once: true,
  },
})

/* ================================================================
   FAQ — accordion
   ================================================================ */
document.querySelectorAll<HTMLButtonElement>('.faq-q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const answer   = btn.nextElementSibling as HTMLElement
    const expanded = btn.getAttribute('aria-expanded') === 'true'

    // collapse all
    document.querySelectorAll<HTMLButtonElement>('.faq-q').forEach((b) => {
      b.setAttribute('aria-expanded', 'false')
      ;(b.nextElementSibling as HTMLElement)?.classList.remove('open')
    })

    // open clicked if was closed
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true')
      answer.classList.add('open')
    }
  })
})

/* ================================================================
   CONTACT FORM — feedback on submit
   ================================================================ */
const contactForm = document.getElementById('contactForm') as HTMLFormElement
const submitBtn   = document.getElementById('submitBtn')   as HTMLButtonElement

contactForm.addEventListener('submit', (e) => {
  e.preventDefault()

  submitBtn.textContent = 'Sent ✓'
  submitBtn.disabled = true

  gsap.to(submitBtn, {
    backgroundColor: '#2d7a4f',
    duration: 0.4,
    ease: 'power2.out',
  })

  setTimeout(() => {
    submitBtn.textContent = 'Send Message'
    submitBtn.disabled = false
    gsap.to(submitBtn, { backgroundColor: '', duration: 0.4 })
    contactForm.reset()
  }, 4000)
})

/* ================================================================
   GENERIC FADE-UP on scroll (contact details, footer, etc.)
   ================================================================ */
const fadeEls = document.querySelectorAll<HTMLElement>(
  '.cdetail, .hiw-connector, .footer-col, .footer-brand, .rw-panel-info'
)
fadeEls.forEach((el, i) => {
  gsap.from(el, {
    opacity: 0,
    y: 28,
    duration: 0.7,
    ease: 'power3.out',
    delay: (i % 3) * 0.08,
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
      once: true,
    },
  })
})

/* ================================================================
   panels — ensure correct opacity on load
   ================================================================ */
panels.forEach((p) => {
  if (!p.classList.contains('active')) {
    gsap.set(p, { opacity: 1 })
  }
})
