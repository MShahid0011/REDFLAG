/* ============================================
   RED FLAG — App Logic
   ============================================ */

let SCENARIOS = [];
let order = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let categoryStats = {}; // type -> {correct, total}

const elScreenIntro = document.getElementById('screen-intro');
const elScreenQuiz = document.getElementById('screen-quiz');
const elScreenResults = document.getElementById('screen-results');

const elExhibit = document.getElementById('exhibit');
const elCaseTypeBadge = document.getElementById('case-type-badge');
const elCaseDifficulty = document.getElementById('case-difficulty');
const elCaseProgress = document.getElementById('case-progress');
const elProgressFill = document.getElementById('progress-fill');

const elVerdictZone = document.getElementById('verdict-zone');
const elFeedbackZone = document.getElementById('feedback-zone');
const elFeedbackHeader = document.getElementById('feedback-header');
const elFeedbackBody = document.getElementById('feedback-body');

const elBtnStart = document.getElementById('btn-start');
const elBtnNext = document.getElementById('btn-next');
const elBtnRestart = document.getElementById('btn-restart');

const TYPE_LABELS = { email: 'EMAIL', sms: 'SMS', call: 'PHONE CALL' };

/* ---------- bootstrap ---------- */
async function loadScenarios() {
  // Loaded from scenarios-data.js (inline) so the app works
  // even when opened directly as a file, with no local server required.
  SCENARIOS = SCENARIOS_DATA;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  order = shuffle(SCENARIOS.map((_, i) => i));
  currentIndex = 0;
  score = 0;
  categoryStats = {};
  elScreenIntro.classList.add('hidden');
  elScreenResults.classList.add('hidden');
  elScreenQuiz.classList.remove('hidden');
  renderCase();
}

