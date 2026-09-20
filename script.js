/* ============================================================================
   NETRUNNER TERMINAL — engine
   Content lives in data.js. This file is the shell that renders it.
   ========================================================================== */

const $  = (s) => document.querySelector(s);
const term      = $("#terminal");
const cmdline   = $("#cmdline");
const inputline = $("#inputline");
const ghost     = $("#ghost");

const esc = (s) => String(s).replace(/[&<>"]/g, c =>
  ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

const LOGO = [
"     ██╗███████╗███╗   ██╗██╗██╗     ",
"     ██║██╔════╝████╗  ██║██║██║     ",
"     ██║█████╗  ██╔██╗ ██║██║██║     ",
"██   ██║██╔══╝  ██║╚██╗██║██║██║     ",
"╚█████╔╝███████╗██║ ╚████║██║███████╗",
" ╚════╝ ╚══════╝╚═╝  ╚═══╝╚═╝╚══════╝",
].join("\n");

/* ============================ OUTPUT ENGINE ============================== */

let busy = false;      // a print animation is running
let flush = false;     // user asked to skip it

function el(html, cls){
  const d = document.createElement("div");
  d.className = "line" + (cls ? " " + cls : "");
  d.innerHTML = html;
  term.insertBefore(d, inputline);   /* the prompt is the last child; stay above it */
  term.scrollTop = term.scrollHeight;
  return d;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* Prints an array of HTML strings line by line, with a skip-on-keypress. */
async function print(lines, speed = 14){
  busy = true; flush = false;
  const arr = Array.isArray(lines) ? lines : [lines];
  for (const l of arr){
    if (l === null || l === undefined) continue;
    const [html, cls] = Array.isArray(l) ? l : [l, ""];
    el(html === "" ? "&nbsp;" : html, cls);
    if (!flush && speed) await sleep(speed);
  }
  busy = false;
  term.scrollTop = term.scrollHeight;
}

/* Character-by-character typing, used sparingly (headers, boot). */
async function typeInto(node, text, speed = 16){
  busy = true; flush = false;
  for (let i = 0; i < text.length; i++){
    node.textContent += text[i];
    term.scrollTop = term.scrollHeight;
    if (!flush) await sleep(speed);
  }
  busy = false;
  return node;
}

async function type(text, cls = "", speed = 16){
  return typeInto(el("", cls), text, speed);
}

/* ============================ FORMAT HELPERS ============================= */

const head  = (t) => `<span class="head">${esc(t)}</span>`;
const rule  = () => `<div class="rule"></div>`;

function linkTag(url, label, downloadAs){
  if (!url) return `<span class="dim">[ not linked yet ]</span>`;
  const safe = esc(url);
  /* a download link must not open a new tab — the tab would just sit blank */
  const attrs = downloadAs
    ? `download="${esc(downloadAs)}"`
    : `target="_blank" rel="noopener noreferrer"`;
  return `<a class="link" href="${safe}" ${attrs}>${esc(label || url)}</a>`;
}

function projectCard(p, i){
  const tags  = p.tech.map(t => `<span class="tag">${esc(t)}</span>`).join("");
  const links = Object.entries(p.links || {})
    .filter(([, u]) => u)
    .map(([k, u]) => `${esc(k.toUpperCase())} ▸ ${linkTag(u)}`)
    .join("   ");
  return `<div class="card">
    <div class="c-title">[${String(i + 1).padStart(2, "0")}] ${esc(p.name)}</div>
    <div class="c-meta">${esc(p.year)} // <span class="c-award">${esc(p.role)}</span> // id: ${esc(p.id)}</div>
    <div class="c-blurb">${esc(p.blurb)}</div>
    <div>${tags}</div>
    <div style="margin-top:6px">${links || '<span class="dim">[ links pending ]</span>'}</div>
  </div>`;
}

/* ============================== COMMANDS ================================= */

const CMD = {};
const define = (name, desc, run, opts = {}) =>
  CMD[name] = { name, desc, run, hidden: !!opts.hidden, args: opts.args || "" };

/* ---- help ---- */
define("help", "show every available command", async () => {
  const rows = Object.values(CMD).filter(c => !c.hidden).map(c => {
    const label = (c.name + (c.args ? " " + c.args : "")).padEnd(20, " ");
    return `  <span class="yel">${esc(label)}</span><span class="dim">${esc(c.desc)}</span>`;
  });
  await print([
    head("COMMAND INDEX"),
    ...rows,
    "",
    `  <span class="dim">TAB completes · ↑/↓ recalls history</span>`,
  ]);
});

/* ---- about ---- */
define("about", "who I am", async () => {
  const id = DATA.identity;
  /* host label follows the city rather than repeating it in a second place */
  const host = String(id.location).split(",")[0].trim().toLowerCase();

  const stats = [
    `<span class="ab-k">ROLE</span> ${esc(id.role)}`,
    `<span class="ab-k">LOCATION</span> ${esc(id.location)}`,
    `<span class="ab-k">STATUS</span> <span class="ok">${esc(id.status)}</span>`,
    `<span class="ab-k">PROJECTS</span> ${DATA.projects.length} archived`,
    `<span class="ab-k">WINS</span> ${DATA.hackathons.length} logged`,
    `<span class="ab-k">UPTIME</span> too many all-nighters`,
  ];

  await print([
    head("DOSSIER // " + id.name),
    `<div class="ab">
       <pre class="ab-art">${esc(LOGO)}</pre>
       <div class="ab-info">
         <div class="ab-handle"><span class="yel">${esc(id.handle)}</span><span class="mag">@</span><span class="acc">${esc(host)}</span></div>
         <div class="ab-sep"></div>
         ${stats.map(r => `<div class="ab-row">${r}</div>`).join("")}
       </div>
     </div>`,
  ], 0);

  await print([
    ...DATA.about.map(l => [`<span class="yel">▸</span>  ${esc(l)}`, "bullet"]),
    "",
    `  <span class="acc">${esc(id.tagline)}</span>`,
    "",
    `  <span class="dim">next ▸ try</span> <span class="yel">projects</span> <span class="dim">or</span> <span class="yel">contact</span>`,
  ], 40);
});

/* ---- projects ---- */
define("projects", "list everything I've built", async () => {
  await print([head("PROJECT ARCHIVE")], 0);
  await print(DATA.projects.map((p, i) => projectCard(p, i)), 60);
  await print([
    `  <span class="dim">▸ run</span> <span class="yel">project &lt;id or number&gt;</span> <span class="dim">for a single entry</span>`,
  ]);
});

define("project", "open one project in detail", async (args) => {
  const key = (args[0] || "").toLowerCase();
  if (!key) return print([`  <span class="err">usage: project &lt;id or number&gt;</span>`]);
  const idx = /^\d+$/.test(key) ? parseInt(key, 10) - 1
            : DATA.projects.findIndex(p => p.id.toLowerCase() === key);
  const p = DATA.projects[idx];
  if (!p) return print([`  <span class="err">no project matches "${esc(key)}"</span>`,
                        `  <span class="dim">run</span> <span class="yel">projects</span> <span class="dim">to see the list</span>`]);
  await print([head(p.name), projectCard(p, idx)], 40);
}, { args: "<id>" });

/* ---- skills ---- */
define("skills", "the stack I work in", async () => {
  const out = [head("SKILL MATRIX")];
  for (const g of DATA.skills){
    out.push(`  <span class="sect">▚ ${esc(g.group)}</span>`);
    for (const s of g.items){
      out.push(`<div class="sk">
        <span class="sk-name">&nbsp;&nbsp;${esc(s.name)}</span>
        <span class="sk-bar"><span class="sk-fill" style="--w:${Number(s.level)}%"></span></span>
        <span class="sk-val">${Number(s.level)}%</span>
      </div>`);
    }
    out.push("");
  }
  await print(out, 26);
});

/* ---- hackathons ---- */
define("hackathons", "competition wins", async () => {
  const out = [head("COMBAT RECORD")];
  DATA.hackathons.forEach(h => {
    out.push(`  ${h.medal}  <span class="yel">${esc(h.name)}</span> <span class="dim">[${esc(h.year)}]</span>`);
    out.push(`      <span class="mag">${esc(h.place)}</span>`);
    out.push(`      <span class="dim">${esc(h.desc)}</span>`);
    if (h.link) out.push(`      <span class="dim">▸</span> ${linkTag(h.link)}`);
    out.push("");
  });
  await print(out, 40);
});

/* ---- experience ---- */
define("experience", "where I've worked", async () => {
  const out = [head("TIMELINE")];
  DATA.experience.forEach(e => {
    out.push(`  <span class="yel">${esc(e.when)}</span>  <span class="acc">${esc(e.what)}</span> <span class="dim">— ${esc(e.where)}</span>`);
    out.push(`      <span class="dim">${esc(e.desc)}</span>`);
    out.push("");
  });
  await print(out, 40);
});

/* ---- education ---- */
define("education", "degrees, certs, languages", async () => {
  const out = [head("TRAINING")];
  DATA.education.forEach(e => {
    out.push(`  <span class="yel">${esc(e.when)}</span>  <span class="acc">${esc(e.what)}</span>`);
    out.push(`      <span class="dim">${esc(e.where)}${e.desc ? " · " + esc(e.desc) : ""}</span>`);
    out.push("");
  });

  out.push(`  <span class="sect">▚ CERTIFICATIONS</span>`);
  DATA.certifications.forEach(c => out.push([`<span class="yel">▸</span>  ${esc(c)}`, "bullet"]));
  out.push("");
  out.push(`  <span class="sect">▚ LANGUAGES</span>`);
  out.push(`  <span class="dim">${esc(DATA.languages)}</span>`);
  await print(out, 26);
});

/* ---- contact ---- */
define("contact", "how to reach me", async () => {
  const out = [head("SECURE CHANNELS")];
  DATA.contact.forEach(c => {
    out.push(`<div class="crow"><span class="cl">${esc(c.label)}</span>${linkTag(c.url, c.value, c.download)}</div>`);
  });
  out.push("");
  out.push(`  <span class="dim">▸</span> <span class="yel">open &lt;label&gt;</span> <span class="dim">launches one of these directly</span>`);
  await print(out, 30);
});

define("open", "open a link by name", async (args) => {
  const key = (args[0] || "").toLowerCase();
  if (!key) return print([`  <span class="err">usage: open &lt;email|github|linkedin|resume|...&gt;</span>`]);
  const hit = DATA.contact.find(c => c.label.toLowerCase() === key);
  if (!hit || !hit.url) return print([`  <span class="err">no channel named "${esc(key)}"</span>`]);
  const tab = window.open(hit.url, "_blank", "noopener");
  await print([ tab
    ? `  <span class="ok">▸ opened ${esc(hit.label)} in a new tab</span>`
    : `  <span class="mag">▸ popup blocked — ${linkTag(hit.url, hit.value)}</span>` ]);
}, { args: "<name>" });

define("resume", "open my resume (PDF)", async () => {
  const r = DATA.contact.find(c => c.label.toUpperCase() === "RESUME");
  if (!r || !r.url) return print([`  <span class="err">no resume on file yet</span>`]);

  /* Fired before any `await` so it still counts as part of the keypress that
     ran the command — otherwise the popup blocker eats the new tab. */
  const tab = window.open(r.url, "_blank", "noopener");

  await print([
    head("DATASHARD"),
    `  ${linkTag(r.url, "▸ OPEN IN NEW TAB")}`,
    `  ${linkTag(r.url, "▸ SAVE PDF TO DISK", r.download || "resume.pdf")}`,
    "",
    tab ? `  <span class="dim">opened in a new tab — this terminal stays put.</span>`
        : `  <span class="mag">your browser blocked the new tab — use a link above.</span>`,
  ], 30);
});

/* ---- breach protocol (easter egg) ---- */
define("breach", "run the breach protocol", async () => {
  const HEX = ["1C", "55", "BD", "E9", "7A", "FF"];
  const size = 5;
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => HEX[Math.floor(Math.random() * HEX.length)]));

  await print([head("BREACH PROTOCOL"), `  <span class="dim">jacking into local subnet …</span>`, ""], 120);

  const node = el("", "");
  const path = [];
  for (let i = 0; i < size; i++) path.push([i, Math.floor(Math.random() * size)]);

  const draw = (upto) => {
    let html = '<div class="breach">';
    for (let r = 0; r < size; r++){
      for (let c = 0; c < size; c++){
        const on = path.slice(0, upto).some(([pr, pc]) => pr === r && pc === c);
        html += `<span class="${on ? "hit" : "miss"}">${grid[r][c]}</span> `;
      }
      html += "<br/>";
    }
    node.innerHTML = html + "</div>";
  };

  for (let i = 0; i <= size; i++){ draw(i); await sleep(260); }

  await print([
    "",
    `  <span class="ok">▸ SEQUENCE MATCHED — ${path.map(([r, c]) => grid[r][c]).join(" ")}</span>`,
    `  <span class="ok">▸ DAEMON UPLOADED: <b>ICEPICK</b></span>`,
    `  <span class="yel">▸ ACCESS GRANTED. You found the easter egg.</span>`,
    "",
    `  <span class="dim">reward: hire me and I'll do that to your bug backlog.</span>`,
  ], 120);

  await print([
    `<img class="breach-img" src="steve-dev.jpg" alt="steve dev" />`,
  ], 0);
});

/* ---- arcade ---- */
/* Set while a game owns the keyboard, so the terminal stops grabbing focus
   and stops treating arrow keys as history navigation. */
let gameActive = false;

define("game", "play a round of Galaga", async () => {
  if (gameActive) return;

  await print([
    head("ARCADE // GALAGA"),
    `  <span class="dim">← →</span> move &nbsp; <span class="dim">SPACE</span> fire &nbsp; <span class="dim">ESC</span> quit`,
  ], 20);

  const wrap = el(
    `<div class="game-wrap">` +
      `<canvas class="game-canvas" width="480" height="360"></canvas>` +
      `<div class="game-pad">` +
        `<button class="gp" data-k="left" aria-label="move left">◀</button>` +
        `<button class="gp" data-k="fire" aria-label="fire">FIRE</button>` +
        `<button class="gp" data-k="right" aria-label="move right">▶</button>` +
      `</div>` +
    `</div>`);

  gameActive = true;
  cmdline.blur();
  const res = await runGalaga(wrap.querySelector("canvas"), wrap.querySelector(".game-pad"));
  gameActive = false;
  cmdline.focus();

  await print([
    `  <span class="yel">▸ FINAL SCORE ${res.score}</span> <span class="dim">· reached wave ${res.wave}</span>`,
    res.score >= 3000
      ? `  <span class="ok">▸ nice shooting, choom.</span>`
      : `  <span class="dim">▸ run</span> <span class="yel">game</span> <span class="dim">to try again.</span>`,
  ], 30);
});

/* A compact Galaga: a swaying formation, enemies that peel off and dive at
   you, two bullets on screen at a time. Resolves when you quit or run out. */
function runGalaga(canvas, pad){
  return new Promise(resolve => {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const YEL = "#fcee0a", CYAN = "#00f0ff", PINK = "#ff4d9d", RED = "#ff003c", BG = "#05060a";

    const COLS = 8, ROWS = 4, SPX = 44, SPY = 30, MX = 46, MY = 46;

    let score = 0, lives = 3, wave = 1, t = 0, raf = 0, over = 0, ended = false;
    let bullets = [], eBullets = [], enemies = [], parts = [];
    let dropped = 0, diveTimer = 80;

    const player = { x: W / 2, y: H - 26, cool: 0, inv: 0 };
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: Math.random() * 1.4 + 0.3, v: Math.random() * 0.5 + 0.15,
    }));

    function spawnWave(){
      enemies = [];
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          enemies.push({ gx: c, gy: r, x: 0, y: 0, alive: true,
                         kind: r === 0 ? 2 : r < 3 ? 1 : 0,
                         state: "form", dt: 0, sx: 0, sy: 0, dir: 1 });
      dropped = 0;
    }
    spawnWave();

    const fx = e => MX + e.gx * SPX + Math.sin(t / 58) * 20;
    const fy = e => MY + e.gy * SPY + dropped;

    /* ---- input ---- */
    const keys = {};
    const GAME_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Spacebar"];
    function down(e){
      if (GAME_KEYS.includes(e.key) || e.code === "Space"){ e.preventDefault(); e.stopPropagation(); }
      if (e.key === "Escape" || e.key === "q" || e.key === "Q"){ e.preventDefault(); return finish(); }
      keys[e.key === " " || e.code === "Space" ? "fire" : e.key] = true;
    }
    function up(e){ keys[e.key === " " || e.code === "Space" ? "fire" : e.key] = false; }
    window.addEventListener("keydown", down, true);
    window.addEventListener("keyup", up, true);

    function padDown(e){ const k = e.target.dataset.k; if (k){ e.preventDefault(); keys[k] = true; } }
    function padUp(e){ const k = e.target.dataset.k; if (k){ e.preventDefault(); keys[k] = false; } }
    if (pad){
      pad.addEventListener("pointerdown", padDown);
      pad.addEventListener("pointerup", padUp);
      pad.addEventListener("pointerleave", padUp);
      pad.addEventListener("pointercancel", padUp);
    }

    function finish(){
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down, true);
      window.removeEventListener("keyup", up, true);
      if (pad) pad.remove();
      resolve({ score, wave });
    }

    function boom(x, y, col){
      for (let i = 0; i < 12; i++)
        parts.push({ x, y, vx: (Math.random() - .5) * 3.4, vy: (Math.random() - .5) * 3.4, life: 26, col });
    }

    function hitPlayer(){
      if (player.inv > 0) return;
      lives--;
      boom(player.x, player.y, YEL);
      player.inv = 90;
      eBullets = [];
      if (lives <= 0) over = 110;
    }

    /* ---- update ---- */
    function update(){
      t++;
      if (player.inv > 0) player.inv--;
      if (player.cool > 0) player.cool--;

      const speed = 3.2;
      if (keys.ArrowLeft  || keys.left)  player.x -= speed;
      if (keys.ArrowRight || keys.right) player.x += speed;
      player.x = Math.max(14, Math.min(W - 14, player.x));

      if (keys.fire && player.cool <= 0 && bullets.length < 2){
        bullets.push({ x: player.x, y: player.y - 12 });
        player.cool = 11;
      }

      bullets = bullets.filter(b => (b.y -= 7.5) > -10);
      eBullets = eBullets.filter(b => (b.y += b.vy) < H + 10);
      parts = parts.filter(p => { p.x += p.vx; p.y += p.vy; return --p.life > 0; });

      /* send someone down */
      if (--diveTimer <= 0 && !over){
        const pool = enemies.filter(e => e.alive && e.state === "form");
        if (pool.length){
          const e = pool[(Math.random() * pool.length) | 0];
          e.state = "dive"; e.dt = 0; e.sx = fx(e); e.sy = fy(e);
          e.dir = Math.random() < .5 ? -1 : 1;
        }
        diveTimer = Math.max(26, 96 - wave * 9);
      }

      for (const e of enemies){
        if (!e.alive) continue;
        if (e.state === "form"){ e.x = fx(e); e.y = fy(e); continue; }

        e.dt++;
        const p = e.dt / 118;
        e.y = e.sy + p * (H + 60);
        e.x = e.sx + Math.sin(e.dt / 13) * 48 * e.dir + (player.x - e.sx) * p * 0.6;
        if (e.dt % 30 === 0 && e.y < H - 70) eBullets.push({ x: e.x, y: e.y + 9, vy: 2.7 });
        if (e.y > H + 40){ e.state = "form"; e.dt = 0; }
      }

      /* bullets vs enemies */
      for (const b of bullets){
        for (const e of enemies){
          if (!e.alive || Math.abs(b.x - e.x) > 10 || Math.abs(b.y - e.y) > 8) continue;
          e.alive = false; b.y = -99;
          score += e.state === "dive" ? 100 : 50;
          boom(e.x, e.y, e.kind === 2 ? YEL : e.kind === 1 ? CYAN : PINK);
          break;
        }
      }
      bullets = bullets.filter(b => b.y > -50);

      if (!over){
        for (const b of eBullets)
          if (Math.abs(b.x - player.x) < 9 && Math.abs(b.y - player.y) < 9){ b.y = H + 99; hitPlayer(); }
        for (const e of enemies)
          if (e.alive && e.state === "dive" && Math.abs(e.x - player.x) < 13 && Math.abs(e.y - player.y) < 11){
            e.alive = false; boom(e.x, e.y, PINK); hitPlayer();
          }
      }

      /* formation creeps down, wave clears */
      if (t % 150 === 0) dropped += 4;
      if (enemies.every(e => !e.alive)){
        wave++; score += 250; diveTimer = 70; spawnWave();
      }
      if (over && --over <= 0) finish();
    }

    /* ---- draw ---- */
    function ship(x, y){
      ctx.fillStyle = YEL;
      ctx.beginPath();
      ctx.moveTo(x, y - 10); ctx.lineTo(x - 10, y + 8); ctx.lineTo(x - 3, y + 5);
      ctx.lineTo(x + 3, y + 5); ctx.lineTo(x + 10, y + 8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = CYAN; ctx.fillRect(x - 1.5, y - 5, 3, 7);
    }
    function bug(x, y, kind){
      const col = kind === 2 ? YEL : kind === 1 ? CYAN : PINK;
      ctx.fillStyle = col;
      ctx.fillRect(x - 7, y - 5, 14, 9);
      ctx.fillRect(x - 10, y - 1, 3, 6);
      ctx.fillRect(x + 7, y - 1, 3, 6);
      ctx.fillStyle = BG;
      ctx.fillRect(x - 4, y - 3, 2, 3);
      ctx.fillRect(x + 2, y - 3, 2, 3);
    }
    function draw(){
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(120,160,180,.5)";
      for (const s of stars){
        s.y += s.v; if (s.y > H){ s.y = 0; s.x = Math.random() * W; }
        ctx.fillRect(s.x, s.y, s.s, s.s);
      }

      for (const e of enemies) if (e.alive) bug(e.x, e.y, e.kind);

      ctx.fillStyle = YEL;
      for (const b of bullets) ctx.fillRect(b.x - 1, b.y - 8, 2, 9);
      ctx.fillStyle = RED;
      for (const b of eBullets) ctx.fillRect(b.x - 1.5, b.y - 5, 3, 7);

      for (const p of parts){
        ctx.globalAlpha = Math.max(0, p.life / 26);
        ctx.fillStyle = p.col; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;

      if (lives > 0 && (player.inv === 0 || (t >> 2) & 1)) ship(player.x, player.y);

      ctx.font = "12px 'Share Tech Mono', ui-monospace, monospace";
      ctx.textAlign = "left";  ctx.fillStyle = YEL;  ctx.fillText("SCORE " + score, 10, 18);
      ctx.textAlign = "center"; ctx.fillStyle = CYAN; ctx.fillText("WAVE " + wave, W / 2, 18);
      ctx.textAlign = "right"; ctx.fillStyle = PINK; ctx.fillText("LIVES " + Math.max(0, lives), W - 10, 18);

      if (over){
        ctx.fillStyle = "rgba(5,6,10,.8)"; ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.fillStyle = RED; ctx.font = "26px 'Share Tech Mono', ui-monospace, monospace";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 6);
        ctx.fillStyle = YEL; ctx.font = "13px 'Share Tech Mono', ui-monospace, monospace";
        ctx.fillText("SCORE " + score, W / 2, H / 2 + 20);
      }
      ctx.textAlign = "left";
    }

    function loop(){ update(); draw(); if (!ended) raf = requestAnimationFrame(loop); }
    raf = requestAnimationFrame(loop);
  });
}

