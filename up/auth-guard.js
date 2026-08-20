// ============================================================
// UP Co. Suite — Guarda de Autenticação
// ============================================================
// Carregado ANTES de qualquer outro script em todos os módulos.
// Enquanto a identidade não é confirmada, a página fica coberta —
// nada de dado financeiro ou comercial aparece na tela.
//
// IMPORTANTE: isto é a camada de conveniência (redireciona, mostra
// quem está logado, faz logout). NÃO é a proteção de verdade.
// A proteção real é server-side: cada endpoint em api/ valida a
// sessão por conta própria. Um guarda de front-end sozinho é
// contornável desligando o JavaScript — por isso ele nunca é a
// única linha de defesa.
// ============================================================

(function authGuard() {

  const LOGIN_PAGE = 'login.html';
  if (window.location.pathname.split('/').pop() === LOGIN_PAGE) return;

  // ── Cortina: esconde a página até confirmar quem é ──────────
  const shield = document.createElement('div');
  shield.id = 'auth-shield';
  shield.style.cssText = `
    position:fixed; inset:0; z-index:99999;
    background:#0F0F0F; color:#888888;
    display:flex; align-items:center; justify-content:center;
    font-family:'Barlow',system-ui,sans-serif; font-size:13px;
    letter-spacing:.02em;
  `;
  shield.textContent = 'Verificando acesso…';

  function mountShield() {
    if (document.body) document.body.appendChild(shield);
    else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(shield));
  }
  mountShield();

  function dropShield() { shield.remove(); }

  function redirectToLogin(motivo) {
    const destino = encodeURIComponent(window.location.pathname.split('/').pop() || '');
    window.location.replace(`${LOGIN_PAGE}?next=${destino}${motivo ? '&m=' + encodeURIComponent(motivo) : ''}`);
  }

  window.UP_AUTH = { user: null, pronto: false };

  window.upLogout = async function () {
    try { await fetch('api/logout.php', { method:'POST', credentials:'same-origin' }); } catch (_) {}
    window.location.replace(LOGIN_PAGE);
  };

  fetch('api/me.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: '{}',
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(data.erro || `HTTP ${res.status}`), { status: res.status });
      return data;
    })
    .then((me) => {
      if (!me || !me.usuario) return redirectToLogin('sessao');

      // Atendente só acessa UP·Lead e UP·Base — mesma regra aplicada no
      // servidor (cada backend recusa com 403), isto aqui é só pra não
      // deixar a pessoa numa tela vazia/quebrada se ela digitar a URL
      // de um módulo vedado direto. Pedido do Rafael, 08/08/2026.
      const PAGINAS_ATENDENTE = ['up-lead.html', 'up-base.html'];
      const paginaAtual = window.location.pathname.split('/').pop();
      if (me.papel === 'atendente' && !PAGINAS_ATENDENTE.includes(paginaAtual)) {
        window.location.replace('up-lead.html');
        return;
      }

      window.UP_AUTH.user = { id: me.id, usuario: me.usuario, nome: me.nome, papel: me.papel };
      window.UP_AUTH.pronto = true;
      document.dispatchEvent(new CustomEvent('up-auth-ready', { detail: window.UP_AUTH.user }));
      dropShield();
    })
    .catch((e) => {
      // 401/403 → não autenticado. Qualquer outro erro (backend fora do ar,
      // arquivo faltando) TAMBÉM bloqueia: em caso de dúvida, não mostra dado.
      if (e.status === 401 || e.status === 403) return redirectToLogin('sessao');
      shield.innerHTML = `
        <div style="text-align:center;max-width:340px;line-height:1.6;">
          <div style="color:#E74C3C;font-weight:500;margin-bottom:8px;">Não consegui confirmar seu acesso</div>
          <div style="font-size:12px;color:#606060;">
            O backend de autenticação não respondeu. Por segurança, nada é exibido.<br>
            Verifique se <code>bruto-secrets/API/auth.php</code> está no servidor.
          </div>
          <a href="${LOGIN_PAGE}" style="display:inline-block;margin-top:16px;color:#57999B;font-size:12px;">Ir para o login</a>
        </div>`;
    });

})();
