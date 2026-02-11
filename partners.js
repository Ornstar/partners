(() => {
  "use strict";

  const BTN_ID   = "mauslotSubmitBtn";
  const WRAP_ID  = "mauslotFloatingBtnWrap";
  const STYLE_ID = "mauslotFloatingBtnStyles";

  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

  // Jarak tombol kita dari tombol biru (hamburger)
  const GAP_BELOW_BLUE = 14;   // (atur 10-20)
  const LEFT_NUDGE = 0;        // geser kiri/kanan kalau perlu (mis. -2 / +2)

  // ukuran tombol
  const SIZE = 56;

  if (document.getElementById(WRAP_ID)) return;

  const css = `
    #${WRAP_ID}{
      position: fixed;
      z-index: 2147483647;
      width:${SIZE}px;height:${SIZE}px;
      display:grid;place-items:center;
      left: 16px;
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

  // Cari tombol biru hamburger: fixed, kiri bawah, ukuran sekitar tombol, paling bawah di kiri
  function findBlueHamburger(){
    const candidates = Array.from(document.querySelectorAll("button,a,div"))
      .filter(el => {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed") return false;
        if (!isVisible(el)) return false;

        const r = el.getBoundingClientRect();
        const nearLeft = r.left < 80;
        const nearBottom = (window.innerHeight - r.bottom) < 140;
        if (!nearLeft || !nearBottom) return false;

        if (r.width < 35 || r.width > 95) return false;
        if (r.height < 35 || r.height > 95) return false;

        return true;
      });

    candidates.sort((a,b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom);
    return candidates[0] || null;
  }

function placeUnderBlue(wrap, blueBtn){
  const r = blueBtn.getBoundingClientRect();

  // ✅ sejajar kiri (bukan center)
  const left = r.left + LEFT_NUDGE;

  // ✅ taruh tepat di bawah tombol biru
  const top = r.bottom + GAP_BELOW_BLUE;

  wrap.style.left = Math.max(6, Math.min(left, window.innerWidth - SIZE - 6)) + "px";
  wrap.style.top  = Math.max(6, Math.min(top,  window.innerHeight - SIZE - 6)) + "px";
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

    const sync = () => {
      blue = findBlueHamburger();
      if (blue) placeUnderBlue(wrap, blue);
    };

    // initial + keep sync
    sync();
    window.addEventListener("resize", sync, { passive:true });
    window.addEventListener("scroll", sync, { passive:true });

    // kalau tombol biru muncul agak telat
    const timer = setInterval(() => {
      sync();
      if (findBlueHamburger()) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once:true });
  } else {
    mount();
  }
})();
