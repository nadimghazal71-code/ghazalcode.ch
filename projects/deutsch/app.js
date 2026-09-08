// ---------- Levels ----------
// Each level is a wholly separate track: its own word list and its own progress
// store. The A2 storage key is the one the app has always used, so progress
// made before A1 existed carries over untouched.
const LEVELS = {
  A1: {
    id: 'A1',
    label: 'A1',
    name: 'Start Deutsch 1',
    words: VOCAB_A1,
    storageKey: 'a1vocab_progress_v1',
  },
  A2: {
    id: 'A2',
    label: 'A2',
    name: 'Goethe-Zertifikat A2',
    words: VOCAB_A2,
    storageKey: 'a2vocab_progress_v1',
  },
};

const LEVEL_ORDER = ['A1', 'A2'];
const ACTIVE_LEVEL_KEY = 'deutsch_active_level_v1';

function loadActiveLevel() {
  try {
    const stored = localStorage.getItem(ACTIVE_LEVEL_KEY);
    if (stored && LEVELS[stored]) return stored;
  } catch (e) {
    /* storage unavailable - fall through to the default */
  }
  return 'A1';
}

let activeLevel = loadActiveLevel();

function setActiveLevel(id) {
  if (!LEVELS[id]) return;
  activeLevel = id;
  try {
    localStorage.setItem(ACTIVE_LEVEL_KEY, id);
  } catch (e) {
    /* not fatal - the choice just won't survive a reload */
  }
  renderHome();
}

/** The word list of whichever level is currently selected. */
function words(levelId) {
  return LEVELS[levelId || activeLevel].words;
}

// ---------- Progress storage ----------
// One store per level, loaded lazily and cached here.
const progressByLevel = {};

function loadProgress(levelId) {
  try {
    return JSON.parse(localStorage.getItem(LEVELS[levelId].storageKey)) || {};
  } catch (e) {
    return {};
  }
}

function progressOf(levelId) {
  const id = levelId || activeLevel;
  if (!progressByLevel[id]) progressByLevel[id] = loadProgress(id);
  return progressByLevel[id];
}

function saveProgress(levelId) {
  const id = levelId || activeLevel;
  localStorage.setItem(LEVELS[id].storageKey, JSON.stringify(progressOf(id)));
}

function getLevel(id, levelId) {
  const p = progressOf(levelId);
  return (p[id] && p[id].level) || 0;
}

// currentLesson is the lesson number (see getLessonCount/bumpLessonCount below)
// at which this rating was given - it's what lets isEligible() know when this
// word's cooldown will next elapse.
function setLevel(id, level, currentLesson, levelId) {
  const p = progressOf(levelId);
  const entry = p[id] || { level: 0, timesSeen: 0 };
  entry.level = level;
  entry.timesSeen = (entry.timesSeen || 0) + 1;
  entry.lastSeen = Date.now();
  entry.lastSeenLesson = currentLesson;
  p[id] = entry;
  saveProgress(levelId);
}

// How many Study "lessons" (sessions) must pass before a word at a given level
// becomes eligible to reappear. Index = level. Derived from two fixed points -
// level 3 -> every 5 lessons, level 4 -> every 10 lessons (each level up doubles
// the gap) - rounding the same curve down to levels 0-2. Level 5 has no entry:
// it's handled separately as "mastered, never reappears".
const LEVEL_INTERVAL = [1, 1, 3, 5, 10];

// A "lesson" = one Study session, counted per level so the two tracks schedule
// independently. This counter only advances when a new Study session starts,
// not for Flashcards.
function getLessonCount(levelId) {
  const p = progressOf(levelId);
  return (p.__meta && p.__meta.lessonCount) || 0;
}

function bumpLessonCount(levelId) {
  const p = progressOf(levelId);
  const meta = p.__meta || { lessonCount: 0 };
  meta.lessonCount += 1;
  p.__meta = meta;
  saveProgress(levelId);
  return meta.lessonCount;
}

