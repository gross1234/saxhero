/* ============================================================
   SaxHero — app logic
   ============================================================ */

/* ---------- Subscription / trial state ---------- */
const TRIAL_DAYS = 7;
const PLANS = {
  yearly:  { label: 'Yearly',  price: '$69.99/yr', perMonth: '$5.83/mo', save: 'SAVE 55%' },
  monthly: { label: 'Monthly', price: '$12.99/mo', perMonth: null, save: null },
};

function loadState() {
  try { return JSON.parse(localStorage.getItem('saxhero') || '{}'); }
  catch { return {}; }
}
function saveState(s) { localStorage.setItem('saxhero', JSON.stringify(s)); }
let state = loadState(); // { email, plan, trialStart, status: 'trial'|'active', usedFreeGeneration, generated: [] }

function trialDaysLeft() {
  if (!state.trialStart) return 0;
  const elapsed = (Date.now() - new Date(state.trialStart).getTime()) / 86400000;
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
}
function entitlement() {
  if (state.status === 'active') return 'active';
  if (state.status === 'trial') return trialDaysLeft() > 0 ? 'trial' : 'expired';
  return 'none';
}
function isEntitled() { const e = entitlement(); return e === 'trial' || e === 'active'; }

/* ---------- Header account area ---------- */
function renderAccount() {
  const el = document.getElementById('accountArea');
  const e = entitlement();
  if (e === 'active') {
    el.innerHTML = `<span class="pill pro">✓ SaxHero Pro</span>`;
  } else if (e === 'trial') {
    el.innerHTML = `<span class="pill">Free trial · ${trialDaysLeft()} day${trialDaysLeft() === 1 ? '' : 's'} left</span>`;
  } else if (e === 'expired') {
    el.innerHTML = `<span class="pill warn">Trial ended</span><button class="btn primary" id="ctaBtn">Subscribe</button>`;
  } else {
    el.innerHTML = `<button class="btn primary" id="ctaBtn">Try 7 days free</button>`;
  }
  const cta = document.getElementById('ctaBtn');
  if (cta) cta.onclick = () => openPaywall();
}

/* ---------- Tabs ---------- */
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + btn.dataset.tab).classList.add('active');
  });
});

/* ---------- Song grid ---------- */
function songDuration(song) {
  const beats = song.notes.reduce((a, n) => a + n.d, 0);
  return Math.round(beats / song.tempo * 60);
}
function diffClass(d) { return d.toLowerCase(); }

function songCardHTML(song, opts = {}) {
  const locked = !song.free && !isEntitled();
  const dur = songDuration(song);
  return `
    <div class="song-card ${opts.generated ? 'generated' : ''}" data-song="${song.id}">
      <div class="song-rank">${opts.generated ? '✦' : song.rank}</div>
      <div class="song-meta">
        <strong>${song.title}</strong>
        <span>${song.artist}</span>
        <div class="song-tags">
          <span class="tag ${diffClass(song.difficulty)}">${song.difficulty}</span>
          <span class="tag">${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}</span>
          ${song.free && !isEntitled() ? '<span class="tag free-tag">FREE</span>' : ''}
          ${opts.generated ? '<span class="tag" style="color:var(--purple)">GENERATED</span>' : ''}
        </div>
      </div>
      ${locked ? '<span class="lock-badge">🔒</span>' : ''}
    </div>`;
}

function renderSongs() {
  const grid = document.getElementById('songGrid');
  grid.innerHTML = SONGS.map(s => songCardHTML(s)).join('');
  grid.querySelectorAll('.song-card').forEach(card => {
    card.onclick = () => {
      const song = SONGS.find(s => s.id === card.dataset.song);
      if (!song.free && !isEntitled()) return openPaywall();
      openPlayer(song);
    };
  });
  renderGenerated();
}

