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
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var API_URL = 'api/whatsapp-atendimento.php';
  var STORAGE_KEY = 'bruto_whatsapp_atendimento';

  // Fallback local caso a API de rodízio caia ou a rede falhe.
  // Hoje o rodízio tem 2 posições: o número Bruto (5511990049468,
  // desbanido pela Meta) ativo, e uma segunda posição em placeholder
  // aguardando um número novo. Por ora, mantém só o número Bruto
  // como rede de segurança; quando a 2ª posição for definida,
  // idealmente incluir aqui também pra o fallback também alternar.
  var FALLBACK_NUMEROS = ['5511990049468'];

  var promessaNumero = null;

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
  // ex: window.brutoWhatsappHref('Olá! Gostaria de...')
  function montarLink(texto) {
    return buscarNumero().then(function (dados) {
      return 'https://wa.me/' + dados.numero + '?text=' + encodeURIComponent(texto);
    });
  }

  function reescreverLinksEstaticos(dados) {
    var links = document.querySelectorAll('a[href*="wa.me/"]');
    links.forEach(function (link) {
      link.href = link.href.replace(/wa\.me\/\d+/, 'wa.me/' + dados.numero);
    });
  }

  window.brutoGetWhatsappNumero = buscarNumero;
  window.brutoWhatsappHref = montarLink;

  document.addEventListener('DOMContentLoaded', function () {
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