// Is this word due to reappear in Study right now? Mastered (level 5) words are
// permanently retired. Never-studied words are always eligible. Everything else
// becomes eligible again once enough lessons have passed since it was last rated.
function isEligible(id, currentLesson, levelId) {
  const entry = progressOf(levelId)[id];
  const level = entry ? entry.level : 0;
  if (level >= 5) return false;
  if (!entry || entry.lastSeenLesson == null) return true;
  return currentLesson - entry.lastSeenLesson >= LEVEL_INTERVAL[level];
}

/** Level 0-5 tallies for one level's whole word list. */
function levelCounts(levelId) {
  const counts = [0, 0, 0, 0, 0, 0];
  words(levelId).forEach(e => { counts[getLevel(e.id, levelId)]++; });
  return counts;
}

// ---------- Helpers ----------
function germanDisplay(e) {
  const art = e.artikel ? e.artikel + ' ' : '';
  const note = e.note ? ' (' + e.note + ')' : '';
  return art + e.word + note;
}

function englishDisplay(e) {
  return e.english;
}

function foldUmlauts(s) {
  return s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
}

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/^(der|die|das)\s+/, '')
    .replace(/^to\s+/, '')
    .replace(/[.,;:!?]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function isCorrectAnswer(typed, alternatives) {
  const t = normalize(typed);
  if (!t) return false;
  const tFolded = foldUmlauts(t);
  return alternatives.some(a => {
    const an = normalize(a);
    return an === t || foldUmlauts(an) === tFolded;
  });
}

// A headword can be written with optional parts - "(sich) anmelden",
// "(ein)hundert" - which belong under A and H, not bunched at the front of the
// alphabet. Sorting ignores them, the way a dictionary would.
function sortKey(word) {
  const stripped = word.replace(/\([^)]*\)/g, '').replace(/^[^A-Za-zÄÖÜäöüß]+/, '').trim();
  return stripped || word;
}

