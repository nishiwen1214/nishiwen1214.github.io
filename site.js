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
