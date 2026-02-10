(() => {
  "use strict";

  const BTN_ID    = "mauslotSubmitBtn";
  const CANVAS_ID = "mauslotPowderCanvas";
  const WRAP_ID   = "mauslotFloatingBtnWrap";
  const STYLE_ID  = "mauslotFloatingBtnStyles";

  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

  /* =========================================================
     WAJIB DISET kalau mau benar2 ikut tombol bawah:
     - TOGGLE_SELECTOR: selector tombol hamburger/menu biru
     - PANEL_SELECTOR : selector panel/menu kiri yang muncul (optional)
     ========================================================= */
  const TOGGLE_SELECTOR = ""; // contoh: ".menu-toggle" atau "#hamburgerBtn"
  const PANEL_SELECTOR  = ""; // contoh: ".left-drawer" atau "#sideMenu"

  /* Posisi tombol: tepat di kotak merah (di atas tombol menu biru) */
  const LEFT_PX = 16;
  const DESKTOP_BOTTOM_PX = 92;  // naikkan/turunkan (kotak merah desktop)
  const MOBILE_BOTTOM_PX  = 92;  // naikkan/turunkan (kotak merah mobile)

  // Cegah double mount
  if (document.getElementById(WRAP_ID)) return;

  const css = `
    #${CANVAS_ID}{
      position: fixed; inset: 0;
      width: 100%; height: 100vh;
      pointer-events: none;
      z-index: 99998;
    }

    #${WRAP_ID}{
      position: fixed;
      left: ${LEFT_PX}px;
      bottom: ${DESKTOP_BOTTOM_PX}px;
      z-index: 99999;
      display: grid;
      place-items: center;
      transition: opacity .18s ease, transform .18s ease;
    }
    #${WRAP_ID}.is-hidden{
      opacity: 0;
      transform: translateY(10px);
      pointer-events: none;
    }

    @media (max-width: 768px){
      #${WRAP_ID}{
        left: ${LEFT_PX}px;
        bottom: calc(${MOBILE_BOTTOM_PX}px + env(safe-area-inset-bottom, 0px));
      }
    }

    /* BUTTON BULAT */
    #${BTN_ID}{
      width: 56px; height: 56px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      position: relative;
      padding: 0;
      outline: none;
      background: none;
      -webkit-tap-highlight-color: transparent;
      filter: drop-shadow(0 12px 22px rgba(0,0,0,.45));
    }

    @keyframes mauslotButtonPulse{
      0%{background-position:0% 50%}
      50%{background-position:100% 50%}
      100%{background-position:0% 50%}
    }

    #${BTN_ID}::before{
      content:'';
      position:absolute; inset:0;
      border-radius: 999px;
      background: linear-gradient(90deg,#050B1C,#07163A,#0A2C6D,#0B4DB2,#1A7BFF,#2FB8FF,#0B4DB2,#07163A);
      background-size: 700% 700%;
      animation: mauslotButtonPulse 9s ease-in-out infinite;
      box-shadow:
        0 2px 6px rgba(0,0,0,.55) inset,
        0 0 0 1px rgba(120,190,255,.18) inset,
        0 10px 26px rgba(0,0,0,.35);
      transition: transform .15s ease, filter .15s ease;
    }
    #${BTN_ID}:active::before{ transform: scale(.96); filter: brightness(1.05); }

    .mauslot-icon{
      position:absolute; inset:0;
      display:grid; place-items:center;
      z-index:1;
      pointer-events:none;
      color:#EAF3FF;
      transition: opacity .15s ease;
    }
    #${BTN_ID}.loading .mauslot-icon{ opacity:0; }

    .mauslot-icon svg{ width: 22px; height: 22px; filter: drop-shadow(0 1px 2px rgba(0,0,0,.35)); }

    .mauslot-loading{
      position:absolute; inset:0;
      display:grid; place-items:center;
      opacity:0; z-index:2;
      pointer-events:none;
      transition: opacity .2s ease;
    }
    #${BTN_ID}.loading .mauslot-loading{ opacity:1; }

    .mauslot-powder{ position: relative; width: 22px; height: 22px; }
    .mauslot-particle{
      position:absolute; width:6px;height:6px;border-radius:50%;
      top:8px;left:8px;
      animation: mauslotPowder 1.1s ease-in-out infinite;
      box-shadow: 0 0 10px rgba(90,180,255,.18);
    }
    @keyframes mauslotPowder{
      0%{transform:translate(0,0) scale(1); opacity:1}
      50%{transform:translate(var(--x),var(--y)) scale(.5); opacity:.7}
      100%{transform:translate(0,0) scale(1); opacity:1}
    }
    .p1{background:#0B4DB2; animation-delay:0s;  --x:-10px; --y:-8px;}
    .p2{background:#1A7BFF; animation-delay:.1s; --x: 10px; --y:-6px;}
    .p3{background:#2FB8FF; animation-delay:.2s; --x:-6px;  --y:10px;}
    .p4{background:#0A2C6D; animation-delay:.3s; --x: 8px;  --y:8px;}
    .p5{background:#07163A; animation-delay:.4s; --x: 0px;  --y:-12px;}
  `;

  const injectCSS = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  };

  const ensureCanvas = () => {
    let c = document.getElementById(CANVAS_ID);
    if (!c) {
      c = document.createElement("canvas");
      c.id = CANVAS_ID;
      document.body.appendChild(c);
    }
    return c;
  };

  function initPowder(btn) {
    const canvas = ensureCanvas();
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return { burst: () => {} };

    let confetti = [];
    let sequins = [];

    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize();
    addEventListener("resize", resize, { passive: true });

    const confettiCount = 90, sequinCount = 45;
    const gravityConfetti = 0.25, gravitySequins = 0.45;
    const dragConfetti = 0.05, dragSequins = 0.02;

    const colors = [
      { front:"#0B4DB2", back:"#07163A" },
      { front:"#1A7BFF", back:"#0A2C6D" },
      { front:"#2FB8FF", back:"#0B4DB2" },
      { front:"#0A2C6D", back:"#050B1C" }
    ];
    const rr = (a,b)=>Math.random()*(b-a)+a;
    const hexToRgb = (hex) => {
      hex = String(hex).replace("#", "");
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      return `${r}, ${g}, ${b}`;
    };

    function Confetto(){
      this.color = colors[Math.floor(rr(0, colors.length))];
      this.r = rr(2.5,4.5);
      const rect = btn.getBoundingClientRect();
      this.x = rr(rect.left, rect.right);
      this.y = rr(rect.top, rect.bottom);
      this.vx = rr(-8,8);
      this.vy = rr(-12,-8);
      this.o = rr(0.7,1);
    }
    function Sequin(){
      const rect = btn.getBoundingClientRect();
      this.c = colors[Math.floor(rr(0, colors.length))].front;
      this.r = rr(1,2.5);
      this.x = rr(rect.left, rect.right);
      this.y = rr(rect.top, rect.bottom);
      this.vx = rr(-6,6);
      this.vy = rr(-10,-7);
      this.o = rr(0.7,1);
    }

    const burst = () => {
      for (let i=0;i<confettiCount;i++) confetti.push(new Confetto());
      for (let i=0;i<sequinCount;i++)  sequins.push(new Sequin());
    };

    const render = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);

      confetti.forEach(p=>{
        p.vx -= p.vx*dragConfetti;
        p.vy += gravityConfetti;
        p.x += p.vx; p.y += p.vy;
        p.o = Math.max(0, p.o - 0.01);

        ctx.fillStyle = `rgba(${hexToRgb(p.color.front)}, ${p.o})`;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      });

      sequins.forEach(s=>{
        s.vx -= s.vx*dragSequins;
        s.vy += gravitySequins;
        s.x += s.vx; s.y += s.vy;
        s.o = Math.max(0, s.o - 0.015);

        ctx.fillStyle = `rgba(${hexToRgb(s.c)}, ${s.o})`;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
      });

      confetti = confetti.filter(p=>p.o>0.05 && p.y<canvas.height+30);
      sequins  = sequins.filter(p=>p.o>0.05 && p.y<canvas.height+30);

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    return { burst };
  }

  function attachLogic(btn, powder){
    let disabled = false;
    const doRedirect = () => { if (REDIRECT_URL) location.href = REDIRECT_URL; };

    btn.addEventListener("click", () => {
      if (disabled) return;
      disabled = true;
      btn.classList.add("loading");

      setTimeout(() => {
        try { powder?.burst?.(); } catch(_){}
        setTimeout(doRedirect, 650);
      }, 450);
    }, { passive: true });
  }

  /* ===============================
     HIDE/SHOW saat hamburger diklik
     =============================== */
  function setupAutoHide(wrap){
    const hide = () => wrap.classList.add("is-hidden");
    const show = () => wrap.classList.remove("is-hidden");

    // 1) Kalau ada selector tombol hamburger: paling akurat
    if (TOGGLE_SELECTOR) {
      document.addEventListener("click", (e) => {
        const t = e.target;
        if (t && t.closest && t.closest(TOGGLE_SELECTOR)) {
          // toggle: kalau lagi tampil -> hide; kalau hidden -> show
          wrap.classList.toggle("is-hidden");
        }
      }, true);
    }

    // 2) Kalau ada selector panel: pantau class/style berubah (open/active)
    if (PANEL_SELECTOR) {
      const panel = document.querySelector(PANEL_SELECTOR);
      if (panel) {
        const isOpen = () => {
          const cs = getComputedStyle(panel);
          return panel.classList.contains("open") ||
                 panel.classList.contains("active") ||
                 cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0";
        };

        // cek awal + observer
        const sync = () => (isOpen() ? hide() : show());
        sync();

        const mo = new MutationObserver(sync);
        mo.observe(panel, { attributes: true, attributeFilter: ["class", "style"] });
      }
    }

    // 3) Fallback: kalau klik area tombol menu biru (kiri bawah) -> hide
    // (aman kalau selector belum ketemu)
    document.addEventListener("click", (e) => {
      const x = e.clientX, y = e.clientY;
      const h = innerHeight;
      // area kiri bawah sekitar tombol biru (kira-kira)
      const inZone = x <= 90 && y >= (h - 140);
      if (inZone) hide();
    }, true);

    // kalau user scroll/klik di luar, tampil lagi (opsional)
    document.addEventListener("click", (e) => {
      const t = e.target;
      // kalau klik bukan area kiri bawah dan bukan tombol kita, munculin lagi
      if (!t.closest || (!t.closest(`#${WRAP_ID}`))) {
        const x = e.clientX, y = e.clientY;
        const h = innerHeight;
        const inZone = x <= 90 && y >= (h - 140);
        if (!inZone) show();
      }
    }, true);
  }

  function mount(){
    injectCSS();
    ensureCanvas();

    const wrap = document.createElement("div");
    wrap.id = WRAP_ID;
    wrap.innerHTML = `
      <button id="${BTN_ID}" type="button" aria-label="REKAN KAMI" title="REKAN KAMI">
        <div class="mauslot-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="mauslot-loading" aria-hidden="true">
          <div class="mauslot-powder">
            <div class="mauslot-particle p1"></div>
            <div class="mauslot-particle p2"></div>
            <div class="mauslot-particle p3"></div>
            <div class="mauslot-particle p4"></div>
            <div class="mauslot-particle p5"></div>
          </div>
        </div>
      </button>
    `;
    document.body.appendChild(wrap);

    const btn = document.getElementById(BTN_ID);
    if (!btn) return;

    const powder = initPowder(btn);
    attachLogic(btn, powder);
    setupAutoHide(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
