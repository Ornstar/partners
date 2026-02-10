(() => {
  "use strict";

  const BTN_ID = "mauslotSubmitBtn";
  const CANVAS_ID = "mauslotPowderCanvas";
  const WRAP_ID = "mauslotFloatingBtnWrap";
  const STYLE_ID = "mauslotFloatingBtnStyles";

  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

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

    #${WRAP_ID}{
      position: fixed;
      left: 18px;
      bottom: 18px;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    /* MOBILE */
    @media (max-width: 768px){
      #${WRAP_ID}{
        --lift: 28px; /* naikkan kalau masih ketutup bottom bar */
        left: 16px !important;
        bottom: calc(74px + var(--lift) + env(safe-area-inset-bottom, 0px)) !important;
      }
    }

    /* ====== BUTTON BULAT ====== */
    #${BTN_ID}{
      width: 56px;
      height: 56px;
      border-radius: 999px;
      border: 0;
      padding: 0;
      cursor: pointer;
      background: transparent;
      position: relative;
      outline: none;
      -webkit-tap-highlight-color: transparent;
      filter: drop-shadow(0 14px 26px rgba(0,0,0,.45));
    }

    /* Ring/Glow luar */
    #${BTN_ID}::before{
      content:'';
      position:absolute;
      inset: 0;
      border-radius: 999px;
      background: conic-gradient(from 180deg,
        #2FB8FF, #1A7BFF, #0B4DB2, #0A2C6D, #07163A, #0B4DB2, #1A7BFF, #2FB8FF
      );
      animation: mauslotSpin 2.8s linear infinite;
      box-shadow:
        0 0 0 1px rgba(120,190,255,.20) inset,
        0 0 22px rgba(70,160,255,.25);
    }

    /* Body dalam */
    #${BTN_ID}::after{
      content:'';
      position:absolute;
      inset: 4px;
      border-radius: 999px;
      background: radial-gradient(120% 120% at 30% 20%, rgba(60,190,255,.35), transparent 55%),
                  linear-gradient(180deg,#061434,#050B1C);
      box-shadow:
        0 10px 24px rgba(0,0,0,.45),
        0 1px 0 rgba(255,255,255,.06) inset;
    }

    @keyframes mauslotSpin{
      to{ transform: rotate(360deg); }
    }

    /* Isi tombol (ikon) */
    .mauslot-circle{
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      z-index: 2;
      color: #EAF3FF;
      user-select:none;
      pointer-events:none;
    }
    .mauslot-circle svg{
      width: 22px;
      height: 22px;
      fill:none;
      stroke: currentColor;
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,.35));
      opacity: .95;
    }

    /* State loading/complete (tetap kompatibel) */
    #${BTN_ID}.loading::before{ opacity: .55; }
    #${BTN_ID}.complete::before{ opacity: 1; }

    /* Animasi powder kecil di tengah saat loading */
    .mauslot-mini-powder{
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      z-index: 3;
      opacity: 0;
      transition: opacity .2s ease;
      pointer-events:none;
    }
    #${BTN_ID}.loading .mauslot-mini-powder{ opacity: 1; }
    #${BTN_ID}.loading .mauslot-circle{ opacity: 0; }

    .mauslot-powder{
      position: relative;
      width: 22px;
      height: 22px;
    }
    .mauslot-particle{
      position:absolute;
      width:6px;height:6px;border-radius:50%;
      top:8px;left:8px;
      animation: mauslotPowder 1.5s ease-in-out infinite;
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
    let rafId = null;

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
      if (y >= yRange[1] - 1) y += (Math.random() < 0.25) ? randomRange(1, 3) : 0;
      return { x, y: -y };
    };

    const hexToRgb = (hex) => {
      hex = String(hex).replace("#", "");
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      return `${r}, ${g}, ${b}`;
    };

    function Confetto() {
      this.randomModifier = randomRange(0, 99);
      this.color = colors[Math.floor(randomRange(0, colors.length))];
      this.dimensions = { x: randomRange(4, 9), y: randomRange(3, 7) };

      const rect = btn.getBoundingClientRect();
      this.position = {
        x: randomRange(rect.left + rect.width*0.2, rect.left + rect.width*0.8),
        y: randomRange(rect.top + rect.height*0.2, rect.top + rect.height*1.2),
      };

      this.rotation = randomRange(0, 2 * Math.PI);
      this.scale = { x: 1, y: 1 };
      this.velocity = initVelocity([-10, 10], [10, 15]);
      this.opacity = randomRange(0.7, 1.0);
    }

    Confetto.prototype.update = function () {
      this.velocity.x -= this.velocity.x * dragConfetti;
      this.velocity.y = Math.min(this.velocity.y + gravityConfetti, terminalVelocity);
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.scale.y = Math.max(0.1, Math.cos((this.position.y + this.randomModifier) * 0.09));
      this.opacity = Math.max(0, this.opacity - 0.008);
    };

    function Sequin() {
      const rect = btn.getBoundingClientRect();
      this.color = colors[Math.floor(randomRange(0, colors.length))].front;
      this.radius = randomRange(1, 3);
      this.position = {
        x: randomRange(rect.left + rect.width*0.2, rect.left + rect.width*0.8),
        y: randomRange(rect.top + rect.height*0.2, rect.top + rect.height*1.2),
      };
      this.velocity = { x: randomRange(-8, 8), y: randomRange(-10, -14) };
      this.opacity = randomRange(0.8, 1.0);
    }

    Sequin.prototype.update = function () {
      this.velocity.x -= this.velocity.x * dragSequins;
      this.velocity.y += gravitySequins;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.opacity = Math.max(0, this.opacity - 0.015);
    };

    const burst = () => {
      for (let i = 0; i < confettiCount; i++) confetti.push(new Confetto());
      for (let i = 0; i < sequinCount; i++) sequins.push(new Sequin());
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach(c => {
        const w = c.dimensions.x * c.scale.x;
        ctx.save();
        ctx.translate(c.position.x, c.position.y);
        ctx.rotate(c.rotation);
        c.update();

        const rgb = hexToRgb(c.scale.y > 0 ? c.color.front : c.color.back);
        ctx.fillStyle = `rgba(${rgb}, ${c.opacity})`;
        ctx.fillRect(-w/2, -w/2, w, c.dimensions.y);
        ctx.restore();
      });

      sequins.forEach(s => {
        ctx.save();
        ctx.translate(s.position.x, s.position.y);
        s.update();
        ctx.fillStyle = `rgba(${hexToRgb(s.color)}, ${s.opacity})`;
        ctx.beginPath(); ctx.arc(0, 0, s.radius, 0, 2 * Math.PI); ctx.fill();
        ctx.restore();
      });

      confetti = confetti.filter(c => c.position.y < canvas.height && c.opacity > 0.1);
      sequins  = sequins.filter(s => s.position.y < canvas.height && s.opacity > 0.1);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return { burst };
  }

  function attachLogic(btn, powder) {
    let disabled = false;

    const doRedirect = () => {
      if (!REDIRECT_URL || REDIRECT_URL === "ISI_LINK_KAMU_DI_SINI") return;
      window.location.href = REDIRECT_URL;
    };

    const click = () => {
      if (disabled) return;
      disabled = true;

      btn.classList.add("loading");

      setTimeout(() => {
        btn.classList.add("complete");
        btn.classList.remove("loading");

        setTimeout(() => {
          try { powder && powder.burst && powder.burst(); } catch (_) {}
          setTimeout(doRedirect, 650);
        }, 200);

      }, 900);
    };

    btn.addEventListener("click", click, { passive: true });
  }

  function mount() {
    injectCSS();
    ensureCanvas();

    const wrap = document.createElement("div");
    wrap.id = WRAP_ID;
    wrap.innerHTML = `
      <button id="${BTN_ID}" type="button" aria-label="REKAN KAMI">
        <div class="mauslot-circle" aria-hidden="true">
          <!-- icon panah bawah (mirip contoh) -->
          <svg viewBox="0 0 24 24">
            <path d="M12 5v11"></path>
            <path d="M7 13l5 5 5-5"></path>
          </svg>
        </div>

        <div class="mauslot-mini-powder" aria-hidden="true">
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
