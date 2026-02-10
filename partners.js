(() => {
  "use strict";

  const BTN_ID = "mauslotSubmitBtn";
  const CANVAS_ID = "mauslotPowderCanvas";
  const WRAP_ID = "mauslotFloatingBtnWrap";
  const STYLE_ID = "mauslotFloatingBtnStyles";

  /* ==== SET LINK TUJUAN DI SINI ==== */
  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

  // Cegah double-mount kalau script kepanggil lebih dari sekali
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

    @media (max-width: 768px){
      #${WRAP_ID}{
        left: 50% !important;
        transform: translateX(-50%) !important;
        bottom: calc(74px + env(safe-area-inset-bottom, 0px)) !important;
      }
      #${BTN_ID}{
        width: 220px !important;
        height: 46px !important;
        font-size: 14px !important;
      }
    }

    #${BTN_ID}{
      background:none;
      border:none;
      color:#EAF3FF;
      cursor:pointer;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 800;
      height: 44px;
      width: 200px;
      padding: 0 10px;
      outline:none;
      overflow:hidden;
      position: relative;
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
      display:block;
      width:100%;
      height:100%;
      border-radius: 50px;
      background: linear-gradient(90deg,#050B1C,#07163A,#0A2C6D,#0B4DB2,#1A7BFF,#2FB8FF,#0B4DB2,#07163A);
      background-size: 700% 700%;
      animation: mauslotButtonPulse 9s ease-in-out infinite;
      box-shadow:
        0 2px 6px rgba(0,0,0,.55) inset,
        0 0 0 1px rgba(120,190,255,.18) inset,
        0 10px 26px rgba(0,0,0,.35);
      transition: width .2s cubic-bezier(.39,1.86,.64,1) .3s;
    }

    #${BTN_ID}.loading::before{ width: 80%; transition: width .3s ease; }

    .mauslot-msg{
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
      position: absolute;
      width: 100%;
      text-align: center;
      user-select: none;
      pointer-events: none;
    }

    .mauslot-msg svg{
      display:inline-block;
      fill:none;
      margin-right:5px;
      stroke-linecap:round;
      stroke-linejoin:round;
      stroke-width:2;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,.35));
    }

    .mauslot-text span{ opacity:0; position:relative; }

    #${BTN_ID}.ready .mauslot-submit svg{
      opacity:1;
      top:1px;
      transition: top .4s ease 600ms, opacity .3s linear 600ms;
    }
    .mauslot-submit svg{
      color:#EAF3FF;
      opacity:0;
      position:relative;
      top:30px;
      width:14px;
      transition: top .4s ease, opacity .3s linear;
    }
    .mauslot-submit .mauslot-text span{
      top:8px;
      transition: all .2s ease var(--d);
      text-shadow: 0 1px 2px rgba(0,0,0,.45);
    }
    #${BTN_ID}.ready .mauslot-submit .mauslot-text span{
      top:0;
      opacity:1;
      transition: all .2s ease calc(var(--dr) + 600ms);
    }

    .mauslot-loading{ opacity:0; transition: opacity .3s linear .3s, top .4s cubic-bezier(.22,0,.41,-0.57); }
    #${BTN_ID}.loading .mauslot-loading{ opacity:1; }

    .mauslot-success svg{
      color:#EAF3FF;
      stroke-dasharray: 20;
      stroke-dashoffset: 20;
      width:14px;
      transition: stroke-dashoffset .3s ease-in-out;
    }
    .mauslot-success .mauslot-text span{
      left:5px;
      transition: all .2s ease var(--dr);
      text-shadow: 0 1px 2px rgba(0,0,0,.45);
    }

    #${BTN_ID}.complete .mauslot-submit svg{ top:-30px; transition:none; }
    #${BTN_ID}.complete .mauslot-submit .mauslot-text span{ top:-8px; transition:none; }
    #${BTN_ID}.complete .mauslot-loading{ top:80px; }
    #${BTN_ID}.complete .mauslot-success .mauslot-text span{
      left:0; opacity:1; transition: all .2s ease calc(var(--d) + 1000ms);
    }
    #${BTN_ID}.complete .mauslot-success svg{
      stroke-dashoffset: 0;
      transition: stroke-dashoffset .3s ease-in-out 1.4s;
    }

    .mauslot-powder{
      position: relative;
      width: 22px;
      height: 22px;
      margin: 0 auto;
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

    // Safety: kalau canvas context gagal, jangan bikin error
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

    const confettiCount = 150, sequinCount = 80;
    const gravityConfetti = 0.25, gravitySequins = 0.45;
    const dragConfetti = 0.05, dragSequins = 0.02;
    const terminalVelocity = 3;

    const colors = [
      { front:"#0B4DB2", back:"#07163A" },
      { front:"#1A7BFF", back:"#0A2C6D" },
      { front:"#2FB8FF", back:"#0B4DB2" },
      { front:"#0A2C6D", back:"#050B1C" },
      { front:"#0E2E86", back:"#07163A" },
      { front:"#5BC8FF", back:"#1A7BFF" },
      { front:"#123F9C", back:"#07163A" },
      { front:"#0D1E4D", back:"#050B1C" }
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
      this.isCircular = Math.random() < 0.7;

      this.dimensions = this.isCircular
        ? { x: randomRange(5, 9), y: randomRange(5, 9) }
        : { x: randomRange(4, 10), y: randomRange(3, 8) };

      this.noiseLevel = randomRange(0.2, 0.9);
      this.opacity = randomRange(0.7, 1.0);
      this.matteFactor = randomRange(0.5, 0.9);

      const rect = btn.getBoundingClientRect();
      this.position = {
        x: randomRange(rect.left + rect.width * 0.25, rect.left + rect.width * 0.75),
        y: randomRange(rect.top + rect.height * 0.3, rect.top + rect.height * 1.4),
      };

      this.rotation = randomRange(0, 2 * Math.PI);
      this.scale = { x: 1, y: 1 };
      this.velocity = initVelocity([-12, 12], [10, 16]);
    }

    Confetto.prototype.update = function () {
      this.velocity.x -= this.velocity.x * dragConfetti;
      this.velocity.y = Math.min(this.velocity.y + gravityConfetti, terminalVelocity);
      if (Math.random() > 0.9) {
        this.velocity.x += (Math.random() > 0.5 ? 0.3 : -0.3) * randomRange(0.5, 1.5);
      }
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.scale.y = Math.max(0.1, Math.cos((this.position.y + this.randomModifier) * 0.09) * this.matteFactor);
      this.opacity = Math.max(0, this.opacity - 0.006 * randomRange(0.95, 1.05));
      if (Math.abs(this.velocity.x) > 0.1) this.velocity.x *= 0.99;
    };

    function Sequin() {
      const rect = btn.getBoundingClientRect();
      this.color = colors[Math.floor(randomRange(0, colors.length))].front;
      this.radius = randomRange(1, 3);
      this.position = {
        x: randomRange(rect.left + rect.width * 0.25, rect.left + rect.width * 0.75),
        y: randomRange(rect.top + rect.height * 0.3, rect.top + rect.height * 1.4),
      };
      this.velocity = { x: randomRange(-8, 8), y: randomRange(-10, -14) };
      this.opacity = randomRange(0.8, 1.0);
      this.grainFactor = randomRange(0.85, 0.95);
    }

    Sequin.prototype.update = function () {
      this.velocity.x -= this.velocity.x * dragSequins;
      this.velocity.y += gravitySequins;
      if (Math.random() > 0.9) this.velocity.x += (Math.random() > 0.5 ? 0.2 : -0.2);
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.opacity = Math.max(0, this.opacity - 0.01 * this.grainFactor);
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

        if (c.isCircular) {
          ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, 2 * Math.PI); ctx.fill();
          if (c.noiseLevel > 0.5) {
            const dots = Math.floor(randomRange(3, 7));
            for (let i = 0; i < dots; i++) {
              ctx.fillStyle = `rgba(${rgb}, ${c.opacity * 0.7})`;
              ctx.beginPath();
              ctx.arc(randomRange(-w/3, w/3), randomRange(-w/3, w/3), randomRange(0.5, 1.5), 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        } else {
          ctx.beginPath();
          const sides = Math.floor(randomRange(5, 8));
          const start = Math.random() * Math.PI * 2;
          for (let i = 0; i < sides; i++) {
            const ang = start + (i * 2 * Math.PI / sides);
            const rad = w / 2 * (0.8 + Math.random() * 0.4);
            const x = Math.cos(ang) * rad;
            const y = Math.sin(ang) * rad;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath(); ctx.fill();
        }
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

    // Bonus safety: stop anim saat tab tidak aktif (lebih hemat)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && rafId) cancelAnimationFrame(rafId);
      if (!document.hidden) rafId = requestAnimationFrame(render);
    });

    return { burst };
  }

  function attachLogic(btn, powder) {
    let disabled = false;

    const doRedirect = () => {
      if (!REDIRECT_URL || REDIRECT_URL === "ISI_LINK_KAMU_DI_SINI") return;
      window.location.href = REDIRECT_URL;
      // kalau mau tab baru:
      // window.open(REDIRECT_URL, "_blank");
    };

    const click = () => {
      if (disabled) return;
      disabled = true;

      btn.classList.add("loading");
      btn.classList.remove("ready");

      setTimeout(() => {
        btn.classList.add("complete");
        btn.classList.remove("loading");

        setTimeout(() => {
          try { powder && powder.burst && powder.burst(); } catch (_) {}

          setTimeout(doRedirect, 900);
        }, 320);

      }, 1800);
    };

    btn.addEventListener("click", click, { passive: true });
  }

  function mount() {
    injectCSS();
    ensureCanvas();

    const wrap = document.createElement("div");
    wrap.id = WRAP_ID;
    wrap.innerHTML = `
      <button id="${BTN_ID}" class="ready" type="button" aria-label="REKAN KAMI">
        <div class="mauslot-msg mauslot-submit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 12.2">
            <polyline stroke="currentColor" points="2,7.1 6.5,11.1 11,7.1 "/>
            <line stroke="currentColor" x1="6.5" y1="1.2" x2="6.5" y2="10.3"/>
          </svg>
          <span class="mauslot-text">REKAN KAMI</span>
        </div>

        <div class="mauslot-msg mauslot-loading">
          <div class="mauslot-powder">
            <div class="mauslot-particle p1"></div>
            <div class="mauslot-particle p2"></div>
            <div class="mauslot-particle p3"></div>
            <div class="mauslot-particle p4"></div>
            <div class="mauslot-particle p5"></div>
          </div>
        </div>

        <div class="mauslot-msg mauslot-success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 11">
            <polyline stroke="currentColor" points="1.4,5.8 5.1,9.5 11.6,2.1 "/>
          </svg>
          <span class="mauslot-text">Terima Kasih</span>
        </div>
      </button>
    `;
    document.body.appendChild(wrap);

    const btn = document.getElementById(BTN_ID);
    if (!btn) return;

    // Split text (lebih aman pakai textContent)
    const els = btn.querySelectorAll(".mauslot-text");
    els.forEach(el => {
      const chars = (el.textContent || "").split("");
      el.innerHTML = chars.map((ch, i) =>
        `<span style="--d:${i * 30}ms; --dr:${(chars.length - i - 1) * 30}ms;">${ch === " " ? "&nbsp;" : ch}</span>`
      ).join("");
    });

    const powder = initPowder(btn);
    attachLogic(btn, powder);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