/* ---- utility / fun ---- */
define("clear", "wipe the screen", async () => {
  term.querySelectorAll(".line").forEach(n => n.remove());
});

define("date", "current time", async () => {
  await print([`  <span class="acc">${esc(new Date().toString())}</span>`]);
});

define("echo", "repeat text back", async (args) => {
  await print([`  ${esc(args.join(" "))}`]);
}, { args: "<text>" });

define("sudo", "nice try", async () => {
  await print([
    `  <span class="err">[ FLATLINE ] nice try, choom. You are not root here.</span>`,
    `  <span class="dim">this incident has been reported to Arasaka.</span>`,
  ], 90);
}, { hidden: true });

define("exit", "log out", async () => {
  await print([`  <span class="err">▸ disconnecting …</span>`], 120);
  await sleep(400);
  await print([
    `  <span class="dim">you can check out any time you like,</span>`,
    `  <span class="yel">but you can never leave. (refresh to reboot)</span>`,
  ], 120);
}, { hidden: true });

define("hello", "say hi", async () => {
  await print([`  <span class="yel">Hey. Wake up, samurai — we have a portfolio to browse.</span>`]);
}, { hidden: true });

/* ============================== DISPATCH ================================= */

const history = [];
let histIdx = -1;

async function runCommand(raw){
  const input = raw.trim();
  el(`<span class="p">jenil@chicago:~$</span> ${esc(input)}`, "line-cmd");
  if (!input) return;

  history.unshift(input);
  histIdx = -1;

  const [name, ...args] = input.split(/\s+/);
  const cmd = CMD[name.toLowerCase()];

  if (!cmd){
    await print([
      `  <span class="err">command not found: ${esc(name)}</span>`,
      `  <span class="dim">type</span> <span class="yel">help</span> <span class="dim">for the command index</span>`,
    ]);
    return;
  }
  await cmd.run(args);
}

