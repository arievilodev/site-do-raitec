// =========================================================
// RAITec — oficinas (extensao.html)
// Clicar na foto da oficina abre o zoom; clicar em "Saiba mais +"
// (botão com data-oficina="id-do-template") abre o card de informações.
// O conteúdo do card vem do <template id="..."> correspondente.
// Dentro do card, clicar numa foto da galeria também abre o zoom.
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const peek = document.querySelector('[data-peek]');
  if (!peek) return;

  const body = peek.querySelector('[data-peek-body]');
  const panel = peek.querySelector('.peek-panel');
  let lastTrigger = null;

  /* ---------- zoom das fotos (criado por aqui, sem HTML extra) ---------- */
  const zoom = document.createElement('div');
  zoom.className = 'lightbox lightbox--zoom';
  zoom.hidden = true;
  zoom.setAttribute('data-zoom-overlay', '');
  zoom.innerHTML = `
    <button type="button" class="lightbox-close" data-zoom-close aria-label="Fechar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <div class="lightbox-inner">
      <figure class="zoom-figure">
        <img src="" alt="">
        <div class="reticle"><i></i><i></i><i></i><i></i></div>
      </figure>
      <p class="lightbox-caption" data-zoom-caption></p>
    </div>`;
  document.body.appendChild(zoom);

  const zoomImg = zoom.querySelector('img');
  const zoomCaption = zoom.querySelector('[data-zoom-caption]');
  let zoomTrigger = null;

  // src/alt/caption vêm da foto clicada (galeria do card OU slide das oficinas)
  function openZoom(trigger, src, alt, caption) {
    zoomImg.src = src;
    zoomImg.alt = alt || '';
    zoomCaption.textContent = caption || alt || '';
    zoomTrigger = trigger;
    zoom.hidden = false;
    requestAnimationFrame(() => zoom.classList.add('is-open'));
    zoom.querySelector('[data-zoom-close]').focus();
  }

  function closeZoom() {
    zoom.classList.remove('is-open');
    setTimeout(() => { zoom.hidden = true; }, 300);
    if (zoomTrigger) zoomTrigger.focus();
  }

  zoom.querySelector('[data-zoom-close]').addEventListener('click', closeZoom);
  zoom.addEventListener('click', e => { if (e.target === zoom) closeZoom(); });

  // fotos da galeria dentro do card
  function zoomFromFigure(fig) {
    const img = fig.querySelector('img');
    if (img) openZoom(fig, img.currentSrc || img.src, img.alt, fig.dataset.caption);
  }
  body.addEventListener('click', e => {
    const fig = e.target.closest('.peek-gallery figure');
    if (fig) zoomFromFigure(fig);
  });
  body.addEventListener('keydown', e => {
    const fig = e.target.closest('.peek-gallery figure');
    if (fig && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      zoomFromFigure(fig);
    }
  });

  /* ---------- fotos do carrossel de oficinas ----------
     clicar na foto           -> zoom (data-zoom = arquivo da imagem)
     clicar em "Saiba mais +" -> abre o card de informações          */
  document.querySelectorAll('[data-zoom]').forEach(slide => {
    const go = () => openZoom(slide, slide.dataset.zoom, slide.dataset.alt, slide.dataset.caption);
    slide.addEventListener('click', go);
    slide.addEventListener('keydown', e => {
      if (e.target === slide && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(); }
    });
  });

  /* ---------- card de informações ---------- */
  function open(templateId, trigger) {
    const tpl = document.getElementById(templateId);
    if (!tpl) return;

    body.innerHTML = '';
    body.appendChild(tpl.content.cloneNode(true));
    body.querySelectorAll('.peek-gallery figure').forEach(fig => {
      fig.tabIndex = 0;
      fig.setAttribute('role', 'button');
    });
    panel.scrollTop = 0;

    lastTrigger = trigger;
    peek.hidden = false;
    requestAnimationFrame(() => peek.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    peek.querySelector('[data-peek-close]').focus();
  }

  function close() {
    peek.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { peek.hidden = true; }, 250);
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('[data-oficina]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();               // não dispara o zoom da foto
      open(el.dataset.oficina, el);
    });
  });

  peek.querySelector('[data-peek-close]').addEventListener('click', close);
  peek.addEventListener('click', e => { if (e.target === peek) close(); });

  // ESC fecha primeiro o zoom; só depois o card
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!zoom.hidden) closeZoom();
    else if (!peek.hidden) close();
  });
});