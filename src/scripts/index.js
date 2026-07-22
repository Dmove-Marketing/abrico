/* Scripts extraídos de index.html */

/* ==========================================================================
   ESPAÇO ABRICÓ — interações
   Nav, menu mobile, scroll-reveal, carrosséis, testemunhos, parallax,
   lightbox e validação simples do formulário de contato.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Generic carousels ---------------- */
  function initCarousel(root) {
    var viewport = root.querySelector('.carousel__viewport');
    var track = root.querySelector('[data-track]');
    var slides = Array.prototype.slice.call(track.children);
    var prevBtn = root.querySelector('[data-prev]');
    var nextBtn = root.querySelector('[data-next]');
    var idx = 0;

    function goTo(i) {
      idx = (i + slides.length) % slides.length;
      slides[idx].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
    }

    viewport.addEventListener('scroll', function () {
      var closest = 0, min = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft - viewport.scrollLeft);
        if (d < min) { min = d; closest = i; }
      });
      idx = closest;
    }, { passive: true });

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(idx + 1); });
  }
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  /* ---------------- Testimonials slider ---------------- */
  var testi = document.querySelector('[data-testi]');
  if (testi) {
    var tSlides = Array.prototype.slice.call(testi.querySelectorAll('.testi__slide'));
    var tDotsWrap = testi.querySelector('[data-testi-dots]');
    var tIndex = 0;
    tSlides.forEach(function (s, i) {
      var dot = document.createElement('button');
      dot.className = 'testi__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Depoimento ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); resetAuto(); });
      tDotsWrap.appendChild(dot);
    });
    var tDots = Array.prototype.slice.call(tDotsWrap.children);

    function goTo(i) {
      tSlides[tIndex].classList.remove('is-active');
      tDots[tIndex].classList.remove('is-active');
      tIndex = i;
      tSlides[tIndex].classList.add('is-active');
      tDots[tIndex].classList.add('is-active');
    }
    function next() { goTo((tIndex + 1) % tSlides.length); }

    var autoTimer;
    function startAuto() {
      if (reduceMotion) return;
      autoTimer = setInterval(next, 6500);
    }
    function resetAuto() { clearInterval(autoTimer); startAuto(); }
    startAuto();
    testi.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
    testi.addEventListener('mouseleave', startAuto);
  }

  /* ---------------- Parallax (Estrutura) ---------------- */
  var parallaxEl = document.querySelector('[data-parallax]');
  if (parallaxEl && !reduceMotion) {
    var img = parallaxEl.querySelector('img');
    var section = parallaxEl.closest('section');
    var raf = false;
    function updateParallax() {
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) { raf = false; return; }
      var progress = (vh - rect.top) / (vh + rect.height); /* 0 -> 1 */
      var shift = (progress - 0.5) * 60; /* px range */
      img.style.transform = 'translateY(' + shift.toFixed(1) + 'px)';
      raf = false;
    }
    window.addEventListener('scroll', function () {
      if (!raf) { window.requestAnimationFrame(updateParallax); raf = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------------- Lightbox (todas as seções com fotos, exceto Hero e Celebração) ---------------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lbPrevBtn = lightbox.querySelector('[data-lightbox-prev]');
  var lbNextBtn = lightbox.querySelector('[data-lightbox-next]');
  var lbGroups = {};
  var lbCurrentGroup = null;
  var lbIndex = 0;

  document.querySelectorAll('[data-lightbox]').forEach(function (item) {
    var groupEl = item.closest('[data-lightbox-group]');
    var groupName = groupEl ? groupEl.getAttribute('data-lightbox-group') : 'default';
    if (!lbGroups[groupName]) lbGroups[groupName] = [];
    var idx = lbGroups[groupName].length;
    lbGroups[groupName].push(item);
    item.addEventListener('click', function () { openLightbox(groupName, idx); });
  });

  function openLightbox(groupName, i) {
    lbCurrentGroup = groupName;
    lbIndex = i;
    renderLightbox();
    var multi = lbGroups[lbCurrentGroup].length > 1;
    lbPrevBtn.style.display = multi ? '' : 'none';
    lbNextBtn.style.display = multi ? '' : 'none';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function renderLightbox() {
    var items = lbGroups[lbCurrentGroup];
    var img = items[lbIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function lbStep(dir) {
    var items = lbGroups[lbCurrentGroup];
    lbIndex = (lbIndex + dir + items.length) % items.length;
    renderLightbox();
  }

  lightbox.querySelector('[data-lightbox-close]').addEventListener('click', closeLightbox);
  lbPrevBtn.addEventListener('click', function () { lbStep(-1); });
  lbNextBtn.addEventListener('click', function () { lbStep(1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbStep(-1);
    if (e.key === 'ArrowRight') lbStep(1);
  });

})();