/* ============================== INPUT ==================================== */

/* The caret and the ghost suggestion are positioned in `ch` units, which works
   because the terminal font is monospace: N characters typed == N ch across. */
function syncInput(){
  const v = cmdline.value;
  inputline.style.setProperty("--len", v.length);
  inputline.classList.toggle("typing", v.length > 0);

  /* only suggest while typing the command word itself, not its arguments */
  const q = v.toLowerCase();
  const hit = (q && !q.includes(" "))
    ? Object.keys(CMD).find(k => k.startsWith(q) && k !== q)
    : null;
  ghost.textContent = hit ? hit.slice(q.length) : "";
}

cmdline.addEventListener("input", syncInput);

cmdline.addEventListener("keydown", async (e) => {
  if (gameActive) return;
  /* skip a running animation */
  if (busy && e.key !== "Tab"){ flush = true; }

  if (e.key === "Enter"){
    const v = cmdline.value;
    cmdline.value = "";
    inputline.classList.remove("typing");
      await runCommand(v);
    return;
  }

  if (e.key === "Tab"){
    e.preventDefault();
    const v = cmdline.value.trim().toLowerCase();
    if (!v) return;
    /* accept the inline ghost suggestion if one is showing */
    if (ghost.textContent){
      cmdline.value = v + ghost.textContent + " ";
      syncInput();
      return;
    }
    const matches = Object.keys(CMD).filter(k => k.startsWith(v));
    if (matches.length === 1){
      cmdline.value = matches[0] + " ";
    } else if (matches.length > 1){
      await print([`  <span class="dim">${matches.map(esc).join("   ")}</span>`], 0);
    }
    syncInput();
    return;
  }

  if (e.key === "ArrowUp"){
    e.preventDefault();
    if (histIdx < history.length - 1) histIdx++;
    cmdline.value = history[histIdx] || "";
    syncInput();
    return;
  }

  if (e.key === "ArrowDown"){
    e.preventDefault();
    if (histIdx > 0){ histIdx--; cmdline.value = history[histIdx]; }
    else { histIdx = -1; cmdline.value = ""; }
    syncInput();
    return;
  }

  if (e.key === "l" && e.ctrlKey){
    e.preventDefault();
    term.querySelectorAll(".line").forEach(n => n.remove());
  }
});

