(() => {
  "use strict";

  const BTN_ID    = "mauslotSubmitBtn";
  const CANVAS_ID = "mauslotPowderCanvas";
  const WRAP_ID   = "mauslotFloatingBtnWrap";
  const STYLE_ID  = "mauslotFloatingBtnStyles";

  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

  /* =========================================================
     WAJIB: isi selector tombol biru (hamburger)
     contoh paling umum:
     - ".floating-social .toggle"
     - "#floatingMenuBtn"
     - ".leftbar-toggle"
     ========================================================= */
  const TOGGLE_SELECTOR = ""; // <-- isi ini

  /* OPTIONAL: isi selector panel/menu yang muncul saat hamburger open
     kalau ada, script akan "sync" tampil/hilang berdasarkan kondisi open.
  */
  const PANEL_SELECTOR = ""; // contoh: ".floating-social.open" atau "#leftbar"

  const LEFT_PX = 16;
  const DESKTOP_BOTTOM_PX = 92;
  const MOBILE_BOTTOM_PX  = 92;

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
    }
    .mauslot-icon svg{ width: 22px; height: 22px; filter: drop-shadow(0 1px 2px rgba(0,0,0,.35)); }
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

  function attachLogic(btn){
    btn.addEventListener("click", () => {
      if (!REDIRECT_URL) return;
      location.href = REDIRECT_URL;
    }, { passive: true });
  }

  function setupToggleWithBlueButton(wrap){
    if (!TOGGLE_SELECTOR) return; // tanpa selector, tidak bisa

    const hide = () => wrap.classList.add("is-hidden");
    const show = () => wrap.classList.remove("is-hidden");

    // Mode A (paling akurat): sync ke PANEL open/close (kalau tersedia)
    const syncByPanel = () => {
      if (!PANEL_SELECTOR) return false;
      const panel = document.querySelector(PANEL_SELECTOR);
      if (!panel) return false;

      const isOpen = () => {
        const cs = getComputedStyle(panel);
        return panel.classList.contains("open") ||
               panel.classList.contains("active") ||
               (cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0");
      };

      const apply = () => (isOpen() ? hide() : show());
      apply();

      const mo = new MutationObserver(apply);
      mo.observe(panel, { attributes: true, attributeFilter: ["class","style"] });
      return true;
    };

    const synced = syncByPanel();

    // Mode B: toggle setiap klik tombol biru
    // (kalau Mode A aktif, ini tetap aman, karena setelah panel berubah observer akan sync lagi)
    document.addEventListener("click", (e) => {
      const t = e.target;
      const btnBlue = t && t.closest ? t.closest(TOGGLE_SELECTOR) : null;
      if (!btnBlue) return;

      // toggle cepat
      wrap.classList.toggle("is-hidden");
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
      </button>
    `;
    document.body.appendChild(wrap);

    const btn = document.getElementById(BTN_ID);
    if (!btn) return;

    attachLogic(btn);
    setupToggleWithBlueButton(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
