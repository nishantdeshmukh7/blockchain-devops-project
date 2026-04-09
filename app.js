const http = require('http');
const fs = require('fs');
const path = require('path');

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ChainOps — DevOps × Blockchain</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg:        #040812;
      --surface:   #080f22;
      --border:    rgba(0,255,180,0.15);
      --accent:    #00ffb4;
      --accent2:   #0af;
      --warn:      #ff4d6d;
      --text:      #e8f0ff;
      --muted:     #5a6a8a;
      --font-head: 'Bebas Neue', sans-serif;
      --font-body: 'Syne', sans-serif;
      --font-mono: 'DM Mono', monospace;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      overflow-x: hidden;
      cursor: none;
    }

    /* ── Custom cursor ── */
    #cursor {
      position: fixed; top: 0; left: 0; z-index: 9999;
      width: 14px; height: 14px;
      background: var(--accent);
      border-radius: 50%;
      pointer-events: none;
      mix-blend-mode: difference;
      transition: transform .15s ease, width .2s ease, height .2s ease;
      transform: translate(-50%,-50%);
    }
    #cursor.grow { width: 40px; height: 40px; }

    /* ── Background grid ── */
    body::before {
      content: '';
      position: fixed; inset: 0;
      background-image:
        linear-gradient(rgba(0,255,180,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,180,.04) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      z-index: 0;
    }

    /* ── Noise overlay ── */
    body::after {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
      opacity: .5;
    }

    /* ── NAV ── */
    nav {
      position: fixed; top: 0; width: 100%; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 60px;
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(20px);
      background: rgba(4,8,18,.6);
    }
    .logo {
      font-family: var(--font-head);
      font-size: 1.8rem;
      letter-spacing: 2px;
      color: var(--accent);
    }
    .logo span { color: var(--accent2); }
    .nav-links { display: flex; gap: 36px; list-style: none; }
    .nav-links a {
      font-size: .8rem; font-weight: 600; letter-spacing: 2px;
      text-transform: uppercase; text-decoration: none;
      color: var(--muted);
      transition: color .2s;
      position: relative;
    }
    .nav-links a::after {
      content: ''; position: absolute; bottom: -4px; left: 0;
      width: 0; height: 1px; background: var(--accent);
      transition: width .3s;
    }
    .nav-links a:hover { color: var(--accent); }
    .nav-links a:hover::after { width: 100%; }
    .nav-cta {
      padding: 10px 24px;
      border: 1px solid var(--accent);
      color: var(--accent) !important;
      font-size: .75rem !important;
    }
    .nav-cta:hover { background: var(--accent); color: var(--bg) !important; }

    /* ── HERO ── */
    #hero {
      position: relative; z-index: 1;
      min-height: 100vh;
      display: flex; flex-direction: column;
      align-items: flex-start; justify-content: center;
      padding: 120px 60px 60px;
      overflow: hidden;
    }
    .hero-bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      animation: orb-drift 12s ease-in-out infinite alternate;
    }
    .orb1 { width: 600px; height: 600px; background: rgba(0,255,180,.07); top: -100px; right: -100px; }
    .orb2 { width: 400px; height: 400px; background: rgba(0,170,255,.07); bottom: 0; left: 10%; animation-delay: -4s; }
    @keyframes orb-drift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(40px, 30px) scale(1.05); }
    }

    .hero-tag {
      font-family: var(--font-mono);
      font-size: .75rem;
      color: var(--accent);
      letter-spacing: 3px;
      text-transform: uppercase;
      border: 1px solid var(--border);
      padding: 6px 14px;
      margin-bottom: 28px;
      display: inline-flex; align-items: center; gap: 8px;
      animation: fade-up .6s .1s both;
    }
    .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--accent);
      animation: blink 1.4s infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

    h1 {
      font-family: var(--font-head);
      font-size: clamp(4rem, 9vw, 10rem);
      line-height: .95;
      letter-spacing: 3px;
      text-transform: uppercase;
      animation: fade-up .6s .2s both;
    }
    h1 .line2 { color: var(--accent); }
    h1 .line3 { -webkit-text-stroke: 1px rgba(0,255,180,.4); color: transparent; }

    .hero-sub {
      max-width: 560px;
      margin-top: 32px;
      font-size: 1.05rem;
      color: var(--muted);
      line-height: 1.7;
      animation: fade-up .6s .35s both;
    }

    .hero-actions {
      display: flex; gap: 16px; margin-top: 44px;
      animation: fade-up .6s .5s both;
    }
    .btn-primary {
      padding: 14px 36px;
      background: var(--accent);
      color: var(--bg);
      font-family: var(--font-body);
      font-weight: 700; font-size: .85rem;
      letter-spacing: 1px; text-transform: uppercase;
      border: none; cursor: none;
      position: relative; overflow: hidden;
      transition: transform .2s;
    }
    .btn-primary::before {
      content: ''; position: absolute; inset: 0;
      background: var(--accent2);
      transform: translateX(-110%);
      transition: transform .35s ease;
    }
    .btn-primary:hover { transform: translateY(-2px); }
    .btn-primary:hover::before { transform: translateX(0); }
    .btn-primary span { position: relative; z-index: 1; }

    .btn-ghost {
      padding: 14px 36px;
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--font-body);
      font-weight: 600; font-size: .85rem;
      letter-spacing: 1px; text-transform: uppercase;
      background: transparent; cursor: none;
      transition: border-color .2s, color .2s;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

    /* ── TICKER ── */
    .ticker-wrap {
      position: relative; z-index: 1;
      overflow: hidden;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      background: rgba(0,255,180,.03);
      padding: 14px 0;
    }
    .ticker-inner {
      display: flex; gap: 0;
      animation: ticker 28s linear infinite;
      width: max-content;
    }
    .ticker-item {
      white-space: nowrap;
      font-family: var(--font-mono);
      font-size: .75rem;
      color: var(--muted);
      padding: 0 40px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .ticker-item .hi { color: var(--accent); }
    @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

    /* ── STATS ── */
    #stats {
      position: relative; z-index: 1;
      display: grid; grid-template-columns: repeat(4,1fr);
      border-bottom: 1px solid var(--border);
    }
    .stat-card {
      padding: 60px 40px;
      border-right: 1px solid var(--border);
      opacity: 0;
      transform: translateY(30px);
      transition: opacity .6s ease, transform .6s ease;
    }
    .stat-card.visible { opacity: 1; transform: translateY(0); }
    .stat-card:last-child { border-right: none; }
    .stat-num {
      font-family: var(--font-head);
      font-size: 4rem;
      color: var(--accent);
      line-height: 1;
    }
    .stat-label {
      font-size: .8rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--muted);
      margin-top: 10px;
    }

    /* ── SECTION COMMON ── */
    section { position: relative; z-index: 1; }
    .section-inner { padding: 100px 60px; }
    .section-tag {
      font-family: var(--font-mono);
      font-size: .7rem;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 12px;
    }
    .section-title {
      font-family: var(--font-head);
      font-size: clamp(2.5rem, 5vw, 5rem);
      letter-spacing: 2px;
      text-transform: uppercase;
      line-height: 1;
      margin-bottom: 16px;
    }
    .section-desc {
      color: var(--muted);
      max-width: 560px;
      line-height: 1.7;
      font-size: .95rem;
      margin-bottom: 60px;
    }

    /* ── SERVICES ── */
    #services { border-top: 1px solid var(--border); }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
      margin-top: 60px;
    }
    .service-card {
      background: var(--bg);
      padding: 48px 40px;
      position: relative;
      overflow: hidden;
      transition: background .3s;
    }
    .service-card::before {
      content: '';
      position: absolute; top: 0; left: 0;
      width: 100%; height: 2px;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      transform: scaleX(0);
      transition: transform .4s ease;
      transform-origin: left;
    }
    .service-card:hover { background: var(--surface); }
    .service-card:hover::before { transform: scaleX(1); }

    .service-icon {
      font-size: 2rem; margin-bottom: 24px;
      display: block;
    }
    .service-card h3 {
      font-family: var(--font-head);
      font-size: 1.8rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .service-card p {
      font-size: .88rem;
      color: var(--muted);
      line-height: 1.7;
    }
    .service-num {
      position: absolute; bottom: 28px; right: 28px;
      font-family: var(--font-mono);
      font-size: .7rem;
      color: var(--border);
    }

    /* ── PIPELINE SECTION ── */
    #pipeline {
      background: var(--surface);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .pipeline-steps {
      display: grid;
      grid-template-columns: repeat(5,1fr);
      gap: 0;
      margin-top: 60px;
      position: relative;
    }
    .pipeline-steps::before {
      content: '';
      position: absolute;
      top: 32px; left: 10%; right: 10%;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
    }
    .pipe-step {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 0 20px;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity .5s ease, transform .5s ease;
    }
    .pipe-step.visible { opacity: 1; transform: translateY(0); }
    .pipe-dot {
      width: 64px; height: 64px;
      border: 1px solid var(--border);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      background: var(--bg);
      position: relative; z-index: 1;
      transition: border-color .3s, background .3s;
      margin-bottom: 20px;
    }
    .pipe-step:hover .pipe-dot {
      border-color: var(--accent);
      background: rgba(0,255,180,.08);
    }
    .pipe-step h4 {
      font-family: var(--font-head);
      font-size: 1.1rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .pipe-step p { font-size: .78rem; color: var(--muted); line-height: 1.6; }

    /* ── TECH STACK ── */
    .tech-grid {
      display: flex; flex-wrap: wrap; gap: 12px; margin-top: 40px;
    }
    .tech-tag {
      padding: 10px 20px;
      border: 1px solid var(--border);
      font-family: var(--font-mono);
      font-size: .75rem;
      letter-spacing: 1px;
      color: var(--muted);
      transition: border-color .2s, color .2s, background .2s;
    }
    .tech-tag:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,255,180,.05); }

    /* ── TERMINAL ── */
    .terminal {
      background: #010409;
      border: 1px solid var(--border);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 50px;
      max-width: 700px;
    }
    .term-bar {
      padding: 12px 20px;
      background: rgba(0,255,180,.04);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 8px;
    }
    .term-dot { width: 10px; height: 10px; border-radius: 50%; }
    .term-title {
      margin-left: 12px;
      font-family: var(--font-mono);
      font-size: .72rem;
      color: var(--muted);
    }
    .term-body { padding: 24px 20px; font-family: var(--font-mono); font-size: .8rem; line-height: 2; }
    .term-line { opacity: 0; animation: appear .1s forwards; }
    .term-prompt { color: var(--accent); }
    .term-cmd { color: var(--text); }
    .term-out { color: var(--muted); padding-left: 20px; }
    .term-success { color: #4ade80; padding-left: 20px; }

    /* ── FOOTER ── */
    footer {
      position: relative; z-index: 1;
      border-top: 1px solid var(--border);
      padding: 60px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .footer-copy {
      font-family: var(--font-mono);
      font-size: .72rem;
      color: var(--muted);
      letter-spacing: 1px;
    }
    .footer-links { display: flex; gap: 28px; }
    .footer-links a {
      font-size: .75rem; letter-spacing: 1px; text-transform: uppercase;
      color: var(--muted); text-decoration: none;
      transition: color .2s;
    }
    .footer-links a:hover { color: var(--accent); }

    /* ── Animations ── */
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes appear { to { opacity: 1; } }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); }

    @media (max-width: 900px) {
      nav { padding: 16px 24px; }
      .nav-links { display: none; }
      #hero { padding: 100px 24px 48px; }
      #stats { grid-template-columns: repeat(2,1fr); }
      .services-grid { grid-template-columns: 1fr; }
      .pipeline-steps { grid-template-columns: 1fr; }
      .pipeline-steps::before { display: none; }
      .section-inner { padding: 60px 24px; }
      footer { flex-direction: column; gap: 20px; text-align: center; }
    }
  </style>