/* ---------- Lessons ---------- */
function renderLessons() {
  const list = document.getElementById('lessonList');
  list.innerHTML = LESSONS.map(l => {
    const locked = !l.free && !isEntitled();
    return `
      <div class="lesson-card" data-lesson="${l.id}">
        <div class="lesson-num">${l.num}</div>
        <div class="song-meta">
          <strong>${l.title}</strong>
          <span>${l.sub}</span>
        </div>
        ${locked ? '<span class="lock-badge">🔒</span>' : (l.type === 'play' ? '<span class="lock-badge">▶</span>' : '<span class="lock-badge">📖</span>')}
      </div>`;
  }).join('');
  list.querySelectorAll('.lesson-card').forEach(card => {
    card.onclick = () => {
      const lesson = LESSONS.find(l => l.id === card.dataset.lesson);
      if (!lesson.free && !isEntitled()) return openPaywall();
      if (lesson.type === 'info') {
        document.getElementById('lessonModalTitle').textContent = `Lesson ${lesson.num}: ${lesson.title}`;
        document.getElementById('lessonModalBody').innerHTML = lesson.body;
        document.getElementById('lessonModal').classList.add('open');
      } else {
        openPlayer(lesson.song);
      }
    };
  });
}

/* ---------- Search → generated tutorials ---------- */
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GEN_SCALES = [
  ['G4','A4','B4','C5','D5','E5','F#5','G5'],       // G major
  ['E4','F#4','G4','A4','B4','C5','D5','E5'],       // E minor
  ['A4','B4','C5','D5','E5','F#5','G5','A5'],       // A dorian-ish
  ['D4','E4','F#4','G4','A4','B4','C5','D5'],       // D mixolydian
];
const GEN_RHYTHMS = [
  [1, 0.5, 0.5, 1, 1],
  [0.5, 0.5, 1, 2],
  [1.5, 0.5, 1, 1],
  [0.5, 0.5, 0.5, 0.5, 2],
];

function generateSong(title) {
  const rand = mulberry32(hashString(title.toLowerCase().trim()));
  const scale = GEN_SCALES[Math.floor(rand() * GEN_SCALES.length)];
  const tempo = 72 + Math.floor(rand() * 48);
  const notes = [];
  let deg = 2 + Math.floor(rand() * 3);
  for (let phrase = 0; phrase < 6; phrase++) {
    const rhythm = GEN_RHYTHMS[Math.floor(rand() * GEN_RHYTHMS.length)];
    for (const d of rhythm) {
      // random-walk melody biased back toward the middle of the scale
      const drift = rand() < 0.5 ? -1 : 1;
      const pull = deg > 5 ? -1 : deg < 2 ? 1 : 0;
      deg = Math.max(0, Math.min(scale.length - 1, deg + (rand() < 0.3 ? pull || drift : drift)));
      notes.push({ n: scale[deg], d });
    }
    if (phrase % 2 === 1) notes.push({ n: 'R', d: 1 });
  }
  notes.push({ n: scale[0], d: 3 }); // resolve home
  const diffs = ['Easy', 'Medium', 'Hard'];
  return {
    id: 'gen-' + hashString(title.toLowerCase().trim()).toString(36),
    title, artist: 'Generated sax arrangement',
    difficulty: diffs[Math.floor(rand() * 2)], tempo, free: false, generated: true,
    notes,
  };
}

function renderGenerated() {
  const grid = document.getElementById('genGrid');
  const gen = state.generated || [];
  document.getElementById('genTitle').style.display = gen.length ? 'block' : 'none';
  grid.innerHTML = gen.map(s => songCardHTML(s, { generated: true })).join('');
  grid.querySelectorAll('.song-card').forEach(card => {
    card.onclick = () => {
      const song = gen.find(s => s.id === card.dataset.song);
      if (!isEntitled() && !song.freebie) return openPaywall();
      openPlayer(song);
    };
  });
}

document.getElementById('searchBtn').onclick = doSearch;
document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

