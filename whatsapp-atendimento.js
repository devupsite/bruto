/* ════════════════════════════════════════════════════════════════
   WHATSAPP-ATENDIMENTO — Distribuição equitativa entre atendentes
   ════════════════════════════════════════════════════════════════
   Carregado em todas as páginas com botão de WhatsApp, ANTES dos
   outros scripts que abrem conversas (mobile-cta-bar.js,
   amostras.js, lead-pdf.js, promo-frete-gratis.js, exit-intent.js).

   Como funciona:
   1) No carregamento da página, busca em api/whatsapp-atendimento.php
      qual atendente (entre os cadastrados e ativos) foi designado pro
      rodízio. O servidor mantém o contador real — é ele quem
      garante equilíbrio entre TODOS os visitantes, não só o
      navegador de cada um.
   2) O resultado fica guardado em sessionStorage: o mesmo visitante
      continua com o mesmo atendente em todas as páginas/botões
      daquela visita, pra não trocar de pessoa no meio de uma
      conversa. Uma nova sessão (nova aba/dia) pode cair com outro
      atendente — é o rodízio seguindo o fluxo normal.
   3) Reescreve automaticamente todos os links <a href="wa.me/...">
      já existentes no HTML da página.
   4) Expõe window.brutoGetWhatsappNumero() e window.brutoWhatsappHref()
      pra scripts que montam o link dinamicamente (formulários,
      popups, calculadora de orçamento etc.) usarem o mesmo número.

   Se a API cair ou a rede falhar, cai num fallback local (ver
   FALLBACK_NUMEROS abaixo) — o site nunca fica sem botão de
   WhatsApp funcionando, só perde a garantia de equilíbrio entre
   visitantes diferentes enquanto o servidor estiver fora.

   5) Rastreio de origem (22/07/2026): captura gclid (Google Ads) e
      utm_source/medium/campaign da URL na primeira página vista,
      guarda em sessionStorage (first-touch — não sobrescreve se o
      visitante já entrou por um clique de anúncio nesta sessão).
      Ao montar o texto de cada botão de WhatsApp, embute um código
      de referência curto (produto_tipo-cta_origem_hash) na própria
      mensagem, e dispara um beacon pra api/registrar-lead.php com
      esses dados + o atendente sorteado, ANTES de abrir o WhatsApp
      — é isso que permite cruzar depois: clique de anúncio (gclid)
      -> lead específico -> atendente -> resultado da conversa.
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var API_URL = 'api/whatsapp-atendimento.php';
  var LEAD_URL = 'api/registrar-lead.php';
  var STORAGE_KEY = 'bruto_whatsapp_atendimento';
  var ADS_STORAGE_KEY = 'bruto_ads_contexto';

  // Fallback local caso a API de rodízio caia ou a rede falhe.
  // Hoje o rodízio tem 2 posições: o número Bruto (5511990049468,
  // desbanido pela Meta) ativo, e uma segunda posição em placeholder
  // aguardando um número novo. Por ora, mantém só o número Bruto
  // como rede de segurança; quando a 2ª posição for definida,
  // idealmente incluir aqui também pra o fallback também alternar.
  var FALLBACK_NUMEROS = ['5511990049468'];

  var promessaNumero = null;

  // ─── Contexto de anúncio (gclid/UTM) — first-touch por sessão ───

  function lerContextoAds() {
    try {
      var raw = sessionStorage.getItem(ADS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function capturarContextoAds() {
    var existente = lerContextoAds();
    if (existente) return existente; // first-touch: já tem, não sobrescreve

    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (e) {
      return null;
    }

    var gclid = params.get('gclid');
    var utmSource = params.get('utm_source');
    var utmMedium = params.get('utm_medium');
    var utmCampaign = params.get('utm_campaign');

    if (!gclid && !utmSource) return null; // visita direta, sem rastro de campanha

    var contexto = {
      gclid: gclid || null,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      origem: gclid ? 'google-ads' : (utmSource || 'desconhecida'),
      capturado_em: new Date().toISOString()
    };

    try {
      sessionStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(contexto));
    } catch (e) { /* sessionStorage indisponível — segue sem persistir */ }

    return contexto;
  }

  // ─── Código de referência por clique (produto_cta_origem_hash) ───

  function slugProduto() {
    var nome = window.location.pathname
      .replace(/^\/|\/$/g, '')
      .replace(/\.html?$/i, '')
      .replace(/^produto-/, '') || 'home';
    return nome;
  }

  function hashCurto() {
    return Math.random().toString(36).slice(2, 6);
  }

  function gerarCodigoReferencia(ctaTipo) {
    var contexto = lerContextoAds();
    var origem = (contexto && contexto.origem) || 'direto';
    return [slugProduto(), ctaTipo || 'whatsapp', origem, hashCurto()].join('_');
  }

  // Beacon fire-and-forget — não bloqueia a abertura do WhatsApp,
  // não trava a navegação se falhar (best-effort, mesmo padrão de
  // resiliência do restante deste arquivo).
  function registrarLead(codigoReferencia, dadosAtendente) {
    try {
      var payload = JSON.stringify({
        codigo_referencia: codigoReferencia,
        atendente: (dadosAtendente && dadosAtendente.atendente) || null,
        numero: (dadosAtendente && dadosAtendente.numero) || null,
        gclid: (lerContextoAds() || {}).gclid || null,
        pagina: window.location.pathname,
        criado_em: new Date().toISOString()
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(LEAD_URL, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(LEAD_URL, { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'application/json' } });
      }
    } catch (e) {
      console.warn('bruto: não foi possível registrar o lead (rastreio), WhatsApp segue normalmente:', e);
    }
  }

  function lerCache() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function salvarCache(dados) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    } catch (e) { /* sessionStorage indisponível — segue sem cache */ }
  }

  function fallbackLocal() {
    var idx = Math.floor(Math.random() * FALLBACK_NUMEROS.length);
    return { numero: FALLBACK_NUMEROS[idx], atendente: null, origem: 'fallback-local' };
  }

  function buscarNumero() {
    if (promessaNumero) return promessaNumero;

    var cache = lerCache();
    if (cache && cache.numero) {
      promessaNumero = Promise.resolve(cache);
      return promessaNumero;
    }

    promessaNumero = fetch(API_URL, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('status ' + res.status);
        return res.json();
      })
      .then(function (dados) {
        if (!dados || !dados.numero) throw new Error('resposta sem número');
        dados.origem = dados.origem || 'api';
        salvarCache(dados);
        return dados;
      })
      .catch(function (err) {
        console.warn('bruto: não foi possível obter o atendente distribuído, usando fallback local:', err);
        var dados = fallbackLocal();
        salvarCache(dados);
        return dados;
      });

    return promessaNumero;
  }

  // Retorna uma Promise que resolve com o link completo já pronto,
  // ex: window.brutoWhatsappHref('Olá! Gostaria de...', 'consultor')
  // ctaTipo é opcional (ex.: 'amostra', 'consultor', 'quiz') — usado
  // só pra compor o código de referência; se omitido, cai em 'whatsapp'.
  function montarLink(texto, ctaTipo) {
    return buscarNumero().then(function (dados) {
      var codigo = gerarCodigoReferencia(ctaTipo);
      registrarLead(codigo, dados);
      var textoComRef = texto + '\n[ref:' + codigo + ']';
      return 'https://wa.me/' + dados.numero + '?text=' + encodeURIComponent(textoComRef);
    });
  }

  function reescreverLinksEstaticos(dados) {
    var links = document.querySelectorAll('a[href*="wa.me/"]');
    links.forEach(function (link) {
      link.href = link.href.replace(/wa\.me\/\d+/, 'wa.me/' + dados.numero);

      // Adiciona o código de referência ao texto já existente no link
      // (sem sobrescrever a mensagem original) e embute o beacon de
      // clique, sem travar a navegação se o beacon falhar.
      try {
        var url = new URL(link.href);
        var textoOriginal = url.searchParams.get('text') || '';
        var ctaTipo = link.dataset.cta || null; // opcional: data-cta="amostra" no HTML
        var codigo = gerarCodigoReferencia(ctaTipo);
        url.searchParams.set('text', textoOriginal + '\n[ref:' + codigo + ']');
        link.href = url.toString();
        link.addEventListener('click', function () {
          registrarLead(codigo, dados);
        }, { once: true });
      } catch (e) {
        // Se algo falhar aqui, o link já reescrito com o número certo
        // continua funcionando normalmente — só perde o rastreio.
      }
    });
  }

  window.brutoGetWhatsappNumero = buscarNumero;
  window.brutoWhatsappHref = montarLink;

  document.addEventListener('DOMContentLoaded', function () {
    capturarContextoAds();
    buscarNumero().then(function (dados) {
      reescreverLinksEstaticos(dados);
      if (window.brutoTrack) {
        window.brutoTrack('atendente_atribuido', {
          atendente: dados.atendente || null,
          origem: dados.origem || 'api'
        });
      }
    });
  });
})();