/* ---------- rendering a case ---------- */
function renderCase() {
  answered = false;
  const scenario = SCENARIOS[order[currentIndex]];

  elCaseTypeBadge.textContent = TYPE_LABELS[scenario.type] || scenario.type.toUpperCase();
  elCaseDifficulty.textContent = 'DIFFICULTY: ' + scenario.difficulty.toUpperCase();
  elCaseProgress.textContent = String(currentIndex + 1).padStart(2, '0') + ' / ' + String(SCENARIOS.length).padStart(2, '0');
  elProgressFill.style.width = ((currentIndex) / SCENARIOS.length * 100) + '%';

  elExhibit.innerHTML = buildExhibitHTML(scenario);

  elVerdictZone.classList.remove('hidden');
  elFeedbackZone.classList.add('hidden');

  // reset verdict buttons
  document.querySelectorAll('.btn-verdict').forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('chosen-correct', 'chosen-wrong');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function buildExhibitHTML(scenario) {
  const bodyTextEscaped = escapeHtml(scenario.content);

  if (scenario.type === 'email') {
    return `
      <div class="exhibit-email-bar">
        <div class="exhibit-email-row">
          <span class="exhibit-email-label">From</span>
          <span class="exhibit-email-value" data-field="sender">${escapeHtml(scenario.sender)}</span>
        </div>
        <div class="exhibit-subject" data-field="subject">${escapeHtml(scenario.subject)}</div>
      </div>
      <div class="exhibit-body" data-field="content">${bodyTextEscaped}</div>
    `;
  }

  if (scenario.type === 'sms') {
    return `
      <div class="exhibit-sms-bar">${escapeHtml(scenario.sender)}</div>
      <div class="exhibit-sms-body">
        <div class="exhibit-sms-bubble" data-field="content">${bodyTextEscaped}</div>
      </div>
    `;
  }

  if (scenario.type === 'call') {
    return `
      <div class="exhibit-call-bar">
        <span class="exhibit-call-icon">&#9742;</span>
        <div class="exhibit-call-caller">${escapeHtml(scenario.sender)}</div>
        <div class="exhibit-call-status">CALL TRANSCRIPT</div>
      </div>
      <div class="exhibit-call-body" data-field="content">${bodyTextEscaped}</div>
    `;
  }

  return `<div class="exhibit-body">${bodyTextEscaped}</div>`;
}

/* ---------- highlighting red flags in the exhibit text after answering ---------- */
function highlightFlags(scenario) {
  const contentEl = elExhibit.querySelector('[data-field="content"]');
  if (!contentEl || !scenario.redFlags || scenario.redFlags.length === 0) return;

  let html = contentEl.innerHTML;
  scenario.redFlags.forEach((flag, idx) => {
    const escapedSnippet = escapeHtml(flag.snippet);
    if (html.includes(escapedSnippet)) {
      html = html.replace(
        escapedSnippet,
        `<span class="flag-hit" title="${escapeHtml(flag.note)}">${escapedSnippet}</span>`
      );
    }
  });
  contentEl.innerHTML = html;

  // Also try highlighting in sender/subject fields if relevant
  ['sender', 'subject'].forEach(fieldName => {
    const el = elExhibit.querySelector(`[data-field="${fieldName}"]`);
    if (!el) return;
    let fieldHtml = el.innerHTML;
    scenario.redFlags.forEach(flag => {
      const escapedSnippet = escapeHtml(flag.snippet);
      if (fieldHtml.includes(escapedSnippet) && !fieldHtml.includes('flag-hit')) {
        fieldHtml = fieldHtml.replace(
          escapedSnippet,
          `<span class="flag-hit" title="${escapeHtml(flag.note)}">${escapedSnippet}</span>`
        );
      }
    });
    el.innerHTML = fieldHtml;
  });
}

/* ---------- answering ---------- */
function handleVerdict(userSaysPhishing) {
  if (answered) return;
  answered = true;

  const scenario = SCENARIOS[order[currentIndex]];
  const isCorrect = userSaysPhishing === scenario.isPhishing;

  if (isCorrect) score++;

  // category stats
  if (!categoryStats[scenario.type]) categoryStats[scenario.type] = { correct: 0, total: 0 };
  categoryStats[scenario.type].total++;
  if (isCorrect) categoryStats[scenario.type].correct++;

  // button visuals
  const legitBtn = document.querySelector('.btn-legit');
  const phishBtn = document.querySelector('.btn-phish');
  legitBtn.disabled = true;
  phishBtn.disabled = true;

  const chosenBtn = userSaysPhishing ? phishBtn : legitBtn;
  chosenBtn.classList.add(isCorrect ? 'chosen-correct' : 'chosen-wrong');

  // if wrong, also show the correct answer as correct
  if (!isCorrect) {
    const correctBtn = scenario.isPhishing ? phishBtn : legitBtn;
    correctBtn.classList.add('chosen-correct');
  }

  highlightFlags(scenario);
  renderFeedback(scenario, isCorrect);

  elFeedbackZone.classList.remove('hidden');
  setTimeout(() => {
    elFeedbackZone.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function renderFeedback(scenario, isCorrect) {
  elFeedbackHeader.className = 'feedback-header ' + (isCorrect ? 'correct' : 'incorrect');
  elFeedbackHeader.innerHTML = isCorrect
    ? '<span>&#10003;</span> Correct assessment'
    : '<span>&#10007;</span> Not quite &mdash; here\'s what to look for';

  let bodyHtml = '';

  if (scenario.redFlags && scenario.redFlags.length > 0) {
    bodyHtml += '<ul class="flag-list">';
    scenario.redFlags.forEach(flag => {
      bodyHtml += `
        <li class="flag-item">
          <span class="flag-item-icon">&#9873;</span>
          <span class="flag-item-text">
            <span class="flag-item-snippet">${escapeHtml(flag.snippet)}</span><br>
            ${escapeHtml(flag.note)}
          </span>
        </li>`;
    });
    bodyHtml += '</ul>';
  } else {
    bodyHtml += '<p class="no-flags-note">No red flags here &mdash; this is a clean example of a legitimate message.</p>';
  }

  bodyHtml += `
    <div class="explanation-box">
      <strong>ANALYST NOTE</strong>
      ${escapeHtml(scenario.explanation)}
    </div>`;

  elFeedbackBody.innerHTML = bodyHtml;
}

/* ---------- navigation ---------- */
function nextCase() {
  currentIndex++;
  if (currentIndex >= SCENARIOS.length) {
    showResults();
  } else {
    renderCase();
  }
}

function showResults() {
  elProgressFill.style.width = '100%';
  elScreenQuiz.classList.add('hidden');
  elScreenResults.classList.remove('hidden');

  const total = SCENARIOS.length;
  document.getElementById('score-num').textContent = score;
  document.getElementById('score-denom').textContent = '/ ' + total;

  const pct = score / total;
  const circumference = 540.35;
  const offset = circumference * (1 - pct);
  const ringFill = document.getElementById('score-ring-fill');
  ringFill.style.strokeDashoffset = offset;
  ringFill.style.stroke = pct >= 0.75 ? 'var(--green)' : pct >= 0.5 ? 'var(--amber)' : 'var(--red)';

  const tagline = document.getElementById('results-tagline');
  if (pct >= 0.9) tagline.textContent = "Sharp eye. You're catching the details most people miss.";
  else if (pct >= 0.7) tagline.textContent = "Solid instincts. A little more attention to detail and you'll catch them all.";
  else if (pct >= 0.5) tagline.textContent = "You're picking up the obvious cases. The subtle ones need a closer look.";
  else tagline.textContent = "This is exactly why awareness training exists. Review the field notes below.";

  renderBreakdown();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderBreakdown() {
  const rowsEl = document.getElementById('breakdown-rows');
  rowsEl.innerHTML = '';
  const typeOrder = ['email', 'sms', 'call'];

  typeOrder.forEach(type => {
    const stats = categoryStats[type];
    if (!stats) return;
    const pct = (stats.correct / stats.total) * 100;
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    row.innerHTML = `
      <span class="breakdown-row-label">${TYPE_LABELS[type]}</span>
      <span class="breakdown-row-track">
        <span class="breakdown-row-fill" style="width:${pct}%"></span>
      </span>
      <span class="breakdown-row-score">${stats.correct}/${stats.total}</span>
    `;
    rowsEl.appendChild(row);
  });
}

/* ---------- event wiring ---------- */
elBtnStart.addEventListener('click', startQuiz);
elBtnNext.addEventListener('click', nextCase);
elBtnRestart.addEventListener('click', startQuiz);

document.querySelectorAll('.btn-verdict').forEach(btn => {
  btn.addEventListener('click', () => {
    handleVerdict(btn.dataset.verdict === 'phish');
  });
});

loadScenarios();
