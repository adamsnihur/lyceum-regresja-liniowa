/**
 * Lyceum: Geometria Myśli - Regresja Liniowa
 * Zintegrowany Silnik Matematyczny, Płynne Animacje Fizyczne & Płótna Dydaktyczne
 */

document.addEventListener('DOMContentLoaded', () => {
  renderMathInDoc();

  // Inicjalizacja modułów
  initModule1GaussSquares();
  initModule2OrthogonalProjection();
  initModule3GradientDescentPhysics();
  initModule4GaussMarkovMorph();
  initModule5Anscombe();
  initModule6InferenceProbe();
  initModule7LassoRidgeGeometry();
  initModule8SandboxTactile();
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
   STATYSTYKA I MATEMATYKA (CORE MATH)
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
      s,
      seBeta0,
      seBeta1,
      tStat
    };
  }
};

/* ==========================================================================
   MODUŁ 1: KWADRATY GAUSSA (GEOMETRIC LEAST SQUARES SQUARES ANIMATION)
   ========================================================================== */
function initModule1GaussSquares() {
  const canvas = document.getElementById('gaussSquaresCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const pts = [
    { x: 1.5, y: 2.5 },
    { x: 2.8, y: 3.2 },
    { x: 4.0, y: 5.5 },
    { x: 5.2, y: 6.0 },
    { x: 6.8, y: 8.5 },
    { x: 8.2, y: 9.0 }
  ];

  const optimal = MathCore.ols(pts.map(p => p.x), pts.map(p => p.y));

  let currentB0 = 0.5;
  let currentB1 = 0.5;
  let showSquares = true;

  const sliderB0 = document.getElementById('m1SliderB0');
  const sliderB1 = document.getElementById('m1SliderB1');
  const valB0 = document.getElementById('m1ValB0');
  const valB1 = document.getElementById('m1ValB1');
  const valRSS = document.getElementById('m1ValRSS');
  const valAreaSum = document.getElementById('m1ValAreaSum');
  const toggleSquaresBtn = document.getElementById('m1ToggleSquares');
  const btnAutoFit = document.getElementById('m1BtnAutoFit');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    render();
  }

  function toScreen(x, y) {
    const rect = canvas.getBoundingClientRect();
    const pad = 45;
    const w = rect.width - 2 * pad;
    const h = rect.height - 2 * pad;
    const sx = pad + (x / 10) * w;
    const sy = rect.height - pad - (y / 12) * h;
    return { sx, sy };
  }

  function render() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Siatka i osie
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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

    // Osie
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
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
        const isPositive = res >= 0;
        const sqX = pScr.sx;
        const sqY = Math.min(pScr.sy, predScr.sy);

        const grad = ctx.createLinearGradient(sqX, sqY, sqX + side, sqY + side);
        grad.addColorStop(0, isPositive ? 'rgba(244, 63, 94, 0.3)' : 'rgba(212, 175, 55, 0.3)');
        grad.addColorStop(1, isPositive ? 'rgba(244, 63, 94, 0.08)' : 'rgba(212, 175, 55, 0.08)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(sqX, sqY, side, side);

        ctx.strokeStyle = isPositive ? 'rgba(244, 63, 94, 0.8)' : 'rgba(212, 175, 55, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sqX, sqY, side, side);

        // Wyświetlanie pola powierzchni e_i^2 wewnątrz kwadratu
        if (side >= 20) {
          ctx.fillStyle = isPositive ? '#fecdd3' : '#fef08a';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(`e²=${(res * res).toFixed(1)}`, sqX + 4, sqY + 14);
        }
      }

      // Pionowy odcinek reszty
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pScr.sx, pScr.sy);
      ctx.lineTo(predScr.sx, predScr.sy);
      ctx.stroke();
    });

    // Linia regresji
    const lineStart = toScreen(0, currentB0);
    const lineEnd = toScreen(10, currentB0 + currentB1 * 10);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(lineStart.sx, lineStart.sy);
    ctx.lineTo(lineEnd.sx, lineEnd.sy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Punkty danych
    pts.forEach(p => {
      const scr = toScreen(p.x, p.y);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(scr.sx, scr.sy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#07090e';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Aktualizacja etykiet
    valB0.textContent = currentB0.toFixed(2);
    valB1.textContent = currentB1.toFixed(2);
    valRSS.textContent = totalRSS.toFixed(2);
    valAreaSum.textContent = totalRSS.toFixed(2);
  }

  sliderB0.addEventListener('input', e => {
    currentB0 = parseFloat(e.target.value);
    render();
  });

  sliderB1.addEventListener('input', e => {
    currentB1 = parseFloat(e.target.value);
    render();
  });

  toggleSquaresBtn.addEventListener('click', () => {
    showSquares = !showSquares;
    toggleSquaresBtn.textContent = showSquares ? 'Ukryj kwadraty' : 'Pokaż kwadraty Gaussa';
    render();
  });

  btnAutoFit.addEventListener('click', () => {
    const startB0 = currentB0;
    const startB1 = currentB1;
    const targetB0 = optimal.beta0;
    const targetB1 = optimal.beta1;
    const duration = 750;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      currentB0 = startB0 + (targetB0 - startB0) * ease;
      currentB1 = startB1 + (targetB1 - startB1) * ease;
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
   MODUŁ 2: RZUT ORTOGONALNY (ISOMETRIC 3D SUBSPACE PROJECTION)
   ========================================================================== */
function initModule2OrthogonalProjection() {
  const canvas = document.getElementById('projCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let angle = 0.5;
  let animating = true;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawProjection();
  }

  function drawProjection() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    const cx = rect.width / 2;
    const cy = rect.height / 2 + 30;

    // Płaszczyzna rozpięta przez kolumny X: col(X)
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(cx - 180, cy - 20);
    ctx.lineTo(cx + 80, cy - 80);
    ctx.lineTo(cx + 180, cy + 40);
    ctx.lineTo(cx - 80, cy + 100);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Etykieta podprzestrzeni col(X)
    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px "JetBrains Mono"';
    ctx.fillText('col(X) = span{x₁, x₂}', cx - 170, cy + 70);

    // Początek układu O (wewnątrz płaszczyzny)
    const ox = cx - 30;
    const oy = cy + 20;

    // Rzutowany wektor y_hat leżący na płaszczyźnie
    const yHatX = ox + 110;
    const yHatY = oy - 40;

    // Wektor rzeczywisty y (unoszący się w 3D ponad płaszczyzną)
    const floatHeight = 110 + 15 * Math.sin(angle);
    const yX = yHatX;
    const yY = yHatY - floatHeight;

    // 1. Wektor błędu / reszt e = y - y_hat (pionowy, ortogonalny)
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(yHatX, yHatY);
    ctx.lineTo(yX, yY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Kąt prosty 90 stopni przy y_hat
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    const s = 14;
    ctx.beginPath();
    ctx.moveTo(yHatX, yHatY - s);
    ctx.lineTo(yHatX - s * 0.7, yHatY - s + s * 0.4);
    ctx.lineTo(yHatX - s * 0.7, yHatY + s * 0.4);
    ctx.stroke();

    // 2. Wektor rzutu y_hat na płaszczyźnie
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(yHatX, yHatY);
    ctx.stroke();

    // Grot wektora y_hat
    drawArrowHead(ox, oy, yHatX, yHatY, '#10b981');

    // 3. Wektor y (oryginalny)
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(yX, yY);
    ctx.stroke();
    drawArrowHead(ox, oy, yX, yY, '#d4af37');

    // Etykiety wektorów
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 13px "JetBrains Mono"';
    ctx.fillText('y (obserwacje)', yX + 12, yY);

    ctx.fillStyle = '#10b981';
    ctx.fillText('ŷ = Xβ̂ (rzut)', yHatX + 10, yHatY + 18);

    ctx.fillStyle = '#f43f5e';
    ctx.fillText('e = y - ŷ  (e ⊥ col(X))', yHatX + 15, yHatY - floatHeight / 2);

    ctx.restore();
  }

  function drawArrowHead(fromX, fromY, toX, toY, color) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 12 * Math.cos(angle - Math.PI / 6), toY - 12 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - 12 * Math.cos(angle + Math.PI / 6), toY - 12 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  function loop() {
    angle += 0.03;
    drawProjection();
    if (animating) requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  setTimeout(() => {
    resize();
    loop();
  }, 100);
}

/* ==========================================================================
   MODUŁ 3: GRADIENT DESCENT FIZYKA & POLE WEKTOROWE
   ========================================================================== */
function initModule3GradientDescentPhysics() {
  const canvas = document.getElementById('gdCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Optymalne parametry
  const targetB0 = 1.2;
  const targetB1 = 0.85;

  let ball = { x: -0.8, y: 1.8, vx: 0, vy: 0 };
  let path = [{ x: ball.x, y: ball.y }];
  let isSimulating = false;
  let learningRate = 0.05;
  let animId = null;

  const sliderLR = document.getElementById('gdSliderLR');
  const valLR = document.getElementById('gdValLR');
  const btnRun = document.getElementById('gdBtnRun');
  const btnReset = document.getElementById('gdBtnReset');
  const valCost = document.getElementById('gdValCost');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawScene();
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
    const pad = 40;
    const w = rect.width - 2 * pad;
    const h = rect.height - 2 * pad;
    // Zakres: b0 in [-1.5, 3.5], b1 in [-0.5, 2.2]
    const sx = pad + ((b0 + 1.5) / 5.0) * w;
    const sy = rect.height - pad - ((b1 + 0.5) / 2.7) * h;
    return { sx, sy };
  }

  function toCoord(sx, sy) {
    const rect = canvas.getBoundingClientRect();
    const pad = 40;
    const w = rect.width - 2 * pad;
    const h = rect.height - 2 * pad;
    const b0 = -1.5 + ((sx - pad) / w) * 5.0;
    const b1 = -0.5 + ((rect.height - pad - sy) / h) * 2.7;
    return { b0, b1 };
  }

  function drawScene() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Rysowanie poziomic (elipsy)
    const levels = [0.2, 0.8, 2.0, 4.0, 7.5, 12.0, 18.0];
    levels.forEach(lvl => {
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const rX = Math.sqrt(lvl / 1.8);
      const rY = Math.sqrt(lvl / 4.5);
      const center = toScreen(targetB0, targetB1);
      const scaleX = (rect.width - 80) / 5.0;
      const scaleY = (rect.height - 80) / 2.7;
      ctx.ellipse(center.sx, center.sy, rX * scaleX, rY * scaleY, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Cel OLS (minimum globalne)
    const opt = toScreen(targetB0, targetB1);
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(opt.sx, opt.sy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#10b981';
    ctx.font = '11px "JetBrains Mono"';
    ctx.fillText('Minimum OLS (J=0)', opt.sx + 10, opt.sy + 4);

    // Trajektoria
    if (path.length > 1) {
      ctx.strokeStyle = '#f43f5e';
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
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(cur.sx, cur.sy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Strzałka wektora gradientu -∇J
    const g = gradient(ball.x, ball.y);
    const gradLen = Math.hypot(g.gb0, g.gb1);
    if (gradLen > 0.01) {
      const stepSx = -g.gb0 * 15;
      const stepSy = g.gb1 * 15;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cur.sx, cur.sy);
      ctx.lineTo(cur.sx + stepSx, cur.sy + stepSy);
      ctx.stroke();
    }

    valCost.textContent = cost(ball.x, ball.y).toFixed(4);
  }

  function stepSim() {
    const g = gradient(ball.x, ball.y);
    ball.x -= learningRate * g.gb0;
    ball.y -= learningRate * g.gb1;

    path.push({ x: ball.x, y: ball.y });
    drawScene();

    const c = cost(ball.x, ball.y);
    if (path.length > 80 || c < 0.001 || c > 100) {
      stopSim();
    }
  }

  function startSim() {
    isSimulating = true;
    btnRun.textContent = 'Zatrzymaj';
    btnRun.classList.replace('bg-emerald-600', 'bg-amber-600');

    function loop() {
      if (!isSimulating) return;
      stepSim();
      animId = setTimeout(() => requestAnimationFrame(loop), 60);
    }
    loop();
  }

  function stopSim() {
    isSimulating = false;
    btnRun.textContent = 'Uruchom spadek';
    btnRun.classList.replace('bg-amber-600', 'bg-emerald-600');
    if (animId) clearTimeout(animId);
  }

  btnRun.addEventListener('click', () => {
    if (isSimulating) stopSim();
    else startSim();
  });

  btnReset.addEventListener('click', () => {
    stopSim();
    ball = { x: -0.8 + Math.random() * 0.4, y: 1.8, vx: 0, vy: 0 };
    path = [{ x: ball.x, y: ball.y }];
    drawScene();
  });

  sliderLR.addEventListener('input', e => {
    learningRate = parseFloat(e.target.value);
    valLR.textContent = learningRate.toFixed(3);
  });

  // Upuszczenie kulki w dowolnym punkcie
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const c = toCoord(sx, sy);
    stopSim();
    ball.x = c.b0;
    ball.y = c.b1;
    path = [{ x: ball.x, y: ball.y }];
    drawScene();
  });

  window.addEventListener('resize', resize);
  setTimeout(resize, 80);
}

/* ==========================================================================
   MODUŁ 4: MORFOWANIE RESZT GAUSSA-MARKOWA
   ========================================================================== */
function initModule4GaussMarkovMorph() {
  const scenarios = {
    ideal: {
      name: 'Wzorzec Idealny (Brak naruszeń)',
      data: Array.from({ length: 30 }, (_, i) => {
        const x = 1 + i * 0.28;
        return { x, y: 1.5 + 0.85 * x + (Math.sin(i * 1.5) * 0.6) };
      }),
      diag: 'Reszty są idealnie losowo rozproszone wokół zera. Stała wariancja, brak zależności szeregowej.',
      remedy: 'Brak konieczności korekt. Estymator OLS jest BLUE.'
    },
    hetero: {
      name: 'Heteroskedastyczność (Rozszerzający się lejek)',
      data: Array.from({ length: 30 }, (_, i) => {
        const x = 1 + i * 0.28;
        const spread = 0.2 + x * 0.4;
        return { x, y: 1.2 + 0.75 * x + (Math.sin(i * 2.3) * spread * 1.6) };
      }),
      diag: 'Wariancja rośnie wraz z wartością X. Kształt rozszerzającego się wachlarza.',
      remedy: 'Zastosuj odporne błędy standardowe White\'a (HC3) lub Ważoną Metodę Najmniejszych Kwadratów (WLS).'
    },
    nonlinear: {
      name: 'Nieliniowość (Ukryta krzywa kwadratowa)',
      data: Array.from({ length: 30 }, (_, i) => {
        const x = 1 + i * 0.28;
        return { x, y: 1.0 + 0.25 * Math.pow(x - 5, 2) + Math.sin(i) * 0.3 };
      }),
      diag: 'Reszty tworzą wyraźną parabolę w kształcie U. Model liniowy jest błędnie wyspecyfikowany.',
      remedy: 'Dodaj wyższe potęgi zmiennej (regresja wielomianowa X²) lub transformację logarytmiczną.'
    },
    leverage: {
      name: 'Wysoka dźwignia i Outlier',
      data: Array.from({ length: 30 }, (_, i) => {
        const x = 1 + i * 0.28;
        if (i === 29) return { x: 9.8, y: 1.5 }; // Ekstremalny punkt dźwigni
        return { x, y: 1.5 + 0.9 * x + Math.sin(i * 1.1) * 0.5 };
      }),
      diag: 'Pojedyncza obserwacja o wysokiej dźwigni drastycznie przekrzywia całą prostą OLS.',
      remedy: 'Analiza odległości Cooka D > 1. Zastosowanie estymacji odpornej (Huber / RANSAC).'
    }
  };

  const select = document.getElementById('gmSelectScenario');
  const txtDiag = document.getElementById('gmTextDiag');
  const txtRemedy = document.getElementById('gmTextRemedy');

  function render(key) {
    const sc = scenarios[key];
    txtDiag.textContent = sc.diag;
    txtRemedy.textContent = sc.remedy;

    const xVals = sc.data.map(d => d.x);
    const yVals = sc.data.map(d => d.y);
    const ols = MathCore.ols(xVals, yVals);

    // Wykres dopasowania
    const traceData = {
      x: xVals,
      y: yVals,
      mode: 'markers',
      name: 'Dane',
      marker: { color: '#38bdf8', size: 8 }
    };

    const traceLine = {
      x: [0.5, 10],
      y: [ols.beta0 + ols.beta1 * 0.5, ols.beta0 + ols.beta1 * 10],
      mode: 'lines',
      name: 'Linia OLS',
      line: { color: '#d4af37', width: 2.5 }
    };

    const layout1 = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(18, 23, 34, 0.7)',
      font: { color: '#94a3b8', family: 'Plus Jakarta Sans', size: 10 },
      margin: { l: 35, r: 20, t: 25, b: 35 },
      xaxis: { gridcolor: '#1e2638' },
      yaxis: { gridcolor: '#1e2638' },
      showlegend: false
    };

    Plotly.react('gmPlotFit', [traceData, traceLine], layout1, { responsive: true, displayModeBar: false });

    // Wykres reszt
    const traceRes = {
      x: ols.yHat,
      y: ols.residuals,
      mode: 'markers',
      name: 'Reszty',
      marker: { color: '#f43f5e', size: 8 }
    };

    const layout2 = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(18, 23, 34, 0.7)',
      font: { color: '#94a3b8', family: 'Plus Jakarta Sans', size: 10 },
      margin: { l: 35, r: 20, t: 25, b: 35 },
      xaxis: { title: 'Wartości dopasowane ŷ', gridcolor: '#1e2638' },
      yaxis: { title: 'Reszty e', gridcolor: '#1e2638' },
      shapes: [
        { type: 'line', x0: 0, x1: 12, y0: 0, y1: 0, line: { color: '#64748b', dash: 'dash' } }
      ],
      showlegend: false
    };

    Plotly.react('gmPlotRes', [traceRes], layout2, { responsive: true, displayModeBar: false });
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
      text: 'Zbiór II: Idealna parabola. Mimo R² = 0.67, prosta linia to kardynalny błąd specyfikacji modelu!'
    },
    III: {
      x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
      y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],
      text: 'Zbiór III: Prawie doskonała linia prosta z jednym potężnym outlierem zmieniającym nachylenie.'
    },
    IV: {
      x: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 19],
      y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 5.56, 7.91, 6.89, 12.50],
      text: 'Zbiór IV: Wszystkie punkty mają x=8 poza jednym (x=19), który sam wyznacza całą prostą!'
    }
  };

  const desc = document.getElementById('ansDesc');
  const buttons = document.querySelectorAll('.ans-btn');

  function render(key) {
    const d = data[key];
    const ols = MathCore.ols(d.x, d.y);
    desc.textContent = d.text;

    document.getElementById('ansB0').textContent = ols.beta0.toFixed(2);
    document.getElementById('ansB1').textContent = ols.beta1.toFixed(3);
    document.getElementById('ansR2').textContent = ols.r2.toFixed(3);

    const traceData = {
      x: d.x,
      y: d.y,
      mode: 'markers',
      name: `Zbiór ${key}`,
      marker: { color: '#38bdf8', size: 10 }
    };

    const traceLine = {
      x: [2, 20],
      y: [ols.beta0 + ols.beta1 * 2, ols.beta0 + ols.beta1 * 20],
      mode: 'lines',
      name: 'Linia OLS',
      line: { color: '#d4af37', width: 2.5 }
    };

    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(18, 23, 34, 0.7)',
      font: { color: '#94a3b8', family: 'Plus Jakarta Sans', size: 11 },
      margin: { l: 40, r: 20, t: 25, b: 40 },
      xaxis: { range: [2, 20], gridcolor: '#1e2638' },
      yaxis: { range: [2, 14], gridcolor: '#1e2638' },
      showlegend: false
    };

    Plotly.react('ansPlot', [traceData, traceLine], layout, { responsive: true, displayModeBar: false });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active', 'border-amber-400', 'text-amber-300'));
      btn.classList.add('active', 'border-amber-400', 'text-amber-300');
      render(btn.dataset.set);
    });
  });

  render('I');
}

