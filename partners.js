(() => {
  "use strict";

  const BTN_ID    = "mauslotSubmitBtn";
  const WRAP_ID   = "mauslotFloatingBtnWrap";
  const STYLE_ID  = "mauslotFloatingBtnStyles";

  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

  /* =========================================================
     1) ISI SELECTOR DI SINI (kalau tahu)
     - urutkan dari paling yakin
     - boleh kosong, nanti auto-detect
  ========================================================= */
  const TOGGLE_SELECTORS = [
    // "#menuToggle",
    // ".hamburger",
    // ".leftbar-toggle",
    // ".floating-social .toggle",
  ];

  /* OPTIONAL: kalau ada panel/menu yang muncul saat open (lebih akurat)
     isi selector panelnya (boleh kosong)
  */
  const PANEL_SELECTORS = [
    // "#leftMenu",
    // ".leftbar",
    // ".side-float",
    // ".floating-social",
  ];

  /* =========================================================
     2) SET POSISI
  ========================================================= */
  const GAP_ABOVE_TOGGLE = 12;   // jarak antar tombol (px)
  const BTN_SIZE = 56;          // ukuran tombol bulat

  /* ========================================================= */

  if (document.getElementById(WRAP_ID)) return;

  const css = `
    #${WRAP_ID}{
      position: fixed;
      left: 16px;
      top: 60vh;
      z-index: 2147483647;
      width: ${BTN_SIZE}px;
      height: ${BTN_SIZE}px;
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
      width: ${BTN_SIZE}px;
      height: ${BTN_SIZE}px;
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

  function injectCSS(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function attachRedirect(btn){
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!REDIRECT_URL) return;
      window.location.href = REDIRECT_URL;
    }, true);
  }

  // cek panel kelihatan (kalau selector panel diset)
  function anyPanelVisible(){
    for (const sel of PANEL_SELECTORS) {
      if (!sel) continue;
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      const visible = cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0";
      // kadang panel off-canvas display:block tapi offscreen; tetap dianggap open kalau ada class umum
      if (visible && (el.classList.contains("open") || el.classList.contains("active") || el.classList.contains("show"))) return true;
      if (el.classList.contains("open") || el.classList.contains("active") || el.classList.contains("show")) return true;
    }
    return false;
  }

  // open state dari tombol biru
  function isOpenState(toggleBtn){
    if (!toggleBtn) return false;

    const cls = toggleBtn.classList;
    if (cls.contains("open") || cls.contains("active") || cls.contains("is-open") || cls.contains("show")) return true;

    const ae = toggleBtn.getAttribute("aria-expanded");
    if (ae === "true") return true;

    // fallback: cek panel
    if (anyPanelVisible()) return true;

    return false;
  }

  // cari tombol biru: 1) dari selector 2) auto-detect elemen fixed kiri bawah
  function findToggleButton(){
    // 1) manual selectors
    for (const sel of TOGGLE_SELECTORS) {
      if (!sel) continue;
      const el = document.querySelector(sel);
      if (el) return el;
    }

    // 2) auto detect: cari element fixed di kiri bawah dengan ukuran kecil (mirip hamburger)
    const candidates = Array.from(document.querySelectorAll("button, a, div"))
      .filter(el => {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed") return false;
        const r = el.getBoundingClientRect();
        if (r.width < 35 || r.width > 90) return false;
        if (r.height < 35 || r.height > 90) return false;
        if (r.left > 40) return false;                         // dekat kiri
        if ((window.innerHeight - r.bottom) > 140) return false; // dekat bawah
        // seringnya ada cursor pointer / role button
        const role = (el.getAttribute("role") || "").toLowerCase();
        const clickable = cs.cursor === "pointer" || el.tagName === "BUTTON" || el.tagName === "A" || role === "button";
        if (!clickable) return false;
        return true;
      });

    // pilih yang paling “bawah”
    candidates.sort((a,b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom);
    return candidates[0] || null;
  }

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function setupAnchorAndVisibility(wrap){
    let toggleBtn = null;

    const placeNearToggle = () => {
      if (!toggleBtn) toggleBtn = findToggleButton();

      // kalau belum ketemu juga, pakai fallback posisi (tidak hide/show)
      if (!toggleBtn) {
        wrap.style.left = "16px";
        wrap.style.top = "65vh";
        wrap.classList.remove("is-hidden");
        return;
      }

      const r = toggleBtn.getBoundingClientRect();

      // sejajarkan center tombol bulat dengan center tombol biru
      const left = r.left + (r.width / 2) - (BTN_SIZE / 2);
      const top  = (r.top - GAP_ABOVE_TOGGLE - BTN_SIZE);

      wrap.style.left = clamp(left, 6, window.innerWidth - BTN_SIZE - 6) + "px";
      wrap.style.top  = clamp(top, 6, window.innerHeight - BTN_SIZE - 6) + "px";
    };

    const applyVisibility = () => {
      if (!toggleBtn) toggleBtn = findToggleButton();
      if (!toggleBtn) { wrap.classList.remove("is-hidden"); return; }

      if (isOpenState(toggleBtn)) wrap.classList.add("is-hidden");
      else wrap.classList.remove("is-hidden");
    };

    // initial
    placeNearToggle();
    applyVisibility();

    // update saat resize/scroll
    window.addEventListener("resize", () => { placeNearToggle(); applyVisibility(); }, { passive: true });
    window.addEventListener("scroll",  () => { placeNearToggle(); }, { passive: true });

    // klik toggle: setelah UI berubah, cek lagi
    const hookToggleClick = () => {
      if (!toggleBtn) return;
      toggleBtn.addEventListener("click", () => {
        setTimeout(() => { placeNearToggle(); applyVisibility(); }, 50);
      }, true);
    };
    hookToggleClick();

    // mutation observer: kalau class/aria berubah
    const mo = new MutationObserver(() => {
      placeNearToggle();
      applyVisibility();
    });

    // observe body/html juga (kadang state open ditaruh di body class)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class","style"] });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class","style"] });

    // observe toggle/panel kalau ada
    const obsTargets = [];
    if (toggleBtn) obsTargets.push(toggleBtn);
    for (const sel of PANEL_SELECTORS) {
      if (!sel) continue;
      const p = document.querySelector(sel);
      if (p) obsTargets.push(p);
    }
    obsTargets.forEach(t => mo.observe(t, { attributes: true, attributeFilter: ["class","style","aria-expanded"] }));

    // fallback: cek berkala (biar pasti sync walau UI aneh)
    setInterval(() => {
      // refresh toggle kalau DOM berubah
      if (!toggleBtn || !document.contains(toggleBtn)) {
        toggleBtn = findToggleButton();
        hookToggleClick();
      }
      placeNearToggle();
      applyVisibility();
    }, 400);
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
    if (!btn) return;

    attachRedirect(btn);
    setupAnchorAndVisibility(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
