'use strict';

// ---------------------------------------------------------------------------
// Cấu hình: chỉ cần sửa ở đây nếu muốn đổi tên hoặc lời nhắn.
// Lưu ý an toàn: trang này KHÔNG đọc URL / hash / referrer / localStorage,
// KHÔNG dùng innerHTML / eval / document.write. Mọi chữ hiển thị đều đi qua
// textContent, nên dữ liệu không bao giờ được parse thành HTML.
// ---------------------------------------------------------------------------
const NAME = 'Linh';

const REASONS = [
  'Vì em cười một cái là anh quên luôn đang định nói gì.',
  'Vì em ăn gì cũng ngon, kể cả lúc giành đồ ăn của anh.',
  'Vì em giận cũng xinh. Hơi khó chịu, nhưng xinh.',
  'Vì em nhớ hết mấy chuyện nhỏ xíu mà anh kể.',
  'Vì mỗi lần em gọi tên anh là tim anh tự động tăng ga.',
  'Vì em chịu được anh. Cái này ít ai làm được.',
  'Vì em là lý do anh thích thứ Hai hơn một chút.',
  'Vì em ngủ dậy tóc rối mà vẫn dễ thương, vô lý.',
  'Vì em hay hỏi "anh ăn gì chưa", mà hỏi thật chứ không hỏi cho có.',
  'Vì em làm anh muốn trở thành phiên bản tốt hơn của chính mình.',
  'Vì ôm em là hết mệt. Đã kiểm chứng nhiều lần.',
  'Vì em là em. Hết. Không cần lý do nữa.'
];

const NO_TEXTS = [
  'Không',
  'Chắc chưa?',
  'Nghĩ lại đi…',
  'Ơ kìa 😳',
  'Nút này hỏng rồi',
  'Anh buồn đó 🥺',
  'Bấm Có đi mà',
  'Thôi em đừng cố',
  'Hết chỗ chạy rồi',
  'Em thắng… à không'
];

const HINTS = [
  'Chọn kỹ nha. Có một nút hơi… nhát.',
  'Ủa, nút Không nó chạy kìa.',
  'Nút Có càng ngày càng to là có lý do hết á.',
  'Em bấm trúng rồi anh cũng không tin đâu.',
  'Anh lập trình nút Không 3 tiếng chỉ để nó chạy. Trân trọng nó đi.',
  'Nó nhỏ dần rồi, thấy chưa?',
  'Còn mỗi nút Có to đùng thôi, đừng ngại.'
];