/* clicking anywhere (or typing) focuses the prompt */
document.addEventListener("click", (e) => {
  if (gameActive) return;
  if (e.target.closest("a, button")) return;
  if (window.getSelection().toString()) return;
  cmdline.focus();
});
document.addEventListener("keydown", (e) => {
  if (gameActive) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (document.activeElement !== cmdline && $("#boot").hidden) cmdline.focus();
});

/* ============================== CLOCK ==================================== */

function tick(){
  const d = new Date();
  $("#clock").textContent = d.toTimeString().slice(0, 8);
  $("#stat-ram").textContent = (58 + Math.floor(Math.random() * 12)) + "%";
}
setInterval(tick, 1000); tick();

/* ============================= WELCOME =================================== */
/* Same art-left / text-right panel as `about`, so the terminal opens on the
   identity block rather than a bare line of text. */

async function welcomePanel(typed = true){
  const id = DATA.identity;
  const node = el(`<div class="ab">
       <pre class="ab-art">${esc(LOGO)}</pre>
       <div class="ab-info">
         <div class="w-name"></div>
         <div class="ab-sep"></div>
         <div class="w-tag"></div>
       </div>
     </div>`);

  const name = `${id.name} // ${id.role}`;
  const nameEl = node.querySelector(".w-name");
  const tagEl  = node.querySelector(".w-tag");

  if (typed){
    await typeInto(nameEl, name, 22);
    await typeInto(tagEl, id.tagline, 8);
  } else {
    nameEl.textContent = name;
    tagEl.textContent  = id.tagline;
  }
  return node;
}

