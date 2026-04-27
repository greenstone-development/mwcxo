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
//
// Safety rules that prevent copy overlap:
//   1. Heading/text elements are auto-capped at ±MAX_TEXT_OFFSET px.
//   2. The multiplier is capped at 700px (so large viewports don't amplify drift).
//   3. Orb travel is capped so they don't escape their parent sections.
//   4. Lerp factor is kept gentle (0.085) for smooth, controlled easing.

const MAX_TEXT_OFFSET = 8;   // px — absolute max shift for any copy element
const MAX_ORB_OFFSET  = 55;  // px — absolute max float travel for decorative orbs

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
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const type  = el.dataset.parallaxType || 'y';
      // Any heading or element with an explicit cap uses the tight text limit.
      const isText    = /^h[1-6]$/i.test(el.tagName);
      const maxOffset = parseFloat(el.dataset.parallaxMax) || (isText ? MAX_TEXT_OFFSET : 20);
      this.elements.push({ el, speed, type, maxOffset });
    });
  }

  injectOrbs() {
    // Speed signs: positive = drifts down as page scrolls; negative = drifts up.
    // Values kept very small so orbs barely move — they add depth without distraction.
    const orbConfigs = [
      { parent: '.hero-left',  cls: 'orb-teal', size: 280, top: '10%',  left: '-8%',  speed:  0.022 },
      { parent: '.hero-left',  cls: 'orb-gold', size: 180, top: '60%',  right: '5%',  speed: -0.015 },
      { parent: '.what-i-do', cls: 'orb-teal', size: 350, top: '-15%', right: '-10%', speed:  0.028 },
      { parent: '.what-i-do', cls: 'orb-ink',  size: 200, bottom: '5%', left: '20%', speed: -0.018 },
      { parent: '.network',   cls: 'orb-gold', size: 260, top: '20%',  left: '-5%',  speed:  0.025 },
      { parent: '.network',   cls: 'orb-teal', size: 160, bottom: '10%', right: '15%', speed: -0.015 },
      { parent: '.clients',   cls: 'orb-teal', size: 300, top: '-10%', right: '5%',  speed:  0.022 },
      { parent: '.rec-hero',  cls: 'orb-teal', size: 220, top: '30%',  right: '10%', speed:  0.028 },
      { parent: '.cta-band',  cls: 'orb-gold', size: 200, top: '20%',  left: '60%',  speed: -0.022 },
    ];

    orbConfigs.forEach(cfg => {
      const parent = document.querySelector(cfg.parent);
      if (!parent) return;

      const style = getComputedStyle(parent);
      if (style.position === 'static') parent.style.position = 'relative';
      if (style.overflow !== 'hidden') parent.style.overflow = 'hidden';

      const orb = document.createElement('div');
      orb.className = `parallax-orb ${cfg.cls}`;
      orb.style.width  = cfg.size + 'px';
      orb.style.height = cfg.size + 'px';
      if (cfg.top)    orb.style.top    = cfg.top;
      if (cfg.bottom) orb.style.bottom = cfg.bottom;
      if (cfg.left)   orb.style.left   = cfg.left;
      if (cfg.right)  orb.style.right  = cfg.right;

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
    // Gentle lerp — feels smooth without overshooting on fast scrolls
    this.currentScrollY = lerp(this.currentScrollY, this.scrollY, 0.085);

    // ── Transform [data-parallax] copy elements ──────────────────────────────
    // Reference height is capped at 700 so large monitors don't amplify offsets.
    // All offsets are additionally clamped to maxOffset for each element.
    const refHeight = Math.min(this.vh, 700);

    this.elements.forEach(({ el, speed, type, maxOffset }) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > this.vh + 200) return;

      // progress 0→1 as element travels bottom-of-viewport → top-of-viewport
      const progress = (this.vh - rect.top) / (this.vh + rect.height);
      // centered: -1 when entering from bottom, 0 at midpoint, +1 when leaving at top
      const centered = clamp((progress - 0.5) * 2, -1, 1);

      if (type === 'y') {
        const raw    = centered * speed * refHeight;
        const offset = clamp(raw, -maxOffset, maxOffset);
        el.style.transform = `translate3d(0,${offset.toFixed(2)}px,0)`;
      } else if (type === 'scale') {
        // Very tight scale range — centred means no scale, extremes ±speed
        const scale = 1 + clamp(centered * speed, -0.015, 0.015);
        el.style.transform = `scale(${scale.toFixed(4)})`;
      }
    });

    // ── Float decorative orbs ─────────────────────────────────────────────────
    // Orbs use raw (lerped) scrollY rather than viewport-relative progress so
    // they drift continuously — giving a sense of depth without snapping.
    // Travel is capped so they stay within a believable range.
    this.orbs.forEach(({ el, speed }) => {
      const parent = el.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > this.vh + 200) return;

      const raw    = this.currentScrollY * speed;
      const offset = clamp(raw, -MAX_ORB_OFFSET, MAX_ORB_OFFSET);
      el.style.transform = `translate3d(0,${offset.toFixed(2)}px,0)`;
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
      { parent: '.org-grid', children: '.org-card' },
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
    // Gentle zoom only — no y-offset, which avoids a visible content shift
    // on scroll reversal and keeps the image anchored in its container.
    const progress = clamp(window.scrollY / window.innerHeight, 0, 1);
    const scale    = 1 + progress * 0.04;
    this.heroContent.style.transform = `scale(${scale.toFixed(4)})`;
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
  initOrgSection();
});


