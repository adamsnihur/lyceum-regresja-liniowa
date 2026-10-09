/**
 * Lyceum: Interaktywne Kompendium Regresji Liniowej
 * Wersja Dribbble SaaS / EdTech Standard (Kompletne 10 Modułów & Edukacja Wizualna)
 */

document.addEventListener('DOMContentLoaded', () => {
  renderMathInDoc();

  // Inicjalizacja wszystkich 10 modułów
  initModule1GaussSquares();
  initModule2MatrixAndProjection();
  initModule3GradientDescent();
  initModule4GaussMarkov();
  initModule5Anscombe();
  initModule6Inference();
  initModule7Regularization();
  initModule8Sandbox();
  initModule9Quiz();
  initNavScroll();
});

function renderMathInDoc() {
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false
    });
  }
}

/* ==========================================================================
   SILNIK MATEMATYCZNY (CORE MATH)
   ========================================================================== */
const MathCore = {
  mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  },

  ols(x, y) {
    const n = x.length;
    const mx = this.mean(x);
    const my = this.mean(y);

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (x[i] - mx) * (y[i] - my);
      den += Math.pow(x[i] - mx, 2);
    }

    const beta1 = den === 0 ? 0 : num / den;
    const beta0 = my - beta1 * mx;

    let rss = 0;
    let ess = 0;
    let tss = 0;
    const yHat = [];
    const residuals = [];

    for (let i = 0; i < n; i++) {
      const yh = beta0 + beta1 * x[i];
      const res = y[i] - yh;
      yHat.push(yh);
      residuals.push(res);
      rss += res * res;
      ess += Math.pow(yh - my, 2);
      tss += Math.pow(y[i] - my, 2);
    }

    const r2 = tss === 0 ? 1 : Math.max(0, 1 - rss / tss);
    const r2Adj = n > 2 ? 1 - ((1 - r2) * (n - 1)) / (n - 2) : r2;
    const mse = rss / n;
    const s2 = n > 2 ? rss / (n - 2) : 0;
    const s = Math.sqrt(s2);
    const seBeta1 = den === 0 ? 0 : s / Math.sqrt(den);
    const seBeta0 = den === 0 ? 0 : s * Math.sqrt(1 / n + (mx * mx) / den);
    const tStat = seBeta1 === 0 ? 0 : beta1 / seBeta1;

    return {
      n,
      beta0,
      beta1,
      mx,
      my,
      den,
      yHat,
      residuals,
      rss,
      ess,
      tss,
      r2,
      r2Adj,
      mse,
      s,
      seBeta0,
      seBeta1,
      tStat
    };
  }
};

/* ==========================================================================
   MODUŁ 1: KWADRATY GAUSSA (GEOMETRIC LEAST SQUARES)
   ========================================================================== */