function doSearch() {
  const q = document.getElementById('searchInput').value.trim();
  const status = document.getElementById('searchStatus');
  if (!q) { status.textContent = 'Type a song name first.'; return; }

  // one free generation, then paywall — the taste that sells the trial
  if (!isEntitled() && state.usedFreeGeneration) {
    status.textContent = 'Unlimited song generation is part of SaxHero Pro.';
    return openPaywall();
  }

  status.innerHTML = `<span class="spinner">♪</span> Finding “${q}” and arranging it for alto sax…`;
  setTimeout(() => {
    const song = generateSong(q);
    if (!isEntitled()) { state.usedFreeGeneration = true; song.freebie = true; }
    state.generated = [song, ...(state.generated || []).filter(s => s.id !== song.id)].slice(0, 12);
    saveState(state);
    status.textContent = `Ready! “${q}” is arranged and playable.`;
    renderGenerated();
    openPlayer(song);
  }, 1400);
}

/* ============================================================
   PLAYER — canvas + audio
   ============================================================ */
const overlay = document.getElementById('playerOverlay');
const canvas = document.getElementById('playerCanvas');
const ctx = canvas.getContext('2d');

const LANES = [
  { key: 'oct', color: '#f2a25c', label: 'octave key' },
  { key: 'L1', color: '#f3ef7d', label: '' },
  { key: 'L2', color: '#f3ef7d', label: 'left hand' },
  { key: 'L3', color: '#f3ef7d', label: '' },
  { key: 'R1', color: '#a8c8f0', label: '' },
  { key: 'R2', color: '#a8c8f0', label: 'right hand' },
  { key: 'R3', color: '#a8c8f0', label: '' },
];

const player = {
  song: null, playing: false, t: 0, lastFrame: 0, speed: 1, loop: false,
  schedule: [], totalBeats: 0, raf: 0, countIn: 0, stars: [],
};

function buildSchedule(song) {
  let t = 0;
  player.schedule = song.notes.map(n => {
    const item = { ...n, start: t, end: t + n.d };
    t += n.d;
    return item;
  }).filter(n => n.n !== 'R' ? true : true);
  player.totalBeats = t;
}

function openPlayer(song) {
  player.song = song;
  player.speed = parseFloat(document.getElementById('speedSelect').value);
  player.loop = document.getElementById('loopToggle').checked;
  player.t = -4; // 4-beat count-in
  player.playing = false;
  buildSchedule(song);
  document.getElementById('playerSongTitle').textContent = song.title;
  document.getElementById('playerSongArtist').textContent = song.artist + ' · ' + song.tempo + ' BPM';
  document.getElementById('playerTip').classList.remove('hidden');
  document.getElementById('playBtn').textContent = '▶';
  overlay.classList.add('open');
  resizeCanvas();
  if (!player.raf) frame(performance.now());
}

function closePlayer() {
  player.playing = false;
  player.song = null;
  cancelAnimationFrame(player.raf);
  player.raf = 0;
  overlay.classList.remove('open');
  stopAllVoices();
}

document.getElementById('playerBack').onclick = closePlayer;
document.getElementById('speedSelect').onchange = e => { player.speed = parseFloat(e.target.value); };
document.getElementById('loopToggle').onchange = e => { player.loop = e.target.checked; };
document.getElementById('restartBtn').onclick = () => { player.t = -4; stopAllVoices(); };
document.getElementById('playBtn').onclick = togglePlay;

function togglePlay() {
  ensureAudio();
  player.playing = !player.playing;
  document.getElementById('playBtn').textContent = player.playing ? '❚❚' : '▶';
  if (player.playing) document.getElementById('playerTip').classList.add('hidden');
  if (!player.playing) stopAllVoices();
  player.lastFrame = performance.now();
}

function resizeCanvas() {
  const wrap = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = wrap.clientWidth * dpr;
  canvas.height = wrap.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // starfield dust like the reference footage
  player.stars = [];
  for (let i = 0; i < 90; i++) {
    player.stars.push({
      x: Math.random() * wrap.clientWidth,
      y: Math.random() * wrap.clientHeight,
      r: Math.random() * 2.2 + 0.4,
      a: Math.random() * 0.5 + 0.08,
      warm: Math.random() > 0.4,
    });
  }
}
window.addEventListener('resize', () => { if (overlay.classList.contains('open')) resizeCanvas(); });