</head>
<body>

<div id="cursor"></div>

<!-- NAV -->
<nav>
  <div class="logo">Chain<span>Ops</span></div>
  <ul class="nav-links">
    <li><a href="#services">Services</a></li>
    <li><a href="#pipeline">Pipeline</a></li>
    <li><a href="#stack">Stack</a></li>
    <li><a href="#contact" class="nav-cta">Get Started</a></li>
  </ul>
</nav>

<!-- HERO -->
<section id="hero">
  <div class="hero-bg-orb orb1"></div>
  <div class="hero-bg-orb orb2"></div>
  <div class="hero-tag"><span class="dot"></span> DevOps × Blockchain Infrastructure</div>
  <h1>
    Build.<br>
    <span class="line2">Deploy.</span><br>
    <span class="line3">Decentralize.</span>
  </h1>
  <p class="hero-sub">
    Enterprise-grade CI/CD pipelines fused with blockchain-native deployment protocols. Ship faster. Trust everything. Break nothing.
  </p>
  <div class="hero-actions">
    <button class="btn-primary"><span>Launch Pipeline →</span></button>
    <button class="btn-ghost">View Docs</button>
  </div>
</section>

<!-- TICKER -->
<div class="ticker-wrap">
  <div class="ticker-inner" id="ticker"></div>