function initModule1GaussSquares() {
  const canvas = document.getElementById('m1Canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const pts = [
    { x: 1.5, y: 2.8 },
    { x: 2.8, y: 3.5 },
    { x: 4.0, y: 5.6 },
    { x: 5.4, y: 6.2 },
    { x: 7.0, y: 8.8 },
    { x: 8.5, y: 9.4 }
  ];

  const optimal = MathCore.ols(pts.map(p => p.x), pts.map(p => p.y));

  let currentB0 = 0.6;
  let currentB1 = 0.55;
  let showSquares = true;

  const sliderB0 = document.getElementById('m1SliderB0');
  const sliderB1 = document.getElementById('m1SliderB1');
  const valB0 = document.getElementById('m1ValB0');
  const valB1 = document.getElementById('m1ValB1');
  const valRSS = document.getElementById('m1ValRSS');
  const valMSE = document.getElementById('m1ValMSE');
  const btnToggleSquares = document.getElementById('m1ToggleSquares');
  const btnAutoFit = document.getElementById('m1BtnAutoFit');
  const statusBadge = document.getElementById('m1StatusBadge');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    render();
  }

  function toScreen(x, y) {
    const rect = canvas.getBoundingClientRect();
    const pad = 40;
    const w = rect.width - 2 * pad;
    const h = rect.height - 2 * pad;
    return {
      sx: pad + (x / 10) * w,
      sy: rect.height - pad - (y / 12) * h
    };
  }

  function render() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Siatka w tle (jasny, elegancki styl Dribbble)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 10; i++) {
      const p1 = toScreen(i, 0);
      const p2 = toScreen(i, 12);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    }
    for (let i = 1; i <= 12; i++) {
      const p1 = toScreen(0, i);
      const p2 = toScreen(10, i);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    }

    // Osie X i Y
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    const o = toScreen(0, 0);
    const xMax = toScreen(10, 0);
    const yMax = toScreen(0, 12);
    ctx.beginPath();
    ctx.moveTo(o.sx, o.sy);
    ctx.lineTo(xMax.sx, xMax.sy);
    ctx.moveTo(o.sx, o.sy);
    ctx.lineTo(yMax.sx, yMax.sy);
    ctx.stroke();

    // Rysowanie Kwadratów Gaussa
    let totalRSS = 0;
    pts.forEach(p => {
      const yh = currentB0 + currentB1 * p.x;
      const res = p.y - yh;
      totalRSS += res * res;

      const pScr = toScreen(p.x, p.y);
      const predScr = toScreen(p.x, yh);
      const side = Math.abs(pScr.sy - predScr.sy);

      if (showSquares && side > 1) {
        const isPos = res >= 0;
        const sqX = pScr.sx;
        const sqY = Math.min(pScr.sy, predScr.sy);

        // Subtelne, ciepłe pastele
        ctx.fillStyle = isPos ? 'rgba(225, 29, 72, 0.12)' : 'rgba(217, 119, 6, 0.12)';
        ctx.fillRect(sqX, sqY, side, side);

        ctx.strokeStyle = isPos ? '#f43f5e' : '#d97706';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sqX, sqY, side, side);

        if (side >= 20) {
          ctx.fillStyle = isPos ? '#9f1239' : '#92400e';
          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.fillText(`e²=${(res * res).toFixed(1)}`, sqX + 4, sqY + 13);
        }
      }

      // Kreska reszty
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pScr.sx, pScr.sy);
      ctx.lineTo(predScr.sx, predScr.sy);
      ctx.stroke();
    });

    // Linia OLS
    const l1 = toScreen(0, currentB0);
    const l2 = toScreen(10, currentB0 + currentB1 * 10);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(l1.sx, l1.sy);
    ctx.lineTo(l2.sx, l2.sy);
    ctx.stroke();

    // Punkty danych (Czyste białe z obwódką navy)
    pts.forEach(p => {
      const scr = toScreen(p.x, p.y);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(scr.sx, scr.sy, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    valB0.textContent = currentB0.toFixed(2);
    valB1.textContent = currentB1.toFixed(2);
    valRSS.textContent = totalRSS.toFixed(2);
    valMSE.textContent = (totalRSS / pts.length).toFixed(2);

    const distFromOpt = Math.hypot(currentB0 - optimal.beta0, currentB1 - optimal.beta1);
    if (distFromOpt < 0.05) {
      statusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
      statusBadge.textContent = '✓ Minimum globalne osiągnięte!';
    } else {
      statusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200';
      statusBadge.textContent = 'Trwa ręczne dopasowywanie...';
    }
  }

  sliderB0.addEventListener('input', e => {
    currentB0 = parseFloat(e.target.value);
    render();
  });

  sliderB1.addEventListener('input', e => {
    currentB1 = parseFloat(e.target.value);
    render();
  });

  btnToggleSquares.addEventListener('click', () => {
    showSquares = !showSquares;
    btnToggleSquares.textContent = showSquares ? 'Ukryj kwadraty' : 'Pokaż kwadraty Gaussa';
    render();
  });

  btnAutoFit.addEventListener('click', () => {
    const sB0 = currentB0;
    const sB1 = currentB1;
    const tB0 = optimal.beta0;
    const tB1 = optimal.beta1;
    const duration = 700;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      currentB0 = sB0 + (tB0 - sB0) * ease;
      currentB1 = sB1 + (tB1 - sB1) * ease;
      sliderB0.value = currentB0;
      sliderB1.value = currentB1;
      render();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  window.addEventListener('resize', resize);
  setTimeout(resize, 60);
}

/* ==========================================================================
   MODUŁ 2: KALKULATOR MACIERZOWY & RZUT ORTOGONALNY
   ========================================================================== */
function initModule2MatrixAndProjection() {
  // 1. Dynamiczne wyliczenie macierzy
  const pts = [
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 5 },
    { x: 4, y: 4 },
    { x: 5, y: 6 }
  ];
  const n = pts.length;
  const x = pts.map(p => p.x);
  const y = pts.map(p => p.y);

  let sumX = 0, sumX2 = 0, sumY = 0, sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumX2 += x[i] * x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
  }

  const det = n * sumX2 - sumX * sumX;
  const inv00 = sumX2 / det;
  const inv01 = -sumX / det;
  const inv10 = -sumX / det;
  const inv11 = n / det;
  const b0 = inv00 * sumY + inv01 * sumXY;
  const b1 = inv10 * sumY + inv11 * sumXY;

  const container = document.getElementById('m2MatrixCards');
  if (container) {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span class="font-mono font-bold text-blue-600 block mb-1">1. Macierz Planu X oraz Wektor y:</span>
          $$\\mathbf{X} = \\begin{bmatrix} 1 & 1 \\\\ 1 & 2 \\\\ 1 & 3 \\\\ 1 & 4 \\\\ 1 & 5 \\end{bmatrix}, \\quad \\mathbf{y} = \\begin{bmatrix} 2 \\\\ 3 \\\\ 5 \\\\ 4 \\\\ 6 \\end{bmatrix}$$
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span class="font-mono font-bold text-emerald-600 block mb-1">2. Iloczyn X^T X oraz X^T y:</span>
          $$\\mathbf{X}^T \\mathbf{X} = \\begin{bmatrix} 5 & 15 \\\\ 15 & 55 \\end{bmatrix}, \\quad \\mathbf{X}^T \\mathbf{y} = \\begin{bmatrix} 20 \\\\ 68 \\end{bmatrix}$$
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span class="font-mono font-bold text-amber-600 block mb-1">3. Inwersja (X^T X)^{-1} (det = 50):</span>
          $$(\\mathbf{X}^T \\mathbf{X})^{-1} = \\frac{1}{50} \\begin{bmatrix} 55 & -15 \\\\ -15 & 5 \\end{bmatrix} = \\begin{bmatrix} 1.10 & -0.30 \\\\ -0.30 & 0.10 \\end{bmatrix}$$
        </div>

        <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <span class="font-mono font-bold text-blue-700 block mb-1">4. Wynik OLS β̂ = (X^T X)^{-1} X^T y:</span>
          $$\\hat{\\boldsymbol{\\beta}} = \\begin{bmatrix} 1.10 & -0.30 \\\\ -0.30 & 0.10 \\end{bmatrix} \\begin{bmatrix} 20 \\\\ 68 \\end{bmatrix} = \\begin{bmatrix} ${b0.toFixed(2)} \\\\ ${b1.toFixed(2)} \\end{bmatrix}$$
          <p class="font-sans font-semibold text-blue-900 mt-2">Dopasowana linia: <strong>\\(\\hat{y} = ${b0.toFixed(2)} + ${b1.toFixed(2)}x\\)</strong></p>
        </div>
      </div>
    `;
    renderMathInElement(container);
  }

  // 2. Rzut 3D Canvas
  const canvas = document.getElementById('m2ProjCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let angle = 0;

  function resizeProj() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawProj();
  }

  function drawProj() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    const cx = rect.width / 2;
    const cy = rect.height / 2 + 20;

    // Płaszczyzna col(X)
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy - 10);
    ctx.lineTo(cx + 70, cy - 70);
    ctx.lineTo(cx + 170, cy + 40);
    ctx.lineTo(cx - 60, cy + 100);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px "JetBrains Mono"';
    ctx.fillText('col(X) = span{x₁, x₂}', cx - 150, cy + 70);

    const ox = cx - 20;
    const oy = cy + 20;
    const yHatX = ox + 100;
    const yHatY = oy - 35;
    const floatH = 100 + 12 * Math.sin(angle);
    const yX = yHatX;
    const yY = yHatY - floatH;

    // Odcinek reszty e prostopadły
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(yHatX, yHatY);
    ctx.lineTo(yX, yY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Symbol kąta prostego 90°
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    const s = 12;
    ctx.beginPath();
    ctx.moveTo(yHatX, yHatY - s);
    ctx.lineTo(yHatX - s * 0.7, yHatY - s + s * 0.4);
    ctx.lineTo(yHatX - s * 0.7, yHatY + s * 0.4);
    ctx.stroke();

    // Wektor y_hat
    drawVector(ox, oy, yHatX, yHatY, '#059669', 'ŷ = Xβ̂');
    // Wektor y
    drawVector(ox, oy, yX, yY, '#2563eb', 'y (obserwacje)');

    // Etykieta e
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 11px "JetBrains Mono"';
    ctx.fillText('e = y - ŷ  (e ⊥ col(X))', yHatX + 10, yHatY - floatH / 2);
  }

  function drawVector(fromX, fromY, toX, toY, color, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    const ang = Math.atan2(toY - fromY, toX - fromX);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 10 * Math.cos(ang - Math.PI / 6), toY - 10 * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(toX - 10 * Math.cos(ang + Math.PI / 6), toY - 10 * Math.sin(ang + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 11px "JetBrains Mono"';
    ctx.fillText(label, toX + 8, toY + 4);
  }

  function loop() {
    angle += 0.035;
    drawProj();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resizeProj);
  setTimeout(() => {
    resizeProj();
    loop();
  }, 100);
}

/* ==========================================================================
   MODUŁ 3: GRADIENT DESCENT (POZIOMICE & FIZYKA KULKI)
   ========================================================================== */
function initModule3GradientDescent() {
  const canvas = document.getElementById('m3Canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const targetB0 = 1.2;
  const targetB1 = 0.85;

  let ball = { x: -0.7, y: 1.8 };
  let path = [{ x: ball.x, y: ball.y }];
  let isRunning = false;
  let learningRate = 0.05;
  let timer = null;

  const sliderLR = document.getElementById('m3SliderLR');
  const valLR = document.getElementById('m3ValLR');
  const btnRun = document.getElementById('m3BtnRun');
  const btnStep = document.getElementById('m3BtnStep');
  const btnReset = document.getElementById('m3BtnReset');
  const valCost = document.getElementById('m3ValCost');
  const valEpoch = document.getElementById('m3ValEpoch');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    render();
  }

  function cost(b0, b1) {
    const db0 = b0 - targetB0;
    const db1 = b1 - targetB1;
    return 1.8 * db0 * db0 + 4.5 * db1 * db1;
  }

  function gradient(b0, b1) {
    return {
      gb0: 3.6 * (b0 - targetB0),
      gb1: 9.0 * (b1 - targetB1)
    };
  }

  function toScreen(b0, b1) {
    const rect = canvas.getBoundingClientRect();
    const pad = 35;
    const w = rect.width - 2 * pad;
    const h = rect.height - 2 * pad;
    return {
      sx: pad + ((b0 + 1.5) / 5.0) * w,
      sy: rect.height - pad - ((b1 + 0.5) / 2.7) * h
    };
  }

  function toCoord(sx, sy) {
    const rect = canvas.getBoundingClientRect();
    const pad = 35;
    const w = rect.width - 2 * pad;
    const h = rect.height - 2 * pad;
    return {
      b0: -1.5 + ((sx - pad) / w) * 5.0,
      b1: -0.5 + ((rect.height - pad - sy) / h) * 2.7
    };
  }

  function render() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Poziomice funkcji kosztu
    const lvls = [0.2, 0.7, 1.8, 3.8, 7.0, 11.5, 17.0];
    lvls.forEach((lvl, i) => {
      ctx.strokeStyle = `rgba(37, 99, 235, ${0.12 + i * 0.04})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const rX = Math.sqrt(lvl / 1.8);
      const rY = Math.sqrt(lvl / 4.5);
      const c = toScreen(targetB0, targetB1);
      const scaleX = (rect.width - 70) / 5.0;
      const scaleY = (rect.height - 70) / 2.7;
      ctx.ellipse(c.sx, c.sy, rX * scaleX, rY * scaleY, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Cel OLS (minimum globalne)
    const opt = toScreen(targetB0, targetB1);
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(opt.sx, opt.sy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#065f46';
    ctx.font = '600 11px "JetBrains Mono"';
    ctx.fillText('Minimum (OLS)', opt.sx + 8, opt.sy + 4);

    // Ścieżka trajektorii
    if (path.length > 1) {
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const p0 = toScreen(path[0].x, path[0].y);
      ctx.moveTo(p0.sx, p0.sy);
      for (let i = 1; i < path.length; i++) {
        const p = toScreen(path[i].x, path[i].y);
        ctx.lineTo(p.sx, p.sy);
      }
      ctx.stroke();
    }

    // Kulka algorytmu
    const cur = toScreen(ball.x, ball.y);
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(cur.sx, cur.sy, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wektor gradientu
    const g = gradient(ball.x, ball.y);
    if (Math.hypot(g.gb0, g.gb1) > 0.01) {
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cur.sx, cur.sy);
      ctx.lineTo(cur.sx - g.gb0 * 12, cur.sy + g.gb1 * 12);
      ctx.stroke();
    }

    valCost.textContent = cost(ball.x, ball.y).toFixed(4);
    valEpoch.textContent = path.length - 1;
  }

  function step() {
    const g = gradient(ball.x, ball.y);
    ball.x -= learningRate * g.gb0;
    ball.y -= learningRate * g.gb1;
    path.push({ x: ball.x, y: ball.y });
    render();

    const c = cost(ball.x, ball.y);
    if (path.length > 70 || c < 0.001 || c > 100) stop();
  }

  function start() {
    isRunning = true;
    btnRun.textContent = 'Pauza';
    btnRun.classList.replace('btn-primary', 'btn-accent');

    function loop() {
      if (!isRunning) return;
      step();
      timer = setTimeout(() => requestAnimationFrame(loop), 60);
    }
    loop();
  }

  function stop() {
    isRunning = false;
    btnRun.textContent = 'Uruchom spadek';
    btnRun.classList.replace('btn-accent', 'btn-primary');
    if (timer) clearTimeout(timer);
  }

  btnRun.addEventListener('click', () => {
    if (isRunning) stop();
    else start();
  });

  btnStep.addEventListener('click', () => {
    if (isRunning) stop();
    step();
  });

  btnReset.addEventListener('click', () => {
    stop();
    ball = { x: -0.7 + Math.random() * 0.4, y: 1.8 };
    path = [{ x: ball.x, y: ball.y }];
    render();
  });

  sliderLR.addEventListener('input', e => {
    learningRate = parseFloat(e.target.value);
    valLR.textContent = learningRate.toFixed(3);
  });

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const c = toCoord(sx, sy);
    stop();
    ball.x = c.b0;
    ball.y = c.b1;
    path = [{ x: ball.x, y: ball.y }];
    render();
  });

  window.addEventListener('resize', resize);
  setTimeout(resize, 80);
}

/* ==========================================================================
   MODUŁ 4: ZAŁOŻENIA GAUSSA-MARKOWA & DIAGNOSTYKA
   ========================================================================== */
function initModule4GaussMarkov() {
  const scenarios = {
    ideal: {
      name: 'Wzorzec Idealny (Gauss-Markov)',
      data: Array.from({ length: 30 }, (_, i) => {
        const x = 1 + i * 0.28;
        return { x, y: 1.5 + 0.85 * x + (Math.sin(i * 1.5) * 0.6) };
      }),
      diag: 'Reszty są losowo rozproszone wokół zera. Stała wariancja, brak zależności.',
      remedy: 'Brak konieczności poprawek. Estymator OLS jest BLUE.'
    },
    hetero: {
      name: 'Heteroskedastyczność (Rozszerzający się lejek)',
      data: Array.from({ length: 30 }, (_, i) => {
        const x = 1 + i * 0.28;
        const spread = 0.2 + x * 0.4;
        return { x, y: 1.2 + 0.75 * x + (Math.sin(i * 2.3) * spread * 1.6) };
      }),
      diag: 'Wariancja rośnie wraz z X. Kształt rozszerzającego się wachlarza.',
      remedy: 'Zastosuj odporne błędy standardowe White\'a (HC3) lub Ważoną Metodę Najmniejszych Kwadratów (WLS).'
    },
    nonlinear: {
      name: 'Nieliniowość (Ukryta parabola)',
      data: Array.from({ length: 30 }, (_, i) => {
        const x = 1 + i * 0.28;
        return { x, y: 1.0 + 0.25 * Math.pow(x - 5, 2) + Math.sin(i) * 0.3 };
      }),
      diag: 'Reszty układają się w parabolę w kształcie U. Model liniowy jest błędny.',
      remedy: 'Dodaj wyższe potęgi zmiennej (regresja wielomianowa X²) lub logarytm.'
    },
    leverage: {
      name: 'Wysoka dźwignia i Outlier',
      data: Array.from({ length: 30 }, (_, i) => {
        const x = 1 + i * 0.28;
        if (i === 29) return { x: 9.8, y: 1.5 };
        return { x, y: 1.5 + 0.9 * x + Math.sin(i * 1.1) * 0.5 };
      }),
      diag: 'Pojedyncza obserwacja o wysokiej dźwigni dramatycznie przekrzywia całą prostą OLS.',
      remedy: 'Zbadaj odległość Cooka D > 1. Użyj estymacji odpornej (Huber / RANSAC).'
    }
  };

  const select = document.getElementById('m4Select');
  const txtDiag = document.getElementById('m4Diag');
  const txtRemedy = document.getElementById('m4Remedy');

  function render(key) {
    const sc = scenarios[key];
    txtDiag.textContent = sc.diag;
    txtRemedy.textContent = sc.remedy;

    const xVals = sc.data.map(d => d.x);
    const yVals = sc.data.map(d => d.y);
    const ols = MathCore.ols(xVals, yVals);

    // Wykres dopasowania
    const tData = { x: xVals, y: yVals, mode: 'markers', marker: { color: '#2563eb', size: 8 } };
    const tLine = { x: [0.5, 10], y: [ols.beta0 + ols.beta1 * 0.5, ols.beta0 + ols.beta1 * 10], mode: 'lines', line: { color: '#d97706', width: 2.5 } };
    const layout1 = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#f8fafc',
      font: { color: '#64748b', family: 'Plus Jakarta Sans', size: 10 },
      margin: { l: 35, r: 20, t: 25, b: 35 },
      xaxis: { gridcolor: '#e2e8f0' },
      yaxis: { gridcolor: '#e2e8f0' },
      showlegend: false
    };
    Plotly.react('m4PlotFit', [tData, tLine], layout1, { responsive: true, displayModeBar: false });

    // Wykres reszt
    const tRes = { x: ols.yHat, y: ols.residuals, mode: 'markers', marker: { color: '#e11d48', size: 8 } };
    const layout2 = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#f8fafc',
      font: { color: '#64748b', family: 'Plus Jakarta Sans', size: 10 },
      margin: { l: 35, r: 20, t: 25, b: 35 },
      xaxis: { title: 'Wartości dopasowane ŷ', gridcolor: '#e2e8f0' },
      yaxis: { title: 'Reszty e', gridcolor: '#e2e8f0' },
      shapes: [{ type: 'line', x0: 0, x1: 12, y0: 0, y1: 0, line: { color: '#94a3b8', dash: 'dash' } }],
      showlegend: false
    };
    Plotly.react('m4PlotRes', [tRes], layout2, { responsive: true, displayModeBar: false });
  }

  select.addEventListener('change', e => render(e.target.value));
  render('ideal');
}

