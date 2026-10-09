'use strict';

// An toàn: không đọc URL/hash/referrer/storage, không innerHTML/eval.
// Mọi nội dung hiển thị là emoji/chuỗi cố định, gắn qua textContent.

const body = document.body;
const scene = document.getElementById('scene');
const fx = document.getElementById('fx');
const boy = document.querySelector('.boy');
const girl = document.querySelector('.girl');
const stars = document.getElementById('stars');
const replay = document.getElementById('replay');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => Math.random() * (b - a) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 50 : ms));

const HEARTS = ['💗', '💖', '💕', '🩷', '❤️', '💘', '✨'];
const RAIN = ['💗', '💖', '🌸', '✨', '💕', '⭐'];
const BALLOONS = ['🎈', '🎈', '🩷'];

// ---------- stars ----------
for (let i = 0; i < 40; i++) {
  const s = document.createElement('span');
  s.className = 'star';
  s.style.left = rand(0, 100) + '%';
  s.style.top = rand(0, 100) + '%';
  s.style.animationDelay = rand(0, 2.4) + 's';
  s.style.transform = 'scale(' + rand(0.5, 1.2) + ')';
  stars.appendChild(s);
}

// ---------- effects ----------
function spawnFx(className, text, styles, lifeMs) {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  Object.assign(el.style, styles);
  fx.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
  setTimeout(() => el.remove(), lifeMs);
  return el;
}

function popHearts(x, y, n) {
  for (let i = 0; i < n; i++) {
    spawnFx('pop', pick(HEARTS), {
      left: x + rand(-18, 18) + 'px',
      top: y + rand(-18, 18) + 'px',
      fontSize: rand(18, 34) + 'px',
      animationDelay: i * 60 + 'ms'
    }, 1600);
  }
}

function burstAt(x, y, n) {
  for (let i = 0; i < n; i++) {
    const ang = (Math.PI * 2 * i) / n + rand(-0.3, 0.3);
    const dist = rand(60, 140);
    spawnFx('burst', pick(HEARTS), {
      left: x + 'px',
      top: y + 'px',
      fontSize: rand(16, 30) + 'px',
      '--dx': Math.round(Math.cos(ang) * dist) + 'px',
      '--dy': Math.round(Math.sin(ang) * dist) + 'px'
    }, 1200);
  }
}

function rainOne() {
  spawnFx('rain', pick(RAIN), {
    left: rand(0, 100) + '%',
    fontSize: rand(16, 30) + 'px',
    animationDuration: rand(3, 6) + 's'
  }, 7000);
}

function balloonOne() {
  spawnFx('balloon', pick(BALLOONS), {
    left: rand(5, 90) + '%',
    animationDuration: rand(7, 11) + 's'
  }, 12000);
}

function center(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// ---------- story ----------
let stage = 0;
let busy = false;
let rainTimer = null;

function setStage(n) {
  stage = n;
  body.dataset.stage = String(n);
}
function setReady(v) {
  body.dataset.ready = v ? '1' : '0';
}

async function advance(tapX, tapY) {
  if (busy) return;
  busy = true;
  setReady(false);

  if (stage === 0) {
    boy.classList.remove('waving');
    boy.classList.add('walking');
    setStage(1);
    await wait(2650);
    boy.classList.remove('walking');
  } else if (stage === 1) {
    setStage(2);
    await wait(500);
    girl.classList.add('jump');
    const g = center(girl);
    burstAt(g.x, g.y - 60, 14);
    await wait(1100);
    girl.classList.remove('jump');
    balloonOne();
  } else if (stage === 2) {
    setStage(3);
    await wait(1300);
    const c = { x: window.innerWidth / 2, y: window.innerHeight * 0.5 };
    burstAt(c.x, c.y, 22);
    await wait(900);
    setStage(4);
    if (!reduced) {
      rainTimer = setInterval(rainOne, 260);
      setTimeout(balloonOne, 400);
      setTimeout(balloonOne, 1800);
      setTimeout(balloonOne, 3400);
    }
    busy = false;
    return; // stage 4: no more hint, taps just make hearts
  } else {
    busy = false;
    return;
  }

  busy = false;
  setReady(true);
}

function reset() {
  if (rainTimer) { clearInterval(rainTimer); rainTimer = null; }
  while (fx.firstChild) fx.removeChild(fx.firstChild);
  busy = false;
  boy.classList.remove('walking');
  boy.classList.add('waving');
  girl.classList.remove('jump');
  setStage(0);
  setReady(true);
}

scene.addEventListener('pointerdown', (e) => {
  if (e.target === replay) return;
  popHearts(e.clientX, e.clientY, 3);
  if (stage < 4) advance(e.clientX, e.clientY);
});

replay.addEventListener('pointerdown', (e) => e.stopPropagation());
replay.addEventListener('click', (e) => {
  e.stopPropagation();
  reset();
});

// ---------- idle sparkle ----------
boy.classList.add('waving');
if (!reduced) {
  setInterval(() => {
    if (document.hidden) return;
    const who = Math.random() < 0.5 ? boy : girl;
    const c = center(who);
    spawnFx('pop', '✨', { left: c.x + rand(-50, 50) + 'px', top: c.y + rand(-70, 20) + 'px', fontSize: '18px' }, 1600);
  }, 1400);
}
