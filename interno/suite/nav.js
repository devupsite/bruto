// ============================================================
// UP Co. Suite — Navegação Compartilhada
// ============================================================
// Injeta a sidebar em qualquer página da suíte.
// Detecta o módulo atual pelo nome do arquivo (window.location).
// Requer config.js carregado antes.
// ============================================================

(function initNav() {

  // ── Módulos da suíte ──────────────────────────────────────
  const MODULES = [
    {
      id:    'up-dash',
      label: 'UP·Dash',
      file:  'up-dash.html',
      desc:  'Visão executiva',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
    },
    {
      id:    'up-lead',
      label: 'UP·Lead',
      file:  'up-lead.html',
      desc:  'Funil de especificação',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    },
    {
      id:    'up-vault',
      label: 'UP·Vault',
      file:  'up-vault.html',
      desc:  'Financeiro',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><circle cx="12" cy="14" r="2"/></svg>`
    },
    {
      id:    'up-flow',
      label: 'UP·Flow',
      file:  'up-flow.html',
      desc:  'Pedidos & entrega',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
    },
    {
      id:    'up-team',
      label: 'UP·Team',
      file:  'up-team.html',
      desc:  'Equipe',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    },
    {
      id:    'up-base',
      label: 'UP·Base',
      file:  'up-base.html',
      desc:  'SOPs & políticas',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    },
    {
      id:    'up-core',
      label: 'UP·Core',
      file:  'up-core.html',
      desc:  'Processos formais',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/></svg>`
    },
    {
      id:    'up-mind',
      label: 'UP·Mind',
      file:  'up-mind.html',
      desc:  'Padrões acumulados',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    },
    {
      id:    'up-gos',
      label: 'UP·GOS',
      file:  'up-gos.html',
      desc:  'Saúde da operação',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3"/></svg>`
    },
    {
      id:    'up-voice',
      label: 'UP·Voice',
      file:  'up-voice.html',
      desc:  'Alertas WhatsApp',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
    },
  ];

  // ── Detectar módulo atual ─────────────────────────────────
  const currentFile = window.location.pathname.split('/').pop() || 'up-dash.html';
  const currentModule = MODULES.find(m => m.file === currentFile);

  // ── Injetar CSS global da suíte ──────────────────────────
  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@300;400;500&display=swap');

    :root { --bg: #0F0F0F; --bg2: #1A1A1A; --bg3: #242424; --text: #F2F2F2; --muted: #888888; --dim: #606060; --teal: #57999B; --border: #2E2E2E; --green: #27AE60; --amber: #F5A623; --red: #E74C3C; --teal-12: rgba(87,153,155,.10); --teal-22: rgba(87,153,155,.20); --green-12: #27AE601f; --red-12: #E74C3C1f; --amber-12: #F5A6231f; }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Barlow', system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      height: 100%;
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    * { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }

    #suite-refresh-btn {
      position: fixed; bottom: 20px; right: 20px; z-index: 9000;
      width: 30px; height: 30px; border-radius: 7px;
      background: var(--bg2); border: 1px solid var(--border); color: var(--muted);
      display: flex; align-items: center; justify-content: center;
      transition: all .15s;
      box-shadow: 0 2px 8px rgba(0,0,0,.4);
    }
    #suite-refresh-btn:hover { color: var(--teal); border-color: var(--teal); background: var(--teal-12); }
    .write-blocked { opacity: .4 !important; cursor: not-allowed !important; pointer-events: none !important; }
    #suite-refresh-btn:active svg { animation: suite-spin .5s linear; }
    @keyframes suite-spin { to { transform: rotate(360deg); } }

    a { color: inherit; text-decoration: none; }
    button { cursor: pointer; font-family: inherit; font-size: inherit; }
    input, textarea, select {
      font-family: inherit;
      font-size: inherit;
      color: inherit;
      background: transparent;
      border: none;
      outline: none;
    }

    /* Layout base da suíte */
    .suite-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar */
    .suite-sidebar {
      width: 220px;
      min-width: 220px;
      background: var(--bg2);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 9px;
    }
    .sidebar-brand svg { color: var(--text); flex-shrink: 0; }
    .sidebar-wordmark {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 600;
      font-size: 18px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--text);
      line-height: 1;
    }
    .sidebar-tagline {
      font-family: 'Barlow', sans-serif;
      font-weight: 400;
      font-size: 11px;
      letter-spacing: 0.01em;
      color: var(--dim);
      margin-top: 7px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 8px 0;
      overflow-y: auto;
    }

    .nav-section-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--dim);
      padding: 12px 20px 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 20px;
      color: var(--muted);
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
      position: relative;
      text-decoration: none;
    }
    .nav-item:hover {
      color: var(--text);
      background: rgba(255,255,255,0.03);
    }
    .nav-item.active {
      color: var(--text);
      background: var(--teal-12);
    }
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 2px;
      background: var(--teal);
      border-radius: 0 2px 2px 0;
    }
    .nav-item svg { flex-shrink: 0; opacity: 0.7; }
    .nav-item.active svg { opacity: 1; color: var(--teal); }

    .nav-item-text { flex: 1; }
    .nav-item-label {
      font-size: 13px;
      font-weight: 500;
      font-family: 'Barlow Condensed', sans-serif;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .nav-item-desc {
      font-size: 11px;
      color: var(--dim);
      line-height: 1.2;
    }
    .nav-item.active .nav-item-desc { color: var(--muted); }

    .sidebar-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--border);
    }
    .sidebar-user {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-bottom: 10px;
      margin-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }
    .sidebar-user-info { display: flex; flex-direction: column; min-width: 0; }
    .sidebar-user-nome {
      font-size: 12px; color: var(--text); font-weight: 500;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sidebar-user-papel {
      font-size: 10px; color: var(--dim); letter-spacing: .04em; text-transform: uppercase;
    }
    .sidebar-sair {
      background: none; border: 1px solid var(--border); border-radius: 4px;
      color: var(--muted); font-family: 'Barlow', sans-serif; font-size: 11px;
      padding: 3px 9px; cursor: pointer; flex-shrink: 0;
    }
    .sidebar-sair:hover { color: var(--text); border-color: var(--teal); }
    .sidebar-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .sidebar-poweredby {
      font-family: 'Barlow', sans-serif;
      font-size: 10px;
      letter-spacing: 0.03em;
      color: var(--dim);
      white-space: nowrap;
    }
    .sidebar-poweredby .upco-sig {
      color: var(--muted);
      font-weight: 500;
    }
    .sidebar-demo-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--amber);
      background: var(--amber-12);
      padding: 3px 7px;
      border-radius: 3px;
    }

    /* Área principal */
    .suite-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg);
    }

    /* Header do módulo */
    .module-header {
      padding: 20px 28px 0;
      flex-shrink: 0;
    }
    .module-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700;
      font-size: 22px;
      letter-spacing: -0.04em;
      color: var(--text);
      line-height: 1;
    }
    .module-title .dash { color: var(--teal); }
    .module-subtitle {
      font-size: 12px;
      color: var(--muted);
      margin-top: 4px;
    }

    /* Utilitários */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-8 { gap: 8px; }
    .gap-12 { gap: 12px; }
    .gap-16 { gap: 16px; }
    .flex-1 { flex: 1; }
    .overflow-hidden { overflow: hidden; }
    .overflow-auto { overflow: auto; }

    /* Badges de temperatura */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.04em;
      padding: 2px 7px;
      border-radius: 3px;
    }
    .badge-quente  { color: var(--red);   background: var(--red-12); }
    .badge-morno   { color: var(--amber); background: var(--amber-12); }
    .badge-frio    { color: var(--muted); background: rgba(255,255,255,0.05); }
    .badge-green   { color: var(--green); background: var(--green-12); }
    .badge-teal    { color: var(--teal);  background: var(--teal-12); }

    /* Botões */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s;
      border: none;
    }
    .btn-primary {
      background: var(--teal);
      color: #fff;
    }
    .btn-primary:hover { opacity: 0.88; }
    .btn-ghost {
      background: transparent;
      color: var(--muted);
      border: 1px solid var(--border);
    }
    .btn-ghost:hover { color: var(--text); border-color: var(--muted); }
    .btn-sm { padding: 5px 10px; font-size: 12px; }

    /* Inputs */
    .input {
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 7px 12px;
      color: var(--text);
      font-size: 13px;
      transition: border-color 0.15s;
      width: 100%;
    }
    .input:focus { border-color: var(--teal); }
    .input::placeholder { color: var(--dim); }

    /* Cards */
    .card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    /* Divider */
    .divider { border: none; border-top: 1px solid var(--border); }

    /* Toast container */
    #toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9999;
    }
    .toast {
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      min-width: 220px;
      animation: slideIn 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toast-info    { background: var(--teal-22); color: var(--teal); border: 1px solid var(--teal); }
    .toast-success { background: var(--green-12); color: var(--green); border: 1px solid var(--green); }
    .toast-error   { background: var(--red-12); color: var(--red); border: 1px solid var(--red); }
    .toast-warn    { background: var(--amber-12); color: var(--amber); border: 1px solid var(--amber); }

    @keyframes slideIn {
      from { transform: translateX(20px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .spin { animation: spin 1s linear infinite; }
  `;

  // Injetar estilos globais
  if (!document.getElementById('suite-global-css')) {
    const style = document.createElement('style');
    style.id = 'suite-global-css';
    style.textContent = globalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  // ── Montar HTML da sidebar ────────────────────────────────
  // Módulos visíveis pra quem tem papel "atendente" — só o próprio
  // funil (com dados já filtrados no backend) e a base de conhecimento.
  // Pedido do Rafael, 08/08/2026.
  const MODULOS_ATENDENTE = ['up-lead', 'up-base'];

  function buildNavHTML() {
    const papel = window.UP_AUTH?.user?.papel;
    const restrito = papel === 'atendente';

    return `
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <svg width="15" height="24" viewBox="0 0 56 90" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="34" height="41" stroke="currentColor" stroke-width="8" fill="none"/>
          <rect x="4" y="45" width="48" height="41" stroke="currentColor" stroke-width="8" fill="none"/>
        </svg>
        <div class="sidebar-wordmark">${CLIENT_CONFIG.empresa}</div>
      </div>
      <div class="sidebar-tagline">Suíte de operação</div>
    </div>
    <nav class="sidebar-nav">
      ${(() => {
        const grupos = [
          { label:'Operação', ids: (window.SUITE_LAYOUT||{}).nucleo || MODULES.map(m=>m.id) },
          { label:'Apoio',    ids: (window.SUITE_LAYOUT||{}).apoio  || [] },
        ];
        return grupos.filter(g => g.ids.length).map(g => `
          <div class="nav-section-label">${g.label}</div>
          ${g.ids.map(id => MODULES.find(m => m.id === id)).filter(Boolean)
            .filter(m => !restrito || MODULOS_ATENDENTE.includes(m.id)).map(m => `
            <a href="${m.file}" class="nav-item ${m.id === (currentModule?.id) ? 'active' : ''}">
              ${m.icon}
              <div class="nav-item-text">
                <div class="nav-item-label">${m.label}</div>
                <div class="nav-item-desc">${m.desc}</div>
              </div>
            </a>
          `).join('')}
        `).join('');
      })()}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user" id="sidebar-user" hidden>
        <div class="sidebar-user-info">
          <span class="sidebar-user-nome" id="sidebar-user-nome"></span>
          <span class="sidebar-user-papel" id="sidebar-user-papel"></span>
        </div>
        <button class="sidebar-sair" onclick="window.upLogout && window.upLogout()" title="Sair">Sair</button>
      </div>
      <div class="sidebar-footer-row">
        <div class="sidebar-poweredby">by <span class="upco-sig"><span style="color:var(--text);font-weight:700;">UP</span> <span style="color:var(--teal);">—</span> Co.</span></div>
        ${DEMO_MODE ? `<span class="sidebar-demo-badge">⚡ Demo</span>` : ''}
      </div>
    </div>
  `;
  }

  // ── Injetar sidebar no DOM ────────────────────────────────
  function pintaUsuario(u) {
    if (!u) return;
    const box = document.getElementById('sidebar-user');
    if (!box) return;
    document.getElementById('sidebar-user-nome').textContent  = u.nome || u.usuario || '';
    document.getElementById('sidebar-user-papel').textContent = u.papel || '';
    box.hidden = false;
  }

  // ── Bloqueio de escrita pro papel 'sócio' ──────────────────
  // Sócio tem leitura em tudo, escrita sempre bloqueada (mesma regra já
  // aplicada no backend em suite-auth.php). Aqui é só UX: evita que a
  // pessoa clique num botão que o servidor vai recusar com 403 de
  // qualquer forma. Cobre elementos ESTÁTICOS marcados com
  // data-write-action; elementos gerados dinamicamente (ex: pipeline
  // do UP·Lead) tratam o próprio caso na função que os desenha.
  window.isSocio = function () { return window.UP_AUTH?.user?.papel === 'socio'; };

  window.aplicarBloqueioEscritaSocio = function () {
    if (!window.isSocio()) return;
    document.querySelectorAll('[data-write-action]').forEach(el => {
      el.classList.add('write-blocked');
      el.title = 'Sócio tem acesso somente leitura';
      if ('disabled' in el) el.disabled = true;
    });
  };

  function mountNav() {
    const sidebar = document.getElementById('suite-sidebar');
    if (sidebar) {
      sidebar.innerHTML = buildNavHTML();
      // A sidebar pode montar antes ou depois do auth-guard resolver —
      // por isso trata os dois casos em vez de assumir uma ordem. Se o
      // papel só chegar depois, o menu é reconstruído ANTES de pintar
      // o usuário (senão a reconstrução apagaria a pintura).
      if (window.UP_AUTH?.pronto) { sidebar.innerHTML = buildNavHTML(); pintaUsuario(window.UP_AUTH.user); window.aplicarBloqueioEscritaSocio(); }
      else document.addEventListener('up-auth-ready', (e) => {
        sidebar.innerHTML = buildNavHTML();
        pintaUsuario(e.detail);
        window.aplicarBloqueioEscritaSocio();
      }, { once: true });
    }
    mountBotaoAtualizar();
  }

  // ── Botão "Atualizar suíte" — fixo, sempre visível, em qualquer
  // módulo (pedido do Rafael, 08/08/2026). Recarrega a página atual,
  // que já busca tudo de novo nos endpoints reais — não existe estado
  // compartilhado entre módulos pra "atualizar" além disso.
  function mountBotaoAtualizar() {
    if (document.getElementById('suite-refresh-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'suite-refresh-btn';
    btn.title = 'Atualizar suíte';
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M21 3v6h-6"/></svg>`;
    btn.onclick = () => window.location.reload();
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountNav);
  } else {
    mountNav();
  }

  // ── Toast system (global) ─────────────────────────────────
  window.toast = function(msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, 3200);
  };

  // ── DATA_LAYER factory ────────────────────────────────────
  // Cada módulo instancia o seu próprio DATA_LAYER.
  // Este helper centraliza a lógica de modo.
  window.createDataLayer = function(mockImpl, supabaseImpl) {
    return DEMO_MODE ? mockImpl : supabaseImpl;
  };

  // ── Algoritmo do Health Score (UP·GOS) ─────────────────────
  // Extraído aqui pra ser a MESMA implementação usada pelo UP·GOS
  // (que exibe o detalhe por dimensão) e pelo UP·Dash (que só
  // precisa do número final pro círculo do topo). Uma cópia só —
  // se o algoritmo mudar, muda num lugar, os dois módulos seguem
  // batendo o mesmo número.
  //
  // Pesos: Financeiro 25% + Comercial 25% + Operacional 20% + Equipe 20% + Processos 10%
  // Não é IA — regras determinísticas, documentadas linha a linha.
  window.calcularGOS = function (fonte) {
    function calcFinanceiro(tx) {
      if (!tx || tx.length === 0) return 50;
      const totalR = tx.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
      const totalD = tx.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
      const saldo = totalR - totalD;
      const meta = window.CLIENT_CONFIG?.meta_mrr || 50000;
      const metaPct = meta > 0 ? Math.min(100, (totalR / meta) * 100) : 50;
      const ptsMeta = (metaPct / 100) * 40;
      const margem = totalR > 0 ? ((totalR - totalD) / totalR) * 100 : 0;
      const ptsMargem = Math.max(0, Math.min(40, (margem / 80) * 40));
      const ptsSaldo = saldo > 0 ? 20 : saldo > -5000 ? 10 : 0;
      return Math.round(ptsMeta + ptsMargem + ptsSaldo);
    }
    function calcComercial(leads, pipeline) {
      if (!leads || leads.length === 0) return 40;
      const quentes = leads.filter(l => l.temperatura === 'quente').length;
      const ptsQuentes = Math.min(30, (quentes / Math.max(1, leads.length)) * 100);
      const qualificados = leads.filter(l => l.status !== 'open').length;
      const convTaxa = qualificados > 0 ? (qualificados / leads.length) * 100 : 0;
      const ptsConv = Math.min(30, convTaxa);
      let pipelineValue = 0;
      if (pipeline && pipeline.stages) pipeline.stages.forEach(s => { if (s.deals) s.deals.forEach(d => { pipelineValue += d.valor || 0; }); });
      const meta = window.CLIENT_CONFIG?.meta_mrr || 50000;
      const ptsPipeline = Math.min(40, (pipelineValue / meta) * 40);
      return Math.round(ptsQuentes + ptsConv + ptsPipeline);
    }
    function calcOperacional(projects) {
      if (!projects || projects.length === 0) return 70;
      const nosPrazo = projects.filter(p => p.status !== 'atrasado').length;
      const ptsNoPrazo = Math.min(50, (nosPrazo / projects.length) * 100);
      let completionTotal = 0;
      projects.forEach(p => { if (p.etapas && p.etapas.length > 0) completionTotal += (p.etapas.filter(e => e.status === 'concluido').length / p.etapas.length) * 100; });
      const ptsCompletion = ((projects.length > 0 ? completionTotal / projects.length : 0) / 100) * 30;
      const comRetrabalhos = projects.filter(p => p.retrabalhos > 0).length;
      const ptsRetrabalhos = Math.min(20, ((projects.length - comRetrabalhos) / projects.length) * 20);
      return Math.round(ptsNoPrazo + ptsCompletion + ptsRetrabalhos);
    }
    function calcEquipe(members) {
      if (!members || members.length === 0) return 70;
      let perfTotal = 0;
      members.forEach(m => { const total = (m.tarefas_concluidas||0)+(m.tarefas_abertas||0); perfTotal += total > 0 ? (m.tarefas_concluidas/total)*100 : 50; });
      const ptsPerf = (perfTotal / members.length / 100) * 50;
      const comAtrasos = members.filter(m => (m.atrasos||0) > 0).length;
      const ptsAtrasos = Math.min(30, ((members.length - comAtrasos) / members.length) * 30);
      const ausMedia = members.reduce((s,m) => s+(m.ausencias||0), 0) / members.length;
      const ptsAusencias = Math.max(0, 20 - (ausMedia * 2));
      return Math.round(ptsPerf + ptsAtrasos + ptsAusencias);
    }
    function calcProcessos(processes) {
      if (!processes || processes.length === 0) return 60;
      const documentados = processes.filter(p => p.etapas && p.etapas.length > 0).length;
      const ptsDocumentados = Math.min(40, (documentados / processes.length) * 40);
      const complianceMedia = processes.reduce((s,p) => s+(p.compliance||0), 0) / processes.length;
      const ptsCompliance = (complianceMedia / 100) * 40;
      const criticos = processes.filter(p => p.classificacao === 'Crítico');
      const criticosAtivos = processes.filter(p => p.classificacao === 'Crítico' && p.status === 'ativo').length;
      const ptsCriticos = Math.min(20, (criticosAtivos / Math.max(1, criticos.length)) * 20);
      return Math.round(ptsDocumentados + ptsCompliance + ptsCriticos);
    }

    const financeiro = calcFinanceiro(fonte.transacoes);
    const comercial = calcComercial(fonte.leads, fonte.pipeline);
    const operacional = calcOperacional(fonte.projects);
    const equipe = calcEquipe(fonte.members);
    const processos = calcProcessos(fonte.processes);

    const dims = {
      financeiro: Math.max(0, Math.min(100, financeiro)), comercial: Math.max(0, Math.min(100, comercial)),
      operacional: Math.max(0, Math.min(100, operacional)), equipe: Math.max(0, Math.min(100, equipe)),
      processos: Math.max(0, Math.min(100, processos)),
    };
    const score = Math.round(dims.financeiro*0.25 + dims.comercial*0.25 + dims.operacional*0.20 + dims.equipe*0.20 + dims.processos*0.10);
    return { score: Math.max(0, Math.min(100, score)), dims };
  };

  // ── Persistência local (ponte até Supabase estar ativo) ───
  // Usa localStorage do navegador — sobrevive a refresh/fechar aba.
  // Escopado por empresa_id para não misturar dados entre clientes.
  window.localPersist = {
    _key(name) { return `upco_${CLIENT_CONFIG.empresa_id}_${name}`; },

    load(name, fallback) {
      try {
        const raw = localStorage.getItem(this._key(name));
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        console.warn('localPersist.load falhou, usando fallback', e);
        return fallback;
      }
    },

    save(name, data) {
      try {
        localStorage.setItem(this._key(name), JSON.stringify(data));
        return true;
      } catch (e) {
        console.warn('localPersist.save falhou', e);
        return false;
      }
    },

    clear(name) {
      localStorage.removeItem(this._key(name));
    },

    // Lista todas as chaves salvas desta empresa (útil para migração futura ao Supabase)
    exportAll() {
      const prefix = `upco_${CLIENT_CONFIG.empresa_id}_`;
      const out = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          out[k.replace(prefix, '')] = JSON.parse(localStorage.getItem(k));
        }
      }
      return out;
    }
  };

  // ── Claude API helper ─────────────────────────────────────
  // ── Chamada de IA ─────────────────────────────────────────
  // NUNCA chamar api.anthropic.com direto do navegador: a chave ficaria
  // visível no código-fonte da página pra qualquer visitante. A chamada
  // passa por api/ia.php, que é uma ponte pra bruto-secrets/ — mesmo
  // padrão que o Atendimento Técnico já usa em api/chat.php.
  window.callClaude = async function({ systemPrompt, userPayload, mockResponse, maxTokens }) {
    if (DEMO_MODE) {
      // Em modo demo, simula latência e retorna mock
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
      return mockResponse;
    }
    try {
      const res = await fetch('api/ia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',      // leva o cookie de sessão
        body: JSON.stringify({
          system: systemPrompt,
          payload: userPayload,
          max_tokens: maxTokens || 1000,
        })
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) { window.location.replace('login.html?m=sessao'); return mockResponse; }
      if (!res.ok) throw new Error(data.erro || `HTTP ${res.status}`);

      return data.texto || mockResponse;
    } catch (e) {
      // IA fora do ar não pode derrubar o painel inteiro — o módulo
      // continua exibindo os dados, só sem a leitura gerada.
      console.error('callClaude:', e);
      window.toast?.('Não consegui gerar a análise agora.', 'error');
      return mockResponse;
    }
  };

})();