function byAlphabet(a, b) {
  return sortKey(a).localeCompare(sortKey(b), 'de');
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Navigation ----------
const screens = {
  home: document.getElementById('screen-home'),
  studySetup: document.getElementById('screen-study-setup'),
  flashSetup: document.getElementById('screen-flash-setup'),
  session: document.getElementById('screen-session'),
  summary: document.getElementById('screen-summary'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
}

function goHome() {
  renderHome();
  showScreen('home');
}

document.querySelectorAll('[data-nav="home"]').forEach(btn => {
  btn.addEventListener('click', goHome);
});

// ---------- Home ----------
const levelList = document.getElementById('level-list');

function renderHome() {
  levelList.innerHTML = '';

  LEVEL_ORDER.forEach(id => {
    const lvl = LEVELS[id];
    const counts = levelCounts(id);
    const total = lvl.words.length;
    const mastered = counts[5];
    const inProgress = counts[1] + counts[2] + counts[3] + counts[4];
    const fresh = counts[0];
    const pct = total ? Math.round(mastered / total * 100) : 0;

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'level-card' + (id === activeLevel ? ' selected' : '');
    card.dataset.level = id;
    card.setAttribute('aria-pressed', String(id === activeLevel));

    const head = document.createElement('div');
    head.className = 'level-card-head';
    head.innerHTML =
      '<span class="level-badge">' + lvl.label + '</span>' +
      '<span class="level-name">' + lvl.name + '</span>' +
      '<span class="level-total">' + total + ' Wörter</span>';
    card.appendChild(head);

    const bar = document.createElement('div');
    bar.className = 'level-bar';
    fillLevelBar(bar, counts, total);
    card.appendChild(bar);

    const stats = document.createElement('div');
    stats.className = 'level-card-stats';
    stats.innerHTML =
      '<span><b>' + mastered + '</b> gelernt</span>' +
      '<span><b>' + inProgress + '</b> in Bearbeitung</span>' +
      '<span><b>' + fresh + '</b> neu</span>' +
      '<span class="level-pct">' + pct + '&nbsp;%</span>';
    card.appendChild(stats);

    card.addEventListener('click', () => setActiveLevel(id));
    levelList.appendChild(card);
  });

  document.querySelectorAll('.level-chip').forEach(chip => {
    chip.textContent = LEVELS[activeLevel].label;
  });
}

/** Paints the level-0..5 distribution into an existing bar element. */
function fillLevelBar(bar, counts, total) {
  bar.innerHTML = '';
  for (let lvl = 0; lvl <= 5; lvl++) {
    if (counts[lvl] === 0) continue;
    const seg = document.createElement('div');
    seg.className = 'seg seg-' + lvl;
    seg.style.width = (counts[lvl] / total * 100) + '%';
    bar.appendChild(seg);
  }
}

document.getElementById('btn-goto-study').addEventListener('click', () => {
  resetSetupSelection('study');
  showScreen('studySetup');
});

document.getElementById('btn-goto-flashcards').addEventListener('click', () => {
  resetSetupSelection('flash');
  showScreen('flashSetup');
});

document.getElementById('btn-reset-progress').addEventListener('click', () => {
  const lvl = LEVELS[activeLevel];
  const question =
    'Fortschritt für ' + lvl.label + ' (' + lvl.name + ') wirklich zurücksetzen?\n' +
    'Das kann nicht rückgängig gemacht werden. Der andere Level bleibt unverändert.';
  if (confirm(question)) {
    progressByLevel[activeLevel] = {};
    saveProgress(activeLevel);
    renderHome();
  }
});

// ---------- Setup screens ----------
const studySelection = { length: null, direction: null };
const flashSelection = { direction: null, order: null };

function resetSetupSelection(which) {
  if (which === 'study') {
    studySelection.length = null;
    studySelection.direction = null;
    document.querySelectorAll('#screen-study-setup .option-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('btn-start-study').disabled = true;
  } else {
    flashSelection.direction = null;
    flashSelection.order = null;
    document.querySelectorAll('#screen-flash-setup .option-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('btn-start-flash').disabled = true;
  }
}

document.querySelectorAll('#screen-study-setup [data-length]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#screen-study-setup [data-length]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    studySelection.length = parseInt(btn.dataset.length, 10);
    checkStudyReady();
  });
});

document.querySelectorAll('#screen-study-setup [data-direction]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#screen-study-setup [data-direction]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    studySelection.direction = btn.dataset.direction;
    checkStudyReady();
  });
});

function checkStudyReady() {
  document.getElementById('btn-start-study').disabled = !(studySelection.length && studySelection.direction);
}

document.querySelectorAll('#screen-flash-setup [data-direction]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#screen-flash-setup [data-direction]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    flashSelection.direction = btn.dataset.direction;
    checkFlashReady();
  });
});

document.querySelectorAll('#screen-flash-setup [data-order]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#screen-flash-setup [data-order]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    flashSelection.order = btn.dataset.order;
    checkFlashReady();
  });
});

function checkFlashReady() {
  document.getElementById('btn-start-flash').disabled = !(flashSelection.direction && flashSelection.order);
}

document.getElementById('btn-start-study').addEventListener('click', () => {
  startStudySession(studySelection.length, studySelection.direction);
});

document.getElementById('btn-start-flash').addEventListener('click', () => {
  startFlashSession(flashSelection.direction, flashSelection.order);
});

// ---------- Session state ----------
// { mode, levelId, direction, words: [ids], index, sessionLevels, currentLesson }
let session = null;

