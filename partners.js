(() => {
  "use strict";

  const BTN_ID   = "mauslotSubmitBtn";
  const WRAP_ID  = "mauslotFloatingBtnWrap";
  const STYLE_ID = "mauslotFloatingBtnStyles";

  const REDIRECT_URL = "https://urlpsjshorten.com/pasjackpot";

  const BTN_SIZE = 56;
  const GAP = 10; // jarak rapi

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
    #${WRAP_ID}.in-stack{
      position: static !important;
      margin: ${GAP}px auto 0;
      transform:none !important;
      width:${BTN_SIZE}px;height:${BTN_SIZE}px;
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

  // Cari tombol fixed kiri bawah (hamburger / download) dari bentuk & posisi
  function findFixedLeftButtons(){
    const all = Array.from(document.querySelectorAll("button,a,div"))
      .filter(el => {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed") return false;
        if (!isVisible(el)) return false;

        const r = el.getBoundingClientRect();
        // area kiri & bawah layar
        const nearLeft = r.left < 60;
        const nearBottom = (window.innerHeight - r.bottom) < 220;
        if (!nearLeft || !nearBottom) return false;

        // ukuran button
        if (r.width < 35 || r.width > 90) return false;
        if (r.height < 35 || r.height > 90) return false;

        return true;
      });

    // urut dari paling bawah
    all.sort((a,b)=> b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom);
    return all;
  }

  // Heuristik: hamburger biasanya paling bawah (atau dekat bawah) dan punya garis/menu
  function guessHamburger(btns){
    // kandidat paling bawah
    return btns[0] || null;
  }

  // Heuristik: download biasanya ada panah bawah / ikon download di dalamnya, dan posisinya di atas hamburger
  function guessDownload(btns, hamburger){
    if (!hamburger) return null;
    const hr = hamburger.getBoundingClientRect();

    const cand = btns
      .map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(x => x.r.bottom < hr.top - 10) // di atas hamburger
      .sort((a,b)=> b.r.bottom - a.r.bottom)[0];

    return cand ? cand.el : null;
  }

  // Cari container stack saat open: biasanya parent yang punya banyak icon di kiri
  function findStackContainerAround(el){
    if (!el) return null;
    let p = el.parentElement;
    for (let i=0;i<8 && p;i++){
      const cs = getComputedStyle(p);
      const r = p.getBoundingClientRect();
      const looksLeft = r.left < 80;
      const hasManyButtons = p.querySelectorAll("a,button").length >= 4;
      if ((cs.position === "fixed" || cs.position === "absolute") && looksLeft && hasManyButtons) return p;
      p = p.parentElement;
    }
    // fallback: cari fixed container kiri yang punya banyak icon
    const containers = Array.from(document.querySelectorAll("div,nav,aside"))
      .filter(c => {
        const cs = getComputedStyle(c);
        if (cs.position !== "fixed") return false;
        const r = c.getBoundingClientRect();
        if (r.left > 80) return false;
        if (r.width < 50) return false;
        return c.querySelectorAll("a,button").length >= 4;
      })
      .sort((a,b)=> b.getBoundingClientRect().height - a.getBoundingClientRect().height);

    return containers[0] || null;
  }

  // Deteksi open: ketika stack container “tinggi” dan ada tombol close (X) atau item banyak terlihat
  function isOpen(stack){
    if (!stack) return false;
    const r = stack.getBoundingClientRect();
    const many = stack.querySelectorAll("a,button").length >= 5;
    const tall = r.height > 220;
    // cari tombol X di dalam stack
    const hasClose = Array.from(stack.querySelectorAll("button,a,div")).some(x => {
      if (!isVisible(x)) return false;
      const t = (x.textContent || "").trim();
      return t === "×" || t === "X";
    });
    return (many && tall) || hasClose;
  }

  function attachRedirect(btn){
    btn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!REDIRECT_URL) return;
      window.location.href = REDIRECT_URL;
    }, true);
  }

  function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

  function placeBetweenDownloadAndHamburger(wrap, downloadBtn, hamburgerBtn){
    const dr = downloadBtn.getBoundingClientRect();
    const hr = hamburgerBtn.getBoundingClientRect();

    // X center align mengikuti download/hamburger
    const left = (hr.left + hr.width/2) - (BTN_SIZE/2);

    // Y: tepat DI BAWAH download, tapi tidak nabrak hamburger
    let top = dr.bottom + GAP;

    // kalau terlalu dekat hamburger, geser jadi di atas hamburger
    const maxTop = hr.top - GAP - BTN_SIZE;
    top = Math.min(top, maxTop);

    // clamp layar
    wrap.style.left = clamp(left, 6, window.innerWidth - BTN_SIZE - 6) + "px";
    wrap.style.top  = clamp(top,  6, window.innerHeight - BTN_SIZE - 6) + "px";
  }

  function moveToStack(wrap, stack){
    if (!stack) return false;
    wrap.classList.add("in-stack");
    wrap.style.left = "auto";
    wrap.style.top  = "auto";
    stack.appendChild(wrap);
    return true;
  }

  function moveToBodyFixed(wrap){
    if (wrap.parentNode !== document.body) document.body.appendChild(wrap);
    wrap.classList.remove("in-stack");
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

    let hamburger = null;
    let download  = null;
    let stack     = null;

    const sync = () => {
      // refresh tombol fixed kiri bawah
      const fixedBtns = findFixedLeftButtons();
      hamburger = guessHamburger(fixedBtns);
      download  = guessDownload(fixedBtns, hamburger);

      // stack container mengikuti hamburger
      stack = findStackContainerAround(hamburger);

      // kalau belum ketemu download/hamburger, jangan hilang — taruh aman kiri
      if (!hamburger || !download) {
        moveToBodyFixed(wrap);
        wrap.classList.remove("hidden");
        wrap.style.left = "16px";
        wrap.style.top  = "65vh";
        return;
      }

      const open = isOpen(stack);

      if (open) {
        // OPEN => ikut naik ke stack
        const ok = moveToStack(wrap, stack);
        wrap.classList.remove("hidden");
        if (!ok) wrap.classList.add("hidden");
      } else {
        // CLOSE => balik fixed di slot dekat kotak merah (antara download & hamburger)
        moveToBodyFixed(wrap);
        placeBetweenDownloadAndHamburger(wrap, download, hamburger);
        wrap.classList.remove("hidden");
      }
    };

    // initial + menjaga stabil
    sync();
    window.addEventListener("resize", sync, { passive:true });
    window.addEventListener("scroll", sync, { passive:true });
    setInterval(sync, 350);

    // observer untuk perubahan class/menu
    const mo = new MutationObserver(() => sync());
    mo.observe(document.body, { attributes:true, childList:true, subtree:true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once:true });
  } else {
    mount();
  }
})();
