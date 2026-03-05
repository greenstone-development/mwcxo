/* ============================================
   Matt Walsh CXO — Site JavaScript
   Parallax + Interactions
   ============================================ */

// ── Utilities ──────────────────────────────────
const isMobile = () => window.innerWidth <= 960;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ── Nav Scroll Effect ──────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile Nav Toggle ──────────────────────────
function toggleNav() {
  const links = document.querySelector('.nav-links');
  const toggle = document.querySelector('.nav-toggle');
  if (links) {
    links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', links.classList.contains('open'));
  }
}

function closeNav() {
  const links = document.querySelector('.nav-links');
  const toggle = document.querySelector('.nav-toggle');
  if (links && links.classList.contains('open')) {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNav();
});

// ── Parallax Engine ────────────────────────────
// Uses requestAnimationFrame with lerped values for buttery smoothness.
// Injects subtle floating orbs and applies depth-based transforms.

class ParallaxEngine {
  constructor() {
    this.elements = [];
    this.orbs = [];
    this.scrollY = 0;
    this.currentScrollY = 0;
    this.vh = window.innerHeight;
  }

  init() {
    if (isMobile()) return;
    this.collectElements();
    this.injectOrbs();
    this.bindEvents();
    this.tick();
  }

  collectElements() {
    document.querySelectorAll('[data-parallax]').forEach(el => {
      this.elements.push({
        el,
        speed: parseFloat(el.dataset.parallax) || 0.1,
        type: el.dataset.parallaxType || 'y',
      });
    });
  }

  injectOrbs() {
    const orbConfigs = [
      { parent: '.hero-left', cls: 'orb-teal', size: 280, top: '10%', left: '-8%', speed: 0.03 },
      { parent: '.hero-left', cls: 'orb-gold', size: 180, top: '60%', right: '5%', speed: -0.02 },
      { parent: '.what-i-do', cls: 'orb-teal', size: 350, top: '-15%', right: '-10%', speed: 0.04 },
      { parent: '.what-i-do', cls: 'orb-ink', size: 200, bottom: '5%', left: '20%', speed: -0.025 },
      { parent: '.network', cls: 'orb-gold', size: 260, top: '20%', left: '-5%', speed: 0.035 },
      { parent: '.network', cls: 'orb-teal', size: 160, bottom: '10%', right: '15%', speed: -0.02 },
      { parent: '.clients', cls: 'orb-teal', size: 300, top: '-10%', right: '5%', speed: 0.03 },
      { parent: '.rec-hero', cls: 'orb-teal', size: 220, top: '30%', right: '10%', speed: 0.04 },
      { parent: '.cta-band', cls: 'orb-gold', size: 200, top: '20%', left: '60%', speed: -0.03 },
    ];

    orbConfigs.forEach(cfg => {
      const parent = document.querySelector(cfg.parent);
      if (!parent) return;

      const style = getComputedStyle(parent);
      if (style.position === 'static') parent.style.position = 'relative';
      if (style.overflow !== 'hidden') parent.style.overflow = 'hidden';

      const orb = document.createElement('div');
      orb.className = `parallax-orb ${cfg.cls}`;
      orb.style.width = cfg.size + 'px';
      orb.style.height = cfg.size + 'px';
      if (cfg.top) orb.style.top = cfg.top;
      if (cfg.bottom) orb.style.bottom = cfg.bottom;
      if (cfg.left) orb.style.left = cfg.left;
      if (cfg.right) orb.style.right = cfg.right;

      parent.appendChild(orb);
      this.orbs.push({ el: orb, speed: cfg.speed, parent });
    });
  }

  bindEvents() {
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.vh = window.innerHeight;
    }, { passive: true });
  }

  tick() {
    this.currentScrollY = lerp(this.currentScrollY, this.scrollY, 0.1);

    // Transform [data-parallax] elements
    this.elements.forEach(({ el, speed, type }) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > this.vh + 100) return;

      const progress = (this.vh - rect.top) / (this.vh + rect.height);
      const centered = (progress - 0.5) * 2;

      if (type === 'y') {
        el.style.transform = `translate3d(0,${(centered * speed * this.vh).toFixed(1)}px,0)`;
      } else if (type === 'scale') {
        el.style.transform = `scale(${(1 + centered * speed).toFixed(4)})`;
      }
    });

    // Float the orbs
    this.orbs.forEach(({ el, speed }) => {
      const parent = el.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > this.vh + 100) return;

      el.style.transform = `translate3d(0,${(this.currentScrollY * speed).toFixed(1)}px,0)`;
    });

    requestAnimationFrame(() => this.tick());
  }
}


// ── Staggered Reveal Observer ──────────────────

class StaggerReveal {
  constructor() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.revealElement(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  }

  init() {
    document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));

    const staggerGroups = [
      { parent: '.method-list', children: '.method-item' },
      { parent: '.testimonial-grid', children: '.testimonial-card' },
      { parent: '.project-grid', children: '.project-card' },
      { parent: '.network-numbers', children: '.net-num-box' },
    ];

    staggerGroups.forEach(({ parent, children }) => {
      document.querySelectorAll(parent).forEach(container => {
        this.observer.observe(container);
        container._staggerChildren = children;
      });
    });
  }

  revealElement(el) {
    if (el.classList.contains('reveal')) {
      el.classList.add('visible');
    }

    if (el._staggerChildren) {
      const children = el.querySelectorAll(el._staggerChildren);
      children.forEach((child, i) => {
        setTimeout(() => {
          child.classList.add('visible');
          if (child.classList.contains('net-num-box')) {
            child.classList.add('parallax-lifted');
          }
        }, i * 100);
      });
    }
  }
}


