/* ============================================================
   PIENSA ANTES DE PUBLICAR · Interacciones
   ============================================================ */

(function () {
  'use strict';

  const CONFIG = {
    // Cambia esta URL por la definitiva si publicas el sitio en otro dominio.
    siteUrl: 'https://piensa-antes-de-publicar.netlify.app',
    team: '—',
    subject: 'Ética',
    teacher: '—'
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Utilidades ---------- */
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    const text = $('#toastText');
    if (!el || !text) return;
    text.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3400);
  }

  function getSiteUrl() {
    if (/^https?:$/.test(location.protocol)) {
      return (location.origin + location.pathname).replace(/index\.html$/i, '').replace(/\/$/, '') || location.origin;
    }
    return CONFIG.siteUrl;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (err) {
        reject(err);
      }
      area.remove();
    });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header ---------- */
  const header = $('.site-header');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');

  function closeNav() {
    if (!navToggle || !navLinks) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
  }

  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navLinks.classList.toggle('is-open', !open);
    });

    navLinks.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNav();
    });
  }

  /* ---------- Footer editable ---------- */
  const teamEl = $('#teamNames');
  if (teamEl) teamEl.textContent = CONFIG.team;
  const subjectEl = $('#subjectName');
  if (subjectEl) subjectEl.textContent = CONFIG.subject;
  const teacherEl = $('#teacherName');
  if (teacherEl) teacherEl.textContent = CONFIG.teacher;

  /* ---------- Publicación del hero ---------- */
  const heroPost = $('#heroPost');
  const heroPublish = $('#heroPublish');
  const heroThink = $('#heroThink');

  if (heroPost && heroPublish && heroThink) {
    heroPublish.addEventListener('click', () => {
      heroPost.classList.remove('is-safe');
      heroPost.classList.remove('is-warn');
      void heroPost.offsetWidth;
      heroPost.classList.add('is-warn');
      toast('Alto: esa foto no es tuya. Pide permiso antes de publicar.');
    });

    heroThink.addEventListener('click', () => {
      heroPost.classList.remove('is-warn');
      heroPost.classList.add('is-safe');
      toast('Bien pensado. Ahora pon a prueba tu criterio.');
    });
  }

  /* ---------- Test: ¿Lo publicarías? ---------- */
  const QUIZ = [
    {
      tag: 'Privacidad',
      q: 'Tu mejor amiga te manda una foto suya y te dice: “no la subas”. ¿Qué haces?',
      options: [
        { t: 'La publico: está graciosa y no se ve nada malo.', ok: false },
        { t: 'Le pregunto si puedo publicarla y respeto su respuesta.', ok: true },
        { t: 'La subo solo a un grupo pequeño; ahí no pasa nada.', ok: false }
      ],
      why: 'El consentimiento no depende del tamaño del grupo. Si te pidió que no la subieras, no se sube. Punto.'
    },
    {
      tag: 'Desinformación',
      q: 'Ves una noticia increíble: “suspenden clases por una invasión de serpientes”. Nadie más la comparte. ¿Qué haces?',
      options: [
        { t: 'La comparto de inmediato para avisar a todos.', ok: false },
        { t: 'Busco la fuente, la fecha y si otros medios lo reportan.', ok: true },
        { t: 'La reenvío solo a mis amigos cercanos.', ok: false }
      ],
      why: 'Una noticia sin fuente verificable es una sospecha, no un aviso. Reenviarla también es difundirla.'
    },
    {
      tag: 'Respeto',
      q: 'Un compañero se equivocó al exponer y alguien empieza a burlarse en el chat del grupo. ¿Qué haces?',
      options: [
        { t: 'Respondo con otra burla para que se le quite.', ok: false },
        { t: 'Le escribo en privado, lo apoyo y no alimentos las burlas.', ok: true },
        { t: 'Le doy “me gusta” a los comentarios para no quedar mal.', ok: false }
      ],
      why: 'Reírte o darle like al acoso también es participar. Apoyar en privado y no amplificar la burla cambia la situación.'
    },
    {
      tag: 'Datos personales',
      q: 'Vas a subir una foto frente a tu escuela. Se alcanza a ver el nombre del plantel y tu horario. ¿Qué haces?',
      options: [
        { t: 'La publico: se ve bien y es solo mi escuela.', ok: false },
        { t: 'Recorto, difumino los datos o la subo sin ubicación.', ok: true },
        { t: 'La subo y la borro después; nadie alcanza a verla.', ok: false }
      ],
      why: 'Una captura o un “guardar” ocurre en segundos. Lo que expones una vez puede quedar fuera de tu control.'
    },
    {
      tag: 'Ciberacoso',
      q: 'En el grupo de la clase están mandando mensajes hirientes contra un compañero. ¿Qué haces?',
      options: [
        { t: 'Me río para no hacer drama; no es mi problema.', ok: false },
        { t: 'Guardo evidencia, lo apoyo y reporto con él o con un adulto.', ok: true },
        { t: 'Salgo del grupo y ya; así no me involucro.', ok: false }
      ],
      why: 'Callar también deja marca. Reportar no es ser chismoso: es proteger a alguien y frenar el acoso.'
    }
  ];

  const quizCard = $('#quizCard');
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;

  function quizDots() {
    return QUIZ.map((_, i) => {
      const cls = i < quizIndex ? 'is-done' : i === quizIndex ? 'is-now' : '';
      return `<i class="${cls}"></i>`;
    }).join('');
  }

  function renderQuestion() {
    if (!quizCard) return;
    quizAnswered = false;
    const item = QUIZ[quizIndex];
    const percent = Math.round((quizIndex / QUIZ.length) * 100);

    quizCard.innerHTML = `
      <div class="quiz-progress"><span style="width:${percent}%"></span></div>
      <div class="quiz-meta">
        <span class="quiz-tag">${escapeHTML(item.tag)}</span>
        <span class="quiz-count">${quizIndex + 1} / ${QUIZ.length}</span>
      </div>
      <h3 class="quiz-q">${escapeHTML(item.q)}</h3>
      <div class="quiz-options">
        ${item.options.map((opt, i) => `
          <button type="button" class="quiz-opt" data-opt="${i}">
            <span class="opt-letter" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
            <span>${escapeHTML(opt.t)}</span>
          </button>`).join('')}
      </div>
      <div class="quiz-feedback-slot"></div>
      <div class="quiz-footer">
        <div class="quiz-dots" aria-hidden="true">${quizDots()}</div>
        <button type="button" class="quiz-next" data-next hidden>
          ${quizIndex === QUIZ.length - 1 ? 'Ver resultado' : 'Siguiente'} <span aria-hidden="true">→</span>
        </button>
      </div>`;
  }

  function renderResult() {
    if (!quizCard) return;
    const total = QUIZ.length;
    const percent = Math.round((quizScore / total) * 100);
    let title;
    let message;

    if (quizScore === total) {
      title = 'Filtro digital: activado.';
      message = 'Piensas antes de publicar y eso se nota. Comparte el test con alguien que todavía publica en modo impulso.';
    } else if (quizScore >= 3) {
      title = 'Buen criterio. Casi invicto.';
      message = 'Tienes claras varias reglas, pero todavía hay situaciones que pueden sorprenderte. Repasa las que fallaste y vuelve a intentarlo.';
    } else {
      title = 'Modo impulso detectado.';
      message = 'No pasa nada: el criterio digital se entrena. Vuelve a intentarlo con calma y revisa las cuatro reglas de la campaña.';
    }

    quizCard.innerHTML = `
      <div class="quiz-result">
        <div class="score-ring" style="--pct:${percent}" role="img" aria-label="${quizScore} de ${total} respuestas correctas">
          <div><b>${quizScore}/${total}</b><span>aciertos</span></div>
        </div>
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="result-actions">
          <button type="button" class="btn btn-ghost" data-restart>Intentar de nuevo ↺</button>
          <button type="button" class="btn btn-dark" data-share>Copiar mi resultado</button>
          <a class="btn btn-lime" href="#compromiso">Firmar mi compromiso →</a>
        </div>
      </div>`;
  }

  if (quizCard) {
    quizCard.addEventListener('click', (event) => {
      const opt = event.target.closest('.quiz-opt');

      if (opt && !quizAnswered) {
        quizAnswered = true;
        const chosen = Number(opt.dataset.opt);
        const item = QUIZ[quizIndex];
        const correct = Boolean(item.options[chosen] && item.options[chosen].ok);

        if (correct) quizScore++;

        $$('.quiz-opt', quizCard).forEach((button, i) => {
          button.disabled = true;
          if (item.options[i].ok) button.classList.add('is-correct');
          if (i === chosen && !correct) button.classList.add('is-wrong');
          if (i !== chosen && !item.options[i].ok) button.classList.add('is-muted');
        });

        const slot = $('.quiz-feedback-slot', quizCard);
        if (slot) {
          slot.innerHTML = `
            <div class="quiz-feedback ${correct ? 'feedback-ok' : 'feedback-bad'}">
              <span class="feedback-icon" aria-hidden="true">${correct ? '✓' : '!'}</span>
              <div>
                <strong>${correct ? 'Buena decisión' : 'Piénsalo otra vez'}</strong>
                ${escapeHTML(item.why)}
              </div>
            </div>`;
        }

        const next = $('[data-next]', quizCard);
        if (next) {
          next.hidden = false;
          next.focus({ preventScroll: true });
        }
        return;
      }

      const next = event.target.closest('[data-next]');
      if (next) {
        if (quizIndex < QUIZ.length - 1) {
          quizIndex++;
          renderQuestion();
        } else {
          renderResult();
        }
        return;
      }

      if (event.target.closest('[data-restart]')) {
        quizIndex = 0;
        quizScore = 0;
        renderQuestion();
        return;
      }

      if (event.target.closest('[data-share]')) {
        const text = `Piensa antes de publicar: saqué ${quizScore}/${QUIZ.length} en el test de ética digital. ¿Y tú? ${getSiteUrl()}`;
        copyText(text)
          .then(() => toast('Resultado copiado. Ahora reta a alguien.'))
          .catch(() => toast('No se pudo copiar. Intenta de nuevo.'));
      }
    });

    renderQuestion();
  }

  /* ---------- Muro de consejos ---------- */
  const WALL_KEY = 'pap_muro_v2';
  const COLORS = ['lime', 'sky', 'violet', 'peach', 'white'];
  const SEED_TIPS = [
    { text: 'Si dudas, no publiques. Tu tranquilidad vale más que un like.', author: 'Equipo', color: 'lime' },
    { text: 'Pide permiso antes de subir una foto donde salga alguien más.', author: 'Campaña', color: 'sky' },
    { text: 'Una captura también es pública. No compartas chats privados.', author: 'Equipo', color: 'violet' },
    { text: 'Verifica la fuente antes de reenviar. No seas el altavoz de una mentira.', author: 'Campaña', color: 'peach' },
    { text: 'Lo que publicas con enojo suele durar más que el enojo.', author: 'Equipo', color: 'white' },
    { text: 'Reportar no es ser chismoso: es cuidar a alguien.', author: 'Campaña', color: 'lime' }
  ];

  const wallGrid = $('#wallGrid');
  const wallCount = $('#wallCount');
  const tipForm = $('#tipForm');
  const tipName = $('#tipName');
  const tipText = $('#tipText');
  const tipCount = $('#tipCount');
  const resetWall = $('#resetWall');

  let tips = load(WALL_KEY, null);
  if (!Array.isArray(tips) || tips.length === 0) {
    tips = SEED_TIPS.map((tip, i) => ({
      id: 'seed-' + i,
      text: tip.text,
      author: tip.author,
      color: tip.color,
      likes: 0,
      liked: false
    }));
  }

  function saveWall() {
    save(WALL_KEY, tips);
  }

  function renderWall() {
    if (!wallGrid) return;
    const rotations = [-1.2, 0.9, -0.6, 1.1, -0.9, 0.5];

    wallGrid.innerHTML = tips.map((tip, i) => {
      const color = COLORS.includes(tip.color) ? tip.color : COLORS[i % COLORS.length];
      const rot = rotations[i % rotations.length];
      return `
        <article class="note note--${color}" style="--rot:${rot}deg">
          <p class="note-text">${escapeHTML(tip.text)}</p>
          <div class="note-foot">
            <span class="note-author">${escapeHTML(tip.author || 'Anónimo')}</span>
            <button type="button" class="note-like ${tip.liked ? 'is-liked' : ''}" data-like="${i}"
              aria-pressed="${Boolean(tip.liked)}" aria-label="Marcar como útil: ${escapeHTML(tip.text)}">
              <span aria-hidden="true">♥</span> <span>${Number(tip.likes) || 0}</span>
            </button>
          </div>
        </article>`;
    }).join('');

    if (wallCount) wallCount.textContent = String(tips.length);
  }

  if (wallGrid) {
    renderWall();

    wallGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-like]');
      if (!button) return;
      const index = Number(button.dataset.like);
      const tip = tips[index];
      if (!tip) return;
      tip.liked = !tip.liked;
      tip.likes = Math.max(0, (Number(tip.likes) || 0) + (tip.liked ? 1 : -1));
      saveWall();
      renderWall();
    });
  }

  if (tipForm && tipText) {
    const updateCount = () => {
      if (tipCount) tipCount.textContent = `${tipText.value.length} / 140`;
    };
    tipText.addEventListener('input', updateCount);
    updateCount();

    tipForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = tipText.value.trim().replace(/\s+/g, ' ');
      if (text.length < 5) {
        toast('Escribe un consejo un poco más largo.');
        tipText.focus();
        return;
      }

      const author = (tipName && tipName.value.trim().slice(0, 24)) || 'Anónimo';
      const tip = {
        id: 'user-' + Date.now(),
        text,
        author,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        likes: 0,
        liked: false
      };

      tips.unshift(tip);
      saveWall();
      renderWall();
      tipForm.reset();
      updateCount();
      const first = wallGrid ? wallGrid.firstElementChild : null;
      if (first) first.classList.add('is-new');
      toast('Consejo publicado en el muro. Gracias por aportar.');
    });
  }

  if (resetWall) {
    resetWall.addEventListener('click', () => {
      const confirmed = window.confirm('¿Restaurar los consejos originales? Se borrarán los que agregaste en este dispositivo.');
      if (!confirmed) return;
      tips = SEED_TIPS.map((tip, i) => ({
        id: 'seed-' + i,
        text: tip.text,
        author: tip.author,
        color: tip.color,
        likes: 0,
        liked: false
      }));
      saveWall();
      renderWall();
      toast('Muro restaurado.');
    });
  }

  /* ---------- Compromiso + tarjeta ---------- */
  const COMMIT_KEY = 'pap_commit_v2';
  const commitForm = $('#commitForm');
  const commitName = $('#commitName');
  const commitStatus = $('#commitStatus');
  const badgeName = $('#badgeName');
  const badgeDate = $('#badgeDate');
  const badge = $('#badgePreview');
  const downloadBadge = $('#downloadBadge');
  const checks = $$('#commitChecks input');

  const dateFormatter = new Intl.DateTimeFormat('es', { day: '2-digit', month: 'long', year: 'numeric' });
  const now = new Date();
  const prettyDate = dateFormatter.format(now);

  if (badgeDate) badgeDate.textContent = prettyDate;

  function updateBadgeName() {
    if (!badgeName || !commitName) return;
    badgeName.textContent = commitName.value.trim() || 'Tu nombre';
  }

  let storedCommit = load(COMMIT_KEY, null);
  if (storedCommit && typeof storedCommit === 'object') {
    if (storedCommit.name && commitName) commitName.value = storedCommit.name;
    if (Array.isArray(storedCommit.checks)) {
      checks.forEach((box) => {
        box.checked = storedCommit.checks.includes(box.value);
      });
    }
    updateBadgeName();
    if (commitStatus) commitStatus.textContent = 'Compromiso firmado. Puedes descargar tu tarjeta.';
  }

  if (commitName) {
    commitName.addEventListener('input', updateBadgeName);
  }

  function saveCommitChecks() {
    const current = load(COMMIT_KEY, {});
    save(COMMIT_KEY, {
      ...(current && typeof current === 'object' ? current : {}),
      checks: checks.filter((box) => box.checked).map((box) => box.value)
    });
  }

  checks.forEach((box) => box.addEventListener('change', saveCommitChecks));

  if (commitForm) {
    commitForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = commitName ? commitName.value.trim() : '';
      if (name.length < 2) {
        toast('Escribe tu nombre para firmar el compromiso.');
        if (commitName) commitName.focus();
        return;
      }

      const unchecked = checks.filter((box) => !box.checked);
      if (unchecked.length > 0) {
        toast('Marca las tres casillas para firmar el compromiso.');
        unchecked[0].focus();
        return;
      }

      save(COMMIT_KEY, {
        name,
        date: prettyDate,
        checks: checks.map((box) => box.value)
      });

      updateBadgeName();
      if (commitStatus) commitStatus.textContent = 'Listo. Tu compromiso quedó firmado en este dispositivo.';
      if (badge && !reducedMotion && typeof badge.animate === 'function') {
        badge.animate(
          [
            { transform: 'rotate(-2deg) scale(1)' },
            { transform: 'rotate(1deg) scale(1.035)' },
            { transform: 'rotate(-2deg) scale(1)' }
          ],
          { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' }
        );
      }
      toast('Compromiso firmado. Ahora descarga tu tarjeta.');
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  }

  async function drawBadgeCanvas(name) {
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (err) { /* fuente de respaldo */ }
    }

    const W = 1080;
    const H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const display = '"Bricolage Grotesque", "Trebuchet MS", sans-serif';
    const body = 'Inter, "Segoe UI", Arial, sans-serif';

    ctx.fillStyle = '#F7F2E8';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#D9F45C';
    ctx.beginPath();
    ctx.arc(985, 190, 168, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#6C4BF4';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(985, 190, 120, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#12110F';
    ctx.lineWidth = 10;
    ctx.strokeRect(34, 34, W - 68, H - 68);

    ctx.fillStyle = '#D9F45C';
    roundRect(ctx, 74, 66, 58, 58, 14);
    ctx.fill();
    ctx.strokeStyle = '#12110F';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#12110F';
    ctx.font = `800 40px ${display}`;
    ctx.textAlign = 'center';
    ctx.fillText('!', 103, 107);
    ctx.textAlign = 'left';
    ctx.font = `800 28px ${display}`;
    ctx.fillText('piensa antes', 150, 106);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#6E675D';
    ctx.font = `600 20px ${body}`;
    ctx.fillText('COMPROMISO DIGITAL', W - 74, 100);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#6E675D';
    ctx.font = `700 25px ${body}`;
    ctx.fillText('YO ME COMPROMETO A', 74, 250);

    ctx.fillStyle = '#12110F';
    ctx.font = `800 130px ${display}`;
    ctx.fillText('PIENSA', 66, 400);
    ctx.fillText('ANTES DE', 66, 530);

    ctx.fillStyle = '#6C4BF4';
    ctx.fillText('PUBLICAR.', 66, 660);

    ctx.strokeStyle = '#D9F45C';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(74, 700);
    ctx.lineTo(620, 700);
    ctx.stroke();

    ctx.fillStyle = '#6E675D';
    ctx.font = `700 22px ${body}`;
    ctx.fillText('FIRMADO POR', 74, 815);

    let fontSize = 74;
    do {
      ctx.font = `800 ${fontSize}px ${display}`;
      fontSize -= 2;
    } while (ctx.measureText(name).width > 910 && fontSize > 34);

    ctx.fillStyle = '#12110F';
    ctx.fillText(name, 72, 895);

    ctx.strokeStyle = '#12110F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(72, 930);
    ctx.lineTo(W - 72, 930);
    ctx.stroke();

    ctx.fillStyle = '#6E675D';
    ctx.font = `500 24px ${body}`;
    ctx.fillText(prettyDate, 72, 970);
    ctx.textAlign = 'right';
    ctx.fillText('2026', W - 72, 970);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#12110F';
    ctx.font = `600 31px ${body}`;
    ctx.fillText('Porque en internet también hay consecuencias.', 72, 1080);

    ctx.fillStyle = '#6E675D';
    ctx.font = `400 24px ${body}`;
    ctx.fillText('Respeto · Privacidad · Verificación · No al ciberacoso', 72, 1124);

    ctx.fillStyle = '#12110F';
    roundRect(ctx, 72, 1188, 470, 66, 33);
    ctx.fill();

    ctx.fillStyle = '#D9F45C';
    ctx.font = `700 23px ${body}`;
    ctx.fillText('PIENSA ANTES DE PUBLICAR', 104, 1230);

    const markX = W - 200;
    ctx.fillStyle = '#D9F45C';
    roundRect(ctx, markX, 1188, 128, 66, 33);
    ctx.fill();
    ctx.fillStyle = '#12110F';
    ctx.font = `800 34px ${display}`;
    ctx.textAlign = 'center';
    ctx.fillText('!', markX + 64, 1233);
    ctx.textAlign = 'left';

    return canvas;
  }

  if (downloadBadge) {
    downloadBadge.addEventListener('click', async () => {
      const name = commitName ? commitName.value.trim() : '';
      if (name.length < 2) {
        toast('Escribe tu nombre para personalizar la tarjeta.');
        if (commitName) commitName.focus();
        return;
      }

      downloadBadge.disabled = true;
      downloadBadge.textContent = 'Generando…';

      try {
        const canvas = await drawBadgeCanvas(name);
        canvas.toBlob((blob) => {
          if (!blob) {
            toast('No se pudo generar la imagen.');
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'compromiso-piensa-antes-de-publicar.png';
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 2500);
          toast('Tarjeta descargada. Compártela con responsabilidad.');
        }, 'image/png');
      } catch (err) {
        toast('No se pudo generar la imagen. Intenta desde el sitio publicado.');
      } finally {
        downloadBadge.disabled = false;
        downloadBadge.innerHTML = 'Descargar tarjeta <span aria-hidden="true">↓</span>';
      }
    });
  }

  /* ---------- Animaciones de entrada ---------- */
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-in'));
  }

  /* ---------- Año dinámico en footer ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