/* ==========================================================================
   MODUŁ 5: KWARTET ANSCOMBE'A
   ========================================================================== */
function initModule5Anscombe() {
  const data = {
    I: {
      x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
      y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],
      text: 'Zbiór I: Podręcznikowy układ liniowy. Klasyczna zależność OLS z normalnym rozkładem reszt.'
    },
    II: {
      x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
      y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74],
      text: 'Zbiór II: Ścisła parabola. Mimo R² = 0.67, prosta linia to fundamentalny błąd specyfikacji modelu!'
    },
    III: {
      x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
      y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],
      text: 'Zbiór III: Prawie idealna linia z jednym skrajnym outlierem, który zmienia nachylenie.'
    },
    IV: {
      x: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 19],
      y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 5.56, 7.91, 6.89, 12.50],
      text: 'Zbiór IV: Wszystkie punkty mają x=8 poza jednym (x=19), który sam wyznacza całą prostą!'
    }
  };

  const desc = document.getElementById('ansDesc');
  const buttons = document.querySelectorAll('.ans-pill');

  function render(key) {
    const d = data[key];
    const ols = MathCore.ols(d.x, d.y);
    desc.textContent = d.text;

    document.getElementById('ansB0').textContent = ols.beta0.toFixed(2);
    document.getElementById('ansB1').textContent = ols.beta1.toFixed(3);
    document.getElementById('ansR2').textContent = ols.r2.toFixed(3);

    const tData = { x: d.x, y: d.y, mode: 'markers', marker: { color: '#2563eb', size: 9 } };
    const tLine = { x: [2, 20], y: [ols.beta0 + ols.beta1 * 2, ols.beta0 + ols.beta1 * 20], mode: 'lines', line: { color: '#d97706', width: 2.5 } };
    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#f8fafc',
      font: { color: '#64748b', family: 'Plus Jakarta Sans', size: 10 },
      margin: { l: 35, r: 20, t: 25, b: 35 },
      xaxis: { range: [2, 20], gridcolor: '#e2e8f0' },
      yaxis: { range: [2, 14], gridcolor: '#e2e8f0' },
      showlegend: false
    };
    Plotly.react('ansPlot', [tData, tLine], layout, { responsive: true, displayModeBar: false });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('bg-blue-600', 'text-white', 'shadow-sm'));
      buttons.forEach(b => b.classList.add('bg-white', 'text-slate-600'));
      btn.classList.remove('bg-white', 'text-slate-600');
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
      render(btn.dataset.set);
    });
  });

  render('I');
}