// ── Hero Image Parallax Zoom ───────────────────

class HeroParallax {
  constructor() {
    this.hero = null;
    this.heroContent = null;
  }

  init() {
    if (isMobile()) return;

    this.hero = document.querySelector('.hero-right');
    if (!this.hero) return;

    this.hero.classList.add('parallax-zoom');
    this.heroContent = this.hero.querySelector('div, img');

    if (this.heroContent) {
      window.addEventListener('scroll', () => this.update(), { passive: true });
    }
  }

  update() {
    if (!this.heroContent) return;
    const progress = clamp(window.scrollY / window.innerHeight, 0, 1);
    const scale = 1 + progress * 0.06;
    const yOffset = progress * -20;
    this.heroContent.style.transform = `scale(${scale.toFixed(4)}) translate3d(0,${yOffset.toFixed(1)}px,0)`;
  }
}


// ── Kicker Line Draw Animation ─────────────────

class KickerAnimation {
  constructor() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('kicker-visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
  }

  init() {
    document.querySelectorAll('.kicker, .page-kicker, .section-kicker, .hero-eyebrow, .contact-kicker').forEach(el => {
      this.observer.observe(el);
    });
  }
}


// ── Initialize Everything ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Close mobile nav on link click
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', closeNav);
  });

  new ParallaxEngine().init();
  new StaggerReveal().init();
  new HeroParallax().init();
  new KickerAnimation().init();
});


// ── Homepage — Client Filtering ────────────────
function filterClients(col, val) {
  const list = document.getElementById(col + '-list');
  const items = Array.from(document.querySelectorAll('[data-col="' + col + '"]'));

  items.forEach(el => {
    const cats = (el.dataset.cat || '').split(' ');
    const featured = el.dataset.featured === 'true';
    el.hidden = val === 'featured' ? !featured : !cats.includes(val);
  });

  // Alphabetise visible items for non-featured filters
  if (val !== 'featured' && list) {
    const visible = items.filter(el => !el.hidden);
    visible.sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()));
    visible.forEach(el => list.appendChild(el));
  }
}

// ── Recognition Toggles ────────────────────────
function toggleTestimonials(e) {
  e.preventDefault();
  const list = document.getElementById('testimonials-list');
  const btn = document.getElementById('testimonials-toggle');
  if (!list || !btn) return;
  const hidden = list.style.display === 'none' || list.style.display === '';
  list.style.display = hidden ? 'block' : 'none';
  btn.setAttribute('aria-expanded', hidden);
  btn.textContent = hidden ? 'Show fewer testimonials \u2191' : 'View all testimonials \u2192';
}

function toggleAwards(e) {
  e.preventDefault();
  const extras = document.querySelectorAll('.award-extra');
  const btn = document.getElementById('awards-toggle');
  if (!extras.length || !btn) return;
  const hidden = extras[0].style.display === 'none';
  extras.forEach(el => el.style.display = hidden ? 'table-row' : 'none');
  btn.setAttribute('aria-expanded', hidden);
  btn.textContent = hidden ? 'Show fewer awards \u2191' : 'View full list \u2192';
}

// ── Contact — Form Submission via Google Apps Script ──
// Replace YOUR_APPS_SCRIPT_URL with your deployed web app URL
const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycby23JRcvVar1LkHf6whcYAWQ3K5wkSqodhqntahlcxjqd6WfxgVv88jGGHBZl_iEeJI8A/exec';

async function handleSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitBtn');
  const formWrap = document.getElementById('form-wrap');
  const success = document.getElementById('successState');
  const errorEl = document.getElementById('formError');

  // Clear previous error state
  if (errorEl) errorEl.style.display = 'none';
  form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));

  // Field-level validation — mark invalid fields before posting
  const requiredFields = [
    { el: form.querySelector('#name'),    label: 'Your Name' },
    { el: form.querySelector('#email'),   label: 'Email' },
    { el: form.querySelector('#message'), label: 'Message' },
  ];
  const missing = requiredFields.filter(f => !f.el || !f.el.value.trim());
  if (missing.length) {
    missing.forEach(f => { if (f.el) { f.el.setAttribute('aria-invalid', 'true'); f.el.focus(); } });
    // Focus the first invalid field
    if (missing[0].el) missing[0].el.focus();
    if (errorEl) {
      errorEl.textContent = 'Please fill in all required fields.';
      errorEl.style.display = 'block';
    }
    return;
  }

  // Gather form data
  const data = {
    name:    form.querySelector('#name').value.trim(),
    email:   form.querySelector('#email').value.trim(),
    company: form.querySelector('#company').value.trim(),
    message: form.querySelector('#message').value.trim(),
  };

  // Loading state
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending\u2026';
  }

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.status === 'success') {
      if (formWrap) formWrap.style.display = 'none';
      if (success) success.style.display = 'block';
    } else {
      throw new Error(result.message || 'Something went wrong.');
    }
  } catch (err) {
    // Show error, reset button
    if (errorEl) {
      errorEl.textContent = 'There was a problem sending your message. Please try emailing matt.walsh@greenstone.co directly.';
      errorEl.style.display = 'block';
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Send message \u2192';
    }
  }
}
