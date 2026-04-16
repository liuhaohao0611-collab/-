const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const map = (v, a, b) => clamp((v - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

const SCENE_COUNT = 10;
const LOCK_S3 = 2.98;
const LOCK_S4 = 3.98;
const LOCK_S9 = 8.72;

const panelEls = [...document.querySelectorAll('.panel')];
const landing = document.getElementById('landing');
const startBtn = document.getElementById('start-btn');

const choice3 = document.getElementById('c3');
const choice4 = document.getElementById('c4');
const chooseAccept = document.getElementById('choose-accept');
const chooseRefuse = document.getElementById('choose-refuse');
const chooseWork = document.getElementById('choose-work');
const chooseSlack = document.getElementById('choose-slack');

const branch = document.getElementById('branch');
const branchRefuse = document.getElementById('branch-refuse');
const branchSlack = document.getElementById('branch-slack');
const backButtons = [...document.querySelectorAll('.back-main')];

const writing = document.getElementById('writing-box');
const voice = document.getElementById('voice');
const throwBtn = document.getElementById('throw-btn');
const echoBubble = document.getElementById('echo-bubble');
const echoTitle = document.getElementById('echo-title');
const paper = document.querySelector('.s9-paper');
const guideCells = [...document.querySelectorAll('.guide-cell')];

const refs = {
  s1: {
    a: document.querySelector('.s1-a'),
    b: document.querySelector('.s1-b'),
    papers: document.querySelector('.s1-papers'),
    pressure: document.querySelector('.s1-pressure')
  },
  s2: {
    v1: document.querySelector('.s2-v1'),
    v2: document.querySelector('.s2-v2'),
    a: document.querySelector('.s2-a'),
    b: document.querySelector('.s2-b'),
    c: document.querySelector('.s2-c'),
    shards: document.querySelector('.s2-shards')
  },
  s3: {
    a: document.querySelector('.s3-a'),
    b: document.querySelector('.s3-b'),
    speed: document.querySelector('.s3-speed'),
    impact: document.querySelector('.s3-impact'),
    badge: document.querySelector('.badge')
  },
  s4: {
    grid: document.querySelector('.s4-grid'),
    chaos: document.querySelector('.s4-chaos'),
    stamp: document.querySelector('.s4-stamp'),
    crack: document.querySelector('.s4-crack'),
    ink: document.querySelector('.s4-ink'),
    caption: document.querySelector('#s4 .caption')
  },
  s5: {
    a: document.querySelector('.s5-ink-a'),
    b: document.querySelector('.s5-ink-b'),
    c: document.querySelector('.s5-ink-c'),
    boat: document.querySelector('.s5-boat'),
    char: document.querySelector('.s5-char'),
    wave: document.querySelector('.s5-wave')
  },
  s6: {
    note: document.querySelector('.s6-note')
  },
  s7: {
    a: document.querySelector('.s7-a'),
    b: document.querySelector('.s7-b'),
    c: document.querySelector('.s7-c')
  },
  s8: {
    bottle: document.querySelector('.s8-bottle'),
    particles: document.querySelector('.s8-particles'),
    pile: document.querySelector('.s8-pile')
  }
};

let started = false;
let scene3Chosen = false;
let scene4Chosen = false;
let scene4Path = null;
let branchMode = null;
let echoShown = false;
const mouse = { x: 0, y: 0 };

const setOpacity = (el, value) => {
  if (!el) return;
  el.style.opacity = String(clamp(value));
};

const place = (el, x, y, scale = 1, rot = 0) => {
  if (!el) return;
  el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale}) rotate(${rot}deg)`;
};

const oneFrame = (active, list) => {
  list.forEach((el, i) => setOpacity(el, i === active ? 1 : 0));
};

function fadePanel(panel, idx, pos) {
  const enter = smooth(map(pos, idx - 0.22, idx + 0.08));
  const leave = 1 - smooth(map(pos, idx + 0.82, idx + 1.2));
  const alpha = clamp(enter * leave);
  panel.style.opacity = alpha.toFixed(3);
  panel.classList.toggle('active', alpha > 0.03);
}

function animateS1(t, now) {
  const p = smooth(t);
  const step = Math.floor(t * 6) % 2;
  const x = lerp(-250, 120, p) + mouse.x * 14;
  const y = lerp(180, -110, p) + mouse.y * 10;

  oneFrame(step, [refs.s1.a, refs.s1.b]);
  place(refs.s1.a, x, y, 1, 0);
  place(refs.s1.b, x, y, 1, 0);

  const fall = (now * 0.07 + t * 660) % 680;
  setOpacity(refs.s1.papers, map(t, 0.05, 1));
  place(refs.s1.papers, -50 + Math.sin(now * 0.0017) * 16 + mouse.x * 8, -320 + fall + mouse.y * 8, 1.04, Math.sin(now * 0.0018) * 5);

  // 压力线仅做轻微左右变形摇动，不夸张。
  const pressureSx = 1 + Math.sin(now * 0.006) * 0.012;
  const pressureRot = Math.sin(now * 0.005) * 0.45;
  refs.s1.pressure.style.opacity = String(lerp(0.45, 0.86, map(t, 0, 0.45)));
  refs.s1.pressure.style.transform = `translate(calc(-50% + ${120 + mouse.x * 4}px), calc(-50% + ${68 + mouse.y * 4}px)) scaleX(${pressureSx}) rotate(${pressureRot}deg)`;
}

function animateS2(t) {
  const show = map(t, 0.06, 0.98);
  const seg = show * 3;
  const frame = Math.min(2, Math.floor(seg));
  const local = seg - frame;

  // 三帧按下滑从左到右依次出现，不同时出现。
  let x;
  let y;
  if (frame === 0) {
    x = lerp(-250, -50, local);
    y = lerp(40, -70, local);
  } else if (frame === 1) {
    x = lerp(-50, 130, local);
    y = lerp(-70, -130, local);
  } else {
    x = lerp(130, 260, local);
    y = lerp(-130, -66, local);
  }

  oneFrame(frame, [refs.s2.a, refs.s2.b, refs.s2.c]);
  place(refs.s2.a, x, y, 1, 0);
  place(refs.s2.b, x, y, 1, 0);
  place(refs.s2.c, x, y, 1, 0);

  // 藤蔓向两侧拉开约 15%。
  const vineSpread = map(t, 0, 1);
  place(refs.s2.v1, lerp(-80, -250, vineSpread), -36, 1, 0);
  place(refs.s2.v2, lerp(80, 250, vineSpread), -98, 1, 0);

  const shardIn = map(t, 0.14, 0.45);
  const shardOut = 1 - map(t, 0.45, 0.8);
  setOpacity(refs.s2.shards, shardIn * shardOut);
  place(refs.s2.shards, lerp(-140, 40, shardIn), lerp(20, -80, shardIn), 0.9 + shardIn * 0.3, shardIn * 20);
}

function animateS3(t, now) {
  const drop = smooth(map(t, 0.06, 0.84));
  const lift = window.innerHeight * 0.2;
  const extraDown = window.innerHeight * 0.08;
  const down5 = window.innerHeight * 0.05;
  const x = lerp(-300, 180, drop);
  const y = lerp(-260, 86, drop) - Math.sin(drop * Math.PI) * 34 - lift + extraDown + down5;

  const frame = drop < 0.62 ? 0 : 1;
  oneFrame(frame, [refs.s3.a, refs.s3.b]);
  place(refs.s3.a, x, y, 1, lerp(-12, -2, drop));
  place(refs.s3.b, x, y, 1, lerp(-4, 5, drop));

  // 速度线保留静态，不再做位移动效。
  setOpacity(refs.s3.speed, map(t, 0.06, 1));
  place(refs.s3.speed, 40, 118, 1, 0);

  const hitIn = map(t, 0.56, 0.72);
  const hitOut = 1 - map(t, 0.78, 0.92);
  setOpacity(refs.s3.impact, hitIn * hitOut);
  place(refs.s3.impact, 190, 96 - lift + down5, 0.7 + hitIn * 0.7, 0);

  // 工牌在右侧原位基础上稍微缩小，并做很轻微上下浮动。
  const c = choice3.getBoundingClientRect();
  const badgeFloat = Math.sin(now * 0.0028) * 4;
  refs.s3.badge.style.left = `${Math.min(window.innerWidth - 18, c.right + 12)}px`;
  refs.s3.badge.style.top = `${c.top + c.height * 0.52 + window.innerHeight * 0.2 + badgeFloat}px`;
  refs.s3.badge.style.transform = 'translateY(-50%) scale(0.8)';
}

function animateS4(t) {
  const drive = scene4Chosen ? t : Math.min(t, 0.33);
  const down = smooth(map(drive, 0.16, 0.52));
  const up = smooth(map(drive, 0.52, 0.86));
  const crush = map(drive, 0.66, 0.98);

  // 印章下压后抬起，再看到化墨人物。
  const stampY = lerp(-700, 12, down) + lerp(0, -690, up);
  place(refs.s4.stamp, 0, stampY, 1, 0);
  setOpacity(refs.s4.stamp, map(t, 0.1, 1));

  const chaosOn = map(drive, 0.5, 0.66);
  setOpacity(refs.s4.grid, 1 - chaosOn);
  setOpacity(refs.s4.chaos, chaosOn);
  setOpacity(refs.s4.crack, map(drive, 0.54, 0.78) * (1 - map(drive, 0.8, 1)));
  place(refs.s4.crack, 0, 26, 1 + crush * 0.16, 0);

  setOpacity(refs.s4.ink, crush);
  place(refs.s4.ink, -40, 104 + crush * 20, 1, 0);
  setOpacity(refs.s4.caption, map(drive, 0.66, 0.9));
}

function animateS5(t, now) {
  // 墨水素材占据整屏，然后消退到小舟场景。
  const inkA = 1 - map(t, 0.18, 0.7);
  const inkB = 1 - map(t, 0.28, 0.78);
  const inkC = 1 - map(t, 0.38, 0.9);
  setOpacity(refs.s5.a, inkA);
  setOpacity(refs.s5.b, inkB);
  setOpacity(refs.s5.c, inkC);

  const reveal = map(t, 0.44, 1);
  const bob = Math.sin(now * 0.0023) * 10;
  setOpacity(refs.s5.boat, reveal);
  setOpacity(refs.s5.char, reveal);
  setOpacity(refs.s5.wave, 0.35 + reveal * 0.55);
  place(refs.s5.boat, mouse.x * 10, 136 + bob + mouse.y * 8, 1, Math.sin(now * 0.0018) * 1.2);
  place(refs.s5.char, mouse.x * 12, 96 + bob + mouse.y * 10, 1, Math.sin(now * 0.0018) * 1.2);
  place(refs.s5.wave, mouse.x * 6, 172 + mouse.y * 6, 1, 0);
}

function animateS6(t, now) {
  setOpacity(refs.s6.note, map(t, 0.08, 1));
  place(refs.s6.note, mouse.x * 10, 36 - window.innerHeight * 0.05 + Math.sin(now * 0.0018) * 3 + mouse.y * 8, 1, 0);
}

function animateS7(t) {
  const seg = map(t, 0.08, 0.92) * 3;
  const frame = Math.min(2, Math.floor(seg));
  oneFrame(frame, [refs.s7.a, refs.s7.b, refs.s7.c]);
  place(refs.s7.a, mouse.x * 10, 44 + mouse.y * 8, 1, 0);
  place(refs.s7.b, mouse.x * 10, 44 + mouse.y * 8, 1, 0);
  place(refs.s7.c, mouse.x * 10, 44 + mouse.y * 8, 1, 0);
}

function animateS8(t, now) {
  const p = smooth(map(t, 0.06, 0.98));
  const driftX = Math.sin(now * 0.0016 + t * 10) * 22;
  const y = lerp(-300, 170, p);
  const particleFloat = Math.sin(now * 0.0038) * 14;

  setOpacity(refs.s8.bottle, 1);
  setOpacity(refs.s8.particles, 0.5 + Math.sin(now * 0.004) * 0.1);
  setOpacity(refs.s8.pile, 1);
  place(refs.s8.bottle, driftX + mouse.x * 8, y + mouse.y * 8, lerp(0.68, 1.05, p), lerp(-20, 10, p));
  place(refs.s8.particles, mouse.x * 6, particleFloat + mouse.y * 10, 1.07, 0);
  place(refs.s8.pile, 0, 154, 1.02, 0);
}

function animateS9(t) {
  const open = map(t, 0.08, 0.94);
  setOpacity(paper, echoShown ? 0 : open);
  paper.style.transform = `translate(calc(-50% + 0px), calc(-50% + 0px)) scale(${0.92 + open * 0.08})`;

  writing.classList.toggle('active', !echoShown && open > 0.35);

  if (!echoShown) {
    setOpacity(echoBubble, 0);
    setOpacity(echoTitle, 0);
  }
}

function draw(pos, now) {
  panelEls.forEach((panel, idx) => fadePanel(panel, idx, pos));

  animateS1(clamp(pos - 0), now);
  animateS2(clamp(pos - 1));
  animateS3(clamp(pos - 2), now);
  animateS4(clamp(pos - 3));
  animateS5(clamp(pos - 4), now);
  animateS6(clamp(pos - 5), now);
  animateS7(clamp(pos - 6));
  animateS8(clamp(pos - 7), now);
  animateS9(clamp(pos - 8));

  const t3 = clamp(pos - 2);
  const t4 = clamp(pos - 3);
  choice3.classList.toggle('show', t3 > 0.32 && t3 < 1 && !scene3Chosen);
  choice4.classList.toggle('show', t4 > 0.2 && t4 < 0.62 && !scene4Chosen);

  if (!scene3Chosen) {
    panelEls[3].style.opacity = '0';
    panelEls[4].style.opacity = '0';
  } else if (!scene4Chosen) {
    panelEls[4].style.opacity = '0';
  }
  if (!echoShown) {
    panelEls[9].style.opacity = '0';
    panelEls[9].classList.remove('active');
  }
}

function getScenePos() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  let pos = clamp(window.scrollY / maxScroll) * SCENE_COUNT;
  if (!scene3Chosen) pos = Math.min(pos, LOCK_S3);
  if (scene3Chosen && !scene4Chosen) pos = Math.min(pos, LOCK_S4);
  if (scene3Chosen && scene4Chosen && !echoShown) pos = Math.min(pos, LOCK_S9);
  return pos;
}

function jumpToScene(idx) {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;
  const y = (idx / SCENE_COUNT) * maxScroll;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

function openBranch(kind) {
  branchMode = kind;
  branch.classList.add('show');
  branchRefuse.classList.remove('show');
  branchSlack.classList.remove('show');
  if (kind === 'refuse') branchRefuse.classList.add('show');
  if (kind === 'slack') branchSlack.classList.add('show');
  branch.setAttribute('aria-hidden', 'false');
  document.body.style.overflowY = 'hidden';
}

function closeBranch() {
  branch.classList.remove('show');
  branchRefuse.classList.remove('show');
  branchSlack.classList.remove('show');
  branch.setAttribute('aria-hidden', 'true');
  document.body.style.overflowY = started ? 'auto' : 'hidden';

  if (branchMode === 'refuse') jumpToScene(3);
  if (branchMode === 'slack') jumpToScene(4);
  branchMode = null;
}

function loop(now) {
  if (started) {
    draw(getScenePos(), now);
  }
  requestAnimationFrame(loop);
}

startBtn.addEventListener('click', () => {
  started = true;
  landing.style.display = 'none';
  document.body.style.overflowY = 'auto';
});

chooseAccept.addEventListener('click', () => {
  scene3Chosen = true;
  jumpToScene(3);
});

chooseRefuse.addEventListener('click', () => {
  scene3Chosen = true;
  openBranch('refuse');
});

chooseWork.addEventListener('click', () => {
  scene4Chosen = true;
  scene4Path = 'work';
  jumpToScene(4);
});

chooseSlack.addEventListener('click', () => {
  scene4Chosen = true;
  scene4Path = 'slack';
  openBranch('slack');
});

backButtons.forEach((btn) => btn.addEventListener('click', closeBranch));

throwBtn.addEventListener('click', () => {
  echoShown = true;
  writing.classList.remove('active');
  setOpacity(paper, 0);
  setOpacity(echoBubble, 1);
  setOpacity(echoTitle, 1);

  const words = voice.value.trim();
  echoTitle.textContent = words
    ? `世界总是包容的，她听到了你的声音：${words}`
    : '世界总是包容的，她听到了你的声音：';
});

voice.addEventListener('input', () => {
  if (echoShown) {
    echoShown = false;
    setOpacity(echoBubble, 0);
    setOpacity(echoTitle, 0);
  }
});

guideCells.forEach((cell) => {
  cell.addEventListener('click', () => {
    const target = Number(cell.dataset.target || 0);
    jumpToScene(target);
  });
});

window.addEventListener(
  'wheel',
  (e) => {
    if (!started) return;
    if (branch.classList.contains('show')) {
      e.preventDefault();
      return;
    }

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const pos = clamp(window.scrollY / maxScroll) * SCENE_COUNT;
    const lock = !scene3Chosen
      ? LOCK_S3
      : !scene4Chosen
        ? LOCK_S4
        : !echoShown
          ? LOCK_S9
          : null;
    if (lock !== null && pos >= lock && e.deltaY > 0) {
      e.preventDefault();
      const y = (lock / SCENE_COUNT) * maxScroll;
      window.scrollTo(0, y);
    }
  },
  { passive: false }
);

window.addEventListener('scroll', () => {
  if (!started) return;
  if (branch.classList.contains('show')) return;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;
  const lock = !scene3Chosen
    ? LOCK_S3
    : !scene4Chosen
      ? LOCK_S4
      : !echoShown
        ? LOCK_S9
        : null;
  if (lock === null) return;

  const stopY = (lock / SCENE_COUNT) * maxScroll;
  if (window.scrollY > stopY) {
    window.scrollTo(0, stopY);
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && branch.classList.contains('show')) closeBranch();
});

window.addEventListener('mousemove', (e) => {
  const nx = (e.clientX / window.innerWidth - 0.5) * 2;
  const ny = (e.clientY / window.innerHeight - 0.5) * 2;
  mouse.x = nx;
  mouse.y = ny;
});

document.body.style.overflowY = 'hidden';
requestAnimationFrame(loop);
