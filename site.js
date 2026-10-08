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
const secretCat = document.querySelector('.mascot-note');
if (secretCat) {
  let escapeAnimation;
  let hops = 0;
  let audioContext;
  let lastMeow = -Infinity;
  let replyTimer;
  let lastReply = -1;
  const catReplies = ['喵～', '你点到本喵啦。', '摸摸可以，罐罐呢？', '抓不到我吧 ฅ', '本喵正在思考，勿扰……再摸一下也行。', '论文你写，觉我替你睡。'];
  const bubble = document.createElement('div');
  bubble.className = 'cat-whisper';
  bubble.setAttribute('role', 'status');
  bubble.setAttribute('aria-live', 'polite');
  bubble.hidden = true;
  document.body.appendChild(bubble);
  const hideReply = () => { clearTimeout(replyTimer); bubble.hidden = true; bubble.textContent = ''; };
  const meow = async () => {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine || performance.now() - lastMeow < 900) return;
    lastMeow = performance.now();
    try {
      // A quiet, short electronic meow, created only after a deliberate click.
      audioContext ||= new AudioEngine();
      if (audioContext.state === 'suspended') await audioContext.resume();
      if (audioContext.state !== 'running') return;
      const now = audioContext.currentTime;
      const voice = audioContext.createOscillator();
      const vowel = audioContext.createBiquadFilter();
      const volume = audioContext.createGain();
      voice.type = 'sawtooth';
      voice.frequency.setValueAtTime(620, now);
      voice.frequency.exponentialRampToValueAtTime(890, now + .12);
      voice.frequency.exponentialRampToValueAtTime(430, now + .52);
      vowel.type = 'bandpass';
      vowel.Q.value = 1.8;
      vowel.frequency.setValueAtTime(1600, now);
      vowel.frequency.exponentialRampToValueAtTime(700, now + .52);
      volume.gain.setValueAtTime(0, now);
      volume.gain.linearRampToValueAtTime(.055, now + .045);
      volume.gain.linearRampToValueAtTime(.035, now + .25);
      volume.gain.exponentialRampToValueAtTime(.001, now + .56);
      voice.connect(vowel).connect(volume).connect(audioContext.destination);
      voice.start(now);
      voice.stop(now + .58);
      voice.onended = () => { voice.disconnect(); vowel.disconnect(); volume.disconnect(); };
    } catch { /* Silent browsers still get the visual reply. */ }
  };
  const stopEscape = () => escapeAnimation?.cancel();
  const showReply = text => {
    clearTimeout(replyTimer);
    bubble.textContent = text;
    bubble.hidden = false;
    const anchor = secretCat.getBoundingClientRect();
    const bubbleWidth = bubble.getBoundingClientRect().width;
    bubble.style.left = `${Math.max(12, Math.min(anchor.left + anchor.width / 2 - bubbleWidth / 2, document.documentElement.clientWidth - bubbleWidth - 12))}px`;
    bubble.style.top = `${Math.max(84, anchor.top - bubble.offsetHeight - 14)}px`;
    replyTimer = setTimeout(hideReply, 2800);
  };
  secretCat.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    showReply('喵～');
    if (audioContext?.state === 'running') void meow();
  });
  secretCat.addEventListener('focus', () => showReply('喵～'));
  secretCat.addEventListener('click', event => {
    stopEscape();
    let reply = Math.floor(Math.random() * catReplies.length);
    if (reply === lastReply) reply = (reply + 1) % catReplies.length;
    lastReply = reply;
    showReply(catReplies[reply]);
    void meow();
    if (reducedMotion.matches) return;
    const bounds = secretCat.getBoundingClientRect();
    const direction = ++hops % 2 ? 1 : -1;
    // Keep the whole hit target inside the viewport, including narrow phones.
    const dx = event.detail === 0 ? 0 : Math.max(8 - bounds.left, Math.min(direction * (48 + Math.random() * 40), document.documentElement.clientWidth - bounds.right - 8));
    const dy = -Math.min(36, Math.max(0, bounds.top - 90));
    escapeAnimation = secretCat.animate([
      { transform: 'translate(0, 0) rotate(0deg)' },
      { transform: `translate(${dx * .5}px, ${dy - 12}px) rotate(${direction * -14}deg)`, offset: .18 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${direction * 8}deg)`, offset: .34 },
      { transform: `translate(${dx}px, ${dy}px) rotate(0deg)`, offset: .62 },
      { transform: 'translate(0, -8px) rotate(-6deg)', offset: .88 },
      { transform: 'translate(0, 0) rotate(0deg)' }
    ], { duration: 1250, easing: 'ease-in-out' });
  });
  window.addEventListener('resize', stopEscape);
  window.addEventListener('resize', hideReply);
  window.addEventListener('scroll', hideReply, { passive: true });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hideReply(); });
  reducedMotion.addEventListener('change', stopEscape);
}
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
