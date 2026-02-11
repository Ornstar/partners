(() => {
  "use strict";

  const BTN_ID   = "mauslotSubmitBtn";
  const WRAP_ID  = "mauslotFloatingBtnWrap";
  const STYLE_ID = "mauslotFloatingBtnStyles";

  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

  // Jarak tombol kita dari tombol biru
  const GAP = 8;          // 6-14
  const X_NUDGE = -5;     // geser kiri/kanan kalau perlu
  const SIZE = 56;

  // Kalau tahu selector tombol hamburger, isi biar pasti tepat
  const TOGGLE_SELECTOR = "";

  // Jaga jarak dari bawah layar (biar gak masuk footer)
  const SAFE_BOTTOM = 12; // 10-24

  if (document.getElementById(WRAP_ID)) return;

  const css = `
    #${WRAP_ID}{
      position: fixed;
      z-index: 2147483647;
      width:${SIZE}px;height:${SIZE}px;
      display:grid;place-items:center;
      left: 16px;
      top: auto;
      bottom: 120px;
      pointer-events:auto;
    }

    #${BTN_ID}{
      width:${SIZE}px;height:${SIZE}px;
      border-radius:999px;border:none;
      cursor:pointer; position:relative;
      padding:0; outline:none; background:none;
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
      border-radius:999px;
      background: linear-gradient(90deg,#050B1C,#07163A,#0A2C6D,#0B4DB2,#1A7BFF,#2FB8FF,#0B4DB2,#07163A);
      background-size:700% 700%;
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
      z-index:1; pointer-events:none;
      color:#EAF3FF;
    }
    .mauslot-icon svg{ width:22px;height:22px; filter: drop-shadow(0 1px 2px rgba(0,0,0,.35)); }
  `;

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = css;
    document.head.appendChild(s);
  }

  function isVisible(el){
    if (!el) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
    const r = el.getBoundingClientRect();
    return r.width > 20 && r.height > 20;
  }

  function scoreHamburger(el){
    if (!el || el.id === BTN_ID || el.id === WRAP_ID) return -999;
    if (!isVisible(el)) return -999;

    const cs = getComputedStyle(el);
    if (cs.position !== "fixed") return -50;

    const r = el.getBoundingClientRect();
    const nearLeft = r.left < 90;
    const nearBottom = (window.innerHeight - r.bottom) < 170;
    if (!nearLeft || !nearBottom) return -20;

    if (r.width < 32 || r.width > 110 || r.height < 32 || r.height > 110) return -10;

    let s = 0;
    s += Math.max(0, 90 - r.left) * 0.5;
    s += Math.max(0, 170 - (window.innerHeight - r.bottom)) * 0.3;

    const txt = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").toLowerCase();
    const cls = (el.className || "").toString().toLowerCase();

    if (cls.includes("hamb") || cls.includes("burger")) s += 80;
    if (cls.includes("menu") || cls.includes("toggle")) s += 45;
    if (txt.includes("menu") || txt.includes("hamb") || txt.includes("toggle")) s += 55;

    if (el.querySelector("svg")) s += 15;

    const br = parseFloat(cs.borderRadius) || 0;
    if (br >= 10) s += 10;

    if (el.closest(`#${WRAP_ID}`)) s -= 999;

    return s;
  }

  function findBlueHamburger(){
    if (TOGGLE_SELECTOR) {
      const el = document.querySelector(TOGGLE_SELECTOR);
      if (el && isVisible(el)) return el;
    }

    const nodes = Array.from(document.querySelectorAll("button,a,div"))
      .filter(el => el && el !== document.body && el !== document.documentElement);

    let best = null, bestScore = -999;
    for (const el of nodes) {
      const sc = scoreHamburger(el);
      if (sc > bestScore) { bestScore = sc; best = el; }
    }
    return bestScore >= 10 ? best : null;
  }

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function placeSmart(wrap, blueBtn){
    const r = blueBtn.getBoundingClientRect();

    // sejajarkan center tombol kita dengan center tombol biru
    const left = r.left + (r.width - SIZE) / 2 + X_NUDGE;
    const x = clamp(left, 6, window.innerWidth - SIZE - 6);

    // coba taruh di bawah dulu
    const topBelow = r.bottom + GAP;

    // kalau di bawah "nabrak" bawah layar/footer -> pindah ke atas tombol biru
    const wouldHitBottom = (topBelow + SIZE) > (window.innerHeight - SAFE_BOTTOM);

    const top = wouldHitBottom
      ? (r.top - GAP - SIZE)   // posisi kotak merah (di atas tombol biru)
      : topBelow;              // normal: di bawah tombol biru

    const y = clamp(top, 6, window.innerHeight - SIZE - SAFE_BOTTOM);

    wrap.style.left = x + "px";
    wrap.style.top  = y + "px";
    wrap.style.bottom = "auto";
  }

  function attachRedirect(btn){
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!REDIRECT_URL) return;
      window.location.href = REDIRECT_URL;
    }, true);
  }

  function mount(){
    injectCSS();

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
      </button>
    `;
    document.body.appendChild(wrap);

    const btn = document.getElementById(BTN_ID);
    if (btn) attachRedirect(btn);

    let blue = null;
    let lastKey = "";

    const tick = () => {
      const found = findBlueHamburger();
      if (found) blue = found;

      if (blue) {
        const r = blue.getBoundingClientRect();
        const key = `${Math.round(r.left)}|${Math.round(r.top)}|${Math.round(r.width)}|${Math.round(r.height)}|${window.innerHeight}`;
        if (key !== lastKey) {
          lastKey = key;
          placeSmart(wrap, blue);
        }
      }
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once:true });
  } else {
    mount();
  }
})();