/* ==========================================================================
   MODUŁ 6: PASY UFNOŚCI & PREDYKCJI
   ========================================================================== */
function initModule6Inference() {
  const x = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const y = [5.0, 5.8, 6.7, 8.1, 9.2, 9.7, 11.0, 12.1, 13.4, 14.0, 15.1, 16.0, 17.2];
  const ols = MathCore.ols(x, y);

  const slider = document.getElementById('infSlider');
  const valConf = document.getElementById('infVal');
  const tCritMap = { '0.90': 1.796, '0.95': 2.201, '0.99': 3.106 };

  function render() {
    const conf = slider.value;
    valConf.textContent = Math.round(parseFloat(conf) * 100) + '%';
    const tCrit = tCritMap[conf] || 2.201;

    const gridX = [], meanY = [], ciUp = [], ciDown = [], piUp = [], piDown = [];
    for (let xi = 1; xi <= 15; xi += 0.2) {
      const yh = ols.beta0 + ols.beta1 * xi;
      const lev = Math.pow(xi - ols.mx, 2) / ols.den;
      const seMean = ols.s * Math.sqrt(1 / ols.n + lev);
      const sePred = ols.s * Math.sqrt(1 + 1 / ols.n + lev);

      gridX.push(xi);
      meanY.push(yh);
      ciUp.push(yh + tCrit * seMean);
      ciDown.push(yh - tCrit * seMean);
      piUp.push(yh + tCrit * sePred);
      piDown.push(yh - tCrit * sePred);
    }

    const tPIUp = { x: gridX, y: piUp, mode: 'lines', line: { color: 'rgba(225, 29, 72, 0.3)', dash: 'dot' }, showlegend: false };
    const tPIDown = { x: gridX, y: piDown, mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(225, 29, 72, 0.08)', line: { color: 'rgba(225, 29, 72, 0.3)', dash: 'dot' }, name: 'Pas Predykcji' };
    const tCIUp = { x: gridX, y: ciUp, mode: 'lines', line: { color: 'rgba(37, 99, 235, 0.4)' }, showlegend: false };
    const tCIDown = { x: gridX, y: ciDown, mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(37, 99, 235, 0.18)', line: { color: 'rgba(37, 99, 235, 0.4)' }, name: 'Pas Ufności' };
    const tLine = { x: gridX, y: meanY, mode: 'lines', line: { color: '#d97706', width: 2.5 }, name: 'Linia OLS' };
    const tData = { x: x, y: y, mode: 'markers', marker: { color: '#0f172a', size: 7.5 }, name: 'Dane' };

    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#f8fafc',
      font: { color: '#64748b', family: 'Plus Jakarta Sans', size: 10 },
      margin: { l: 35, r: 20, t: 25, b: 35 },
      xaxis: { range: [1, 15], gridcolor: '#e2e8f0' },
      yaxis: { range: [2, 21], gridcolor: '#e2e8f0' },
      showlegend: true,
      legend: { orientation: 'h', y: -0.2 }
    };
    Plotly.react('infPlot', [tPIUp, tPIDown, tCIUp, tCIDown, tLine, tData], layout, { responsive: true, displayModeBar: false });
  }

  slider.addEventListener('input', render);
  render();
}

/* ==========================================================================
   MODUŁ 7: REGULARYZACJA (RIDGE VS LASSO)
   ========================================================================== */
function initModule7Regularization() {
  const slider = document.getElementById('regSlider');
  const valLambda = document.getElementById('regVal');
  const valR1 = document.getElementById('regR1');
  const valR2 = document.getElementById('regR2');
  const valL1 = document.getElementById('regL1');
  const valL2 = document.getElementById('regL2');
  const barR1 = document.getElementById('regR1Bar');
  const barR2 = document.getElementById('regR2Bar');
  const barL1 = document.getElementById('regL1Bar');
  const barL2 = document.getElementById('regL2Bar');
  const pctR1 = document.getElementById('regR1Pct');
  const pctR2 = document.getElementById('regR2Pct');
  const pctL1 = document.getElementById('regL1Pct');
  const pctL2 = document.getElementById('regL2Pct');
  const lassoStatus = document.getElementById('regLassoStatus');

  const trueBeta1 = 3.5;
  const trueBeta2 = 2.8;

  // Ścieżki regularyzacji (krzywe bazowe)
  const lVals = [], r1 = [], r2 = [], ls1 = [], ls2 = [];
  for (let i = 0; i <= 4; i += 0.05) {
    lVals.push(i);
    r1.push(trueBeta1 / (1 + 0.8 * i));
    r2.push(trueBeta2 / (1 + 0.8 * i));
    ls1.push(Math.max(0, trueBeta1 - 1.2 * i));
    ls2.push(Math.max(0, trueBeta2 - 1.4 * i));
  }

  const tR1 = { x: lVals, y: r1, name: 'Ridge: β₁', line: { color: '#2563eb', width: 2.5 }, hoverinfo: 'none' };
  const tR2 = { x: lVals, y: r2, name: 'Ridge: β₂', line: { color: '#60a5fa', width: 2, dash: 'dash' }, hoverinfo: 'none' };
  const tL1 = { x: lVals, y: ls1, name: 'Lasso: β₁', line: { color: '#059669', width: 2.5 }, hoverinfo: 'none' };
  const tL2 = { x: lVals, y: ls2, name: 'Lasso: β₂ (zerowanie!)', line: { color: '#e11d48', width: 2.5, dash: 'dot' }, hoverinfo: 'none' };

  function render() {
    const l = parseFloat(slider.value);
    valLambda.textContent = l.toFixed(1);

    const ridge1 = trueBeta1 / (1 + 0.8 * l);
    const ridge2 = trueBeta2 / (1 + 0.8 * l);
    const lasso1 = Math.max(0, trueBeta1 - 1.2 * l);
    const lasso2 = Math.max(0, trueBeta2 - 1.4 * l);

    valR1.textContent = ridge1.toFixed(2);
    valR2.textContent = ridge2.toFixed(2);
    valL1.textContent = lasso1.toFixed(2);
    valL2.textContent = lasso2.toFixed(2);

    // Animowane paski postępu
    if (barR1) barR1.style.width = `${Math.min(100, Math.max(0, (ridge1 / trueBeta1) * 100))}%`;
    if (barR2) barR2.style.width = `${Math.min(100, Math.max(0, (ridge2 / trueBeta2) * 100))}%`;
    if (barL1) barL1.style.width = `${Math.min(100, Math.max(0, (lasso1 / trueBeta1) * 100))}%`;
    if (barL2) barL2.style.width = `${Math.min(100, Math.max(0, (lasso2 / trueBeta2) * 100))}%`;

    if (pctR1) pctR1.textContent = `${Math.round((ridge1 / trueBeta1) * 100)}%`;
    if (pctR2) pctR2.textContent = `${Math.round((ridge2 / trueBeta2) * 100)}%`;
    if (pctL1) pctL1.textContent = `${Math.round((lasso1 / trueBeta1) * 100)}%`;
    if (pctL2) pctL2.textContent = `${Math.round((lasso2 / trueBeta2) * 100)}%`;

    // Status Lasso
    if (lassoStatus) {
      if (lasso2 === 0) {
        lassoStatus.className = 'p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-[11px] font-sans font-semibold flex items-center gap-2 transition-all';
        lassoStatus.innerHTML = '<span class="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span><span>⚡ Selekcja Cech: β₂ = 0 (zmienna usunięta!)</span>';
      } else {
        lassoStatus.className = 'p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-sans font-semibold flex items-center gap-2 transition-all';
        lassoStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500"></span><span>Model Lasso: obie cechy aktywne (β₁ > 0, β₂ > 0)</span>';
      }
    }

    // Dynamiczna pionowa linia wskaźnika aktualnej kary λ
    const tCursor = {
      x: [l, l],
      y: [0, 4],
      mode: 'lines',
      line: { color: '#6366f1', width: 2, dash: 'dash' },
      name: `Kursor λ = ${l.toFixed(1)}`,
      hoverinfo: 'none'
    };

    // Dynamiczne punkty na krzywych przesuwające się wraz z suwakiem
    const tDots = {
      x: [l, l, l, l],
      y: [ridge1, ridge2, lasso1, lasso2],
      mode: 'markers',
      marker: {
        color: ['#2563eb', '#60a5fa', '#059669', lasso2 === 0 ? '#b91c1c' : '#e11d48'],
        size: [12, 11, 12, lasso2 === 0 ? 15 : 11],
        symbol: ['circle', 'circle', 'circle', lasso2 === 0 ? 'x' : 'circle'],
        line: { color: '#ffffff', width: 2 }
      },
      name: 'Punkty dla aktualnego λ',
      hovertemplate: '<b>%{text}</b><br>Kara λ: %{x:.1f}<br>Wartość β: %{y:.2f}<extra></extra>',
      text: [
        `Ridge β₁ = ${ridge1.toFixed(2)}`,
        `Ridge β₂ = ${ridge2.toFixed(2)}`,
        `Lasso β₁ = ${lasso1.toFixed(2)}`,
        lasso2 === 0 ? 'Lasso β₂ = 0.00 (WYEROWANA!)' : `Lasso β₂ = ${lasso2.toFixed(2)}`
      ]
    };

    const annotations = [
      {
        x: l,
        y: 3.9,
        xref: 'x',
        yref: 'y',
        text: `λ = ${l.toFixed(1)}`,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowcolor: '#6366f1',
        ax: 0,
        ay: -24,
        font: { color: '#4338ca', size: 11, weight: 'bold', family: 'Plus Jakarta Sans' },
        bgcolor: '#e0e7ff',
        bordercolor: '#c7d2fe',
        borderwidth: 1,
        borderpad: 4
      }
    ];

    if (lasso2 === 0) {
      annotations.push({
        x: l,
        y: 0,
        xref: 'x',
        yref: 'y',
        text: 'Lasso β₂ = 0 (Selekcja!)',
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowcolor: '#dc2626',
        ax: 40,
        ay: -28,
        font: { color: '#991b1b', size: 10, weight: 'bold', family: 'Plus Jakarta Sans' },
        bgcolor: '#fee2e2',
        bordercolor: '#fca5a5',
        borderwidth: 1,
        borderpad: 3
      });
    }

    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#f8fafc',
      font: { color: '#64748b', family: 'Plus Jakarta Sans', size: 10 },
      margin: { l: 35, r: 25, t: 35, b: 35 },
      xaxis: { title: 'Kara λ (siła regularyzacji)', range: [-0.1, 4.1], gridcolor: '#e2e8f0', zerolinecolor: '#cbd5e1' },
      yaxis: { title: 'Współczynnik β', range: [-0.1, 4.1], gridcolor: '#e2e8f0', zerolinecolor: '#cbd5e1' },
      showlegend: true,
      legend: { orientation: 'h', y: -0.28 },
      annotations: annotations
    };

    Plotly.react('regPlot', [tR1, tR2, tL1, tL2, tCursor, tDots], layout, { responsive: true, displayModeBar: false });
  }

  slider.addEventListener('input', render);
  render();
}

