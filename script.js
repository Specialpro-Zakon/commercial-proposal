/* ============================================================
   Zakon.kz × Яндекс 360 — интерактив
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Прогресс скролла + фон навигации ---------- */
const progressBar = document.getElementById('progressBar');
const nav = document.getElementById('nav');

function onScroll() {
  const scrolled = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + '%';
  nav.classList.toggle('scrolled', scrolled > 40);
  updateActiveLink();
  updateParallax();
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Подсветка активного пункта меню ---------- */
const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...document.querySelectorAll('.nav-links a')];

function updateActiveLink() {
  const pos = window.scrollY + window.innerHeight * 0.32;
  let current = '';
  for (const s of sections) {
    if (pos >= s.offsetTop) current = s.id;
  }
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

/* ---------- Параллакс героя и картинки идеи ---------- */
const parallaxEls = [...document.querySelectorAll('[data-parallax]')];

function updateParallax() {
  if (reduceMotion) return;
  for (const el of parallaxEls) {
    const speed = parseFloat(el.dataset.parallax);
    const rect = el.getBoundingClientRect();
    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
    el.style.transform = `translateY(${-offset}px)`;
  }
}

/* ---------- Появление блоков при скролле ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Анимация счётчиков ---------- */
function formatValue(value, format) {
  switch (format) {
    case 'space':
      return Math.round(value).toLocaleString('ru-RU').replace(/ /g, ' ');
    case 'decimal':
      return value.toFixed(2).replace('.', ',');
    case 'time': {
      // хранится в секундах: 270 -> 4:30
      const total = Math.round(value);
      const min = Math.floor(total / 60);
      const sec = total % 60;
      return `${min}:${String(sec).padStart(2, '0')}`;
    }
    default:
      return String(Math.round(value));
  }
}

function runCounter(el) {
  const target = parseFloat(el.dataset.target);
  const format = el.dataset.format || 'plain';

  if (reduceMotion) {
    el.textContent = formatValue(target, format);
    return;
  }

  const duration = 1900;
  const start = performance.now();

  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    // easeOutExpo — быстрый разгон, мягкая остановка
    const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    el.textContent = formatValue(target * eased, format);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      runCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ---------- Табы: варианты кампаний ---------- */
const tabs = [...document.querySelectorAll('.tab')];
const slider = document.getElementById('tabSlider');

function moveSlider(tab) {
  if (!slider || window.innerWidth <= 620) return;
  slider.style.width = tab.offsetWidth + 'px';
  slider.style.transform = `translateX(${tab.offsetLeft - 6}px)`;
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    moveSlider(tab);

    document.querySelectorAll('.campaign').forEach(c => c.classList.remove('active'));
    const panel = document.getElementById(tab.dataset.tab);
    panel.classList.add('active');

    // счётчики внутри вкладки, которые ещё не запускались
    panel.querySelectorAll('.counter').forEach(el => {
      if (el.textContent === '0') runCounter(el);
    });
  });
});

window.addEventListener('load', () => {
  const active = document.querySelector('.tab.active');
  if (active) moveSlider(active);
});
window.addEventListener('resize', () => {
  const active = document.querySelector('.tab.active');
  if (active) moveSlider(active);
});

/* ---------- 3D-наклон карточек за курсором ---------- */
if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `translateY(-8px) perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ---------- Медиаплан: подсказка о горизонтальной прокрутке ---------- */
document.querySelectorAll('.table-scroll').forEach(box => {
  const card = box.closest('.table-card');

  function update() {
    const overflow = box.scrollWidth - box.clientWidth;
    card.classList.toggle('scrollable', overflow > 4);
    card.classList.toggle('at-end', box.scrollLeft >= overflow - 4);
  }

  box.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  update();
});

/* ---------- Мобильное меню ---------- */
const burger = document.getElementById('burger');
const navLinksBox = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinksBox.classList.toggle('open');
});
navLinks.forEach(a => a.addEventListener('click', () => {
  burger.classList.remove('open');
  navLinksBox.classList.remove('open');
}));

onScroll();