// ── Building Organizations — Audience Toggle ───
const orgContent = {
  culture: {
    agency: {
      title: 'Building Powerful Cultures',
      body: "The strongest cultures are built on leadership that makes people want to give more than was asked. After 12 years inspiring 200+ people at Green Stone, I know how to bring that energy to any mission."
    },
    brand: {
      title: 'Building Powerful Cultures',
      body: "Great customer experiences start with great internal cultures, and I've spent 12 years building one from scratch. I help brand teams create the kind of culture that actually shows up in the experience itself."
    }
  },
  talent: {
    agency: {
      title: 'Identifying & Evolving Talent',
      body: "I have a sharp eye for talent, and I'd put the teams I've built up against just about anyone in CX, strategy, research, digital marketing, and product design. I'm particularly good at spotting it before it's fully formed."
    },
    brand: {
      title: 'Identifying & Evolving Talent',
      body: "I've spent 20+ years developing talent across disciplines and bring that same eye to helping brands identify what they have, what they need, and how to close the gap."
    }
  },
  remote: {
    agency: {
      title: 'Maximizing Decentralized Workforces',
      body: "Green Stone has been fully distributed since 2014, and that journey gave me practical cultural and operational tools for any agency navigating remote, hybrid, or multi-office realities."
    },
    brand: {
      title: 'Maximizing Decentralized Workforces',
      body: "I've spent 12 years building a fully distributed company that performs at the level of any in-person team, and I understand the levers that make it work for large, decentralized brand organizations too."
    }
  },
  trust: {
    agency: {
      title: 'Earning Client Trust',
      body: "At Green Stone I owned every client relationship, and I got very good at building the kind of trust that leads to repeat work, open dialogue, and clients who bring you with them when they move on."
    },
    brand: {
      title: 'Earning Stakeholder Trust',
      body: "I know how to earn alignment rather than mandate it, moving ambitious work forward across marketing, product, operations, and the C-suite without leaving people behind."
    }
  },
  bizdev: {
    agency: {
      title: 'Business Development',
      body: "Twelve years of pitching has made me pretty good at it, and I've built a network across marketing leadership that could open meaningful doors."
    },
    brand: {
      title: 'Network & Relationships',
      body: "Two decades of agency relationships have given me a network most brand-side leaders don't have, and I can accelerate the search for the right partners considerably."
    }
  },
  perspective: {
    agency: {
      title: 'Keeping Perspective',
      body: "Having carried the line of credit at Green Stone for over a decade, I bring a grounded, bottom-line sensibility to decisions that only comes from having done it yourself."
    },
    brand: {
      title: 'Keeping Perspective',
      body: "Strategic ambition and creative vision are only worth something if they move the business. The work needs to be inspiring and effective."
    }
  }
};

let currentOrgAudience = 'agency';

function initOrgSection() {
  document.querySelectorAll('.org-card').forEach(card => {
    const key = card.dataset.key;
    const content = orgContent[key];
    if (!content) return;
    card.querySelector('.org-card-title').textContent = content.agency.title;
    card.querySelector('.org-card-body').textContent = content.agency.body;
  });
}

function setOrgAudience(audience) {
  if (audience === currentOrgAudience) return;
  currentOrgAudience = audience;

  document.querySelectorAll('.org-toggle-btn').forEach(btn => {
    const isActive = btn.id === 'toggle-' + audience;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  document.querySelectorAll('.org-card').forEach(card => {
    const key = card.dataset.key;
    const content = orgContent[key];
    if (!content) return;
    const body = card.querySelector('.org-card-body');
    const title = card.querySelector('.org-card-title');
    body.classList.add('fading');
    setTimeout(() => {
      title.textContent = content[audience].title;
      body.textContent = content[audience].body;
      body.classList.remove('fading');
    }, 200);
  });
}

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
