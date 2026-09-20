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
  if (e.target.closest("a, button")) return;
  if (window.getSelection().toString()) return;
  cmdline.focus();
});
document.addEventListener("keydown", (e) => {
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
