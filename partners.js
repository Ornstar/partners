(() => {
  "use strict";

  const BTN_ID    = "mauslotSubmitBtn";
  const CANVAS_ID = "mauslotPowderCanvas";
  const WRAP_ID   = "mauslotFloatingBtnWrap";
  const STYLE_ID  = "mauslotFloatingBtnStyles";

  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

  /* WAJIB: selector tombol biru (hamburger) */
  const TOGGLE_SELECTOR = ""; // contoh: "#menuToggle", ".floating-social .toggle", ".hamburger"

  /* OPTIONAL: selector panel/menu yang muncul saat open (kalau ada) */
  const PANEL_SELECTOR = ""; // contoh: ".leftbar.open" atau "#leftMenu"

  /* posisi tombol bulat: di atas tombol biru */
  const OFFSET_ABOVE_TOGGLE = 72; // naik 72px dari tombol biru (ubah 60-90 sesuai perlu)

  if (document.getElementById(WRAP_ID)) return;

  const css = `
    #${CANVAS_ID}{
      position: fixed; inset: 0;
      width: 100%; height: 100vh;
      pointer-events: none;
      z-index: 99998;
    }

    /* wrap: fixed tapi posisinya DISET lewat JS biar nempel ke tombol biru */
    #${WRAP_ID}{
      position: fixed;
      left: 16px;
      bottom: 120px;
      z-index: 2147483647; /* super tinggi biar gak ketimpa */
      display: grid;
      place-items: center;
      transition: opacity .18s ease, transform .18s ease;
    }
    #${WRAP_ID}.is-hidden{
      opacity: 0;
      transform: translateY(10px);
      pointer-events: none;
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
    .mauslot-icon svg{
      width: 22px; height: 22px;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,.35));
    }
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

  function attachRedirect(btn){
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!REDIRECT_URL) return;
      location.href = REDIRECT_URL;
    });
  }

  function isOpenState(btnEl){
    // kalau tombol biru punya class open/active/expanded
    const cls = btnEl.classList;
    if (cls.contains("open") || cls.contains("active") || cls.contains("is-open")) return true;

    // kalau aria-expanded ada
    const ae = btnEl.getAttribute("aria-expanded");
    if (ae === "true") return true;

    // kalau panel selector diisi, pakai itu sebagai acuan
    if (PANEL_SELECTOR) {
      const panel = document.querySelector(PANEL_SELECTOR);
      if (panel) {
        const pcs = getComputedStyle(panel);
        const visible = pcs.display !== "none" && pcs.visibility !== "hidden" && pcs.opacity !== "0";
        if (panel.classList.contains("open") || panel.classList.contains("active") || visible) return true;
      }
    }

    return false;
  }

  function setupToggleAndAnchor(wrap){
    if (!TOGGLE_SELECTOR) return;

    const toggleBtn = document.querySelector(TOGGLE_SELECTOR);
    if (!toggleBtn) return;

    const placeNearToggle = () => {
      const r = toggleBtn.getBoundingClientRect();
      // tempel di kiri sejajar tombol biru
      wrap.style.left = Math.max(8, r.left) + "px";
      // taruh DI ATAS tombol biru
      const bottomPx = Math.max(8, (window.innerHeight - r.top) + OFFSET_ABOVE_TOGGLE);
      wrap.style.bottom = bottomPx + "px";
    };

    const applyVisibility = () => {
      // open => hide, close => show
      if (isOpenState(toggleBtn)) wrap.classList.add("is-hidden");
      else wrap.classList.remove("is-hidden");
    };

    // initial
    placeNearToggle();
    applyVisibility();

    // update posisi saat scroll/resize
    window.addEventListener("resize", () => { placeNearToggle(); applyVisibility(); }, { passive: true });
    window.addEventListener("scroll",  () => { placeNearToggle(); }, { passive: true });

    // klik tombol biru: toggle hide/show (dan posisi update)
    toggleBtn.addEventListener("click", () => {
      // setelah UI toggle berubah, cek lagi (kasih delay kecil)
      setTimeout(() => {
        placeNearToggle();
        applyVisibility();
      }, 30);
    }, true);

    // kalau class/style berubah tanpa klik (misalnya otomatis), tetap sync
    const mo = new MutationObserver(() => {
      placeNearToggle();
      applyVisibility();
    });
    mo.observe(toggleBtn, { attributes: true, attributeFilter: ["class","style","aria-expanded"] });
    if (PANEL_SELECTOR) {
      const panel = document.querySelector(PANEL_SELECTOR);
      if (panel) mo.observe(panel, { attributes: true, attributeFilter: ["class","style"] });
    }
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

    attachRedirect(btn);
    setupToggleAndAnchor(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