</div>

<!-- STATS -->
<section id="stats">
  <div class="stat-card"><div class="stat-num" data-count="99.98">0</div><div class="stat-label">Uptime SLA %</div></div>
  <div class="stat-card"><div class="stat-num" data-count="420">0</div><div class="stat-label">Chains Deployed</div></div>
  <div class="stat-card"><div class="stat-num" data-count="12">0</div><div class="stat-label">Avg Deploy (sec)</div></div>
  <div class="stat-card"><div class="stat-num" data-count="5200">0</div><div class="stat-label">Smart Contracts CI</div></div>
</section>

<!-- SERVICES -->
<section id="services">
  <div class="section-inner">
    <div class="section-tag">// What We Do</div>
    <div class="section-title">Core<br>Services</div>
    <p class="section-desc">From chain-agnostic CI/CD to on-chain deployment audit trails — we own the entire delivery loop.</p>
    <div class="services-grid">
      <div class="service-card">
        <span class="service-icon">⛓</span>
        <h3>Chain-Native CI/CD</h3>
        <p>Fully automated pipelines that test, sign, and deploy smart contracts across EVM, Solana, and Cosmos ecosystems.</p>
        <div class="service-num">01</div>
      </div>
      <div class="service-card">
        <span class="service-icon">🔐</span>
        <h3>Zero-Trust Security</h3>
        <p>Every artifact cryptographically signed. Immutable audit logs on-chain. Secrets managed via distributed HSMs.</p>
        <div class="service-num">02</div>
      </div>
      <div class="service-card">
        <span class="service-icon">📡</span>
        <h3>Observability Stack</h3>
        <p>Real-time metrics for node health, gas analytics, mempool congestion, and validator performance in one pane.</p>
        <div class="service-num">03</div>
      </div>
      <div class="service-card">
        <span class="service-icon">🌐</span>
        <h3>Multi-Cloud Nodes</h3>
        <p>Geo-distributed validator and RPC nodes across AWS, GCP, and bare metal — auto-failover in under 2 seconds.</p>
        <div class="service-num">04</div>
      </div>
      <div class="service-card">
        <span class="service-icon">🤖</span>
        <h3>AI-Assisted Reviews</h3>
        <p>Automated audit runs on every pull request. Vulnerability scoring. Gas optimization suggestions before merge.</p>
        <div class="service-num">05</div>
      </div>
      <div class="service-card">
        <span class="service-icon">⚡</span>
        <h3>Instant Rollbacks</h3>
        <p>One-click revert to any previous deployment state. On-chain upgrade proxy management with governance hooks.</p>
        <div class="service-num">06</div>
      </div>
    </div>
  </div>
