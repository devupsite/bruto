/* ============================================================
   BRUTO — Simulador de Paginação & Cor
   Renderiza os padrões de assentamento usando a textura real
   (foto) de cada tijolo da coleção Brick, com seletor de cor
   e toggle de ambiente claro/escuro.
   ============================================================ */

(function () {

  // Coleções — cada item traz a dimensão real da peça (mm), usada para
  // manter escala e junta fiéis na parede simulada. A coleção exibida é
  // inferida do prefixo do id em data-current, sem precisar editar HTML.
  var COLECOES = {
    brick: {
      nome: 'Brick',
      itens: [
        { id: 'brick-eco-palha',              nome: 'Eco Palha',             w: 265, h: 65,
          texturas: ['brick-eco-palha-face1.webp?v=3', 'brick-eco-palha-face2.webp?v=3'] },
        { id: 'brick-lumus',                  nome: 'Lumus',                 w: 265, h: 65,
          texturas: ['brick-lumus-face1.webp?v=3', 'brick-lumus-face2.webp?v=3'] },
        { id: 'brick-mescla-prime',           nome: 'Mescla Prime',          w: 250, h: 70,
          texturas: ['brick-mescla-prime-face1.webp?v=2', 'brick-mescla-prime-face2.webp?v=2'] },
        { id: 'brick-natura',                 nome: 'Natura',                w: 240, h: 70,
          texturas: ['brick-natura-face1.webp?v=3', 'brick-natura-face2.webp?v=3'] },
        { id: 'brick-rosso-prime',            nome: 'Rosso Prime',           w: 240, h: 65,
          texturas: ['brick-rosso-prime-face1.webp?v=2', 'brick-rosso-prime-face2.webp?v=2'] },
        { id: 'brick-rusticatto-sertao',      nome: 'Rusticatto do Sertão',  w: 255, h: 70,
          texturas: ['brick-rusticatto-sertao-face1.webp?v=4', 'brick-rusticatto-sertao-face2.webp?v=4'] },
        { id: 'brick-rusticatto-fume',        nome: 'Rusticatto Fumê',       w: 240, h: 65,
          texturas: ['brick-rusticatto-fume-face1.webp?v=2', 'brick-rusticatto-fume-face2.webp?v=2'] },
        { id: 'brick-rusticatto-rosso',       nome: 'Rusticatto Rosso',      w: 270, h: 70,
          texturas: ['brick-rusticatto-rosso-face1.webp?v=3', 'brick-rusticatto-rosso-face2.webp?v=5'] },
        { id: 'brick-rusticatto-terra-negra', nome: 'Rusticatto Terra Negra', w: 260, h: 65,
          texturas: ['brick-rusticatto-terra-negra-face1.webp?v=3', 'brick-rusticatto-terra-negra-face2.webp?v=4'] },
        { id: 'brick-terra-cerrado',          nome: 'Terra do Cerrado',      w: 260, h: 70,
          texturas: ['brick-terra-cerrado-face1.webp?v=3', 'brick-terra-cerrado-face2.webp?v=3'] }
      ]
    },
    cimenticio: {
      nome: 'Cimentício',
      itens: [
        { id: 'cimenticio-alpino', nome: 'Alpino', w: 260, h: 75,
          texturas: ['cimenticio-alpino-face1.webp?v=1'] },
        { id: 'cimenticio-grigio', nome: 'Grigio', w: 260, h: 75,
          texturas: ['cimenticio-grigio-face1.webp'] },
        { id: 'cimenticio-urban',  nome: 'Urban',  w: 260, h: 75,
          texturas: ['cimenticio-urban-face1.webp'] }
      ]
    },
    rockface: {
      nome: 'Rockface',
      itens: [
        { id: 'rockface-alpino', nome: 'Alpino', w: 290, h: 95,
          texturas: ['rockface-alpino-face1.webp?v=1'] },
        { id: 'rockface-brisa',  nome: 'Brisa',  w: 260, h: 75,
          texturas: ['rockface-brisa-face1.webp'] },
        { id: 'rockface-grigio', nome: 'Grigio', w: 290, h: 95,
          texturas: ['rockface-grigio-face1.webp'] }
      ]
    }
  };

  function colecaoDe(id) {
    if (id && id.indexOf('cimenticio-') === 0) return COLECOES.cimenticio;
    if (id && id.indexOf('rockface-') === 0)   return COLECOES.rockface;
    return COLECOES.brick;
  }

  function textureUrl(id)  { return id + '-frontal.webp'; }
  function thumbUrl(id)    { return id + '-frontal-thumb.webp'; }
  function findItem(id) {
    var col = colecaoDe(id);
    return col.itens.filter(function (b) { return b.id === id; })[0] || col.itens[0];
  }

  // Padrões — cat segue a taxonomia do catálogo de paginações
  // (corrido / geometrico / especial); nivel: 1 fácil · 2 médio · 3 avançado
  var PATTERNS = [
    { id: 'corrido12',  label: 'Amarrado 1/2',    cat: 'corrido',    nivel: 1,
      desc: 'O clássico — deslocamento de meia peça a cada fiada.' },
    { id: 'corrido13',  label: 'Terço Corrido',   cat: 'corrido',    nivel: 1,
      desc: 'Deslocamento de um terço, ritmo mais alongado.' },
    { id: 'quarto',     label: 'Quarto Corrido',  cat: 'corrido',    nivel: 1,
      desc: 'Deslocamento de um quarto — escalonado sutil, quase diagonal.' },
    { id: 'fiadas',     label: 'Fiadas Duplas',   cat: 'corrido',    nivel: 2,
      desc: 'Pares de fiadas alinhadas, deslocando a cada dupla. Ritmo mais largo.' },
    { id: 'empilhado',  label: 'Junta a Prumo',   cat: 'corrido',    nivel: 2,
      desc: 'Sem deslocamento — grid puro, leitura industrial e contemporânea.' },
    { id: 'vertical',   label: 'Vertical',        cat: 'especial',   nivel: 2,
      desc: 'Peças em pé — alonga o ambiente e destaca panos de parede.' },
    { id: 'cesta',      label: 'Cesta',           cat: 'geometrico', nivel: 2,
      desc: 'Blocos alternados na horizontal e vertical — efeito de trama têxtil.' },
    { id: 'espinha',    label: 'Espinha de Peixe', cat: 'geometrico', nivel: 3,
      desc: 'Peças em 45° alternadas — acabamento premium.' },
    { id: 'diagonal',   label: 'Diagonal',        cat: 'geometrico', nivel: 3,
      desc: 'Amarrado girado em 45° — amplia visualmente e gera mais recortes.' }
  ];

  var FILTROS = [
    { id: 'todos',      label: 'Todos' },
    { id: 'corrido',    label: 'Corridos' },
    { id: 'geometrico', label: 'Geométricos' },
    { id: 'especial',   label: 'Especiais' }
  ];

  var NIVEL_LABEL = { 1: 'Fácil', 2: 'Médio', 3: 'Avançado' };

  // Cores de rejunte — a primeira replica a junta clara original do widget
  var REJUNTES = [
    { id: 'argamassa', nome: 'Argamassa clara', cor: '#f2efe9' },
    { id: 'areia',     nome: 'Areia',           cor: '#d9c9ae' },
    { id: 'cinza',     nome: 'Cinza platina',   cor: '#b9b4ab' },
    { id: 'grafite',   nome: 'Grafite',         cor: '#4a453e' },
    { id: 'terracota', nome: 'Terracota',       cor: '#9c5f43' }
  ];


  /* ---------- Geradores de layout (retângulos por padrão) ---------- */

  function genCorrido(wallW, wallH, mw, mh, gap, offsetFrac, groupRows) {
    // offsetFrac: fração da largura deslocada a cada fiada (0 = junta a prumo)
    // groupRows: desloca a cada N fiadas (ex.: 2 = fiadas duplas)
    var rects = [];
    var stepY = mh + gap;
    var stepX = mw + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    var k = offsetFrac ? Math.max(1, Math.round(1 / offsetFrac)) : 1;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var rr = groupRows ? Math.floor(r / groupRows) : r;
      var idx = ((rr % k) + k) % k;
      var off = offsetFrac ? idx * mw * offsetFrac : 0;
      var cols = Math.ceil((wallW + mw * 2) / stepX) + 2;
      for (var c = -2; c < cols; c++) {
        var x = c * stepX - off;
        rects.push({ x: x, y: y, w: mw, h: mh, rot: 0 });
      }
    }
    return rects;
  }

  function genEmpilhado(wallW, wallH, mw, mh, gap) {
    return genCorrido(wallW, wallH, mw, mh, gap, 0);
  }

  function genVertical(wallW, wallH, mw, mh, gap) {
    // peças em pé: células de mh × mw, colunas alternadas com meio passo,
    // e a foto girada em 90° para acompanhar a peça
    var rects = [];
    var stepX = mh + gap;
    var stepY = mw + gap;
    var cols = Math.ceil(wallW / stepX) + 2;
    var rows = Math.ceil(wallH / stepY) + 3;
    for (var c = -1; c < cols; c++) {
      var off = (Math.abs(c) % 2) * stepY * 0.5;
      for (var r = -2; r < rows; r++) {
        var cx = c * stepX + mh / 2;
        var cy = r * stepY - off + mw / 2;
        rects.push({ x: cx - mw / 2, y: cy - mh / 2, w: mw, h: mh, rot: 90 });
      }
    }
    return rects;
  }

  function genDiagonal(wallW, wallH, mw, mh, gap) {
    // amarrado 1/2 gerado numa área maior e girado 45° em torno do centro
    var R = Math.ceil(Math.sqrt(wallW * wallW + wallH * wallH)) + mw * 2;
    var base = genCorrido(R, R, mw, mh, gap, 0.5);
    var cos = Math.SQRT1_2, sin = Math.SQRT1_2;
    var half = R / 2;
    return base.map(function (b) {
      var cx = b.x + b.w / 2 - half;
      var cy = b.y + b.h / 2 - half;
      var nx = cx * cos - cy * sin + wallW / 2;
      var ny = cx * sin + cy * cos + wallH / 2;
      return { x: nx - b.w / 2, y: ny - b.h / 2, w: b.w, h: b.h, rot: 45 };
    });
  }

  function genCesta(wallW, wallH, mw, mh, gap) {
    // blocos quadrados (lado = largura da peça) alternando k peças
    // deitadas e k peças em pé, em xadrez
    var rects = [];
    var k = Math.max(2, Math.round((mw + gap) / (mh + gap)));
    var B = mw;
    var stepB = B + gap;
    var strip = (B - (k - 1) * gap) / k;
    var rows = Math.ceil(wallH / stepB) + 2;
    var cols = Math.ceil(wallW / stepB) + 2;
    for (var r = -1; r < rows; r++) {
      for (var c = -1; c < cols; c++) {
        var X = c * stepB, Y = r * stepB;
        var par = (((r + c) % 2) + 2) % 2 === 0;
        for (var i = 0; i < k; i++) {
          if (par) {
            rects.push({ x: X, y: Y + i * (strip + gap), w: B, h: strip, rot: 0 });
          } else {
            var cx = X + i * (strip + gap) + strip / 2;
            var cy = Y + B / 2;
            rects.push({ x: cx - B / 2, y: cy - strip / 2, w: B, h: strip, rot: 90 });
          }
        }
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

  var WALL_MM = 1800; // largura real (mm) representada pela parede simulada

  function buildLayout(patternId, wallW, wallH, juntaMm, peca) {
    // escala fiel: a parede representa WALL_MM de largura real,
    // então cada peça ocupa a fração proporcional à sua dimensão
    var mw = Math.max(40, wallW * (peca.w / WALL_MM));
    var mh = mw * (peca.h / peca.w);
    // converte a junta real (mm) para pixels usando a largura da peça como régua
    var gap = Math.max(1, mw * ((juntaMm || 8) / peca.w));
    switch (patternId) {
      case 'corrido13': return genCorrido(wallW, wallH, mw, mh, gap, 1 / 3);
      case 'quarto':     return genCorrido(wallW, wallH, mw, mh, gap, 1 / 4);
      case 'fiadas':     return genCorrido(wallW, wallH, mw, mh, gap, 0.5, 2);
      case 'empilhado':  return genEmpilhado(wallW, wallH, mw, mh, gap);
      case 'vertical':   return genVertical(wallW, wallH, mw, mh, gap);
      case 'cesta':      return genCesta(wallW, wallH, mw, mh, gap);
      case 'diagonal':   return genDiagonal(wallW, wallH, mw, mh, gap);
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

    var peca = findItem(state.brickId);
    var layout = buildLayout(state.pattern, rectW, rectH, state.junta, peca);

    // descarta peças totalmente fora da parede (padrões girados geram sobra)
    layout = layout.filter(function (b) {
      var m = Math.max(b.w, b.h); // margem segura para peças rotacionadas
      return b.x + b.w > -m && b.x < rectW + m && b.y + b.h > -m && b.y < rectH + m;
    });
    var url = "url('" + textureUrl(state.brickId) + "')";
    var frag = document.createDocumentFragment();

    // o fundo da parede é o rejunte — as juntas entre as peças o revelam
    wallEl.style.backgroundColor = state.rejunte.cor;

    // variação de faces: sorteio ESTÁVEL por posição (mesma parede a cada
    // render). Itens com `texturas` (fotos de peça individual) usam o modo
    // FOTO-POR-PEÇA: cada peça da parede exibe uma foto inteira em escala
    // 1:1, com giro opcional de 180° — como um lote real assentado.
    // Itens sem `texturas` mantêm a janela reveladora original.
    var texturas = peca.texturas || null;
    function hashPos(x, y, salt) {
      var v = Math.sin(x * 127.1 + y * 311.7 + salt * 74.77) * 43758.5453;
      return v - Math.floor(v);
    }

    layout.forEach(function (b) {
      var el = document.createElement('div');
      el.className = 'pgn-brick';
      el.style.left = b.x + 'px';
      el.style.top = b.y + 'px';
      el.style.width = b.w + 'px';
      el.style.height = b.h + 'px';

      if (texturas) {
        var face = Math.floor(hashPos(b.x, b.y, 1) * texturas.length) % texturas.length;
        var gira = hashPos(b.x, b.y, 2) > 0.5;
        el.style.backgroundImage = "url('" + texturas[face] + "')";
        el.style.backgroundSize = '100% 100%';
        var ang = (b.rot || 0) + (gira ? 180 : 0);
        if (ang) {
          el.style.transformOrigin = 'center center';
          el.style.transform = 'rotate(' + ang + 'deg)';
        }
      } else if (b.rot) {
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
    colecaoDe(state.brickId).itens.forEach(function (b) {
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

  // Miniaturas SVG dos padrões (traço, sem preenchimento)
  function patIcon(id) {
    function r(x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>'; }
    var s = '', i, c;
    if (id === 'corrido12')  { for (i = 0; i < 3; i++) for (c = -1; c < 3; c++) s += r(4 + c * 22 + (i % 2) * 11, 4 + i * 11, 20, 9); }
    if (id === 'corrido13')  { for (i = 0; i < 3; i++) for (c = -1; c < 3; c++) s += r(4 + c * 22 + (i % 3) * 7.3, 4 + i * 11, 20, 9); }
    if (id === 'quarto')     { for (i = 0; i < 3; i++) for (c = -1; c < 3; c++) s += r(4 + c * 22 + (i % 4) * 5.5, 4 + i * 11, 20, 9); }
    if (id === 'fiadas')     { for (i = 0; i < 3; i++) for (c = -1; c < 3; c++) s += r(4 + c * 22 + (Math.floor(i / 2) % 2) * 11, 4 + i * 11, 20, 9); }
    if (id === 'empilhado')  { for (i = 0; i < 3; i++) for (c = 0; c < 3; c++) s += r(4 + c * 22, 4 + i * 11, 20, 9); }
    if (id === 'vertical')   { for (i = 0; i < 2; i++) for (c = 0; c < 6; c++) s += r(4 + c * 11, 4 + i * 17 + (c % 2) * 2, 9, 15); }
    if (id === 'cesta')      { s = r(4, 4, 20, 6) + r(4, 11, 20, 6) + r(4, 18, 20, 6) + r(26, 4, 6, 20) + r(33, 4, 6, 20) + r(40, 4, 6, 20) + r(48, 4, 20, 6) + r(48, 11, 20, 6) + r(48, 18, 20, 6); }
    if (id === 'espinha')    { s = '<g transform="rotate(45 34 20)">' + r(10, 2, 18, 8) + r(28, 2, 8, 18) + r(18, 11, 18, 8) + r(36, 11, 8, 18) + r(26, 20, 18, 8) + r(0, 11, 8, 18) + '</g>'; }
    if (id === 'diagonal')   { s = '<g transform="rotate(45 34 20)">'; for (i = -1; i < 3; i++) for (c = -1; c < 3; c++) s += r(2 + c * 22 + (((i % 2) + 2) % 2) * 11, 2 + i * 11, 20, 9); s += '</g>'; }
    return '<svg viewBox="0 0 68 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + s + '</svg>';
  }

  function nivelDots(nivel) {
    var s = '<span class="pgn-nivel" title="Dificuldade de execução: ' + NIVEL_LABEL[nivel] + '">';
    for (var i = 1; i <= 3; i++) s += '<i' + (i <= nivel ? ' class="on"' : '') + '></i>';
    return s + '</span>';
  }

  function buildPatternButtons(root, state, onChange) {
    var wrap = root.querySelector('.pgn-pattern-list');
    if (!wrap) return;

    // Chips de filtro por categoria (criados uma vez, antes da lista)
    var filtros = root.querySelector('.pgn-filtros');
    if (!filtros) {
      filtros = document.createElement('div');
      filtros.className = 'pgn-filtros';
      filtros.setAttribute('role', 'group');
      filtros.setAttribute('aria-label', 'Filtrar padrões por estilo');
      FILTROS.forEach(function (f) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'pgn-filtro-chip' + (f.id === state.filtro ? ' is-active' : '');
        chip.setAttribute('data-filtro', f.id);
        chip.textContent = f.label;
        chip.addEventListener('click', function () {
          if (state.filtro === f.id) return;
          state.filtro = f.id;
          filtros.querySelectorAll('.pgn-filtro-chip').forEach(function (s) { s.classList.remove('is-active'); });
          chip.classList.add('is-active');
          renderList();
        });
        filtros.appendChild(chip);
      });
      wrap.parentNode.insertBefore(filtros, wrap);
    }

    function renderList() {
      wrap.innerHTML = '';
      PATTERNS.forEach(function (p) {
        if (state.filtro !== 'todos' && p.cat !== state.filtro) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pgn-pattern-btn' + (p.id === state.pattern ? ' is-active' : '');
        btn.setAttribute('data-pattern', p.id);
        btn.setAttribute('title', p.label + ' · ' + NIVEL_LABEL[p.nivel]);
        btn.innerHTML = patIcon(p.id) +
          '<span class="pgn-pattern-name">' + p.label + '</span>' +
          nivelDots(p.nivel);
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

    renderList();
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
    var initialId = root.getAttribute('data-current') || COLECOES.brick.itens[0].id;

    // Deep-link do catálogo de paginações: ?padrao=<id> pré-seleciona o padrão
    var urlPadrao = null;
    try {
      urlPadrao = new URLSearchParams(window.location.search).get('padrao');
    } catch (err) { /* navegadores sem URLSearchParams seguem no padrão default */ }
    var padraoInicial = 'corrido12';
    if (urlPadrao) {
      for (var pi = 0; pi < PATTERNS.length; pi++) {
        if (PATTERNS[pi].id === urlPadrao) { padraoInicial = urlPadrao; break; }
      }
    }

    var state = {
      brickId: findItem(initialId).id,
      pattern: padraoInicial,
      ambiente: 'claro',
      vista: 'frontal',
      filtro: 'todos',
      junta: 8,                 // mm — mesmo valor da calculadora de m²
      rejunte: REJUNTES[0]
    };

    var nameLabel = root.querySelector('.pgn-current-name');
    if (nameLabel) nameLabel.textContent = findItem(state.brickId).nome;

    var descLabel = root.querySelector('.pgn-pattern-desc');
    if (descLabel) {
      var pAtivo = PATTERNS.filter(function (p) { return p.id === state.pattern; })[0] || PATTERNS[0];
      descLabel.textContent = pAtivo.desc;
    }

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