/* ==========================================================================
   MODUŁ 6: PASY UFNOŚCI & WNIOSKOWANIE (INFERENCE PROBE)
   ========================================================================== */
function initModule6InferenceProbe() {
  const x = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const y = [5.0, 5.8, 6.7, 8.1, 9.2, 9.7, 11.0, 12.1, 13.4, 14.0, 15.1, 16.0, 17.2];
  const ols = MathCore.ols(x, y);

  const slider = document.getElementById('infSliderConf');
  const valConf = document.getElementById('infValConf');

  const tCritMap = { '0.90': 1.796, '0.95': 2.201, '0.99': 3.106 };

  function render() {
    const conf = slider.value;
    valConf.textContent = Math.round(parseFloat(conf) * 100) + '%';
    const tCrit = tCritMap[conf] || 2.201;

    const gridX = [];
    const meanY = [];
    const ciUp = [];
    const ciDown = [];
    const piUp = [];
    const piDown = [];

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

    const tracePIUp = { x: gridX, y: piUp, mode: 'lines', line: { color: 'rgba(244, 63, 94, 0.25)', width: 1, dash: 'dot' }, showlegend: false };
    const tracePIDown = { x: gridX, y: piDown, mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(244, 63, 94, 0.06)', line: { color: 'rgba(244, 63, 94, 0.25)', width: 1, dash: 'dot' }, name: 'Pas Predykcji' };
    const traceCIUp = { x: gridX, y: ciUp, mode: 'lines', line: { color: 'rgba(56, 189, 248, 0.4)', width: 1 }, showlegend: false };
    const traceCIDown = { x: gridX, y: ciDown, mode: 'lines', fill: 'tonexty', fillcolor: 'rgba(56, 189, 248, 0.18)', line: { color: 'rgba(56, 189, 248, 0.4)', width: 1 }, name: 'Pas Ufności (Średnia)' };

    const traceLine = { x: gridX, y: meanY, mode: 'lines', line: { color: '#d4af37', width: 2.5 }, name: 'Linia OLS' };
    const traceData = { x: x, y: y, mode: 'markers', marker: { color: '#f8fafc', size: 8 }, name: 'Dane' };

    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(18, 23, 34, 0.7)',
      font: { color: '#94a3b8', family: 'Plus Jakarta Sans', size: 11 },
      margin: { l: 40, r: 20, t: 25, b: 40 },
      xaxis: { range: [1, 15], gridcolor: '#1e2638' },
      yaxis: { range: [2, 21], gridcolor: '#1e2638' },
      showlegend: true,
      legend: { orientation: 'h', y: -0.2 }
    };

    Plotly.react('infPlot', [tracePIUp, tracePIDown, traceCIUp, traceCIDown, traceLine, traceData], layout, { responsive: true, displayModeBar: false });
  }

  slider.addEventListener('input', render);
  render();
}

