/* ============================================================
   BRUTO — Simulador de Paginação & Cor
   Renderiza os padrões de assentamento usando a textura real
   (foto) de cada tijolo da coleção Brick, com seletor de cor
   e toggle de ambiente claro/escuro.
   ============================================================ */

(function () {

  // Coleção Brick — id, nome de exibição, foto principal e thumb
  var BRICKS = [
    { id: 'brick-branco-rose',          nome: 'Branco Rosé' },
    { id: 'brick-eco-palha',            nome: 'Eco Palha' },
    { id: 'brick-lumus',                nome: 'Lumus' },
    { id: 'brick-mescla-prime',         nome: 'Mescla Prime' },
    { id: 'brick-natura',               nome: 'Natura' },
    { id: 'brick-rosso-prime',          nome: 'Rosso Prime' },
    { id: 'brick-rusticatto-sertao',    nome: 'Rusticatto do Sertão' },
    { id: 'brick-rusticatto-fume',      nome: 'Rusticatto Fumê' },
    { id: 'brick-rusticatto-rosso',     nome: 'Rusticatto Rosso' },
    { id: 'brick-rusticatto-terra-negra', nome: 'Rusticatto Terra Negra' },
    { id: 'brick-terra-cerrado',        nome: 'Terra do Cerrado' },
    { id: 'brick-vulcano',              nome: 'Vulcano' }
  ];

  function textureUrl(id)  { return id + '-frontal.webp'; }
  function thumbUrl(id)    { return id + '-frontal-thumb.webp'; }
  function findBrick(id)   { return BRICKS.filter(function (b) { return b.id === id; })[0] || BRICKS[0]; }

  var PATTERNS = [
    { id: 'corrido12', label: 'Corrido 1/2',    desc: 'O clássico — deslocamento de meia peça a cada fiada.' },
    { id: 'corrido13', label: 'Corrido 1/3',     desc: 'Deslocamento de um terço, ritmo mais alongado.' },
    { id: 'empilhado', label: 'Empilhado',       desc: 'Sem deslocamento — grid puro, leitura industrial.' },
    { id: 'espinha',   label: 'Espinha de Peixe', desc: 'Peças em 45° alternadas — acabamento premium.' }
  ];

  // Cores de rejunte — a primeira replica a junta clara original do widget
  var REJUNTES = [
    { id: 'argamassa', nome: 'Argamassa clara', cor: '#f2efe9' },
    { id: 'areia',     nome: 'Areia',           cor: '#d9c9ae' },
    { id: 'cinza',     nome: 'Cinza platina',   cor: '#b9b4ab' },
    { id: 'grafite',   nome: 'Grafite',         cor: '#4a453e' },
    { id: 'terracota', nome: 'Terracota',       cor: '#9c5f43' }
  ];

  var PECA_LARGURA_MM = 240; // referência da peça Brick para converter junta mm → px

  /* ---------- Geradores de layout (retângulos por padrão) ---------- */

  function genCorrido(wallW, wallH, mw, mh, gap, offsetFrac) {
    var rects = [];
    var stepY = mh + gap;
    var stepX = mw + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var off = (offsetFrac === 0.5) ? ((Math.abs(r) % 2) * mw * 0.5)
                                      : ((((r % 3) + 3) % 3) * mw / 3);
      var cols = Math.ceil((wallW + mw * 2) / stepX) + 2;
      for (var c = -2; c < cols; c++) {
        var x = c * stepX - off;
        rects.push({ x: x, y: y, w: mw, h: mh, rot: 0 });
      }
    }
    return rects;
  }

  function genEmpilhado(wallW, wallH, mw, mh, gap) {
    var rects = [];
    var stepY = mh + gap;
    var stepX = mw + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    var cols = Math.ceil(wallW / stepX) + 2;
    for (var r = -1; r < rows; r++) {
      for (var c = -1; c < cols; c++) {
        rects.push({ x: c * stepX, y: r * stepY, w: mw, h: mh, rot: 0 });
      }
    }
    return rects;
  }

  function genEspinha(wallW, wallH, L, gap) {
    // Construção validada: cada FILEIRA inteira (não cada peça) tem uma
    // única orientação (45° ou 135°), alternando fileira a fileira, com
    // deslocamento de meio passo entre elas — igual ao padrão clássico de
    // espinha de peixe (testado e comparado pixel a pixel contra uma
    // referência CSS de espinha de peixe consagrada antes de aplicar aqui).
    // Cobertura 100%, sem gaps e sem peças se cruzando em X.
    // A junta é criada encolhendo cada peça em `gap`, revelando o rejunte.
    var rects = [];
    var thick = L / 2; // proporção clássica 2:1 (comprimento : espessura)
    var step = L / Math.SQRT2; // espaçamento entre fileiras e entre peças na mesma fileira
    var g = gap || 0;

    var originX = wallW / 2;
    var originY = wallH / 2;

    var rowSteps = Math.ceil(wallH / (2 * step)) + 3;
    var colSteps = Math.ceil(wallW / (2 * step)) + 3;

    for (var r = -rowSteps; r <= rowSteps; r++) {
      var y = r * step + originY;
      var odd = ((r % 2) + 2) % 2 === 1; // módulo seguro pra r negativo
      var rot = odd ? 135 : 45;
      var xOffset = odd ? step / 2 : 0;

      for (var c = -colSteps; c <= colSteps; c++) {
        var x = c * step + xOffset + originX;
        rects.push({ x: x - L / 2 + g / 2, y: y - thick / 2 + g / 2, w: L - g, h: thick - g, rot: rot });
      }
    }
    return rects;
  }

  function buildLayout(patternId, wallW, wallH, juntaMm) {
    var mw = Math.max(48, wallW / 7.5);
    var mh = mw / 3.65;
    // converte a junta real (mm) para pixels usando a largura da peça como régua
    var gap = Math.max(1, mw * ((juntaMm || 8) / PECA_LARGURA_MM));
    switch (patternId) {
      case 'corrido13': return genCorrido(wallW, wallH, mw, mh, gap, 1 / 3);
      case 'empilhado':  return genEmpilhado(wallW, wallH, mw, mh, gap);
      case 'espinha':    return genEspinha(wallW, wallH, mw * 1.35, gap);
      case 'corrido12':
      default:           return genCorrido(wallW, wallH, mw, mh, gap, 0.5);
    }
  }

  /* ---------- Renderização ---------- */

  function renderWall(root, state) {
    var wallEl = root.querySelector('.pgn-wall');
    if (!wallEl) return;

    var rectW = wallEl.clientWidth;
    var rectH = wallEl.clientHeight;
    if (!rectW || !rectH) return;

    var layout = buildLayout(state.pattern, rectW, rectH, state.junta);
    var url = "url('" + textureUrl(state.brickId) + "')";
    var frag = document.createDocumentFragment();

    // o fundo da parede é o rejunte — as juntas entre as peças o revelam
    wallEl.style.backgroundColor = state.rejunte.cor;

    layout.forEach(function (b) {
      var el = document.createElement('div');
      el.className = 'pgn-brick';
      el.style.left = b.x + 'px';
      el.style.top = b.y + 'px';
      el.style.width = b.w + 'px';
      el.style.height = b.h + 'px';

      if (b.rot) {
        el.style.transformOrigin = 'center center';
        el.style.transform = 'rotate(' + b.rot + 'deg)';
        el.style.backgroundImage = url;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = '50% 50%';
      } else {
        // truque de "janela reveladora": a textura cobre toda a
        // parede numa única escala e cada peça revela seu recorte,
        // criando continuidade fotográfica entre as peças.
        el.style.backgroundImage = url;
        el.style.backgroundSize = rectW + 'px ' + rectH + 'px';
        el.style.backgroundPosition = (-b.x) + 'px ' + (-b.y) + 'px';
      }
      frag.appendChild(el);
    });

    wallEl.innerHTML = '';
    wallEl.appendChild(frag);
  }

  /* ---------- Montagem do widget ---------- */

  function buildSwatches(root, state, onChange) {
    var wrap = root.querySelector('.pgn-swatches');
    if (!wrap) return;
    wrap.innerHTML = '';
    BRICKS.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pgn-swatch' + (b.id === state.brickId ? ' is-active' : '');
      btn.setAttribute('data-brick', b.id);
      btn.setAttribute('title', b.nome);
      btn.setAttribute('aria-label', b.nome);
      btn.innerHTML = '<img src="' + thumbUrl(b.id) + '" alt="' + b.nome + '" loading="lazy">';
      btn.addEventListener('click', function () {
        if (state.brickId === b.id) return;
        state.brickId = b.id;
        wrap.querySelectorAll('.pgn-swatch').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var label = root.querySelector('.pgn-current-name');
        if (label) label.textContent = b.nome;
        onChange();
      });
      wrap.appendChild(btn);
    });
  }

  function buildPatternButtons(root, state, onChange) {
    var wrap = root.querySelector('.pgn-pattern-list');
    if (!wrap) return;
    wrap.innerHTML = '';
    PATTERNS.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pgn-pattern-btn' + (p.id === state.pattern ? ' is-active' : '');
      btn.setAttribute('data-pattern', p.id);
      btn.textContent = p.label;
      btn.addEventListener('click', function () {
        if (state.pattern === p.id) return;
        state.pattern = p.id;
        wrap.querySelectorAll('.pgn-pattern-btn').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var desc = root.querySelector('.pgn-pattern-desc');
        if (desc) desc.textContent = p.desc;
        onChange();
      });
      wrap.appendChild(btn);
    });
  }

  function updateGroutNote(root, state) {
    var note = root.querySelector('.pgn-grout-note');
    if (!note) return;
    note.innerHTML = '<i class="ti ti-line-dashed" aria-hidden="true"></i> ' +
      'Junta de ' + state.junta + ' mm · rejunte ' + state.rejunte.nome.toLowerCase();
  }

  function buildGroutControls(root, state, onChange) {
    var controls = root.querySelector('.pgn-controls');
    if (!controls || controls.querySelector('.pgn-grout-group')) return;

    var group = document.createElement('div');
    group.className = 'pgn-control-group pgn-grout-group';

    var label = document.createElement('span');
    label.className = 'pgn-control-label';
    label.textContent = 'Junta & rejunte';
    group.appendChild(label);

    // Slider de junta (mm)
    var row = document.createElement('div');
    row.className = 'pgn-grout-row';
    var range = document.createElement('input');
    range.type = 'range';
    range.className = 'pgn-junta-range';
    range.min = '3'; range.max = '15'; range.step = '1';
    range.value = String(state.junta);
    range.setAttribute('aria-label', 'Espessura da junta em milímetros');
    var val = document.createElement('span');
    val.className = 'pgn-junta-val';
    val.textContent = state.junta + ' mm';
    var raf = null;
    range.addEventListener('input', function () {
      state.junta = parseInt(range.value, 10) || 8;
      val.textContent = state.junta + ' mm';
      updateGroutNote(root, state);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onChange);
    });
    row.appendChild(range);
    row.appendChild(val);
    group.appendChild(row);

    // Swatches de rejunte
    var list = document.createElement('div');
    list.className = 'pgn-rejunte-list';
    list.setAttribute('role', 'group');
    list.setAttribute('aria-label', 'Cor do rejunte');
    REJUNTES.forEach(function (rj) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pgn-rejunte-swatch' + (rj.id === state.rejunte.id ? ' is-active' : '');
      btn.style.backgroundColor = rj.cor;
      btn.setAttribute('title', rj.nome);
      btn.setAttribute('aria-label', 'Rejunte ' + rj.nome);
      btn.addEventListener('click', function () {
        if (state.rejunte.id === rj.id) return;
        state.rejunte = rj;
        list.querySelectorAll('.pgn-rejunte-swatch').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        updateGroutNote(root, state);
        onChange();
      });
      list.appendChild(btn);
    });
    group.appendChild(list);

    controls.appendChild(group);
  }

  function buildViewToggle(root, state) {
    var wrap = root.querySelector('.pgn-preview-wrap');
    if (!wrap || wrap.querySelector('.pgn-view-toggle')) return;
    var box = document.createElement('div');
    box.className = 'pgn-view-toggle';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Vista da parede');
    [['frontal', 'Frontal'], ['persp', 'Em perspectiva']].forEach(function (v) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pgn-chip' + (state.vista === v[0] ? ' is-active' : '');
      btn.setAttribute('data-view', v[0]);
      btn.textContent = v[1];
      btn.addEventListener('click', function () {
        if (state.vista === v[0]) return;
        state.vista = v[0];
        box.querySelectorAll('.pgn-chip').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        wrap.classList.toggle('pgn-view--persp', v[0] === 'persp');
      });
      box.appendChild(btn);
    });
    wrap.appendChild(box);
  }

  function buildAmbientToggle(root, state) {
    var wrap = root.querySelector('.pgn-ambient-toggle');
    if (!wrap) return;
    wrap.querySelectorAll('.pgn-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = btn.getAttribute('data-ambient');
        if (state.ambiente === val) return;
        state.ambiente = val;
        wrap.querySelectorAll('.pgn-chip').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var wallWrap = root.querySelector('.pgn-preview-wrap');
        if (wallWrap) {
          wallWrap.classList.toggle('pgn-ambient--escuro', val === 'escuro');
          wallWrap.classList.toggle('pgn-ambient--claro', val === 'claro');
        }
      });
    });
  }

  function initOne(root) {
    var initialId = root.getAttribute('data-current') || BRICKS[0].id;
    var state = {
      brickId: findBrick(initialId).id,
      pattern: 'corrido12',
      ambiente: 'claro',
      vista: 'frontal',
      junta: 8,                 // mm — mesmo valor da calculadora de m²
      rejunte: REJUNTES[0]
    };

    var nameLabel = root.querySelector('.pgn-current-name');
    if (nameLabel) nameLabel.textContent = findBrick(state.brickId).nome;

    var descLabel = root.querySelector('.pgn-pattern-desc');
    if (descLabel) descLabel.textContent = PATTERNS[0].desc;

    function rerender() {
      renderWall(root, state);
      var colorLink = root.querySelector('.pgn-color-link');
      if (colorLink) colorLink.setAttribute('href', 'produto-' + state.brickId + '.html');
    }

    buildSwatches(root, state, rerender);
    buildPatternButtons(root, state, rerender);
    buildAmbientToggle(root, state);
    buildViewToggle(root, state);
    buildGroutControls(root, state, rerender);
    updateGroutNote(root, state);

    rerender();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rerender, 150);
    });
  }

  function initPaginacoes() {
    var roots = document.querySelectorAll('.pgn-section[data-current]');
    roots.forEach ? roots.forEach(initOne) : Array.prototype.forEach.call(roots, initOne);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPaginacoes);
  } else {
    initPaginacoes();
  }

  window.BrutoPaginacoes = { init: initPaginacoes };

})();
