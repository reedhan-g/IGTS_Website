const filterButtons = document.querySelectorAll('[data-filter]');
const gameCards = document.querySelectorAll('[data-status]');

for (const button of filterButtons) {
  button.addEventListener('click', () => {
    for (const other of filterButtons) {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    }
    for (const card of gameCards) {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.status !== button.dataset.filter;
    }
  });
}

// Each layer follows ordinary document scroll. Leave wheel, touch and key events to the browser.
const opening = document.querySelector('.opening');
const billboard = opening.querySelector('.billboard');
const notes = opening.querySelector('.opening-notes');
const chapter = document.querySelector('.intro');
const pageHeader = document.querySelector('header');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let queuedFrame = 0;
let chapterComplete = false;

function fraction(distance, length) {
  return Math.max(0, Math.min(1, distance / length));
}

function paintPoster() {
  queuedFrame = 0;
  const viewport = document.documentElement.clientHeight;
  const chapterTop = chapter.getBoundingClientRect().top;
  if (chapterComplete && chapterTop < 0) return;

  const posterBox = billboard.getBoundingClientRect();
  const notesTop = notes.getBoundingClientRect().top;
  const headerHeight = pageHeader.offsetHeight;
  const heroProgress = fraction(headerHeight - posterBox.top, headerHeight + posterBox.height);
  const notesProgress = fraction(viewport * .80 - notesTop, viewport * .52);
  const chapterProgress = fraction(viewport - chapterTop, viewport * .53);

  opening.style.setProperty('--hero-progress', heroProgress.toFixed(4));
  opening.style.setProperty('--notes-progress', notesProgress.toFixed(4));
  chapter.style.setProperty('--chapter-progress', chapterProgress.toFixed(4));
  chapterComplete = chapterTop < 0;
}

function queuePoster() {
  if (!queuedFrame) queuedFrame = requestAnimationFrame(paintPoster);
}

function syncMotionPreference() {
  window.removeEventListener('scroll', queuePoster);
  window.removeEventListener('resize', queuePoster);
  window.removeEventListener('pageshow', queuePoster);
  cancelAnimationFrame(queuedFrame);
  queuedFrame = 0;
  chapterComplete = false;
  if (motionPreference.matches) return;
  window.addEventListener('scroll', queuePoster, { passive: true });
  window.addEventListener('resize', queuePoster);
  window.addEventListener('pageshow', queuePoster);
  paintPoster();
}

motionPreference.addEventListener('change', syncMotionPreference);
syncMotionPreference();
