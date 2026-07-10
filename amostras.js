/* ════════════════════════════════════════════════════════════════
   AMOSTRAS — Sacola de amostras físicas (até 3 produtos)
   Carregado nas páginas de produto. Widget flutuante + modal de
   revisão/endereço, injetados em runtime (mesmo padrão do
   back-to-top.js e do lead-pdf.js).

   Fluxo: usuário adiciona até 3 produtos à sacola (persistida em
   localStorage, sobrevive entre páginas) → abre a sacola → preenche
   endereço → confirma → Formspree + WhatsApp com o pedido completo.

   FORMSPREE_ENDPOINT: mesmo endpoint configurado em 08/07/2026.
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbdveedy';
  var WHATSAPP_NUMBER    = '5511990049468';
  var STORAGE_KEY         = 'bruto_amostras_bag';
  var MAX_ITENS           = 3;

  /* ── Estado (localStorage) ────────────────────────────────────── */
  function lerSacola() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function salvarSacola(arr) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) { /* ignora quota/privado */ }
  }

  var sacola = lerSacola();

  /* ── Widget flutuante (pílula) ────────────────────────────────── */
  var pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'amostra-pill';
  pill.setAttribute('aria-label', 'Ver sacola de amostras');
  document.body.appendChild(pill);

  function renderPill() {
    if (sacola.length === 0) {
      pill.classList.remove('is-visible');
      return;
    }
    pill.classList.add('is-visible');
    pill.innerHTML =
      '<i class="ti ti-package" aria-hidden="true"></i>' +
      '<span>Amostras</span>' +
      '<span class="amostra-pill__badge">' + sacola.length + '</span>';
  }

  /* ── Toast simples (limite atingido, etc.) ────────────────────── */
  var toast = document.createElement('div');
  toast.className = 'amostra-toast';
  document.body.appendChild(toast);
  var toastTimer = null;
  function mostrarToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 3200);
  }

  /* ── Atualiza todos os botões "Adicionar" da página atual ────── */
  function renderBotoes() {
    document.querySelectorAll('.amostra-add-btn').forEach(function (btn) {
      var id = btn.getAttribute('data-amostra-id');
      var naSacola = sacola.some(function (item) { return item.id === id; });
      var label = btn.querySelector('.amostra-add-btn__label');
      var icon = btn.querySelector('i');
      if (naSacola) {
        btn.classList.add('is-added');
        if (label) label.textContent = 'Na sacola de amostras';
        if (icon) icon.className = 'ti ti-check';
      } else {
        btn.classList.remove('is-added');
        if (label) label.textContent = 'Adicionar à sacola de amostras';
        if (icon) icon.className = 'ti ti-package';
      }
    });
  }

  function alternarItem(btn) {
    var id = btn.getAttribute('data-amostra-id');
    var idx = sacola.findIndex(function (item) { return item.id === id; });

    if (idx !== -1) {
      sacola.splice(idx, 1);
    } else {
      if (sacola.length >= MAX_ITENS) {
        mostrarToast('Máximo de ' + MAX_ITENS + ' amostras por pedido — remova uma para adicionar outra.');
        return;
      }
      sacola.push({
        id: id,
        nome: btn.getAttribute('data-amostra-nome') || '',
        linha: btn.getAttribute('data-amostra-linha') || '',
        imagem: btn.getAttribute('data-amostra-imagem') || ''
      });
      if (window.brutoTrack) {
        window.brutoTrack('amostra_add', { produto: btn.getAttribute('data-amostra-nome') || '' });
      }
    }

    salvarSacola(sacola);
    renderPill();
    renderBotoes();
    renderListaModal();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.amostra-add-btn');
    if (btn) alternarItem(btn);
  });

  /* ── Modal: revisão da sacola + endereço ──────────────────────── */
  var modal = document.createElement('div');
  modal.className = 'lead-modal amostra-modal';
  modal.innerHTML =
    '<div class="lead-modal__overlay" data-close></div>' +
    '<div class="lead-modal__card" role="dialog" aria-modal="true" aria-label="Sacola de amostras">' +
      '<button type="button" class="lead-modal__close" data-close aria-label="Fechar"><i class="ti ti-x" aria-hidden="true"></i></button>' +
      '<div class="lead-modal__step" data-step="form">' +
        '<p class="eyebrow">Sacola de amostras</p>' +
        '<h3 class="lead-modal__title">Seu pedido de amostras</h3>' +
        '<div class="amostra-lista" id="amostra-lista"></div>' +
        '<form class="lead-modal__form" id="amostra-form">' +
          '<label class="lead-modal__field">' +
            '<span>Nome</span>' +
            '<input type="text" name="nome" required placeholder="Seu nome">' +
          '</label>' +
          '<label class="lead-modal__field">' +
            '<span>WhatsApp</span>' +
            '<input type="tel" name="whatsapp" required placeholder="(11) 91234-5678">' +
          '</label>' +
          '<label class="lead-modal__field">' +
            '<span>E-mail <em>(opcional)</em></span>' +
            '<input type="email" name="email" placeholder="voce@email.com">' +
          '</label>' +
          '<label class="lead-modal__field">' +
            '<span>CEP</span>' +
            '<input type="text" name="cep" required placeholder="00000-000" inputmode="numeric">' +
          '</label>' +
          '<label class="lead-modal__field">' +
            '<span>Endereço completo</span>' +
            '<textarea name="endereco" required placeholder="Rua, número, complemento, bairro, cidade — UF" rows="3"></textarea>' +
          '</label>' +
          '<button type="submit" class="btn btn--primary lead-modal__submit">' +
            '<i class="ti ti-send" aria-hidden="true"></i> Confirmar pedido de amostras' +
          '</button>' +
          '<p class="lead-modal__error" hidden></p>' +
        '</form>' +
      '</div>' +
      '<div class="lead-modal__step" data-step="done" hidden>' +
        '<div class="lead-modal__done-icon"><i class="ti ti-check" aria-hidden="true"></i></div>' +
        '<h3 class="lead-modal__title">Pedido enviado!</h3>' +
        '<p class="lead-modal__body">Abrimos o WhatsApp com seu pedido pronto — é só confirmar o envio. Suas amostras seguem em até alguns dias úteis.</p>' +
        '<button type="button" class="btn btn--outline" data-close>Fechar</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  var listaEl = modal.querySelector('#amostra-lista');

  function renderListaModal() {
    if (sacola.length === 0) {
      listaEl.innerHTML = '<p class="amostra-lista__vazia">Sua sacola está vazia. Feche esta janela e adicione até ' + MAX_ITENS + ' produtos direto na página de cada um.</p>';
      return;
    }
    listaEl.innerHTML = sacola.map(function (item) {
      return '<div class="amostra-item" data-id="' + item.id + '">' +
        '<div class="amostra-item__img" style="background-image:url(\'' + item.imagem + '\')"></div>' +
        '<div class="amostra-item__info">' +
          '<span class="amostra-item__linha">' + item.linha + '</span>' +
          '<span class="amostra-item__nome">' + item.nome + '</span>' +
        '</div>' +
        '<button type="button" class="amostra-item__remove" data-remove-id="' + item.id + '" aria-label="Remover ' + item.nome + '"><i class="ti ti-x" aria-hidden="true"></i></button>' +
      '</div>';
    }).join('');
  }

  listaEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove-id]');
    if (!btn) return;
    var id = btn.getAttribute('data-remove-id');
    sacola = sacola.filter(function (item) { return item.id !== id; });
    salvarSacola(sacola);
    renderPill();
    renderBotoes();
    renderListaModal();
  });

  function openModal() {
    modal.querySelector('[data-step="form"]').hidden = false;
    modal.querySelector('[data-step="done"]').hidden = true;
    modal.querySelector('.lead-modal__error').hidden = true;
    renderListaModal();
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  pill.addEventListener('click', openModal);
  modal.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  /* ── Submit ────────────────────────────────────────────────────── */
  var form = modal.querySelector('#amostra-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var errEl = modal.querySelector('.lead-modal__error');
    errEl.hidden = true;

    if (sacola.length === 0) {
      errEl.textContent = 'Adicione ao menos uma amostra antes de confirmar.';
      errEl.hidden = false;
      return;
    }

    var lead = {
      nome: form.nome.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      email: form.email.value.trim(),
      cep: form.cep.value.trim(),
      endereco: form.endereco.value.trim()
    };

    var nomesProdutos = sacola.map(function (item) { return item.linha + ' — ' + item.nome; }).join(', ');

    var submitBtn = form.querySelector('.lead-modal__submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    var payload = {
      nome: lead.nome, whatsapp: lead.whatsapp, email: lead.email || '',
      cep: lead.cep, endereco: lead.endereco,
      amostras: nomesProdutos,
      origem: 'sacola-amostras'
    };

    var enviarPromise = (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.indexOf('SEU_ID_AQUI') !== -1)
      ? Promise.resolve()
      : fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(function () { /* não bloqueia o fluxo se o Formspree falhar */ });

    enviarPromise.then(function () {
      if (window.brutoTrack) {
        window.brutoTrack('form_submit', { form_type: 'sacola-amostras', amostras: nomesProdutos });
      }

      var msg = 'Olá! Sou ' + lead.nome + ' e gostaria de solicitar amostras:\n' +
        '\n' + sacola.map(function (item) { return '• ' + item.linha + ' — ' + item.nome; }).join('\n') + '\n' +
        '\nCEP: ' + lead.cep +
        '\nEndereço: ' + lead.endereco;
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
      if (window.brutoTrack) {
        window.brutoTrack('whatsapp_click', { link_text: 'sacola-amostras', amostras: nomesProdutos });
      }
      window.open(url, '_blank');

      // Limpa a sacola após o pedido confirmado
      sacola = [];
      salvarSacola(sacola);
      renderPill();
      renderBotoes();

      modal.querySelector('[data-step="form"]').hidden = true;
      modal.querySelector('[data-step="done"]').hidden = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="ti ti-send" aria-hidden="true"></i> Confirmar pedido de amostras';
      form.reset();
    });
  });

  /* ── Inicialização ─────────────────────────────────────────────── */
  renderPill();
  renderBotoes();
})();
