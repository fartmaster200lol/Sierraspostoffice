const menu = get('menu');
const street = get('street');
const office = get('office');
const curtain = get('curtain');
const preferences = get('preferences');
const motion = get('motion');
const sound = get('sound');
const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
let scene = menu;
let changing = false;
const pigSound = new Audio('oink.ogg');
const doorSound = new Audio('door.ogg');
pigSound.preload = 'auto';
doorSound.preload = 'auto';

function preference(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; }
  catch { return fallback; }
}

function savePreference(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

motion.checked = preference('sierra-motion', String(systemMotion.matches)) === 'true';
sound.checked = preference('sierra-sound', 'true') === 'true';
document.documentElement.classList.toggle('reduced', motion.checked);

motion.addEventListener('change', () => {
  savePreference('sierra-motion', motion.checked);
  document.documentElement.classList.toggle('reduced', motion.checked);
});
sound.addEventListener('change', () => {
  savePreference('sierra-sound', sound.checked);
  if (sound.checked) oink();
});

function playSound(clip) {
  if (!sound.checked) return;
  clip.currentTime = 0;
  clip.play().catch(() => {});
}

function oink() {
  playSound(pigSound);
}

const wait = duration => new Promise(resolve => setTimeout(resolve, duration));

async function changeScene(destination, focus, entering = false) {
  if (changing) return;
  changing = true;
  const fade = !motion.checked;
  if (entering) playSound(doorSound);
  if (fade) {
    curtain.style.setProperty('--fade-time', entering ? '850ms' : '290ms');
    curtain.classList.add('black');
    await wait(entering ? 875 : 300);
  }
  scene.hidden = true;
  destination.hidden = false;
  scene = destination;
  window.scrollTo(0, 0);
  focus.focus({ preventScroll: true });
  if (fade && entering) {
    curtain.style.setProperty('--fade-time', '1550ms');
    await wait(350);
  }
  curtain.classList.remove('black');
  if (fade) await wait(entering ? 1575 : 300);
  changing = false;
}

get('settings').addEventListener('click', () => preferences.showModal());
get('begin').addEventListener('pointerenter', oink);
get('begin').addEventListener('focus', event => {
  if (event.target.matches(':focus-visible')) oink();
});
get('begin').addEventListener('click', () => {
  if (pigSound.paused && pigSound.currentTime === 0) oink();
  changeScene(street, get('door'));
});
get('back-menu').addEventListener('click', () => changeScene(menu, get('begin')));
get('door').addEventListener('click', () => changeScene(office, get(get('desk').hidden ? 'stack' : 'greeting'), true));
get('back-street').addEventListener('click', () => index === letters.length ? leaveAfterSorting() : changeScene(street, get('door')));

const music = get('music');
const soundtrack = new Audio('post-office-theme.ogg');
soundtrack.loop = true;
soundtrack.volume = .36;
music.checked = preference('sierra-music', 'true') === 'true';
music.addEventListener('change', () => {
  savePreference('sierra-music', music.checked);
  if (music.checked) startMusic();
  else soundtrack.pause();
});
get('begin').addEventListener('click', startMusic);

function startMusic() {
  if (music.checked && soundtrack.paused) soundtrack.play().catch(() => {});
}

const night = get('night');
const flight = get('flight');
const bell = new Audio('night-bell.ogg');
const bark = new Audio('woof.ogg');

function ringNightBell() {
  playSound(bell);
  office.classList.add('after-hours');
}

function leaveAfterSorting() {
  return changeScene(night, get('night-title'));
}

get('morning').addEventListener('click', async () => {
  if (changing) return;
  await changeScene(flight, get('flight-title'));
  flight.classList.add('flying');
  await wait(motion.checked ? 1400 : 6500);
  get('end-card').hidden = false;
  flight.classList.add('landed');
  playSound(bark);
  get('end-title').focus();
});

get('replay').addEventListener('click', async () => {
  if (changing) return;
  await changeScene(menu, get('begin'));
  flight.classList.remove('flying', 'landed');
  get('end-card').hidden = true;
  office.classList.remove('after-hours');
  resetLetters();
});
