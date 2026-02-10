<script>
(() => {
  "use strict";

  const BTN_ID   = "mauslotSubmitBtn";
  const CANVAS_ID= "mauslotPowderCanvas";
  const WRAP_ID  = "mauslotFloatingBtnWrap";
  const STYLE_ID = "mauslotFloatingBtnStyles";

  /* ==== SET LINK TUJUAN DI SINI ==== */
  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

  /* ==== (OPSIONAL) AGAR NEMPEL DI BAR KIRI DAN IKUT NAIK SAAT EXPAND ====
     Isi selector container bar kiri kak.
     Contoh (misal): ".floating-social", "#sticky-leftbar", ".side-float"
     Kalau belum tahu, biarkan "" (kosong) -> tetap muncul fixed kiri bawah.
  */
  const STACK_SELECTOR = "";  // <-- isi ini kalau mau ikut naik bar kiri

  /* ==== OFFSET POSISI ==== */
  const DESKTOP_LEFT = 18;
  const DESKTOP_BOTTOM = 18;

  // Ini yang bikin gak nutup tombol hijau (bottom nav) di mobile
  const MOBILE_BOTTOM = 118; // kalau masih nabrak, naikin jadi 130-150

  // Cegah double-mount
  if (document.getElementById(WRAP_ID)) return;

  const css = `
    #${CANVAS_ID}{
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100vh;
      pointer-events: none;
      z-index: 99998;
    }

    /* WRAP default: kiri bawah (kotak merah) */
    #${WRAP_ID}{
      position: fixed;
      left: ${DESKTOP_LEFT}px;
      bottom: ${DESKTOP_BOTTOM}px;
      z-index: 99999;
      display: grid;
      place-items: center;
    }

    /* MOBILE: naikin supaya tidak nutup bottom nav (hijau) */
    @media (max-width: 768px){
      #${WRAP_ID}{
        left: ${DESKTOP_LEFT}px !important;
        bottom: calc(${MOBILE_BOTTOM}px + env(safe-area-inset-bottom, 0px)) !important;
        transform: none !important;
      }
    }

    /* ===== BUTTON BULAT ===== */
    #${BTN_ID}{
      width: 56px;
      height: 56px;
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

    /* lingkaran gradient */
    #${BTN_ID}::before{
      content:'';
      position:absolute;
      inset:0;
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

    #${BTN_ID}:active::before{
      transform: scale(.96);
      filter: brightness(1.05);
    }

    /* isi icon */
    .mauslot-icon{
      position:absolute;
      inset:0;
      display:grid;
      place-items:center;
      z-index:1;
      pointer-events:none;
      color:#EAF3FF;
    }
    .mauslot-icon svg{
      width: 22px;
      height: 22px;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,.35));
    }

    /* Badge kecil optional */
    .mauslot-badge{
      position:absolute;
      right:-2px;
      top:-2px;
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: rgba(47,184,255,.95);
      box-shadow: 0 0 0 2px rgba(5,11,28,.9);
      display:none; /* kalau mau tampilkan, ganti jadi grid */
      place-items:center;
      font-size: 11px;
      font-weight: 900;
      color:#07163A;
      z-index:2;
      pointer-events:none;
    }

    /* ====== powder loader kecil (tetap ada, tapi ringkas) ====== */
    .mauslot-loading{
      position:absolute;
      inset:0;
      display:grid;
      place-items:center;
      opacity:0;
      z-index:2;
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const confettiCount = 110, sequinCount = 60;
    const gravityConfetti = 0.25, gravitySequins = 0.45;
    const dragConfetti = 0.05, dragSequins = 0.02;
    const terminalVelocity = 3;

    const colors = [
      { front:"#0B4DB2", back:"#07163A" },
      { front:"#1A7BFF", back:"#0A2C6D" },
      { front:"#2FB8FF", back:"#0B4DB2" },
      { front:"#0A2C6D", back:"#050B1C" }
    ];

    const randomRange = (min, max) => Math.random() * (max - min) + min;

    const initVelocity = (xRange, yRange) => {
      const x = randomRange(xRange[0], xRange[1]);
      const range = yRange[1] - yRange[0] + 1;
      let y = yRange[1] - Math.abs(randomRange(0, range) + randomRange(0, range) - range);
      return { x, y: -y };
    };

    const hexToRgb = (hex) => {
      hex = String(hex).replace("#", "");
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      return `${r}, ${g}, ${b}`;
    };

    function Confetto(){
      this.color = colors[Math.floor(randomRange(0, colors.length))];
      this.isCircular = Math.random() < 0.7;
      this.dimensions = this.isCircular
        ? { x: randomRange(5,9), y: randomRange(5,9) }
        : { x: randomRange(4,10), y: randomRange(3,8) };

      const rect = btn.getBoundingClientRect();
      this.position = {
        x: randomRange(rect.left + rect.width*0.25, rect.left + rect.width*0.75),
        y: randomRange(rect.top + rect.height*0.25, rect.top + rect.height*1.2),
      };
      this.rotation = randomRange(0, 2*Math.PI);
      this.scale = { x:1, y:1 };
      this.opacity = randomRange(0.7, 1.0);
      this.velocity = initVelocity([-10,10], [10,14]);
      this.randomModifier = randomRange(0,99);
    }
    Confetto.prototype.update = function(){
      this.velocity.x -= this.velocity.x * dragConfetti;
      this.velocity.y = Math.min(this.velocity.y + gravityConfetti, terminalVelocity);
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.scale.y = Math.max(0.1, Math.cos((this.position.y + this.randomModifier)*0.09));
      this.opacity = Math.max(0, this.opacity - 0.008);
    };

    function Sequin(){
      const rect = btn.getBoundingClientRect();
      this.color = colors[Math.floor(randomRange(0,colors.length))].front;
      this.radius = randomRange(1,3);
      this.position = {
        x: randomRange(rect.left + rect.width*0.25, rect.left + rect.width*0.75),
        y: randomRange(rect.top + rect.height*0.25, rect.top + rect.height*1.2),
      };
      this.velocity = { x: randomRange(-7,7), y: randomRange(-10,-13) };
      this.opacity = randomRange(0.8,1.0);
    }
    Sequin.prototype.update = function(){
      this.velocity.x -= this.velocity.x * dragSequins;
      this.velocity.y += gravitySequins;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.opacity = Math.max(0, this.opacity - 0.015);
    };

    const burst = () => {
      for (let i=0;i<confettiCount;i++) confetti.push(new Confetto());
      for (let i=0;i<sequinCount;i++) sequins.push(new Sequin());
    };

    const render = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);

      confetti.forEach(c => {
        const w = c.dimensions.x * c.scale.x;
        ctx.save();
        ctx.translate(c.position.x, c.position.y);
        ctx.rotate(c.rotation);
        c.update();
        const rgb = hexToRgb(c.scale.y > 0 ? c.color.front : c.color.back);
        ctx.fillStyle = `rgba(${rgb}, ${c.opacity})`;
        if (c.isCircular){
          ctx.beginPath(); ctx.arc(0,0,w/2,0,2*Math.PI); ctx.fill();
        } else {
          ctx.fillRect(-w/2,-w/3,w,w*0.7);
        }
        ctx.restore();
      });

      sequins.forEach(s => {
        ctx.save();
        ctx.translate(s.position.x, s.position.y);
        s.update();
        ctx.fillStyle = `rgba(${hexToRgb(s.color)}, ${s.opacity})`;
        ctx.beginPath(); ctx.arc(0,0,s.radius,0,2*Math.PI); ctx.fill();
        ctx.restore();
      });

      confetti = confetti.filter(c => c.position.y < canvas.height && c.opacity > 0.1);
      sequins  = sequins.filter(s => s.position.y < canvas.height && s.opacity > 0.1);

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    return { burst };
  }

  function attachLogic(btn, powder){
    let disabled = false;

    const doRedirect = () => {
      if (!REDIRECT_URL) return;
      window.location.href = REDIRECT_URL;
      // window.open(REDIRECT_URL, "_blank");
    };

    btn.addEventListener("click", () => {
      if (disabled) return;
      disabled = true;

      btn.classList.add("loading");

      setTimeout(() => {
        try { powder && powder.burst && powder.burst(); } catch(_){}
        setTimeout(doRedirect, 650);
      }, 650);

    }, { passive: true });
  }

  function tryAttachToLeftStack(wrap){
    if (!STACK_SELECTOR) return false;
    const host = document.querySelector(STACK_SELECTOR);
    if (!host) return false;

    // ikut “barisan” menu kiri
    wrap.style.position = "static";
    wrap.style.left = "auto";
    wrap.style.bottom = "auto";
    wrap.style.zIndex = "99999";
    host.appendChild(wrap);
    return true;
  }

  function mount(){
    injectCSS();
    ensureCanvas();

    const wrap = document.createElement("div");
    wrap.id = WRAP_ID;

    wrap.innerHTML = `
      <button id="${BTN_ID}" type="button" aria-label="REKAN KAMI" title="REKAN KAMI">
        <div class="mauslot-icon" aria-hidden="true">
          <!-- icon panah / download style -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="mauslot-badge">1</div>

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

    // kalau bisa, tempel ke bar kiri (biar ikut naik saat expand)
    const attached = tryAttachToLeftStack(wrap);
    if (!attached) document.body.appendChild(wrap);

    const btn = document.getElementById(BTN_ID);
    if (!btn) return;

    const powder = initPowder(btn);
    attachLogic(btn, powder);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
</script>