function buildStudyWordList(levelId, n, currentLesson) {
  // Walk the vocabulary A -> Z. A word only counts if it's "due": not mastered,
  // and its level's cooldown (see LEVEL_INTERVAL) has elapsed since it was last
  // rated. This is what makes low levels reappear almost every lesson while
  // level 4 words only resurface once every 10 - and it's still fundamentally
  // an alphabetical scan, so early sessions are dominated by A-words and later
  // sessions drift into B, C, ... as earlier words become due less often.
  const alphabetical = words(levelId).slice().sort((a, b) => byAlphabet(a.word, b.word));

  const selected = new Set();
  function addUpTo(predicate) {
    for (const e of alphabetical) {
      if (selected.size >= n) break;
      if (!selected.has(e.id) && predicate(e)) selected.add(e.id);
    }
  }

  addUpTo(e => isEligible(e.id, currentLesson, levelId)); // 1) preferred: actually due
  addUpTo(e => getLevel(e.id, levelId) < 5);              // 2) fallback: ignore cooldown so a session is rarely short
  addUpTo(() => true);                                     // 3) last resort: everything is mastered - review anyway

  // Re-filter (rather than returning `selected` as-is) so the result is always
  // in alphabetical order, regardless of which pass above contributed each word.
  return alphabetical.filter(e => selected.has(e.id)).map(e => e.id);
}

function startStudySession(length, direction) {
  const levelId = activeLevel;
  // Starting a Study session always counts as one "lesson" - bump the counter
  // first so this session's word selection and ratings are stamped with it.
  const currentLesson = bumpLessonCount(levelId);
  session = {
    mode: 'study',
    levelId,
    direction,
    words: buildStudyWordList(levelId, length, currentLesson),
    index: 0,
    sessionLevels: {},
    currentLesson,
  };
  showScreen('session');
  renderCard();
}

function startFlashSession(direction, order) {
  const levelId = activeLevel;
  const list = words(levelId);
  let ids = list.map(e => e.id);
  if (order === 'shuffle') {
    ids = shuffle(ids);
  } else {
    ids = ids.slice().sort((a, b) => byAlphabet(list[a].word, list[b].word));
  }
  session = {
    mode: 'flash',
    levelId,
    direction,
    words: ids,
    index: 0,
  };
  showScreen('session');
  renderCard();
}

document.querySelectorAll('[data-nav="exit-session"]').forEach(btn => {
  btn.addEventListener('click', goHome);
});

// ---------- Card rendering ----------
const cardTypeBadge = document.getElementById('card-type-badge');
const cardFront = document.getElementById('card-front');
const cardBack = document.getElementById('card-back');
const cardBackText = document.getElementById('card-back-text');
const cardPartizip = document.getElementById('card-partizip');
const answerArea = document.getElementById('answer-area');
const answerInput = document.getElementById('answer-input');
const answerFeedback = document.getElementById('answer-feedback');
const rateArea = document.getElementById('rate-area');
const browseArea = document.getElementById('browse-area');
const revealArea = document.getElementById('reveal-area');
const cardEl = document.getElementById('card');
const sessionProgressFill = document.getElementById('session-progress-fill');
const sessionProgressText = document.getElementById('session-progress-text');
const sessionLevelChip = document.getElementById('session-level-chip');

function currentEntry() {
  return words(session.levelId)[session.words[session.index]];
}

function renderCard() {
  const e = currentEntry();
  const total = session.words.length;
  sessionProgressText.textContent = (session.index + 1) + ' / ' + total;
  sessionProgressFill.style.width = ((session.index) / total * 100) + '%';
  if (sessionLevelChip) sessionLevelChip.textContent = LEVELS[session.levelId].label;

  cardTypeBadge.textContent = e.type;
  cardBack.classList.add('hidden');
  answerFeedback.textContent = '';
  answerFeedback.className = 'answer-feedback';
  answerInput.value = '';

  // Border color reflects the word's level BEFORE this card is rated -
  // "how well I knew it last time" (level 0 = neutral grey ... 5 = green).
  for (let lvl = 0; lvl <= 5; lvl++) cardEl.classList.remove('card-level-' + lvl);
  cardEl.classList.add('card-level-' + getLevel(e.id, session.levelId));

  if (session.direction === 'en-de') {
    cardFront.textContent = englishDisplay(e);
  } else {
    cardFront.textContent = germanDisplay(e);
  }

  rateArea.classList.add('hidden');
  browseArea.classList.add('hidden');

  cardEl.classList.add('card-clickable'); // tapping the card always reveals, in both modes

  if (session.mode === 'study') {
    answerArea.classList.remove('hidden');
    revealArea.classList.add('hidden');
    answerInput.focus();
  } else {
    answerArea.classList.add('hidden');
    revealArea.classList.remove('hidden');
  }
}