</section>

<!-- PIPELINE -->
<section id="pipeline">
  <div class="section-inner">
    <div class="section-tag">// How It Works</div>
    <div class="section-title">The Pipeline</div>
    <p class="section-desc">Five deterministic stages from commit to decentralized production — every step verifiable on-chain.</p>
    <div class="pipeline-steps">
      <div class="pipe-step">
        <div class="pipe-dot">📝</div>
        <h4>Commit</h4>
        <p>Code pushed, hash anchored on-chain instantly</p>
      </div>
      <div class="pipe-step" style="transition-delay:.1s">
        <div class="pipe-dot">🧪</div>
        <h4>Test</h4>
        <p>Unit, integration & fuzz tests in parallel</p>
      </div>
      <div class="pipe-step" style="transition-delay:.2s">
        <div class="pipe-dot">🔍</div>
        <h4>Audit</h4>
        <p>AI static analysis + formal verification</p>
      </div>
      <div class="pipe-step" style="transition-delay:.3s">
        <div class="pipe-dot">🚀</div>
        <h4>Deploy</h4>
        <p>Multi-sig approval then atomic deployment</p>
      </div>
      <div class="pipe-step" style="transition-delay:.4s">
        <div class="pipe-dot">📊</div>
        <h4>Monitor</h4>
        <p>Live telemetry with auto-rollback triggers</p>
      </div>
    </div>
  </div>
</section>