/* ==========================================================================
   MODUŁ 8: TACTILE SANDBOX CANVAS
   ========================================================================== */
function initModule8Sandbox() {
  const canvas = document.getElementById('sbCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let points = [
    { x: 2, y: 3.2 },
    { x: 3.5, y: 4.8 },
    { x: 5, y: 6.0 },
    { x: 6.8, y: 7.9 },
    { x: 8.5, y: 9.3 }
  ];

  let draggingPoint = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    draw();
  }

  function toScreen(x, y) {
    const rect = canvas.getBoundingClientRect();
    const pad = 35;
    const w = rect.width - 2 * pad;
    const h = rect.height - 2 * pad;
    return {
      sx: pad + (x / 10) * w,
      sy: rect.height - pad - (y / 12) * h
    };
  }

  function toMath(sx, sy) {
    const rect = canvas.getBoundingClientRect();
    const pad = 35;
    const w = rect.width - 2 * pad;
    const h = rect.height - 2 * pad;
    return {
      x: Math.max(0, Math.min(10, ((sx - pad) / w) * 10)),
      y: Math.max(0, Math.min(12, ((rect.height - pad - sy) / h) * 12))
    };
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 10; i++) {
      const p1 = toScreen(i, 0);
      const p2 = toScreen(i, 12);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    }
    for (let i = 1; i <= 12; i++) {
      const p1 = toScreen(0, i);
      const p2 = toScreen(10, i);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    }

    if (points.length < 2) {
      drawPoints();
      return;
    }

    const ols = MathCore.ols(points.map(p => p.x), points.map(p => p.y));

    // Kreski reszt
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.4)';
    ctx.setLineDash([3, 3]);
    points.forEach(p => {
      const yh = ols.beta0 + ols.beta1 * p.x;
      const s1 = toScreen(p.x, p.y);
      const s2 = toScreen(p.x, yh);
      ctx.beginPath();
      ctx.moveTo(s1.sx, s1.sy);
      ctx.lineTo(s2.sx, s2.sy);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Linia OLS
    const start = toScreen(0, ols.beta0);
    const end = toScreen(10, ols.beta0 + ols.beta1 * 10);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(start.sx, start.sy);
    ctx.lineTo(end.sx, end.sy);
    ctx.stroke();

    drawPoints();

    document.getElementById('sbN').textContent = points.length;
    document.getElementById('sbB0').textContent = ols.beta0.toFixed(2);
    document.getElementById('sbB1').textContent = ols.beta1.toFixed(3);
    document.getElementById('sbR2').textContent = ols.r2.toFixed(3);
    document.getElementById('sbFormula').textContent = `ŷ = ${ols.beta0.toFixed(2)} + ${ols.beta1.toFixed(2)}x`;
  }

  function drawPoints() {
    points.forEach(p => {
      const s = toScreen(p.x, p.y);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.sx, s.sy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
  }

  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    for (let i = 0; i < points.length; i++) {
      const pScr = toScreen(points[i].x, points[i].y);
      if (Math.hypot(pScr.sx - sx, pScr.sy - sy) < 14) {
        if (e.button === 2) {
          points.splice(i, 1);
          draw();
          return;
        }
        draggingPoint = points[i];
        return;
      }
    }

    if (e.button === 0) {
      const m = toMath(sx, sy);
      points.push({ x: m.x, y: m.y });
      draw();
    }
  });

  window.addEventListener('mousemove', e => {
    if (!draggingPoint) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const m = toMath(sx, sy);
    draggingPoint.x = m.x;
    draggingPoint.y = m.y;
    draw();
  });

  window.addEventListener('mouseup', () => {
    draggingPoint = null;
  });

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  document.getElementById('sbClear').addEventListener('click', () => {
    points = [];
    draw();
  });

  document.getElementById('sbRandom').addEventListener('click', () => {
    points = Array.from({ length: 15 }, () => {
      const x = 1 + Math.random() * 8;
      const y = 1.0 + 1.1 * x + (Math.random() - 0.5) * 2;
      return { x, y: Math.max(0.5, Math.min(11.5, y)) };
    });
    draw();
  });

  // Modal Pythona
  const modal = document.getElementById('pythonModal');
  const btnExport = document.getElementById('sbExport');
  const btnClose = document.getElementById('btnCloseModal');
  const codeBox = document.getElementById('pyCode');

  if (btnExport && modal) {
    btnExport.addEventListener('click', () => {
      const xStr = points.map(p => p.x.toFixed(2)).join(', ');
      const yStr = points.map(p => p.y.toFixed(2)).join(', ');
      codeBox.textContent = `# Regresja Liniowa w Pythonie z Twoich Punktow
import numpy as np
import statsmodels.api as sm
from sklearn.linear_model import LinearRegression

x = np.array([${xStr}]).reshape(-1, 1)
y = np.array([${yStr}])

# 1. Scikit-Learn
model = LinearRegression().fit(x, y)
print(f"b0: {model.intercept_:.4f}, b1: {model.coef_[0]:.4f}, R2: {model.score(x,y):.4f}")

# 2. Statsmodels
X_const = sm.add_constant(x)
res = sm.OLS(y, X_const).fit()
print(res.summary())
`;
      modal.classList.remove('hidden');
    });

    btnClose.addEventListener('click', () => modal.classList.add('hidden'));
  }

  window.addEventListener('resize', resize);
  setTimeout(resize, 80);
}