/* ============================== BOOT ===================================== */

const BOOT_LINES = [
  `<b>ARASAKA BIOS v2.077</b> — POST … <span class="ok">OK</span>`,
  `mounting /dev/datashard … <span class="ok">OK</span>`,
  `loading neural interface drivers … <span class="ok">OK</span>`,
  `handshake w/ NETWATCH … <span class="warn">BYPASSED</span>`,
  `decrypting personnel file: <b>${DATA.identity.name}</b> … <span class="ok">OK</span>`,
  `indexing ${DATA.projects.length} project records … <span class="ok">OK</span>`,
  `calibrating optics … <span class="ok">OK</span>`,
  `<b>WAKE UP, SAMURAI.</b>`,
];

async function boot(){
  const logo = $("#boot-logo");
  const log  = $("#boot-log");
  const fill = $("#boot-bar-fill");
  const press = $("#boot-press");

  /* type the logo in line by line */
  for (const line of LOGO.split("\n")){
    logo.textContent += line + "\n";
    await sleep(70);
  }

  for (let i = 0; i < BOOT_LINES.length; i++){
    const d = document.createElement("div");
    d.innerHTML = "&gt; " + BOOT_LINES[i];
    log.appendChild(d);
    fill.style.width = Math.round(((i + 1) / BOOT_LINES.length) * 100) + "%";
    await sleep(190 + Math.random() * 160);
  }

  press.hidden = false;
  await new Promise(res => {
    const go = () => { document.removeEventListener("keydown", go);
                       document.removeEventListener("click", go); res(); };
    document.addEventListener("keydown", go);
    document.addEventListener("click", go);
    setTimeout(go, 6000);   /* auto-continue if they just watch */
  });

  $("#boot").hidden = true;
  $("#boot").style.display = "none";
  $("#frame").classList.remove("hidden");
  cmdline.focus();

  await print([
    `  <span class="dim">connection established · encrypted · ${esc(new Date().toDateString())}</span>`,
  ], 0);

  await welcomePanel();

  await print([
    "",
    `  Type <span class="yel">help</span> to see what this terminal can do.`,
    "",
  ], 30);
}

/* skip boot entirely with ?fast in the URL */
if (location.search.includes("fast")){
  $("#boot").hidden = true; $("#boot").style.display = "none";
  $("#frame").classList.remove("hidden");
  cmdline.focus();
  welcomePanel(false).then(() =>
    print([`  <span class="dim">fast boot.</span> Type <span class="yel">help</span>.`]));
} else {
  boot();
}