function revealAnswer() {
  const e = currentEntry();
  if (session.direction === 'en-de') {
    cardBackText.textContent = germanDisplay(e);
  } else {
    cardBackText.textContent = englishDisplay(e);
  }
  if (e.partizipII) {
    cardPartizip.textContent = 'Partizip II: ' + e.partizipII;
  } else {
    cardPartizip.textContent = '';
  }
  cardBack.classList.remove('hidden');
  answerArea.classList.add('hidden');
  revealArea.classList.add('hidden');
  cardEl.classList.remove('card-clickable');

  if (session.mode === 'study') {
    rateArea.classList.remove('hidden');
  } else {
    browseArea.classList.remove('hidden');
  }
}

function checkAnswer() {
  const e = currentEntry();
  const typed = answerInput.value;
  if (!typed.trim()) {
    revealAnswer();
    return;
  }
  const alternatives = session.direction === 'en-de'
    ? e.word.split('/').map(s => s.trim())
    : e.english.split('/').map(s => s.trim());

  const correct = isCorrectAnswer(typed, alternatives);
  answerFeedback.textContent = correct ? 'Richtig! ✓' : 'Nicht ganz…';
  answerFeedback.className = 'answer-feedback ' + (correct ? 'correct' : 'incorrect');
  revealAnswer();
}

document.getElementById('btn-check').addEventListener('click', checkAnswer);
document.getElementById('btn-show').addEventListener('click', () => {
  answerFeedback.textContent = '';
  revealAnswer();
});
document.getElementById('btn-reveal').addEventListener('click', revealAnswer);

cardEl.addEventListener('click', () => {
  if (session && cardBack.classList.contains('hidden')) {
    answerFeedback.textContent = '';
    revealAnswer();
  }
});

answerInput.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') {
    ev.preventDefault();
    checkAnswer();
  }
});

document.querySelectorAll('.rate-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const level = parseInt(btn.dataset.level, 10);
    const e = currentEntry();
    setLevel(e.id, level, session.currentLesson, session.levelId);
    session.sessionLevels[e.id] = level;
    advance();
  });
});

document.getElementById('btn-next').addEventListener('click', advance);
document.getElementById('btn-prev').addEventListener('click', () => {
  if (session.index > 0) {
    session.index--;
    renderCard();
  }
});

function advance() {
  if (session.index + 1 < session.words.length) {
    session.index++;
    renderCard();
  } else {
    finishSession();
  }
}

function finishSession() {
  if (session.mode === 'study') {
    renderSummary();
    showScreen('summary');
  } else {
    goHome();
  }
}

function renderSummary() {
  const levelId = session.levelId;
  const counts = levelCounts(levelId);

  const reviewed = session.words.length;
  const fives = session.words.filter(id => (session.sessionLevels[id] || 0) === 5).length;

  document.getElementById('summary-line').textContent =
    LEVELS[levelId].label + ' · ' + reviewed + ' Wörter geübt · ' + fives + ' auf Level 5 gebracht';

  fillLevelBar(document.getElementById('summary-level-bar'), counts, words(levelId).length);
}

document.getElementById('btn-study-again').addEventListener('click', () => {
  resetSetupSelection('study');
  showScreen('studySetup');
});

// ---------- Init ----------
goHome();
