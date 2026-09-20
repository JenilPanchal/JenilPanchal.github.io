/* ============================================================================
   SITE CONTENT
   Everything the terminal prints comes from this file. Edit a string, save,
   reload — no build step.
   ========================================================================== */

const DATA = {

  /* ---------------- IDENTITY ---------------- */
  identity: {
    name:     "JENIL PANCHAL",
    handle:   "jenil",
    role:     "Software Developer // 7x Hackathon Winner",
    location: "Chicago, IL",
    status:   "AVAILABLE FOR WORK",
    tagline:  "I build things that ship — web, mobile, and real-time 3D.",
  },

  /* ---------------- ABOUT ----------------
     One bullet per string, rendered under the ASCII panel. Whole thoughts
     only — a sentence split across two entries renders as two bullets.   */
  about: [
    "Software Engineer and MS Computer Science candidate at Illinois Tech, with 4+ years building web, mobile, and real-time 3D applications.",
    "Professional React Native and full-stack experience — TypeScript, React, Next.js, Node.js and SQL across the stack.",
    "Specialized in Unity, Unreal Engine and AR/VR, from WebXR to Snap AR glasses and Meta Quest.",
    "Seven-time hackathon award winner at ETHGlobal, Google and Microsoft competitions.",
    "Shipped a multiplayer game to the Google Play Store and built systems serving 10M+ 3D assets.",
  ],

  /* ---------------- SKILLS ----------------
     level = 0-100. A rough weighting for the bar width, not a metric.    */
  skills: [
    { group: "LANGUAGES", items: [
      { name: "TypeScript / JavaScript", level: 92 },
      { name: "C#",                      level: 84 },
      { name: "Python",                  level: 78 },
      { name: "SQL",                     level: 80 },
      { name: "Solidity",                level: 72 },
    ]},
    { group: "FRAMEWORKS", items: [
      { name: "React / React Native",    level: 90 },
      { name: "Next.js",                 level: 85 },
      { name: "Node.js / Express",       level: 82 },
      { name: "Redux / Reanimated",      level: 80 },
      { name: "Flutter / Django",        level: 70 },
    ]},
    { group: "GAME & XR", items: [
      { name: "Unity 3D",                level: 88 },
      { name: "WebXR / ARCore / ARKit",  level: 84 },
      { name: "Snap Lens Studio",        level: 76 },
      { name: "Unreal Engine 5",         level: 70 },
      { name: "Blender",                 level: 68 },
    ]},
    { group: "BACKEND & WEB3", items: [
      { name: "Socket.IO / WebSockets",  level: 82 },
      { name: "Sequelize / schema design", level: 78 },
      { name: "Firebase / GCP",          level: 76 },
      { name: "Smart contracts / NFTs",  level: 74 },
      { name: "Cloudflare Workers",      level: 72 },
    ]},
  ],

  /* ---------------- PROJECTS ----------------
     `links` keys become the clickable labels. Use "" to hide a link.      */
  projects: [
    {
      id:    "pinch",
      name:  "Pinch — Agentic Robot Teleoperation",
      year:  "Jun 2026",
      blurb: "A robot controlled by bare-hand gestures captured through Snap AR glasses, with a WebXR and Cloudflare Workers pipeline handling real-time control. The robot runs as an autonomous on-chain agent with its own Hedera wallet and ENS identity — when it gets stuck it posts a crypto bounty automatically and settles payment on completion. World ID proof-of-personhood keeps the help marketplace Sybil-resistant.",
      role:  "1st — Best Use of World ID, ETHGlobal NY 2026 · 1st — Monad Blitz NYC",
      tech:  ["WebXR", "Snap AR Glasses", "Hedera", "World ID", "ENS", "Cloudflare Workers"],
      links: { showcase: "https://ethglobal.com/showcase/pinch-fvnm7" },
    },
    {
      id:    "lenz",
      name:  "Lenz.dev — Creator Ownership for AR",
      year:  "Aug 2025",
      blurb: "A creator-ownership platform for AR and spatial content, closing the attribution and monetization gap with an on-chain system for discovery, licensing and revenue tracking. Tokenizes AR filters and spatial mini-games with direct Snap Lens Studio integration, and instruments on-chain engagement for uses, likes, shares and remixes.",
      role:  "2nd — Best dApp on Saga Chainlet, ETHGlobal NYC 2025",
      tech:  ["Next.js", "TypeScript", "Solidity", "Coinbase Base", "Saga"],
      links: { showcase: "https://ethglobal.com/showcase/lenz-dev-r7bbr" },
    },
    {
      id:    "grid",
      name:  "The Grid — 3D Model Search Engine",
      year:  "Oct 2024",
      blurb: "A search engine indexing 10M+ Creative Commons GLB assets, with AR preview and blockchain-backed provenance. NFT minting through Metaplex Core enforces metadata schemas so creator attribution survives transfers and marketplaces.",
      role:  "Led development · 1st — Neon EVM prize, ETHGlobal San Francisco 2024",
      tech:  ["Unity 3D", "C#", "Metaplex Core", "ARCore", "ARKit"],
      links: { showcase: "https://ethglobal.com/showcase/the-grid-kxbwq" },
    },
    {
      id:    "ocd",
      name:  "My OCD — Mixed Reality Experience",
      year:  "2024",
      blurb: "A mixed reality piece for Meta Quest that recreates Rhett & Link's \"My OCD\" music video, blending the original's cinematic storytelling with interactive gameplay so players act out the song's quirks themselves.",
      role:  "Meta Quest Presence Platform Hackathon 2024",
      tech:  ["Unreal Engine", "Meta Presence Platform SDK", "Scene SDK", "Blender"],
      links: { devpost: "https://devpost.com/software/my-ocd-game" },
    },
    {
      id:    "hackar",
      name:  "HackAR — Mixed Reality Metaverse",
      year:  "May 2024 — Jun 2024",
      blurb: "A mixed-reality metaverse on Quest 3 blending spatial computing, gaming and weather visualization. Players explore the Metaplex metaverse, play Crypto Saber and NFT Ninja, fight PvP and socialize, with photorealistic 3D tiles from Google's Geospatial Creator and Lit Protocol handling secure authentication.",
      role:  "Lit Protocol prize, ETHGlobal HackFS 2024",
      tech:  ["Unity 3D", "Meta Quest 3", "Meta XR SDK", "Lit Protocol", "Mona Wallet SDK"],
      links: { showcase: "https://ethglobal.com/showcase/hackar-bdjsv" },
    },
    {
      id:    "teamglobe",
      name:  "Team Globe — Games for the Planet",
      year:  "2024",
      blurb: "A collection of mobile games that turn environmental action into play — cleaning up virtual oceans, planting digital forests — built to make environmental responsibility fun and accessible. Inspired by campaigns like #TeamSeas.",
      role:  "Team build · Flutter Global Gamers Challenge",
      tech:  ["Flutter", "Dart", "Unity 3D"],
      links: { devpost: "https://devpost.com/software/teamglobe" },
    },
    {
      id:    "geoviz",
      name:  "GeoViz — AR Architectural Collaboration",
      year:  "Sep 2023 — Dec 2023",
      blurb: "An AR app letting distributed teams review building designs on site at true scale. Google Geospatial Creator drives real-time visualization and feedback, cutting design iteration time by 20%.",
      role:  "Winner — Google Immersive Geospatial Challenge, AR Best of Productivity & Business",
      tech:  ["Unity 3D", "ARCore", "Google Cloud", "Blender"],
      links: { devpost: "https://devpost.com/software/geoviz" },
    },
    {
      id:    "digiyoga",
      name:  "Digi Yoga — Virtual Physiotherapy",
      year:  "2023",
      blurb: "A hardware-free virtual physiotherapy platform built on Unreal Engine 5.1 with a custom motion-capture plugin, so patients can follow guided sessions using nothing but a camera.",
      role:  "Finalist — EY Techathon 3.0",
      tech:  ["Unreal Engine 5.1", "Motion Capture", "Blender"],
      links: { demo: "https://youtu.be/jTSd9u1C-YQ" },
    },
    {
      /* NOTE: this Play Store URL currently returns 404 — listing appears
         unpublished. Update or drop the link. */
      id:    "squares",
      name:  "Squares — Multiplayer Mobile Game",
      year:  "Mar 2022 — May 2022",
      blurb: "A 2D multiplayer mobile game published on the Google Play Store. Real-time multiplayer paired with a neon visual identity and an original soundtrack lifted user retention by 15%.",
      role:  "Initiated and led a cross-functional team",
      tech:  ["Unity 3D", "C#", "Blender", "After Effects"],
      links: { play: "https://play.google.com/store/apps/details?id=com.levelzero.squares" },
    },
    {
      id:    "skyrunner",
      name:  "Sky Runner",
      year:  "2021 — 2022",
      blurb: "An endless runner styled after Tron — neon grid lines, glowing edges and a dark synthetic world. Built in Unity with original models and environment art made in Blender.",
      role:  "Solo build",
      tech:  ["Unity 3D", "C#", "Blender"],
      links: { demo: "https://youtu.be/KotqxfErzA4" },
    },
  ],

  /* ---------------- HACKATHONS / WINS ----------------
     `link` points at the project that won. The `about` panel counts this
     list, so the number here is what the site reports.                  */
  hackathons: [
    /* Both first places went to the same project (Pinch), so they share a
       single entry — hence 7 entries and "7x" in the role line. */
    { medal: "🥇", name: "ETHGlobal New York · Monad Blitz NYC", year: "2026",
      place: "1st Place — Best Use of World ID · 1st Place — Monad Blitz",
      desc: "Pinch: gesture-controlled robot as an autonomous on-chain agent.",
      link: "https://ethglobal.com/showcase/pinch-fvnm7" },
    { medal: "🥇", name: "ETHGlobal San Francisco", year: "2024",
      place: "1st Place — Neon EVM Partner Prize",
      desc: "The Grid: 10M+ asset 3D search engine with on-chain provenance.",
      link: "https://ethglobal.com/showcase/the-grid-kxbwq" },
    { medal: "🥈", name: "ETHGlobal NYC", year: "2025",
      place: "2nd Place — Best dApp Built on Saga Chainlet",
      desc: "Lenz.dev: creator ownership and licensing for AR content.",
      link: "https://ethglobal.com/showcase/lenz-dev-r7bbr" },
    { medal: "🏆", name: "ETHOnline", year: "2024",
      place: "Sign Protocol — Sign Everything Pool Prize",
      desc: "DocumentLocker: tamper-proof document vault on the EVM.",
      link: "https://ethglobal.com/showcase/documentlocker-9d7wy" },
    { medal: "🏆", name: "ETHGlobal HackFS", year: "2024",
      place: "Lit Protocol Prize",
      desc: "HackAR: mixed-reality metaverse on Quest 3.",
      link: "https://ethglobal.com/showcase/hackar-bdjsv" },
    { medal: "🏆", name: "Google Immersive Geospatial Challenge", year: "2023",
      place: "Winner — AR Best of Productivity & Business",
      desc: "GeoViz: on-site AR review of building designs at true scale.",
      link: "https://devpost.com/software/geoviz" },
    { medal: "🏆", name: "Microsoft PyGames", year: "2023",
      place: "Winner — The Good, Bad or Ugly",
      desc: "Text adventure with branching storylines and ASCII graphics.",
      link: "https://devpost.com/software/the-good-bad-or-ugly" },
  ],

  /* ---------------- EXPERIENCE / TIMELINE ---------------- */
  experience: [
    { when: "OCT 2025 — DEC 2025", what: "Software Engineer Intern", where: "Lumena Energy, Chicago IL",
      desc: "Built concurrent-booking prevention with Sequelize row-level locks, SQL events and triggers for 100% booking integrity under contention. Cut redundant React Native / Redux re-renders by 40%, shipped 60 FPS Reanimated animations, and held 99.5% push-notification uptime on Firebase Cloud Messaging." },
  ],

  /* ---------------- EDUCATION ---------------- */
  education: [
    { when: "AUG 2024 — PRESENT", what: "M.S. Computer Science",
      where: "Illinois Institute of Technology, Chicago IL", desc: "" },
    { when: "JUN 2020 — JUL 2024", what: "B.Tech Computer Science",
      where: "Shri Vaishnav Vidyapeeth Vishwavidyalaya, Indore, India", desc: "GPA 3.2" },
  ],

  certifications: [
    "Google Cloud Program — Data Science & Machine Learning track (30 Days of Google Cloud)",
    "Google Cloud Facilitator",
    "IBM Blockchain Fundamentals",
    "IBM Web Services",
    "IBM Deployment of Private Cloud",
    "IBM Enterprise Design Thinking Practitioner",
  ],

  languages: "English (fluent) · Hindi (fluent) · Gujarati (native)",

  /* ---------------- CONTACT / LINKS ---------------- */
  contact: [
    { label: "EMAIL",    value: "jenil.panchal10@gmail.com",   url: "mailto:jenil.panchal10@gmail.com" },
    { label: "GITHUB",   value: "github.com/JenilPanchal",     url: "https://github.com/JenilPanchal" },
    { label: "LINKEDIN", value: "linkedin.com/in/jenilpanchal", url: "https://linkedin.com/in/jenilpanchal" },
    /* This page is public and gets scraped — drop this line to keep the
       number off the site. */
    { label: "PHONE",    value: "773-410-6375",                url: "tel:+17734106375" },
    /* `download` saves the file rather than navigating to it.
       The PDF sits next to index.html as resume.pdf. */
    { label: "RESUME",   value: "Jenil_Panchal_Resume.pdf",    url: "resume.pdf",
      download: "Jenil_Panchal_Resume.pdf" },
  ],
};
