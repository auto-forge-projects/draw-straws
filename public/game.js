'use strict';
(function () {
  const setupScreen = document.getElementById('screen-setup');
  const drawScreen = document.getElementById('screen-draw');
  const resultScreen = document.getElementById('screen-result');

  const playerCountInput = document.getElementById('playerCount');
  const setupWarning = document.getElementById('setupWarning');
  const shuffleBtn = document.getElementById('shuffleBtn');

  const turnIndicator = document.getElementById('turnIndicator');
  const strawGrid = document.getElementById('strawGrid');

  const resultCard = document.getElementById('resultCard');
  const ariaLiveResult = document.getElementById('ariaLiveResult');
  const redrawBtn = document.getElementById('redrawBtn');

  let playerCount = null;
  let straws = [];
  let nextTurn = 0;

  function isValidCount(raw) {
    if (!/^\d+$/.test(raw)) return false;
    const n = Number(raw);
    return Number.isInteger(n) && n >= 2 && n <= 20;
  }

  function showScreen(screen) {
    [setupScreen, drawScreen, resultScreen].forEach((s) => { s.hidden = s !== screen; });
  }

  playerCountInput.addEventListener('input', () => {
    const raw = playerCountInput.value.trim();
    const valid = isValidCount(raw);
    shuffleBtn.disabled = !valid;
    shuffleBtn.setAttribute('aria-disabled', String(!valid));
    setupWarning.hidden = valid || raw === '';
  });

  function startDraw(n) {
    playerCount = n;
    straws = createDraw(n);
    nextTurn = 0;
    renderStrawGrid();
    showScreen(drawScreen);
  }

  shuffleBtn.addEventListener('click', () => {
    const raw = playerCountInput.value.trim();
    if (!isValidCount(raw)) {
      setupWarning.hidden = false;
      return;
    }
    startDraw(Number(raw));
  });

  function renderStrawGrid() {
    turnIndicator.textContent = `Sıra: Oyuncu ${nextTurn + 1}`;
    strawGrid.innerHTML = '';
    straws.forEach((straw, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'straw';
      btn.dataset.index = String(i);
      btn.textContent = String(i + 1);
      if (straw.revealed) {
        btn.classList.add('revealed', straw.isShort ? 'short' : 'long');
        btn.textContent = `${i + 1}: ${straw.isShort ? 'Kısa' : 'Uzun'}`;
      } else if (i === nextTurn) {
        btn.classList.add('active');
      }
      btn.addEventListener('click', () => onStrawClick(i));
      strawGrid.appendChild(btn);
    });
    const activeBtn = strawGrid.querySelector('.straw.active');
    if (activeBtn) activeBtn.focus();
  }

  function onStrawClick(index) {
    const straw = straws[index];
    if (!straw || straw.revealed || index !== nextTurn) return; // idempotent/sıra dışı = no-op
    straw.revealed = true;
    nextTurn += 1;
    const allRevealed = straws.every((s) => s.revealed);
    if (allRevealed) {
      showResult();
    } else {
      renderStrawGrid();
    }
  }

  function showResult() {
    const shortStraw = straws.find((s) => s.isShort);
    const playerNo = shortStraw.index + 1;
    resultCard.textContent = `🎯 Kısa çöpü Oyuncu ${playerNo} çekti!`;
    ariaLiveResult.textContent = `Kısa çöpü ${playerNo}. oyuncu çekti.`;
    showScreen(resultScreen);
  }

  redrawBtn.addEventListener('click', () => {
    startDraw(playerCount);
  });
})();