const HUG_LINES = [
  'Ôm cái nữa đi, anh chưa đã.',
  'Hơi chặt. Nhưng anh thích.',
  'Em ôm anh còn nhiều hơn em ôm gối rồi đó.',
  'Mỗi cái ôm đều được ghi vào sổ. Sổ dày lắm.',
  'Thôi để dành tí, gặp nhau ôm thật.'
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function spawn(parent, className, text, left, duration, extraStyle) {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  el.style.left = left + '%';
  el.style.animationDuration = duration + 's';
  if (extraStyle) Object.assign(el.style, extraStyle);
  parent.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
  return el;
}

// ---------------------------------------------------------------------------
// Tên
// ---------------------------------------------------------------------------
$('sign-name').textContent = NAME;

// ---------------------------------------------------------------------------
// Trái tim bay lên nền
// ---------------------------------------------------------------------------
const sky = $('sky');
const HEART_EMOJI = ['💗', '💖', '💕', '🩷', '❤️', '✨'];

function floatHeart() {
  if (document.hidden) return;
  spawn(sky, 'heart', pick(HEART_EMOJI), rand(0, 100), rand(6, 11), {
    fontSize: rand(14, 30) + 'px'
  });
}
if (!reducedMotion) {
  for (let i = 0; i < 6; i++) setTimeout(floatHeart, i * 400);
  setInterval(floatHeart, 900);
}

// ---------------------------------------------------------------------------
// Máy bốc lý do
// ---------------------------------------------------------------------------
const reasonEl = $('reason');
const reasonCount = $('reason-count');
let remaining = REASONS.slice();
let drawn = 0;

$('reason-btn').addEventListener('click', () => {
  if (remaining.length === 0) remaining = REASONS.slice();
  const idx = Math.floor(Math.random() * remaining.length);
  const text = remaining.splice(idx, 1)[0];
  drawn++;
  reasonEl.textContent = text;
  reasonEl.classList.remove('pop');
  void reasonEl.offsetWidth; // restart animation
  reasonEl.classList.add('pop');
  if (drawn >= REASONS.length) {
    reasonCount.textContent = 'Hết ' + REASONS.length + ' lý do rồi. Mà bốc tiếp vẫn được, anh có thêm.';
  } else {
    reasonCount.textContent = 'Lý do ' + drawn + '/' + REASONS.length + '. Còn ' + remaining.length + ' lý do nữa.';
  }
  for (let i = 0; i < 3; i++) floatHeart();
});

// ---------------------------------------------------------------------------
// Số đếm chạy khi cuộn tới
// ---------------------------------------------------------------------------
function animateCount(el) {
  const target = Number(el.dataset.count) || 0;
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const dur = 1200;
  function tick(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const nums = document.querySelectorAll('.stats .num');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  nums.forEach((n) => io.observe(n));
} else {
  nums.forEach(animateCount);
}

// ---------------------------------------------------------------------------
// Nút Không chạy trốn
// ---------------------------------------------------------------------------
const noBtn = $('no-btn');
const yesBtn = $('yes-btn');
const hint = $('hint');
const choices = $('choices');
let dodges = 0;
let answered = false;
let lastFlee = 0;

function flee() {
  if (answered) return;
  // Một lần chạm có thể bắn mouseenter + pointerdown + click: chỉ tính 1 lần né.
  const now = Date.now();
  if (now - lastFlee < 350) return;
  lastFlee = now;
  dodges++;
  noBtn.classList.add('fleeing');
  const pad = 12;
  const w = noBtn.offsetWidth;
  const h = noBtn.offsetHeight;
  const maxX = Math.max(pad, window.innerWidth - w - pad);
  const maxY = Math.max(pad, window.innerHeight - h - pad);
  // Tránh chui xuống dưới nút Có: chỉ cần chọn vị trí ngẫu nhiên cách xa chuột hiện tại.
  noBtn.style.left = Math.round(rand(pad, maxX)) + 'px';
  noBtn.style.top = Math.round(rand(pad, maxY)) + 'px';

  noBtn.textContent = NO_TEXTS[Math.min(dodges, NO_TEXTS.length - 1)];
  hint.textContent = HINTS[Math.min(dodges, HINTS.length - 1)];

  const scale = Math.min(1 + dodges * 0.12, 2.1);
  yesBtn.style.transform = 'scale(' + scale + ')';
  choices.style.minHeight = Math.round(90 * scale) + 'px';

  if (dodges >= 5) noBtn.classList.add('tiny');
  if (dodges >= 9) {
    noBtn.style.opacity = '0';
    noBtn.style.pointerEvents = 'none';
    setTimeout(() => { noBtn.classList.add('hidden'); }, 350);
  }
}

noBtn.addEventListener('mouseenter', flee);
noBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); flee(); });
noBtn.addEventListener('click', (e) => { e.preventDefault(); flee(); });
noBtn.addEventListener('focus', flee);

// ---------------------------------------------------------------------------
// Bấm Có
// ---------------------------------------------------------------------------
const result = $('result');
const CONFETTI = ['💖', '💗', '🎉', '✨', '💘', '🌸', '🎊', '💝'];

function confettiBurst(n) {
  if (reducedMotion) return;
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      spawn(sky, 'confetti', pick(CONFETTI), rand(0, 100), rand(2.5, 5), {
        fontSize: rand(16, 34) + 'px'
      });
    }, i * 25);
  }
}

yesBtn.addEventListener('click', () => {
  if (answered) return;
  answered = true;
  noBtn.classList.add('hidden');
  yesBtn.textContent = 'Có 💖 (đã chốt)';
  yesBtn.style.transform = 'scale(1.15)';
  yesBtn.disabled = true;
  hint.textContent = 'Anh biết mà. 😏';
  result.classList.remove('hidden');
  confettiBurst(70);
  setTimeout(() => result.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }), 150);
});

// ---------------------------------------------------------------------------
// Nút ôm
// ---------------------------------------------------------------------------
let hugs = 0;
const hugCount = $('hug-count');
$('hug-btn').addEventListener('click', (e) => {
  hugs++;
  confettiBurst(18);
  for (let i = 0; i < 6; i++) floatHeart();
  e.currentTarget.classList.remove('shake');
  void e.currentTarget.offsetWidth;
  e.currentTarget.classList.add('shake');
  hugCount.textContent = 'Đã ôm ' + hugs + ' cái. ' + HUG_LINES[Math.min(hugs - 1, HUG_LINES.length - 1)];
});
