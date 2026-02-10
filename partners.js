(() => {
  "use strict";

  const BTN_ID   = "mauslotSubmitBtn";
  const WRAP_ID  = "mauslotFloatingBtnWrap";
  const STYLE_ID = "mauslotFloatingBtnStyles";

  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

  /* =========================
     WAJIB: isi selector di sini
     ========================= */
  const TOGGLE_SELECTORS = [
    // contoh:
    // ".floating-social .toggle",
    // "#menuToggle",
    // ".hamburger",
  ];

  const STACK_CONTAINERS = [
    // contoh container list icon saat open:
    // ".floating-social .items",
    // ".floating-social",
    // "#sticky-leftbar",
  ];

  /* jarak tombol kita dari tombol biru saat mode CLOSED (fixed) */
  const GAP_ABOVE_TOGGLE = 12;
  const BTN_SIZE = 56;

  if (document.getElementById(WRAP_ID)) return;

  const css = `
    #${WRAP_ID}{
      position: fixed;
      z-index: 2147483647;
      width:${BTN_SIZE}px;height:${BTN_SIZE}px;
      display:grid;place-items:center;
      transition: opacity .18s ease, transform .18s ease;
    }
    #${WRAP_ID}.hidden{
      opacity:0; transform: translateY(10px);
      pointer-events:none;
    }

    #${BTN_ID}{
      width:${BTN_SIZE}px;height:${BTN_SIZE}px;
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
      box-shadow: 0 2px 6px rgba(0,0,0,.55) inset,
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

    /* ketika ditempel ke stack, biar rapi seperti icon lain */
    #${WRAP_ID}.in-stack{
      position: static !important;
      width:${BTN_SIZE}px;height:${BTN_SIZE}px;
      margin: 10px auto 0;
      transform:none !important;
    }
  `;

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = css;
    document.head.appendChild(s);
  }

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function findFirst(selectors){
    for (const sel of selectors){
      if (!sel) continue;
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  // fallback auto detect tombol biru fixed kiri bawah
  function autoFindToggle(){
    const nodes = Array.from(document.querySelectorAll("button,a,div"))
      .filter(el => {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed") return false;
        const r = el.getBoundingClientRect();
        if (r.width < 35 || r.width > 90) return false;
        if (r.height < 35 || r.height > 90) return false;
        if (r.left > 50) return false;
        if ((window.innerHeight - r.bottom) > 170) return false;
        return cs.cursor === "pointer" || el.tagName === "BUTTON" || el.tagName === "A";
      });
    nodes.sort((a,b)=> b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom);
    return nodes[0] || null;
  }

  function isOpenState(toggleBtn){
    if (!toggleBtn) return false;
    const cls = toggleBtn.classList;
    if (cls.contains("open") || cls.contains("active") || cls.contains("is-open") || cls.contains("show")) return true;
    const ae = toggleBtn.getAttribute("aria-expanded");
    if (ae === "true") return true;
    // fallback: kalau ada body class open/menu-open
    const bcls = document.body.classList;
    if (bcls.contains("open") || bcls.contains("menu-open") || bcls.contains("sidebar-open")) return true;
    return false;
  }

  function placeFixedNearToggle(wrap, toggleBtn){
    if (!toggleBtn) return;
    const r = toggleBtn.getBoundingClientRect();
    const left = r.left + (r.width/2) - (BTN_SIZE/2);
    const top  = r.top - GAP_ABOVE_TOGGLE - BTN_SIZE;

    wrap.style.left = clamp(left, 6, window.innerWidth - BTN_SIZE - 6) + "px";
    wrap.style.top  = clamp(top,  6, window.innerHeight - BTN_SIZE - 6) + "px";
  }

  function moveToStack(wrap){
    const host = findFirst(STACK_CONTAINERS);
    if (!host) return false;

    // jika host pakai list icon, kita tempel ikut barisan
    wrap.classList.add("in-stack");
    wrap.style.left = "auto";
    wrap.style.top  = "auto";

    host.appendChild(wrap);
    return true;
  }

  function moveToBodyFixed(wrap){
    if (wrap.parentNode !== document.body) document.body.appendChild(wrap);
    wrap.classList.remove("in-stack");
  }

  function attachRedirect(btn){
    btn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!REDIRECT_URL) return;
      window.location.href = REDIRECT_URL;
    }, true);
  }

  function setup(wrap){
    let toggleBtn = findFirst(TOGGLE_SELECTORS) || autoFindToggle();

    const sync = () => {
      if (!toggleBtn || !document.contains(toggleBtn)) {
        toggleBtn = findFirst(TOGGLE_SELECTORS) || autoFindToggle();
      }

      // kalau belum ketemu toggle, biarkan fixed di kiri bawah
      if (!toggleBtn){
        moveToBodyFixed(wrap);
        wrap.classList.remove("hidden");
        wrap.style.left = "16px";
        wrap.style.top  = "65vh";
        return;
      }

      const open = isOpenState(toggleBtn);

      if (open) {
        // OPEN => tempel ke stack (ikut naik)
        const ok = moveToStack(wrap);
        wrap.classList.remove("hidden");
        if (!ok){
          // kalau host belum ketemu, minimal hide (biar gak ketimpa)
          wrap.classList.add("hidden");
        }
      } else {
        // CLOSE => balik ke fixed dekat tombol biru
        moveToBodyFixed(wrap);
        placeFixedNearToggle(wrap, toggleBtn);
        wrap.classList.remove("hidden");
      }
    };

    // initial
    sync();

    // update event
    window.addEventListener("resize", sync, { passive:true });
    window.addEventListener("scroll", () => {
      // kalau close (fixed), ikuti posisi toggle saat scroll
      const open = toggleBtn && isOpenState(toggleBtn);
      if (!open) sync();
    }, { passive:true });

    // klik toggle => tunggu UI berubah, lalu sync
    if (toggleBtn){
      toggleBtn.addEventListener("click", () => setTimeout(sync, 60), true);
    }

    // observer: class/aria berubah
    const mo = new MutationObserver(() => sync());
    mo.observe(document.body, { attributes:true, attributeFilter:["class","style"] });
    if (toggleBtn) mo.observe(toggleBtn, { attributes:true, attributeFilter:["class","style","aria-expanded"] });

    // interval fallback biar stabil walau UI aneh
    setInterval(sync, 400);
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
    setup(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once:true });
  } else {
    mount();
  }
})();
