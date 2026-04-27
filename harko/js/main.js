/* ============================================================
   HARKO CONSTRUCTION — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ---- NAV SCROLL EFFECT ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const scrollThreshold = 60;
    const hasHero = document.querySelector('.hero');
    const alwaysScrolled = !hasHero || nav.hasAttribute('data-nav-fixed');

    const handleScroll = () => {
      if (alwaysScrolled) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.toggle('scrolled', window.scrollY > scrollThreshold);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ---- MOBILE NAV TOGGLE ---- */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      const expanded = toggle.classList.contains('active');
      toggle.setAttribute('aria-expanded', expanded);
      document.body.style.overflow = expanded ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        toggle.classList.remove('active');
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }

  /* ---- PARALLAX ---- */
  const parallaxElements = document.querySelectorAll('.hero-img[data-parallax]');
  if (parallaxElements.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--parallax-speed')) || 0.3;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach(el => {
        const rect = el.parentElement.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (inView) {
          const offset = scrollY * speed;
          el.style.transform = `translateY(${offset}px) scale(1.1)`;
        }
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // Set initial scale for parallax images
    parallaxElements.forEach(el => {
      el.style.transform = 'translateY(0) scale(1.1)';
    });
  }

  /* ---- FADE-UP ON SCROLL ---- */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach(el => observer.observe(el));
  }

  /* ---- TESTIMONIAL CAROUSEL ---- */
  const testimonials = [
    {
      quote: '"It was a pleasure working together with Harko to build our dream luxury home. Brad and his team exceeded every expectation with their attention to detail and commitment to quality."',
      name: 'The Johnson Family',
      role: 'Homeowner — Cherry Creek'
    },
    {
      quote: '"Harko transformed our outdated home into a modern masterpiece. The communication throughout the project was outstanding, and the finished product surpassed our vision."',
      name: 'Michael & Sarah Chen',
      role: 'Homeowner — Highlands Ranch'
    },
    {
      quote: '"Brad\'s professionalism and dedication to quality are unmatched. From the initial planning to the final walkthrough, every step was handled with care and precision."',
      name: 'The Williams Family',
      role: 'Homeowner — Boulder'
    }
  ];

  const quoteEl = document.getElementById('t-quote');
  const nameEl = document.getElementById('t-name');
  const roleEl = document.getElementById('t-role');

  if (quoteEl && nameEl && roleEl) {
    let currentTestimonial = 0;

    window.cycleTestimonial = function (dir) {
      currentTestimonial = (currentTestimonial + dir + testimonials.length) % testimonials.length;
      const t = testimonials[currentTestimonial];

      // Fade out
      quoteEl.style.opacity = '0';
      nameEl.style.opacity = '0';
      roleEl.style.opacity = '0';

      setTimeout(() => {
        quoteEl.textContent = t.quote;
        nameEl.textContent = t.name;
        roleEl.textContent = t.role;
        quoteEl.style.opacity = '1';
        nameEl.style.opacity = '1';
        roleEl.style.opacity = '1';
      }, 300);
    };

    // Add transition to testimonial elements
    [quoteEl, nameEl, roleEl].forEach(el => {
      el.style.transition = 'opacity 0.3s ease';
    });
  }

  /* ---- KEN BURNS SLIDESHOW ---- */
  const kbContainer = document.getElementById('kb-slides');
  if (kbContainer) {
    const slides = kbContainer.querySelectorAll('.kb-slide');
    const counter = document.getElementById('kb-counter');
    const progress = document.getElementById('kb-progress-fill');
    const total = slides.length;
    let current = 0;

    if (total > 0) {
      if (counter) counter.textContent = '01 / ' + String(total).padStart(2, '0');

      setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % total;
        slides[current].classList.add('active');

        if (counter) {
          counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
        }

        if (progress) {
          progress.style.animation = 'none';
          progress.offsetHeight; // Force reflow
          progress.style.animation = 'kb-prog 6s linear forwards';
        }
      }, 6000);
    }
  }

  /* ---- SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        // Set focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ---- COUNTER ANIMATION ---- */
  const statNums = document.querySelectorAll('.stat-num[data-value]');
  if (statNums.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = el.getAttribute('data-value');
            const suffix = el.getAttribute('data-suffix') || '';
            const isNumber = !isNaN(parseInt(target));

            if (isNumber) {
              const end = parseInt(target);
              const duration = 1500;
              const start = performance.now();

              const animate = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                const current = Math.round(eased * end);
                el.textContent = current.toLocaleString() + suffix;
                if (progress < 1) requestAnimationFrame(animate);
              };
              requestAnimationFrame(animate);
            } else {
              el.textContent = target + suffix;
            }

            countObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNums.forEach(el => {
      el.textContent = '0' + (el.getAttribute('data-suffix') || '');
      countObserver.observe(el);
    });
  }

})();