/* ==========================================================================
   MODUŁ 7: GEOMETRIA REGULARYZACJI (LASSO DIAMOND VS RIDGE CIRCLE)
   ========================================================================== */
function initModule7LassoRidgeGeometry() {
  const canvas = document.getElementById('regGeometryCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let lambda = 1.0;
  const slider = document.getElementById('regSliderLambda');
  const valLambda = document.getElementById('regValLambda');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    render();
  }

  function render() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const scale = 55;

    // Osie beta1 i beta2
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, cy);
    ctx.lineTo(rect.width - 30, cy);
    ctx.moveTo(cx, 30);
    ctx.lineTo(cx, rect.height - 30);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '11px "JetBrains Mono"';
    ctx.fillText('β₁', rect.width - 25, cy - 8);
    ctx.fillText('β₂', cx + 8, 30);

    const radius = Math.max(15, 95 - lambda * 18);

    // 1. Ograniczenie Ridge (Kula L2: okrąg)
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 120, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px "Newsreader", serif';
    ctx.fillText('Ridge L₂: ||β||₂² ≤ t', cx - 170, cy + radius + 25);

    // 2. Ograniczenie Lasso (Kula L1: romb)
    ctx.strokeStyle = '#d4af37';
    ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 120, cy - radius);
    ctx.lineTo(cx + 120 + radius, cy);
    ctx.lineTo(cx + 120, cy + radius);
    ctx.lineTo(cx + 120 - radius, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d4af37';
    ctx.fillText('Lasso L₁: |β₁| + |β₂| ≤ t', cx + 70, cy + radius + 25);

    // Punkt styczności Lasso dokładnie na narożniku (beta2 = 0!)
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx + 120 + radius, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 11px "JetBrains Mono"';
    ctx.fillText('Narożnik: β₂ = 0 (Selekcja!)', cx + 120 + radius - 70, cy - 12);
  }

  slider.addEventListener('input', e => {
    lambda = parseFloat(e.target.value);
    valLambda.textContent = lambda.toFixed(1);
    render();
  });

  window.addEventListener('resize', resize);
  setTimeout(resize, 80);
}

