const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '打开导航菜单');
}

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '打开导航菜单');
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...navigation.querySelectorAll('a')];

const petButton = document.querySelector('.pet-button');
const petReply = document.querySelector('.pet-reply');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (petButton && petReply) {
  const replies = ['喵，收到你的摸摸啦。', '伸个懒腰，再想一个好问题。', '今天也要保持好奇心。', '论文可以慢慢读，猫可以再摸一下。'];
  let petCount = 0;
  petButton.hidden = false;
  petButton.addEventListener('click', () => {
    petReply.textContent = replies[petCount % replies.length];
    petCount += 1;
    petButton.textContent = petCount % 2 ? '再摸一下 ♡' : '摸摸舒芙蕾 ♡';
    if (!reducedMotion.matches) {
      const card = petButton.closest('.mascot-card');
      const photo = card.querySelector('.member-photo');
      photo.getAnimations().forEach(animation => animation.cancel());
      photo.animate([{transform:'rotate(0deg)'}, {transform:'rotate(-3deg) scale(1.04)'}, {transform:'rotate(3deg) scale(1.04)'}, {transform:'rotate(0deg)'}], {duration:600, easing:'ease-in-out'});
      if (card.querySelectorAll('.pet-spark').length < 5) {
        const spark = document.createElement('span');
        spark.className = 'pet-spark';
        spark.setAttribute('aria-hidden', 'true');
        spark.textContent = petCount % 2 ? '♡' : '✧';
        card.appendChild(spark);
        const animation = spark.animate([{opacity:0,transform:'translate(-50%, 0) scale(.6)'}, {opacity:1,offset:.25}, {opacity:0,transform:'translate(-50%, -65px) scale(1.3)'}], {duration:950,easing:'ease-out'});
        animation.finished.finally(() => spark.remove());
      }
    }
  });
}

document.querySelectorAll('.publication-list > li').forEach((item) => {
  const paragraph = item.querySelector('p');
  const title = paragraph?.querySelector('.text-blue');
  if (!paragraph || !title) return;

  const heading = document.createElement('h3');
  heading.className = 'pub-title';
  const authors = document.createElement('div');
  authors.className = 'pub-authors';
  const details = document.createElement('div');
  details.className = 'pub-details';

  while (paragraph.firstChild && paragraph.firstChild !== title) authors.appendChild(paragraph.firstChild);
  heading.appendChild(title);
  while (paragraph.firstChild) details.appendChild(paragraph.firstChild);
  const first = details.firstChild;
  if (first?.nodeType === Node.TEXT_NODE) first.textContent = first.textContent.replace(/^\s*[,，.]\s*/, '');
  item.replaceChildren(heading, authors, details);
});

// Only track the pointer while it is over a panel; no permanent animation loop.
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
document.querySelectorAll('.project-card, .member-card, .service-card, .hero-track, .portrait-wrap').forEach(panel => {
  panel.classList.add('interactive-panel');
  const light = document.createElement('span');
  light.className = 'panel-light';
  light.setAttribute('aria-hidden', 'true');
  panel.appendChild(light);
  let frame = 0;
  let bounds;
  let pointer;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    bounds = null;
    panel.classList.remove('is-tracking');
    ['--pointer-x','--pointer-y','--tilt-x','--tilt-y'].forEach(name => panel.style.removeProperty(name));
  };
  panel.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || !precisePointer.matches || reducedMotion.matches) return;
    bounds = panel.getBoundingClientRect();
  });
  panel.addEventListener('pointermove', event => {
    if (!bounds || !precisePointer.matches || reducedMotion.matches) return;
    pointer = {x: event.clientX, y: event.clientY};
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!bounds) return;
      const x = Math.max(0, Math.min(1, (pointer.x - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (pointer.y - bounds.top) / bounds.height));
      panel.style.setProperty('--pointer-x', `${x * 100}%`);
      panel.style.setProperty('--pointer-y', `${y * 100}%`);
      panel.style.setProperty('--tilt-x', `${(0.5 - y) * 3}deg`);
      panel.style.setProperty('--tilt-y', `${(x - 0.5) * 3}deg`);
      panel.classList.add('is-tracking');
    });
  });
  panel.addEventListener('pointerleave', reset);
  panel.addEventListener('pointercancel', reset);
  reducedMotion.addEventListener('change', reset);
  precisePointer.addEventListener('change', reset);
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${visible.target.id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-90px 0px -55% 0px', threshold: [0, 0.2, 0.5] });
  sections.forEach((section) => observer.observe(section));
}
