/* Matt Walsh CXO — site behavior.
   Renders the data in data.js (window.SITE) into the layout, and reproduces
   the interactive behavior from the Figma Make source (tabs, filters,
   toggles, the case-study modal, and the scroll-linked parallax images)
   as plain JS since this is a static multi-page site rather than a React SPA. */

(function () {
  'use strict';

  var SITE = window.SITE || {};

  /* The live production site crops every project screenshot with a plain
     center object-position (background-position: center in its own CSS) —
     no per-image exceptions. Keep this map empty to match that; only add an
     override here if a specific image is confirmed to need one. */
  var IMAGE_POSITION_OVERRIDES = {};
  function imagePositionClass(src) {
    var pos = IMAGE_POSITION_OVERRIDES[src];
    return pos ? 'object-[' + pos + ']' : '';
  }

  var esc = function (s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  /* ---------------- Mobile nav ---------------- */
  function initNav() {
    var btn = document.getElementById('nav-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('hidden') === false;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------------- Parallax (ParallaxImage) ---------------- */
  function initParallax() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (!els.length) return;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    function tick() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var inner = el.querySelector('.parallax-inner');
        if (!inner) return;
        var rect = el.getBoundingClientRect();
        // Mirrors Framer Motion's useScroll offset ["start end", "end start"]:
        // progress 0 when el top hits viewport bottom, 1 when el bottom hits viewport top.
        var start = vh;
        var end = -rect.height;
        var progress = (rect.top - start) / (end - start || 1);
        progress = Math.max(0, Math.min(1, progress));
        var y = -15 + progress * 30; // -15% -> 15%
        inner.style.transform = 'translateY(' + y.toFixed(2) + '%)';
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function parallaxImage(src, alt, boxClasses) {
    return (
      '<div class="' + boxClasses + '" data-parallax>' +
        '<div class="parallax-inner">' +
          '<img src="' + esc(src) + '" alt="' + esc(alt) + '" class="w-full h-full object-cover">' +
        '</div>' +
      '</div>'
    );
  }
  window.parallaxImage = parallaxImage;

  /* ---------------- Home: methodology list ---------------- */
  function renderMethodology() {
    var host = document.getElementById('methodology-list');
    if (!host) return;
    host.innerHTML = SITE.methodology.map(function (item, i) {
      return (
        '<div class="flex flex-col sm:flex-row gap-4 sm:gap-6 py-5 md:py-6 border-t border-border/60 first:border-t-0 sm:first:pt-0 group">' +
          '<div class="text-sm font-bold text-[#004b46] shrink-0 sm:mt-1">' + item.num + '</div>' +
          '<div>' +
            '<h3 class="text-xl md:text-2xl font-bold mb-1.5 text-foreground group-hover:text-[#004b46] transition-colors leading-tight">' + esc(item.title) + '</h3>' +
            '<p class="text-muted-foreground leading-normal">' + esc(item.desc) + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  /* ---------------- Home: Building Organizations (brand/agency tabs) ---------------- */
  function orgCard(item) {
    return (
      '<div class="p-6 md:p-8 border-r border-b border-white/10 flex flex-col hover:bg-white/[0.02] transition-colors group">' +
        '<div class="text-sm font-bold text-[#2dd4bf] mb-4">' + item.num + '</div>' +
        '<h3 class="text-xl font-bold mb-2 text-white group-hover:text-[#2dd4bf] transition-colors">' + esc(item.title) + '</h3>' +
        '<p class="text-white/70 leading-snug text-sm">' + esc(item.desc) + '</p>' +
      '</div>'
    );
  }

  function setOrgTab(tab) {
    var grid = document.getElementById('org-grid');
    if (!grid) return;
    var items = tab === 'agencies' ? SITE.orgAgencies : SITE.orgBrands;
    grid.classList.remove('anim-fade-in');
    void grid.offsetWidth;
    grid.innerHTML = items.map(orgCard).join('');
    grid.classList.add('anim-fade-in');

    var brandBtn = document.getElementById('org-tab-brands');
    var agencyBtn = document.getElementById('org-tab-agencies');
    [brandBtn, agencyBtn].forEach(function (b) { if (b) b.classList.remove('bg-[#2dd4bf]', 'text-[#171c1c]', 'border-[#2dd4bf]'); });
    [brandBtn, agencyBtn].forEach(function (b) { if (b) b.classList.add('bg-transparent', 'text-white/70', 'border-white/20'); });
    var active = tab === 'agencies' ? agencyBtn : brandBtn;
    if (active) {
      active.classList.remove('bg-transparent', 'text-white/70', 'border-white/20');
      active.classList.add('bg-[#2dd4bf]', 'text-[#171c1c]', 'border-[#2dd4bf]');
    }
  }
  window.setOrgTab = setOrgTab;

  function initOrgSection() {
    if (!document.getElementById('org-grid')) return;
    setOrgTab('brands');
  }

  /* ---------------- Home: Clients (B2C / B2B) ---------------- */
  function clientRow(client) {
    return (
      '<div class="py-4 px-4 -mx-4 border-b border-border/40 hover:bg-card/50 transition-colors group cursor-default rounded-xl anim-fade-in-fast">' +
        '<span class="text-base md:text-lg font-bold text-foreground group-hover:text-[#004b46] transition-colors">' + esc(client.name) + '</span>' +
      '</div>'
    );
  }

  function renderClientColumn(kind) {
    var listHost = document.getElementById(kind + '-client-list');
    if (!listHost) return;
    var select = document.getElementById(kind + '-filter');
    var value = select ? select.value : 'featured';
    var clients = kind === 'b2c' ? SITE.b2cClients : SITE.b2bClients;
    var filtered = value === 'featured' ? clients.filter(function (c) { return c.featured; }) : clients.filter(function (c) { return c.category === value; });
    listHost.innerHTML = filtered.length
      ? filtered.map(clientRow).join('')
      : '<p class="text-sm font-medium text-muted-foreground py-8">No projects in this category yet.</p>';
  }
  window.renderClientColumn = renderClientColumn;

  function initClientColumns() {
    ['b2c', 'b2b'].forEach(function (kind) {
      var select = document.getElementById(kind + '-filter');
      var categories = kind === 'b2c' ? SITE.b2cCategories : SITE.b2bCategories;
      if (select) {
        select.innerHTML = categories.map(function (c) { return '<option value="' + esc(c.value) + '">' + esc(c.label) + '</option>'; }).join('');
        select.addEventListener('change', function () { renderClientColumn(kind); });
      }
      renderClientColumn(kind);
    });
  }

  /* ---------------- Recognition: testimonials ---------------- */
  function testimonialCard(t) {
    return (
      '<div class="bg-card/50 p-6 md:p-8 rounded-3xl border border-border/50 flex flex-col h-full hover:bg-card transition-colors">' +
        '<svg class="w-8 h-8 text-[#004b46] mb-5 opacity-30 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/></svg>' +
        '<p class="text-lg md:text-xl text-foreground leading-normal mb-6 flex-1 italic">&ldquo;' + esc(t.quote) + '&rdquo;</p>' +
        '<div class="mt-auto">' +
          '<p class="font-bold text-foreground text-lg">' + esc(t.name) + '</p>' +
          '<p class="text-sm font-medium text-muted-foreground mt-1">' + esc(t.title) + (t.company ? ', ' + esc(t.company) : '') + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function testimonialRow(t) {
    return (
      '<div class="py-6 border-t border-border/50">' +
        '<p class="text-lg md:text-xl text-foreground italic leading-normal mb-4 max-w-4xl">&ldquo;' + esc(t.quote) + '&rdquo;</p>' +
        '<div>' +
          '<p class="font-bold text-foreground text-base">' + esc(t.name) + '</p>' +
          '<p class="text-sm font-medium text-muted-foreground mt-1">' + esc(t.title) + (t.company ? ', ' + esc(t.company) : '') + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  var showAllTestimonials = false;
  function renderTestimonials() {
    var grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    grid.innerHTML = SITE.testimonials.slice(0, 4).map(testimonialCard).join('');

    var extra = document.getElementById('testimonials-extra');
    var btn = document.getElementById('testimonials-toggle');
    if (extra) {
      if (showAllTestimonials) {
        extra.classList.remove('hidden');
        extra.classList.add('anim-fade-slide-down');
        extra.innerHTML = SITE.testimonials.slice(4).map(testimonialRow).join('');
      } else {
        extra.classList.add('hidden');
        extra.innerHTML = '';
      }
    }
    if (btn) {
      btn.innerHTML = (showAllTestimonials ? 'Show fewer testimonials' : 'View all testimonials') +
        '<svg class="w-4 h-4 ml-2 inline transition-transform ' + (showAllTestimonials ? '-rotate-90' : 'rotate-90') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
    }
  }

  function initTestimonials() {
    if (!document.getElementById('testimonials-grid')) return;
    renderTestimonials();
    var btn = document.getElementById('testimonials-toggle');
    if (btn) btn.addEventListener('click', function () { showAllTestimonials = !showAllTestimonials; renderTestimonials(); });
  }

  /* ---------------- Recognition: awards ---------------- */
  var showAllAwards = false;
  function awardRow(a) {
    return (
      '<div class="py-5 md:py-6 border-b border-white/10 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-start hover:bg-white/[0.02] transition-colors px-4 -mx-4 rounded-xl">' +
        '<div class="font-bold text-white text-lg md:col-span-3">' + esc(a.show) + '</div>' +
        '<div class="text-white/80 font-medium md:col-span-3"><span class="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest uppercase">' + esc(a.prize) + '</span></div>' +
        '<div class="text-white/90 md:col-span-4 font-medium">' + esc(a.project) + '</div>' +
        '<div class="text-[#2dd4bf] text-sm md:text-right md:col-span-2 font-medium tracking-wide uppercase">' + esc(a.category) + '</div>' +
      '</div>'
    );
  }

  function renderAwards() {
    var host = document.getElementById('awards-list');
    if (!host) return;
    var list = showAllAwards ? SITE.awards : SITE.awards.slice(0, 8);
    host.innerHTML = list.map(awardRow).join('');
    var btn = document.getElementById('awards-toggle');
    if (btn) {
      btn.innerHTML = (showAllAwards ? 'Show fewer awards' : 'View full list') +
        '<svg class="w-4 h-4 ml-2 inline transition-transform ' + (showAllAwards ? '-rotate-90' : 'rotate-90') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
    }
  }

  function initAwards() {
    if (!document.getElementById('awards-list')) return;
    renderAwards();
    var btn = document.getElementById('awards-toggle');
    if (btn) btn.addEventListener('click', function () { showAllAwards = !showAllAwards; renderAwards(); });
  }

  /* ---------------- Projects (work.html) ---------------- */
  var projectCategories = ['MOST RECENT', 'RESEARCH & STRATEGY', 'DIGITAL PLATFORMS', 'BRANDING', 'E-COMMERCE', 'ADVERTISING', 'SHOW ALL'];
  var activeProjectTab = 'MOST RECENT';
  // Matches the old production site's behavior: these three category tabs
  // shuffle their five most-recent projects on every render (Fisher-Yates,
  // top slice only); the rest of the list stays in chronological order.
  // E-Commerce and Advertising were never part of that shuffle on the old
  // site, so they stay purely chronological here too.
  var FEATURED_SHUFFLE_TABS = ['RESEARCH & STRATEGY', 'DIGITAL PLATFORMS', 'BRANDING'];
  // The current computed list for activeProjectTab, cached so the grid and
  // the case-study modal's prev/next nav agree on order (recomputing would
  // re-shuffle and desync the two).
  var currentProjectsList = [];

  function tabButton(tab, active, extraClass) {
    return (
      '<button data-tab="' + esc(tab) + '" class="' + (extraClass || '') + ' px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ' +
      (active ? 'bg-[#004b46] text-white border-[#004b46]' : 'bg-transparent text-muted-foreground border-border/50 hover:border-border hover:text-foreground') +
      '">' + esc(tab) + '</button>'
    );
  }

  function renderProjectTabs() {
    ['project-tabs-top', 'project-tabs-bottom'].forEach(function (id) {
      var host = document.getElementById(id);
      if (!host) return;
      host.innerHTML = projectCategories.map(function (tab) { return tabButton(tab, tab === activeProjectTab); }).join('');
    });
  }

  function projectCard(project) {
    var isExternal = project.link && project.link !== 'null' && project.link !== '#';
    var isModal = project.caseStudyId && project.caseStudyId !== 'null';
    var footer;
    if (isExternal) {
      footer = '<span class="flex items-center gap-1 group-hover:text-[#004b46] transition-colors">Launch Case Study <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></span>';
    } else if (isModal) {
      footer = '<span class="flex items-center gap-1 group-hover:text-[#004b46] transition-colors">View Project Details <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>';
    } else {
      footer = '<span class="text-muted-foreground/50">Details upon request</span>';
    }

    var inner = (
      '<div class="relative aspect-[16/10] overflow-hidden bg-secondary border-b border-border/50">' +
        '<img src="' + esc(project.image) + '" alt="' + esc(project.title) + '" loading="lazy" class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 ' + imagePositionClass(project.image) + '">' +
        '<div class="absolute inset-0 bg-[#004b46]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>' +
      '</div>' +
      '<div class="p-6 md:p-8 flex flex-col flex-1">' +
        '<div class="flex items-center gap-3 text-xs font-bold tracking-widest text-[#004b46] uppercase mb-3"><span>' + esc(project.client) + '</span></div>' +
        '<h3 class="text-2xl font-bold mb-4 text-foreground group-hover:text-[#004b46] transition-colors leading-tight">' + esc(project.title) + '</h3>' +
        '<p class="text-muted-foreground leading-normal mb-8 flex-1">' + esc(project.desc) + '</p>' +
        '<div class="flex items-center gap-4 text-xs font-bold tracking-widest text-foreground uppercase mt-auto pt-4 border-t border-border/50">' +
          '<span>' + esc(project.year) + '</span><span class="w-1 h-1 rounded-full bg-foreground/30"></span>' + footer +
        '</div>' +
      '</div>'
    );

    var cls = 'group cursor-pointer flex flex-col border border-border/50 bg-card/50 hover:bg-card transition-colors duration-300';
    if (isExternal) {
      return '<a href="' + esc(project.link) + '" target="_blank" rel="noopener noreferrer" class="' + cls + '">' + inner + '</a>';
    }
    if (isModal) {
      return '<div class="' + cls + '" data-open-case-study="' + esc(project.caseStudyId) + '">' + inner + '</div>';
    }
    return '<div class="' + cls + '">' + inner + '</div>';
  }

  function computeFilteredProjects() {
    if (activeProjectTab === 'SHOW ALL') return SITE.projects;
    if (activeProjectTab === 'MOST RECENT') return SITE.projects.slice(0, 10);

    var items = SITE.projects.filter(function (p) { return p.categories && p.categories.indexOf(activeProjectTab) !== -1; });
    items = items.slice().sort(function (a, b) { return (b.sortYear || 0) - (a.sortYear || 0); });

    if (FEATURED_SHUFFLE_TABS.indexOf(activeProjectTab) !== -1 && items.length > 1) {
      var topCount = Math.min(5, items.length);
      var top = items.slice(0, topCount);
      var rest = items.slice(topCount);
      // Fisher-Yates shuffle on the top slice only — matches the old site.
      for (var s = top.length - 1; s > 0; s--) {
        var r = Math.floor(Math.random() * (s + 1));
        var tmp = top[s]; top[s] = top[r]; top[r] = tmp;
      }
      items = top.concat(rest);
    }
    return items;
  }

  // Builds the old site's alternating 3/2/3/2… row layout (each row its own
  // grid so a short final row doesn't stretch to fill a column it doesn't
  // have items for), keeping the current project-card markup/styling as-is.
  function buildAlternatingGrid(items) {
    var html = '';
    var cols = 3;
    var i = 0;
    while (i < items.length) {
      var rowSize = Math.min(cols, items.length - i);
      var gridCls = 'grid gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-12 ' + (cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2');
      html += '<div class="' + gridCls + '">';
      for (var j = 0; j < rowSize; j++) html += projectCard(items[i + j]);
      html += '</div>';
      i += rowSize;
      cols = cols === 3 ? 2 : 3;
    }
    return html;
  }

  function renderProjectsGrid() {
    var host = document.getElementById('projects-grid');
    if (!host) return;
    currentProjectsList = computeFilteredProjects();

    if (activeProjectTab === 'MOST RECENT' || activeProjectTab === 'SHOW ALL') {
      host.className = 'grid md:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-12';
      host.innerHTML = currentProjectsList.map(projectCard).join('');
    } else {
      host.className = 'flex flex-col gap-10 md:gap-12';
      host.innerHTML = buildAlternatingGrid(currentProjectsList);
    }

    host.querySelectorAll('[data-open-case-study]').forEach(function (el) {
      el.addEventListener('click', function () { openCaseStudy(el.getAttribute('data-open-case-study')); });
    });
    renderProjectTabs();
  }

  function initProjects() {
    if (!document.getElementById('projects-grid')) return;
    renderProjectsGrid();
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tab]');
      if (!btn || !btn.closest('#project-tabs-top, #project-tabs-bottom')) return;
      var fromBottom = !!btn.closest('#project-tabs-bottom');
      activeProjectTab = btn.getAttribute('data-tab');
      renderProjectsGrid();
      if (fromBottom) window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Case study modal ---------------- */
  function modalProjectsList() {
    // Reuse the already-rendered (and, for shuffled tabs, already-ordered)
    // list rather than recomputing — recomputing would re-shuffle and put
    // prev/next out of sync with what's on screen behind the modal.
    return currentProjectsList.filter(function (p) { return p.caseStudyId && p.caseStudyId !== 'null'; });
  }

  function openCaseStudy(id) {
    var cs = SITE.caseStudies[id];
    if (!cs) return;
    var modal = document.getElementById('case-study-modal');
    if (!modal) return;
    modal.dataset.activeId = id;

    document.getElementById('cs-client').textContent = cs.client;
    document.getElementById('cs-title').textContent = cs.title;

    // Image column: matches the old site's behavior — every image the
    // project has gets shown, stacked; if there's a fuller write-up on
    // greenstone.co, the FIRST image (only) carries a "Launch Case Study"
    // bar link instead of silently dropping that link on the floor.
    var images = (cs.images && cs.images.length) ? cs.images : [''];
    var imagesHTML = images.map(function (src, i) {
      var imgTag = '<img src="' + esc(src) + '" alt="' + esc(cs.title) + (i === 0 ? '' : ' screenshot') + '" loading="lazy" class="w-full h-auto block ' + imagePositionClass(src) + '">';
      if (i === 0 && cs.link) {
        return (
          '<a href="' + esc(cs.link) + '" target="_blank" rel="noopener noreferrer" class="group block relative rounded-2xl overflow-hidden shadow-sm">' +
            imgTag +
            '<div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-primary group-hover:bg-primary/90 transition-colors px-6 py-4">' +
              '<span class="text-xs font-bold tracking-widest text-white uppercase">Launch Case Study on GreenStone.co</span>' +
              '<span class="shrink-0 w-8 h-8 rounded-full border border-white/40 group-hover:border-white group-hover:bg-white/15 transition-colors flex items-center justify-center">' +
                '<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>' +
              '</span>' +
            '</div>' +
          '</a>'
        );
      }
      return '<div class="rounded-2xl overflow-hidden shadow-sm">' + imgTag + '</div>';
    }).join('');
    document.getElementById('cs-images-col').innerHTML = imagesHTML;

    document.getElementById('cs-overview').innerHTML = cs.overview || '';
    document.getElementById('cs-type').textContent = cs.type || '';
    document.getElementById('cs-agency').textContent = cs.agency || '';
    document.getElementById('cs-year').textContent = cs.year || '';
    var roleWrap = document.getElementById('cs-role-wrap');
    document.getElementById('cs-role').innerHTML = cs.role || '';
    roleWrap.classList.toggle('hidden', !cs.role);

    var recWrap = document.getElementById('cs-recognition-wrap');
    var recList = document.getElementById('cs-recognition-list');
    if (cs.recognition && cs.recognition.length) {
      recWrap.classList.remove('hidden');
      recList.innerHTML = cs.recognition.map(function (r) {
        return '<li class="flex items-start gap-3 text-muted-foreground"><svg class="w-5 h-5 text-[#004b46] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg><span>' + r + '</span></li>';
      }).join('');
    } else {
      recWrap.classList.add('hidden');
      recList.innerHTML = '';
    }

    updateCaseStudyNav();
    modal.classList.remove('hidden');
    modal.querySelector('.cs-panel').classList.remove('anim-zoom-in');
    void modal.offsetWidth;
    modal.querySelector('.cs-panel').classList.add('anim-zoom-in');
    document.body.classList.add('overflow-hidden');
  }
  window.openCaseStudy = openCaseStudy;

  function updateCaseStudyNav() {
    var modal = document.getElementById('case-study-modal');
    var list = modalProjectsList();
    var idx = list.findIndex(function (p) { return p.caseStudyId === modal.dataset.activeId; });
    var prevBtn = document.getElementById('cs-prev');
    var nextBtn = document.getElementById('cs-next');
    var prev = idx > 0 ? list[idx - 1] : null;
    var next = idx !== -1 && idx < list.length - 1 ? list[idx + 1] : null;
    prevBtn.disabled = !prev;
    nextBtn.disabled = !next;
    prevBtn.onclick = function () { if (prev) openCaseStudy(prev.caseStudyId); };
    nextBtn.onclick = function () { if (next) openCaseStudy(next.caseStudyId); };
  }

  function closeCaseStudy() {
    var modal = document.getElementById('case-study-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.dataset.activeId = '';
    document.body.classList.remove('overflow-hidden');
  }
  window.closeCaseStudy = closeCaseStudy;

  function initCaseStudyModal() {
    var modal = document.getElementById('case-study-modal');
    if (!modal) return;
    var backdrop = modal.querySelector('.cs-backdrop');
    var closeBtn = document.getElementById('cs-close');
    if (backdrop) backdrop.addEventListener('click', closeCaseStudy);
    if (closeBtn) closeBtn.addEventListener('click', closeCaseStudy);
    document.addEventListener('keydown', function (e) {
      if (modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeCaseStudy();
      if (e.key === 'ArrowLeft') document.getElementById('cs-prev').click();
      if (e.key === 'ArrowRight') document.getElementById('cs-next').click();
    });
  }

  /* ---------------- Thought leadership ---------------- */
  function renderFeaturedThoughts() {
    var host = document.getElementById('featured-thoughts');
    if (!host) return;
    host.innerHTML = SITE.featuredThoughts.map(function (item) {
      return (
        '<div class="flex flex-col md:flex-row border-b border-border/50 bg-card/50 hover:bg-card transition-colors duration-300 group">' +
          '<div class="w-full md:w-1/3 aspect-[3/2] overflow-hidden shrink-0 border-r border-border/50 bg-secondary relative">' +
            '<img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">' +
            '<div class="absolute inset-0 bg-[#004b46]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>' +
          '</div>' +
          '<div class="p-6 md:p-8 lg:p-10 flex flex-col justify-center flex-1">' +
            '<div class="flex items-center gap-3 text-xs font-bold tracking-widest uppercase mb-4 text-[#004b46]">' +
              '<span class="bg-[#004b46] text-white px-3 py-1 rounded-full">' + esc(item.type) + '</span>' +
              '<span class="text-muted-foreground">' + esc(item.source) + '</span>' +
            '</div>' +
            '<h3 class="text-2xl md:text-3xl font-bold mb-3 text-foreground group-hover:text-[#004b46] transition-colors leading-tight max-w-3xl">' + esc(item.title) + '</h3>' +
            '<p class="text-muted-foreground leading-normal mb-6 max-w-4xl">' + esc(item.excerpt) + '</p>' +
            '<a href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-xs font-bold tracking-widest text-[#004b46] uppercase mt-auto group-hover:translate-x-1 transition-transform w-fit">' + esc(item.linkText) + ' <svg class="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></a>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderThoughtsList() {
    var host = document.getElementById('thoughts-list');
    if (!host) return;
    host.innerHTML = SITE.thoughtsList.map(function (item) {
      var badgeClass = item.type === 'ARTICLE' ? 'bg-[#004b46]' : item.type === 'PODCAST' ? 'bg-[#966b33]' : 'bg-foreground text-background';
      return (
        '<a href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer" class="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 border-b border-border/50 hover:bg-card transition-colors group">' +
          '<h3 class="text-lg font-bold text-foreground group-hover:text-[#004b46] transition-colors mb-4 sm:mb-0 max-w-3xl pr-4">' + esc(item.title) + '</h3>' +
          '<div class="flex items-center gap-4 text-xs font-medium shrink-0">' +
            '<span class="px-3 py-1 rounded-full font-bold tracking-wider text-white ' + badgeClass + '">' + esc(item.type) + '</span>' +
            '<span class="text-muted-foreground min-w-[140px] text-right">' + esc(item.source) + '</span>' +
          '</div>' +
        '</a>'
      );
    }).join('');
  }

  function initThoughtLeadership() {
    if (!document.getElementById('featured-thoughts')) return;
    renderFeaturedThoughts();
    renderThoughtsList();
  }

  /* ---------------- Contact form (real Apps Script submission) ---------------- */
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycby23JRcvVar1LkHf6whcYAWQ3K5wkSqodhqntahlcxjqd6WfxgVv88jGGHBZl_iEeJI8A/exec';

  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('submitBtn');
      var formWrap = document.getElementById('form-wrap');
      var success = document.getElementById('successState');
      var errorEl = document.getElementById('formError');

      if (errorEl) errorEl.classList.add('hidden');
      form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });

      var nameEl = form.querySelector('#name');
      var emailEl = form.querySelector('#email');
      var messageEl = form.querySelector('#message');
      var required = [nameEl, emailEl, messageEl];
      var missing = required.filter(function (el) { return !el || !el.value.trim(); });
      if (missing.length) {
        missing.forEach(function (el) { if (el) el.setAttribute('aria-invalid', 'true'); });
        if (missing[0]) missing[0].focus();
        if (errorEl) { errorEl.textContent = 'Please fill in all required fields.'; errorEl.classList.remove('hidden'); }
        return;
      }

      var data = {
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        company: form.querySelector('#company') ? form.querySelector('#company').value.trim() : '',
        message: messageEl.value.trim()
      };

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      }).then(function (res) { return res.json(); }).then(function (result) {
        if (result.status === 'success') {
          if (formWrap) formWrap.classList.add('hidden');
          if (success) success.classList.remove('hidden');
        } else {
          throw new Error(result.message || 'Something went wrong.');
        }
      }).catch(function () {
        if (errorEl) {
          errorEl.textContent = 'There was a problem sending your message. Please try emailing matt.walsh@greenstone.co directly.';
          errorEl.classList.remove('hidden');
        }
        if (btn) { btn.disabled = false; btn.innerHTML = 'Send Message'; }
      });
    });
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    renderMethodology();
    initOrgSection();
    initClientColumns();
    initTestimonials();
    initAwards();
    initProjects();
    initCaseStudyModal();
    initThoughtLeadership();
    initContactForm();
    initParallax();
  });
})();
