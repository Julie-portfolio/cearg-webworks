// Hide loader once page fully loads
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

// Preserve exact spacing: wrap words, keep spaces as text nodes
function splitIntoWordsPreserveSpaces(el) {
  const text = el.textContent;
  const tokens = text.match(/(\s+|[^\s]+)/g) || [text]; // keep spaces and words
  el.textContent = '';
  tokens.forEach((t) => {
    if (/^\s+$/.test(t)) {
      el.appendChild(document.createTextNode(t)); // keep spaces exactly
    } else {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = t;
      el.appendChild(span);
    }
  });
}

// Apply to all elements marked for word reveal
document.querySelectorAll('.reveal-words').forEach(splitIntoWordsPreserveSpaces);

// IntersectionObserver for fast section reveals
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const section = e.target;
      section.classList.add('in');

      // Stagger cards
      section.querySelectorAll('.card').forEach((card, idx) => {
        const order = Number(card.getAttribute('data-stagger') ?? idx);
        card.style.transitionDelay = `${order * 90}ms`;
        requestAnimationFrame(() => card.classList.add('in'));
      });

      // Stagger stats
      section.querySelectorAll('.stat').forEach((stat, idx) => {
        stat.style.transitionDelay = `${idx * 120}ms`;
        requestAnimationFrame(() => stat.classList.add('in'));
      });

      // Word-by-word reveal inside this section (preserving spacing)
      const words = section.querySelectorAll('.word');
      words.forEach((w, i) => {
        setTimeout(() => w.classList.add('show'), i * 40);
      });

      // Start counters in About section
      if (section.id === 'about') startCounters(section);
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
);

// Observe .reveal sections
document.querySelectorAll('.reveal').forEach((el) => sectionObserver.observe(el));

// Hero swirl: fade in on load
window.addEventListener('load', () => {
  const swirl = document.querySelector('.hero-swirl');
  if (swirl) {
    swirl.style.opacity = '1';
    swirl.style.transform = 'translate(-50%, -50%) scale(1)';
  }
});

// Swirl parallax on scroll
window.addEventListener('scroll', () => {
  const swirl = document.querySelector('.hero-swirl');
  if (!swirl) return;
  const y = window.scrollY || document.documentElement.scrollTop;
  swirl.style.transform =
    `translate(-50%, calc(-50% + ${y * 0.12}px)) scale(${1 + y * 0.00008}) rotate(${y * 0.008}deg)`;
});

// Smooth scroll
document.documentElement.style.scrollBehavior = 'smooth';

// Stat counters
function startCounters(scope) {
  const nums = scope.querySelectorAll('.num');
  nums.forEach((el) => {
    const target = Number(el.dataset.target);
    const isLarge = target > 1000;
    const duration = 1200;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const value = Math.floor(target * eased);
      el.textContent = isLarge ? value.toLocaleString('en-US') : String(value);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
