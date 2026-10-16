(() => {
  'use strict';

  const STORAGE_KEY = 'inkling-score-sheet-v1';

  const emptyGuess = () => ({ text: '', points: null });
  const initialState = () => ({
    names: { you: '', left: '', right: '' },
    guesses: {
      left: Array.from({ length: 7 }, emptyGuess),
      right: Array.from({ length: 7 }, emptyGuess)
    },
    ink: { left: 0, right: 0 },
    activeSide: 'left',
    scoringMode: false,
    started: false
  });

  let state = loadState();
  let toastTimer;

  const $ = (id) => document.getElementById(id);
  const els = {
    setupView: $('setupView'),
    sheetView: $('sheetView'),
    setupForm: $('setupForm'),
    yourName: $('yourName'),
    leftName: $('leftName'),
    rightName: $('rightName'),
    playerLabel: $('playerLabel'),
    grandTotal: $('grandTotal'),
    summaryTotal: $('summaryTotal'),
    scoringModeButton: $('scoringModeButton'),
    moreButton: $('moreButton'),
    leftTab: $('leftTab'),
    rightTab: $('rightTab'),
    leftTabName: $('leftTabName'),
    rightTabName: $('rightTabName'),
    leftGuessScoreTab: $('leftGuessScoreTab'),
    rightGuessScoreTab: $('rightGuessScoreTab'),
    sideKicker: $('sideKicker'),
    activeNeighbourName: $('activeNeighbourName'),
    activeGuessScore: $('activeGuessScore'),
    guessList: $('guessList'),
    scoringHint: $('scoringHint'),
    leftSummaryName: $('leftSummaryName'),
    rightSummaryName: $('rightSummaryName'),
    leftInkName: $('leftInkName'),
    rightInkName: $('rightInkName'),
    leftGuessScore: $('leftGuessScore'),
    rightGuessScore: $('rightGuessScore'),
    leftInkScore: $('leftInkScore'),
    rightInkScore: $('rightInkScore'),
    guessCount: $('guessCount'),
    modePill: $('modePill'),
    shareButton: $('shareButton'),
    newSheetButton: $('newSheetButton'),
    helpButton: $('helpButton'),
    helpDialog: $('helpDialog'),
    moreDialog: $('moreDialog'),
    optionsPlayerName: $('optionsPlayerName'),
    editNamesButton: $('editNamesButton'),
    clearScoresButton: $('clearScoresButton'),
    editDialog: $('editDialog'),
    editForm: $('editForm'),
    editYourName: $('editYourName'),
    editLeftName: $('editLeftName'),
    editRightName: $('editRightName'),
    closeEditButton: $('closeEditButton'),
    toast: $('toast')
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState();
      const parsed = JSON.parse(raw);
      const fresh = initialState();
      return {
        ...fresh,
        ...parsed,
        names: { ...fresh.names, ...(parsed.names || {}) },
        ink: { ...fresh.ink, ...(parsed.ink || {}) },
        guesses: {
          left: normalizeGuesses(parsed.guesses?.left),
          right: normalizeGuesses(parsed.guesses?.right)
        }
      };
    } catch {
      return initialState();
    }
  }

  function normalizeGuesses(list) {
    return Array.from({ length: 7 }, (_, i) => ({
      text: typeof list?.[i]?.text === 'string' ? list[i].text : '',
      points: [0, 1, 2, 3].includes(list?.[i]?.points) ? list[i].points : null
    }));
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function scoreFor(side) {
    return state.guesses[side].reduce((sum, guess) => sum + (guess.text.trim() ? (guess.points ?? 0) : 0), 0);
  }

  function totalScore() {
    return scoreFor('left') + scoreFor('right') + clampScore(state.ink.left) + clampScore(state.ink.right);
  }

  function usedGuesses() {
    return [...state.guesses.left, ...state.guesses.right].filter((g) => g.text.trim()).length;
  }

  function clampScore(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(10, Math.round(n)));
  }

  function render() {
    els.setupView.hidden = state.started;
    els.sheetView.hidden = !state.started;

    if (!state.started) return;

    const leftScore = scoreFor('left');
    const rightScore = scoreFor('right');
    const total = totalScore();
    const active = state.activeSide;
    const activeName = state.names[active];

    els.playerLabel.textContent = `${state.names.you}'s score`;
    els.optionsPlayerName.textContent = state.names.you;
    els.grandTotal.textContent = total;
    els.summaryTotal.textContent = total;

    els.leftTabName.textContent = state.names.left;
    els.rightTabName.textContent = state.names.right;
    els.leftSummaryName.textContent = state.names.left;
    els.rightSummaryName.textContent = state.names.right;
    els.leftInkName.textContent = state.names.left;
    els.rightInkName.textContent = state.names.right;

    els.leftGuessScoreTab.textContent = leftScore;
    els.rightGuessScoreTab.textContent = rightScore;
    els.leftGuessScore.textContent = leftScore;
    els.rightGuessScore.textContent = rightScore;
    els.activeGuessScore.textContent = scoreFor(active);
    els.guessCount.textContent = usedGuesses();

    els.leftInkScore.value = clampScore(state.ink.left);
    els.rightInkScore.value = clampScore(state.ink.right);

    els.leftTab.classList.toggle('active', active === 'left');
    els.rightTab.classList.toggle('active', active === 'right');
    els.activeNeighbourName.textContent = activeName;
    els.sideKicker.textContent = active === 'left' ? 'PLAYER LEFT' : 'PLAYER RIGHT';

    els.scoringModeButton.textContent = state.scoringMode ? 'Done scoring' : 'Score game';
    els.scoringModeButton.classList.toggle('active', state.scoringMode);
    els.modePill.textContent = state.scoringMode ? 'Scoring' : 'Guessing';
    els.modePill.classList.toggle('scoring', state.scoringMode);
    els.scoringHint.hidden = !state.scoringMode;

    renderGuessRows();
    saveState();
  }

  function renderGuessRows() {
    const side = state.activeSide;
    const rows = state.guesses[side];
    els.guessList.replaceChildren();

    rows.forEach((guess, index) => {
      const row = document.createElement('div');
      row.className = `guess-row${state.scoringMode ? ' scoring' : ''}`;

      const number = document.createElement('span');
      number.className = 'guess-index';
      number.textContent = String(index + 1).padStart(2, '0');

      const input = document.createElement('input');
      input.className = 'guess-input';
      input.type = 'text';
      input.inputMode = 'text';
      input.autocapitalize = 'characters';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.maxLength = 32;
      input.placeholder = 'Guess';
      input.value = guess.text;
      input.disabled = state.scoringMode;
      input.setAttribute('aria-label', `Guess ${index + 1} for ${state.names[side]}`);
      input.addEventListener('input', (event) => {
        state.guesses[side][index].text = event.target.value;
        saveState();
        els.guessCount.textContent = usedGuesses();
      });

      row.append(number, input);

      if (state.scoringMode) {
        const picker = document.createElement('div');
        picker.className = 'points-picker';
        picker.setAttribute('aria-label', `Points for guess ${index + 1}`);

        [0, 1, 2, 3].forEach((value) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `point-button${guess.points === value ? ' selected' : ''}`;
          button.dataset.value = value;
          button.textContent = value === 0 ? '×' : String(value);
          button.disabled = !guess.text.trim();
          button.setAttribute('aria-label', value === 0 ? 'Mark wrong' : `Mark ${value} points`);
          button.addEventListener('click', () => {
            state.guesses[side][index].points = value;
            render();
          });
          picker.appendChild(button);
        });

        row.appendChild(picker);
      }

      els.guessList.appendChild(row);
    });
  }

  function startSheet(event) {
    event.preventDefault();
    state = initialState();
    state.names.you = els.yourName.value.trim();
    state.names.left = els.leftName.value.trim();
    state.names.right = els.rightName.value.trim();
    state.started = true;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setActiveSide(side) {
    state.activeSide = side;
    render();
  }

  function toggleScoringMode() {
    state.scoringMode = !state.scoringMode;
    render();
    if (state.scoringMode) showToast('Scoring mode on');
  }

  function updateInk(side, value) {
    state.ink[side] = clampScore(value);
    renderTotalsOnly();
    saveState();
  }

  function renderTotalsOnly() {
    const total = totalScore();
    els.grandTotal.textContent = total;
    els.summaryTotal.textContent = total;
  }

  async function shareResult() {
    const leftGuess = scoreFor('left');
    const rightGuess = scoreFor('right');
    const leftInk = clampScore(state.ink.left);
    const rightInk = clampScore(state.ink.right);
    const total = totalScore();
    const count = usedGuesses();
    const text = `${state.names.you} — ${total} points in Inkling\nGuessing: ${leftGuess} + ${rightGuess}\nInk: ${leftInk} + ${rightInk}\nGuesses used: ${count}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Inkling score', text });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast('Result copied');
    } catch {
      showToast('Could not copy result');
    }
  }

  function editNames() {
    els.moreDialog.close();
    els.editYourName.value = state.names.you;
    els.editLeftName.value = state.names.left;
    els.editRightName.value = state.names.right;
    els.editDialog.showModal();
  }

  function saveNames(event) {
    event.preventDefault();
    state.names.you = els.editYourName.value.trim();
    state.names.left = els.editLeftName.value.trim();
    state.names.right = els.editRightName.value.trim();
    els.editDialog.close();
    render();
    showToast('Names updated');
  }

  function clearScores() {
    els.moreDialog.close();
    if (!confirm('Clear all guesses and scores but keep the player names?')) return;
    state.guesses.left = Array.from({ length: 7 }, emptyGuess);
    state.guesses.right = Array.from({ length: 7 }, emptyGuess);
    state.ink = { left: 0, right: 0 };
    state.scoringMode = false;
    render();
    showToast('Sheet cleared');
  }

  function newSheet() {
    if (!confirm('Start a completely new score sheet?')) return;
    state = initialState();
    localStorage.removeItem(STORAGE_KEY);
    els.setupForm.reset();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add('show');
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 1800);
  }

  els.setupForm.addEventListener('submit', startSheet);
  els.leftTab.addEventListener('click', () => setActiveSide('left'));
  els.rightTab.addEventListener('click', () => setActiveSide('right'));
  els.scoringModeButton.addEventListener('click', toggleScoringMode);
  els.leftInkScore.addEventListener('input', (event) => updateInk('left', event.target.value));
  els.rightInkScore.addEventListener('input', (event) => updateInk('right', event.target.value));
  els.leftInkScore.addEventListener('blur', render);
  els.rightInkScore.addEventListener('blur', render);
  els.shareButton.addEventListener('click', shareResult);
  els.newSheetButton.addEventListener('click', newSheet);
  els.helpButton.addEventListener('click', () => els.helpDialog.showModal());
  els.moreButton.addEventListener('click', () => els.moreDialog.showModal());
  els.editNamesButton.addEventListener('click', editNames);
  els.clearScoresButton.addEventListener('click', clearScores);
  els.editForm.addEventListener('submit', saveNames);
  els.closeEditButton.addEventListener('click', () => els.editDialog.close());

  for (const dialog of [els.helpDialog, els.moreDialog, els.editDialog]) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  render();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    });
  }
})();