/* ==========================================================================
   MODUŁ 8: TACTILE SANDBOX CANVAS
   ========================================================================== */
function initModule8SandboxTactile() {
  const canvas = document.getElementById('tactileCanvas');
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
    const pad = 40;
    const w = rect.width - 2 * pad;
    const h = rect.height - 2 * pad;
    return {
      sx: pad + (x / 10) * w,
      sy: rect.height - pad - (y / 12) * h
    };
  }

  function toMath(sx, sy) {
    const rect = canvas.getBoundingClientRect();
    const pad = 40;
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

    // Siatka
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
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
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(start.sx, start.sy);
    ctx.lineTo(end.sx, end.sy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    drawPoints();

    // Statystyki
    document.getElementById('sbN').textContent = points.length;
    document.getElementById('sbB0').textContent = ols.beta0.toFixed(2);
    document.getElementById('sbB1').textContent = ols.beta1.toFixed(3);
    document.getElementById('sbR2').textContent = ols.r2.toFixed(3);
    document.getElementById('sbFormula').textContent = `ŷ = ${ols.beta0.toFixed(2)} + ${ols.beta1.toFixed(2)}x`;
  }

  function drawPoints() {
    points.forEach(p => {
      const s = toScreen(p.x, p.y);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(s.sx, s.sy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#07090e';
      ctx.lineWidth = 2;
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

  window.addEventListener('resize', resize);
  setTimeout(resize, 80);
}

/* ==========================================================================
   MODUŁ 9: QUIZ WIEDZY
   ========================================================================== */
function initModule9Quiz() {
  const quizCards = document.querySelectorAll('.quiz-card');
  quizCards.forEach(card => {
    card.addEventListener('click', () => {
      const parent = card.parentElement;
      const isCorrect = card.dataset.correct === 'true';
      const feedback = parent.parentElement.querySelector('.quiz-feedback');

      parent.querySelectorAll('.quiz-card').forEach(c => (c.style.pointerEvents = 'none'));

      if (isCorrect) {
        card.classList.add('correct');
        feedback.className = 'quiz-feedback p-3 rounded-lg text-xs leading-relaxed mt-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 block';
        feedback.textContent = 'Znakomicie! ' + card.dataset.explain;
      } else {
        card.classList.add('incorrect');
        const correctCard = parent.querySelector('[data-correct="true"]');
        if (correctCard) correctCard.classList.add('correct');
        feedback.className = 'quiz-feedback p-3 rounded-lg text-xs leading-relaxed mt-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 block';
        feedback.textContent = 'Niepoprawnie. ' + card.dataset.explain;
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

  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (window.scrollY / (docHeight || 1)) * 100 + '%';

    const pos = window.scrollY + 200;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const h = sec.offsetHeight;
      if (pos >= top && pos < top + h) {
        links.forEach(l => {
          if (l.getAttribute('href') === '#' + sec.id) l.classList.add('active');
          else l.classList.remove('active');
        });
      }
    });
  });
}
