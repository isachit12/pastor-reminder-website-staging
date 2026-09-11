(function () {
  // Only hide [data-reveal] elements once we know this script is actually
  // running — see the .js-gated rules in style.css. If JS fails to load or
  // throws before this line, every section stays at its default (visible)
  // state instead of being stuck at opacity: 0 forever.
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktopMql = window.matchMedia('(min-width: 721px)');

  document.getElementById('year').textContent = new Date().getFullYear();

  // Sticky nav background on scroll
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');
  navToggle.addEventListener('click', function () {
    var open = navMobile.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navMobile.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Scroll-reveal
  if (reduceMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('in-view');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // Laptop dashboard preview (Overview / People / Departments / Leaders &
  // Access): manual-only — a tab click shows that page's screenshot and
  // highlights the button. No timers, no auto-cycling, no offscreen
  // observing; nothing here ever changes on its own.
  var slideshow = document.querySelector('[data-slideshow]');
  if (slideshow) {
    var slides = Array.prototype.slice.call(slideshow.querySelectorAll('[data-slide]'));
    var slideTabs = Array.prototype.slice.call(document.querySelectorAll('[data-slide-tab]'));

    function showSlide(index) {
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === index);
      });
      slideTabs.forEach(function (t, i) {
        t.classList.toggle('is-active', i === index);
        t.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }

    slideTabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        showSlide(i);
      });
    });

    showSlide(0);
  }

  // Subtle parallax on the full-bleed landscape backgrounds — desktop only,
  // capped at 30px of movement, transform-only (no layout impact). Disabled
  // entirely on mobile and when the visitor prefers reduced motion.
  var parallaxLayers = document.querySelectorAll('.parallax-bg');
  if (parallaxLayers.length && !reduceMotion) {
    var MAX_PARALLAX = 30;
    var parallaxTicking = false;

    function applyParallax() {
      var isDesktop = desktopMql.matches;
      parallaxLayers.forEach(function (layer) {
        if (!isDesktop) {
          layer.style.transform = '';
          return;
        }
        var section = layer.parentElement;
        var rect = section.getBoundingClientRect();
        var sectionCenter = rect.top + rect.height / 2;
        var viewportCenter = window.innerHeight / 2;
        // Normalize by half the viewport height so movement stays smooth
        // and bounded regardless of section height, then clamp to ±30px.
        var progress = (sectionCenter - viewportCenter) / (window.innerHeight / 2);
        var offset = Math.max(-MAX_PARALLAX, Math.min(MAX_PARALLAX, progress * MAX_PARALLAX));
        var scale = layer.getAttribute('data-parallax-scale');
        layer.style.transform = scale
          ? 'translateY(' + offset.toFixed(1) + 'px) scale(' + scale + ')'
          : 'translateY(' + offset.toFixed(1) + 'px)';
      });
      parallaxTicking = false;
    }

    function requestParallax() {
      if (parallaxTicking) return;
      parallaxTicking = true;
      window.requestAnimationFrame(applyParallax);
    }

    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    applyParallax();
  }
})();
