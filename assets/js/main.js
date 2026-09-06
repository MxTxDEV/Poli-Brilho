// Loader
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hide'), 400);
});

// Nav background on scroll
const nav = document.getElementById('nav');
const onNavScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
onNavScroll();
window.addEventListener('scroll', onNavScroll, { passive: true });

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
revealEls.forEach((el) => revealObserver.observe(el));

// Product scrollytelling (pinned showcase)
const showcase = document.querySelector('.showcase');
const bottle = document.getElementById('bottle');
const shine = document.querySelector('.bottle__shine');
const steps = document.querySelectorAll('.step');
const isDesktop = () => window.innerWidth > 900;

function updateShowcase() {
  if (!showcase || !isDesktop()) return;

  const rect = showcase.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  const progress = Math.min(Math.max(-rect.top / total, 0), 1);

  const rotate = -18 + progress * 36;
  const scale = 0.88 + progress * 0.22;
  bottle.style.transform = `rotate(${rotate}deg) scale(${scale})`;

  if (shine) {
    shine.setAttribute('transform', `skewX(-18) translate(${progress * 480}, 0)`);
  }

  const stepIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));
  steps.forEach((step, i) => step.classList.toggle('active', i === stepIndex));
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateShowcase();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

window.addEventListener('resize', updateShowcase);
updateShowcase();