<!-- STACK -->
<section id="stack">
  <div class="section-inner">
    <div class="section-tag">// Technology</div>
    <div class="section-title">Our Stack</div>
    <p class="section-desc">Best-in-class tools, assembled and battle-tested across hundreds of production deployments.</p>
    <div class="tech-grid" id="tech-grid"></div>
    <!-- Terminal -->
    <div class="terminal">
      <div class="term-bar">
        <div class="term-dot" style="background:#ff5f57"></div>
        <div class="term-dot" style="background:#febc2e"></div>
        <div class="term-dot" style="background:#28c840"></div>
        <span class="term-title">chainops-cli — deploy.sh</span>
      </div>
      <div class="term-body" id="term-body"></div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer id="contact">
  <div class="footer-copy">© 2025 ChainOps Inc. — All systems operational.</div>
  <div class="footer-links">
    <a href="#">GitHub</a>
    <a href="#">Discord</a>
    <a href="#">Status</a>
    <a href="#">Docs</a>
  </div>
</footer>

<script>
  // Cursor
  const cursor = document.getElementById('cursor');
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('button, a, .service-card, .tech-tag').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });

  // Ticker
  const items = [
    'ETH Mainnet: <span class="hi">↑ 0.23%</span>',
    'BTC: <span class="hi">$68,420</span>',
    'Gas: <span class="hi">12 gwei</span>',
    'Contracts deployed today: <span class="hi">3,847</span>',
    'Active nodes: <span class="hi">1,204</span>',
    'Last deploy: <span class="hi">4s ago</span>',
    'SOL: <span class="hi">↑ 1.4%</span>',
    'Pipeline success rate: <span class="hi">99.98%</span>',
    'Avg block time: <span class="hi">12.1s</span>',
  ];
  const ticker = document.getElementById('ticker');
  [...items, ...items].forEach(t => {
    const el = document.createElement('div');
    el.className = 'ticker-item';
    el.innerHTML = t + ' &nbsp;·&nbsp; ';
    ticker.appendChild(el);
  });

  // Tech tags
  const techs = [
    'Kubernetes','Helm','ArgoCD','Terraform','Hardhat','Foundry',
    'Solidity','Go','Rust','Node.js','Docker','Prometheus',
    'Grafana','GitHub Actions','HashiCorp Vault','Chainlink',
    'The Graph','IPFS','Polygon','Arbitrum','AWS','GCP'
  ];
  const tg = document.getElementById('tech-grid');
  techs.forEach(t => {
    const el = document.createElement('div');
    el.className = 'tech-tag';
    el.textContent = t;
    tg.appendChild(el);
  });

  // Scroll reveal
  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.stat-card, .pipe-step').forEach(el => observer.observe(el));

  // Count-up
  function countUp(el, target, decimals = 0, duration = 1800) {
    const start = performance.now();
    const update = now => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * ease).toFixed(decimals);
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat-num').forEach(n => {
          const val = parseFloat(n.dataset.count);
          const dec = val % 1 !== 0 ? 2 : 0;
          countUp(n, val, dec);
        });
        statsObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  statsObs.observe(document.getElementById('stats'));

  // Terminal typewriter
  const lines = [
    { type: 'prompt', text: '$ chainops deploy --network mainnet --contract ./src/Vault.sol' },
    { type: 'out',    text: '→ Compiling contracts...' },
    { type: 'out',    text: '→ Running 248 tests... ████████████ 100%' },
    { type: 'out',    text: '→ Auditing with AI scanner...' },
    { type: 'out',    text: '→ Requesting multi-sig approval (2/3)...' },
    { type: 'out',    text: '→ Deploying to Ethereum Mainnet...' },
    { type: 'success',text: '✓ Deployed: 0x3f4a...c21b  |  Gas: 1,204,832  |  Block: 21,084,610' },
    { type: 'success',text: '✓ Anchored deployment hash on-chain. Pipeline complete in 9.2s 🚀' },
  ];
  const tb = document.getElementById('term-body');
  const termObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      lines.forEach((l, i) => {
        setTimeout(() => {
          const d = document.createElement('div');
          d.className = 'term-line ' + (l.type === 'prompt' ? 'term-prompt' : l.type === 'success' ? 'term-success' : 'term-out');
          d.style.animationDelay = '0s';
          d.textContent = l.text;
          tb.appendChild(d);
        }, i * 320);
      });
      termObs.disconnect();
    }
  }, { threshold: 0.3 });
  termObs.observe(tb);
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML);
});

server.listen(3000, () => {
  console.log('🚀 ChainOps server running → http://localhost:3000');
});