/* ==========================================================================
   MODUŁ 9: INTERAKTYWNY QUIZ (Z LICZNIKIEM PUNKTÓW)
   ========================================================================== */
function initModule9Quiz() {
  const cards = document.querySelectorAll('.quiz-opt');
  let score = 0;
  let answered = 0;
  const scoreBadge = document.getElementById('quizScoreBadge');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const parent = card.closest('.quiz-q-group');
      const isCorrect = card.dataset.correct === 'true';
      const feedback = parent.querySelector('.quiz-feedback');

      parent.querySelectorAll('.quiz-opt').forEach(c => (c.style.pointerEvents = 'none'));

      answered++;
      if (isCorrect) {
        score++;
        card.classList.add('correct');
        feedback.className = 'quiz-feedback p-3 rounded-xl text-xs leading-relaxed mt-3 bg-emerald-50 border border-emerald-200 text-emerald-800 block';
        feedback.textContent = '✓ Poprawna odpowiedź! ' + card.dataset.explain;
      } else {
        card.classList.add('incorrect');
        const correctCard = parent.querySelector('[data-correct="true"]');
        if (correctCard) correctCard.classList.add('correct');
        feedback.className = 'quiz-feedback p-3 rounded-xl text-xs leading-relaxed mt-3 bg-rose-50 border border-rose-200 text-rose-800 block';
        feedback.textContent = '✗ Błędna odpowiedź. ' + card.dataset.explain;
      }

      if (scoreBadge) {
        scoreBadge.textContent = `Twój wynik: ${score} / ${answered} (${Math.round((score / answered) * 100)}%)`;
      }
    });
  });
}

/* ==========================================================================
   NAWIGACJA
   ========================================================================== */
function initNavScroll() {
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const progress = document.getElementById('scrollProgress');

  if (progress) {
    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (window.scrollY / (docHeight || 1)) * 100 + '%';
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(sec => observer.observe(sec));
}