/* ---------- Drawing ---------- */
const NOW_X = 170;
const PX_PER_BEAT = 80;

function laneYs(h) {
  const top = 190;
  const gap = Math.min(64, (h - top - 40) / 7.6);
  return [top, top + gap * 1.4, top + gap * 2.4, top + gap * 3.4, top + gap * 4.9, top + gap * 5.9, top + gap * 6.9];
}

function noteParts(n) {
  const m = n.match(/^([A-G])(#|b)?(\d)$/);
  return m ? { letter: m[1], acc: m[2] || '', oct: +m[3] } : null;
}
function staffStep(n) {
  const p = noteParts(n);
  if (!p) return 0;
  return STAFF_STEPS[p.letter] + (p.oct - 4) * 7;
}

function draw() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  // dust
  for (const s of player.stars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.warm ? `rgba(210,170,120,${s.a})` : `rgba(200,190,220,${s.a})`;
    ctx.fill();
  }

  if (!player.song) return;

  const staffBottom = 108, lineGap = 13;
  // staff lines
  ctx.strokeStyle = 'rgba(255,255,255,.85)';
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 5; i++) {
    const y = staffBottom - i * lineGap;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  // clef + time signature
  ctx.fillStyle = '#fff';
  ctx.font = '74px serif';
  ctx.fillText('\u{1D11E}', 14, staffBottom + 14);
  ctx.font = 'bold 26px serif';
  ctx.fillText('4', 84, staffBottom - 2 * lineGap - 3);
  ctx.fillText('4', 84, staffBottom - 2);

  // playhead beam over the staff
  const beam = ctx.createLinearGradient(NOW_X - 10, 0, NOW_X + 10, 0);
  beam.addColorStop(0, 'rgba(243,239,125,0)');
  beam.addColorStop(0.5, 'rgba(243,239,125,.75)');
  beam.addColorStop(1, 'rgba(243,239,125,0)');
  ctx.fillStyle = beam;
  ctx.fillRect(NOW_X - 10, 18, 20, 140);

  const ys = laneYs(h);
  const R = 22;

  // notes: staff heads, names, lane bars
  for (const note of player.schedule) {
    const x = NOW_X + (note.start - player.t) * PX_PER_BEAT;
    const xEnd = x + note.d * PX_PER_BEAT;
    if (xEnd < -40 || x > w + 40) continue;
    if (note.n === 'R') continue;

    const active = player.t >= note.start && player.t < note.end;
    const p = noteParts(note.n);
    const step = staffStep(note.n);
    const yNote = staffBottom - step * (lineGap / 2);

    if (x > NOW_X - 60) {
      // notehead
      ctx.save();
      ctx.translate(x, yNote);
      ctx.rotate(-0.35);
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.6, 4.9, 0, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#fff' : 'rgba(255,255,255,.92)';
      if (note.d >= 3) { ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); } else { ctx.fill(); }
      ctx.restore();
      // stem
      ctx.strokeStyle = 'rgba(255,255,255,.92)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      if (step < 4) { ctx.moveTo(x + 6, yNote - 1); ctx.lineTo(x + 6, yNote - 34); }
      else { ctx.moveTo(x - 6, yNote + 1); ctx.lineTo(x - 6, yNote + 34); }
      ctx.stroke();
      // ledger line for D4/C4 region
      if (step <= -2) {
        ctx.beginPath(); ctx.moveTo(x - 11, staffBottom + lineGap); ctx.lineTo(x + 11, staffBottom + lineGap); ctx.stroke();
      }
      // accidental + name
      ctx.fillStyle = active ? '#fff' : 'rgba(255,255,255,.9)';
      ctx.font = '600 24px -apple-system, sans-serif';
      const label = p.letter + (p.acc === '#' ? '♯' : p.acc === 'b' ? '♭' : '');
      ctx.fillText(label, x - 8, 152);
      if (p.acc) { ctx.font = '20px serif'; ctx.fillText(p.acc === '#' ? '♯' : '♭', x - 22, yNote + 6); }
    }

    // fingering bars
    const fing = FINGERINGS[note.n];
    if (!fing) continue;
    for (let i = 0; i < 7; i++) {
      if (!fing[i]) continue;
      const y = ys[i];
      const barX = Math.max(x, NOW_X);
      const barW = xEnd - barX - 10;
      if (barW < 2) continue;
      ctx.beginPath();
      const bh = 15;
      roundRect(ctx, barX + 6, y - bh / 2, barW, bh, 7);
      ctx.fillStyle = LANES[i].color;
      ctx.globalAlpha = active && barX === NOW_X ? 1 : 0.88;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // key circles + octave key shape + labels (drawn over the bars)
  const activeNote = player.schedule.find(n => n.n !== 'R' && player.t >= n.start && player.t < n.end);
  const activeFing = activeNote ? FINGERINGS[activeNote.n] : null;
  for (let i = 0; i < 7; i++) {
    const y = ys[i];
    const on = activeFing && activeFing[i];
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = LANES[i].color;

    if (i === 0) {
      // octave key: teardrop shape
      ctx.save();
      ctx.translate(NOW_X - R - 32, y);
      ctx.beginPath();
      ctx.moveTo(4, -16);
      ctx.quadraticCurveTo(20, -12, 14, 8);
      ctx.quadraticCurveTo(11, 17, 2, 16);
      ctx.quadraticCurveTo(6, 0, 4, -16);
      ctx.closePath();
      if (on) { glowFill(ctx, LANES[0].color); } else ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(NOW_X - R - 18, y, R * (i > 3 ? 1.06 : 0.92), 0, Math.PI * 2);
      if (on) { glowFill(ctx, LANES[i].color); } else ctx.stroke();
    }
  }
  // lane group labels (octave / left hand / right hand) at left of circles
  ctx.font = '500 21px -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.fillText('octave', 18, ys[0] + 7);
  ctx.fillText('left', 34, ys[2] + 7);
  ctx.fillStyle = '#c9b8f5';
  ctx.fillText('right', 30, ys[5] + 7);

  // count-in indicator
  if (player.t < 0 && player.playing) {
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '700 46px -apple-system, sans-serif';
    ctx.fillText(String(Math.ceil(-player.t)), NOW_X + 30, h / 2);
  }
}

function glowFill(c, color) {
  c.save();
  c.shadowColor = '#fff';
  c.shadowBlur = 26;
  c.fillStyle = '#fff';
  c.fill();
  c.shadowBlur = 0;
  c.lineWidth = 3;
  c.strokeStyle = color;
  c.stroke();
  c.restore();
}

function roundRect(c, x, y, w2, h2, r) {
  const rr = Math.max(0, Math.min(r, w2 / 2, h2 / 2));
  c.moveTo(x + rr, y);
  c.arcTo(x + w2, y, x + w2, y + h2, rr);
  c.arcTo(x + w2, y + h2, x, y + h2, rr);
  c.arcTo(x, y + h2, x, y, rr);
  c.arcTo(x, y, x + w2, y, rr);
  c.closePath();
}

/* ---------- Playback clock ---------- */
let lastCountBeat = null;
function frame(now) {
  player.raf = requestAnimationFrame(frame);
  if (!player.song) return;
  const dt = Math.min(0.1, (now - player.lastFrame) / 1000);
  player.lastFrame = now;

  if (player.playing) {
    const bps = player.song.tempo / 60 * player.speed;
    const prevT = player.t;
    player.t += dt * bps;

    // count-in clicks
    if (player.t < 0.02) {
      const beat = Math.floor(player.t);
      if (beat !== lastCountBeat) { lastCountBeat = beat; click(); }
    }
    // trigger notes crossing the playhead
    for (const note of player.schedule) {
      if (note.n === 'R') continue;
      if (note.start >= prevT && note.start < player.t) {
        playSax(noteFreq(note.n), note.d / bps);
      }
    }
    // end of song
    if (player.t > player.totalBeats + 2) {
      if (player.loop) { player.t = -4; lastCountBeat = null; }
      else { player.playing = false; document.getElementById('playBtn').textContent = '▶'; }
    }
  }
  draw();
}

/* ---------- Audio: sax-ish synth ---------- */
let audio = null, master = null;
const voices = new Set();

function ensureAudio() {
  if (!audio) {
    audio = new (window.AudioContext || window.webkitAudioContext)();
    master = audio.createGain();
    master.gain.value = 0.28;
    master.connect(audio.destination);
  }
  if (audio.state === 'suspended') audio.resume();
}

function noteFreq(n) {
  const p = noteParts(n);
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let s = SEMI[p.letter] + (p.acc === '#' ? 1 : p.acc === 'b' ? -1 : 0);
  const midi = (p.oct + 1) * 12 + s;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playSax(freq, durSec) {
  if (!audio) return;
  const t0 = audio.currentTime;
  const dur = Math.max(0.12, durSec - 0.06);

  const o1 = audio.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = freq;
  const o2 = audio.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = freq; o2.detune.value = 8;
  const filt = audio.createBiquadFilter(); filt.type = 'lowpass';
  filt.frequency.value = Math.min(3200, freq * 4.5); filt.Q.value = 1.1;

  // delayed vibrato
  const lfo = audio.createOscillator(); lfo.frequency.value = 5.2;
  const lfoGain = audio.createGain(); lfoGain.gain.setValueAtTime(0, t0);
  lfoGain.gain.setTargetAtTime(freq * 0.006, t0 + 0.18, 0.12);
  lfo.connect(lfoGain); lfoGain.connect(o1.frequency); lfoGain.connect(o2.frequency);

  const env = audio.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(1, t0 + 0.045);
  env.gain.setValueAtTime(1, t0 + Math.max(0.05, dur - 0.09));
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.1);

  o1.connect(filt); o2.connect(filt); filt.connect(env); env.connect(master);
  o1.start(t0); o2.start(t0); lfo.start(t0);
  const stopAt = t0 + dur + 0.15;
  o1.stop(stopAt); o2.stop(stopAt); lfo.stop(stopAt);
  const v = { o1, o2, lfo, env };
  voices.add(v);
  o1.onended = () => voices.delete(v);
}

function click() {
  if (!audio) return;
  const t0 = audio.currentTime;
  const o = audio.createOscillator(); o.type = 'square'; o.frequency.value = 1500;
  const g = audio.createGain();
  g.gain.setValueAtTime(0.12, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + 0.06);
}

function stopAllVoices() {
  if (!audio) return;
  for (const v of voices) {
    try { v.env.gain.cancelScheduledValues(audio.currentTime); v.env.gain.setTargetAtTime(0.0001, audio.currentTime, 0.03); } catch {}
  }
}

/* ============================================================
   ONBOARDING / PAYWALL WIZARD
   ============================================================ */
const paywallModal = document.getElementById('paywallModal');
const pwStep = document.getElementById('paywallStep');
let pw = { step: 0, plan: 'yearly', level: null };

function openPaywall() {
  pw = { step: 0, plan: 'yearly', level: null };
  paywallModal.classList.add('open');
  renderPaywall();
}

function dots() {
  const total = 5;
  document.getElementById('stepDots').innerHTML =
    Array.from({ length: total }, (_, i) => `<span class="dot ${i <= pw.step ? 'on' : ''}"></span>`).join('');
}

function renderPaywall() {
  dots();
  const expired = entitlement() === 'expired';
  if (pw.step === 0) {
    pwStep.innerHTML = `
      <div class="pw-hero">
        <div class="pw-emoji">🎷</div>
        <h2>${expired ? 'Your trial has ended' : 'Unlock every song'}</h2>
        <p class="sub">${expired ? 'Subscribe to keep playing everything you’ve started.' : 'Learn sax the fun way — free for 7 days.'}</p>
        <div class="pw-bullets">
          <div><span class="ic">✓</span> All Top-10 songs + every lesson, fully unlocked</div>
          <div><span class="ic">✓</span> Unlimited song search — any song, playable instantly</div>
          <div><span class="ic">✓</span> Slow-down, loop, and count-in practice tools</div>
        </div>
        <div class="pw-social"><span class="stars">★★★★★</span> &nbsp;“I played Careless Whisper in a week.” — 12,000+ learners</div>
        <button class="btn primary block" id="pwNext">${expired ? 'See plans' : 'Continue'}</button>
        <p class="fine-print">7-day free trial · Cancel anytime · Reminder before you're charged</p>
      </div>`;
    document.getElementById('pwNext').onclick = () => { pw.step = 1; renderPaywall(); };
  }
  else if (pw.step === 1) {
    pwStep.innerHTML = `
      <div class="pw-hero">
        <h2>How much have you played?</h2>
        <p class="sub">We'll start you in the right place.</p>
      </div>
      <div class="choice-row">
        <button class="choice-btn" data-v="never">🌱 Never — total beginner</button>
        <button class="choice-btn" data-v="little">🎶 A little — I know a few notes</button>
        <button class="choice-btn" data-v="comfy">🔥 Comfortable — I want the hits</button>
      </div>`;
    pwStep.querySelectorAll('.choice-btn').forEach(b => b.onclick = () => {
      pw.level = b.dataset.v; pw.step = 2; renderPaywall();
    });
  }
  else if (pw.step === 2) {
    pwStep.innerHTML = `
      <div class="pw-hero">
        <h2>Choose your plan</h2>
        <p class="sub">Both include a 7-day free trial. Cancel anytime.</p>
      </div>
      <div id="planCards">
        <div class="plan-card ${pw.plan === 'yearly' ? 'selected' : ''}" data-plan="yearly">
          <span class="plan-badge">BEST VALUE · ${PLANS.yearly.save}</span>
          <div><div class="plan-name">Yearly</div><div class="plan-sub">${PLANS.yearly.perMonth}, billed annually</div></div>
          <div class="plan-price">${PLANS.yearly.price}<small>after free trial</small></div>
        </div>
        <div class="plan-card ${pw.plan === 'monthly' ? 'selected' : ''}" data-plan="monthly">
          <div><div class="plan-name">Monthly</div><div class="plan-sub">Flexible, month to month</div></div>
          <div class="plan-price">${PLANS.monthly.price}<small>after free trial</small></div>
        </div>
      </div>
      <button class="btn primary block" id="pwNext">Continue</button>
      <p class="fine-print">You won't be charged today.</p>`;
    pwStep.querySelectorAll('.plan-card').forEach(c => c.onclick = () => { pw.plan = c.dataset.plan; renderPaywall(); });
    document.getElementById('pwNext').onclick = () => { pw.step = 3; renderPaywall(); };
  }
  else if (pw.step === 3) {
    pwStep.innerHTML = `
      <div class="pw-hero">
        <h2>How your free trial works</h2>
      </div>
      <div class="timeline">
        <div class="tl-item">
          <div class="tl-rail"><div class="tl-dot on">🔓</div><div class="tl-line"></div></div>
          <div class="tl-body"><strong>Today — everything unlocks</strong><span>All songs, lessons, and unlimited song search.</span></div>
        </div>
        <div class="tl-item">
          <div class="tl-rail"><div class="tl-dot">🔔</div><div class="tl-line"></div></div>
          <div class="tl-body"><strong>Day 5 — we remind you</strong><span>An email before your trial ends. No surprises.</span></div>
        </div>
        <div class="tl-item">
          <div class="tl-rail"><div class="tl-dot">⭐</div></div>
          <div class="tl-body"><strong>Day 7 — ${PLANS[pw.plan].label} plan starts</strong><span>${PLANS[pw.plan].price} unless you cancel first.</span></div>
        </div>
      </div>
      <button class="btn primary block" id="pwNext">Continue</button>
      <p class="fine-print">Cancel anytime in Settings with two taps.</p>`;
    document.getElementById('pwNext').onclick = () => { pw.step = 4; renderPaywall(); };
  }
  else if (pw.step === 4) {
    pwStep.innerHTML = `
      <div class="pw-hero"><h2>Start your free trial</h2>
      <p class="sub">${PLANS[pw.plan].label} · ${PLANS[pw.plan].price} after 7 days free</p></div>
      <div class="form-field"><label>Email</label>
        <input type="email" id="pwEmail" placeholder="you@example.com" value="${state.email || ''}">
        <div class="field-error" id="errEmail">Enter a valid email.</div></div>
      <div class="form-field"><label>Card number</label>
        <input inputmode="numeric" id="pwCard" placeholder="4242 4242 4242 4242" maxlength="19">
        <div class="field-error" id="errCard">Enter a 16-digit card number.</div></div>
      <div class="form-row">
        <div class="form-field"><label>Expiry</label><input id="pwExp" placeholder="MM/YY" maxlength="5"></div>
        <div class="form-field"><label>CVC</label><input inputmode="numeric" id="pwCvc" placeholder="123" maxlength="4"></div>
      </div>
      <button class="btn primary block" id="pwPay">Start my 7-day free trial</button>
      <div class="secure-note">🔒 Demo checkout — no real payment is processed</div>
      <p class="fine-print">By continuing you agree to the Terms. ${PLANS[pw.plan].price} after trial, cancels anytime.</p>`;
    // light input formatting
    const card = document.getElementById('pwCard');
    card.addEventListener('input', () => {
      card.value = card.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    });
    const exp = document.getElementById('pwExp');
    exp.addEventListener('input', () => {
      let v = exp.value.replace(/\D/g, '').slice(0, 4);
      exp.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
    });
    document.getElementById('pwPay').onclick = () => {
      const email = document.getElementById('pwEmail').value.trim();
      const cardOk = card.value.replace(/\s/g, '').length === 16;
      const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      document.getElementById('errEmail').style.display = emailOk ? 'none' : 'block';
      document.getElementById('errCard').style.display = cardOk ? 'none' : 'block';
      if (!emailOk || !cardOk) return;
      state.email = email;
      state.plan = pw.plan;
      if (entitlement() === 'expired') { state.status = 'active'; }
      else { state.status = 'trial'; state.trialStart = new Date().toISOString(); }
      saveState(state);
      pw.step = 5; renderPaywall();
      refreshAll();
    };
  }
  else {
    const active = state.status === 'active';
    pwStep.innerHTML = `
      <div class="pw-hero">
        <div class="success-check">✓</div>
        <h2>${active ? 'Welcome back to Pro!' : 'Your trial has started!'}</h2>
        <p class="sub">${active ? 'Everything is unlocked again.' : `Everything is unlocked for ${TRIAL_DAYS} days. We'll email ${state.email} before day 7.`}</p>
        <button class="btn primary block" data-close="paywallModal">Start playing</button>
      </div>`;
    bindCloseButtons();
  }
}

/* ---------- Modal close plumbing ---------- */
function bindCloseButtons() {
  document.querySelectorAll('[data-close]').forEach(b => {
    b.onclick = () => document.getElementById(b.dataset.close).classList.remove('open');
  });
}
bindCloseButtons();
document.querySelectorAll('.modal-backdrop').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

/* ---------- Demo reset ---------- */
document.getElementById('resetDemo').onclick = () => {
  localStorage.removeItem('saxhero');
  state = {};
  refreshAll();
};

/* ---------- Boot ---------- */
function refreshAll() {
  renderAccount();
  renderSongs();
  renderLessons();
}
refreshAll();
