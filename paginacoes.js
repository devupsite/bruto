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
        { id: 'brick-zulko-claro',              nome: 'Zulko Claro',             w: 265, h: 65,
          texturas: ['brick-eco-palha-face1.webp?v=4', 'brick-eco-palha-face2.webp?v=4'] },
        { id: 'brick-ostrek-claro',        nome: 'Ostrek Claro',      w: 270, h: 70,
          texturas: ['brick-rusticatto-palha-face1.webp?v=2', 'brick-rusticatto-palha-face2.webp?v=2'] },
        { id: 'brick-ostrek-claro-verso',  nome: 'Ostrek Claro Verso', w: 270, h: 70,
          texturas: ['brick-rusticatto-palha-verso.webp?v=1', 'brick-rusticatto-palha-verso.webp?v=1'] },
        { id: 'brick-nardek-rosado',                  nome: 'Nardek Rosado',                 w: 265, h: 65,
          texturas: ['brick-lumus-face1.webp?v=4', 'brick-lumus-face2.webp?v=4'] },
        { id: 'brick-vaskir-fundo',           nome: 'Vaskir Fundo',          w: 250, h: 70,
          texturas: ['brick-mescla-prime-face1.webp?v=3', 'brick-mescla-prime-face2.webp?v=3'] },
        { id: 'brick-yandel-rosado',                 nome: 'Yandel Rosado',                w: 240, h: 70,
          texturas: ['brick-natura-face1.webp?v=4', 'brick-natura-face2.webp?v=4'] },
        { id: 'brick-kelvar-aceso',            nome: 'Kelvar Aceso',           w: 240, h: 65,
          texturas: ['brick-rosso-prime-face1.webp?v=3', 'brick-rosso-prime-face2.webp?v=3'] },
        { id: 'brick-kharun-funda',      nome: 'Kharun Funda',  w: 255, h: 70,
          texturas: ['brick-rusticatto-sertao-face1.webp?v=4', 'brick-rusticatto-sertao-face2.webp?v=4'] },
        { id: 'brick-thavrin-cinza',        nome: 'Thavrin Cinza',       w: 240, h: 65,
          texturas: ['brick-rusticatto-fume-face1.webp?v=3', 'brick-rusticatto-fume-face2.webp?v=3'] },
        { id: 'brick-thavrin-cinza-verso',  nome: 'Thavrin Cinza Verso', w: 240, h: 65,
          texturas: ['brick-rusticatto-fume-verso.webp?v=1', 'brick-rusticatto-fume-verso.webp?v=1'] },
        { id: 'brick-vanrik-rosso',       nome: 'Vanrik Rosso',      w: 270, h: 70,
          texturas: ['brick-rusticatto-rosso-face1.webp?v=4', 'brick-rusticatto-rosso-face2.webp?v=6'] },
        { id: 'brick-ulvren-negro', nome: 'Ulvren Negro', w: 260, h: 65,
          texturas: ['brick-rusticatto-terra-negra-face1.webp?v=4', 'brick-rusticatto-terra-negra-face2.webp?v=5'] },
        { id: 'brick-ulvren-negro-verso', nome: 'Ulvren Negro Verso', w: 260, h: 65,
          texturas: ['brick-rusticatto-terra-negra-verso.webp?v=1', 'brick-rusticatto-terra-negra-verso.webp?v=1'] },
        { id: 'brick-zendral-cobre',          nome: 'Zendral Cobre',      w: 260, h: 70,
          texturas: ['brick-terra-cerrado-face1.webp?v=4', 'brick-terra-cerrado-face2.webp?v=4'] }
      ]
    },
    cimenticio: {
      nome: 'Cimentício',
      itens: [
        { id: 'cimenticio-naevel-claro', nome: 'Naevel Claro', w: 260, h: 75,
          texturas: ['cimenticio-alpino-face1.webp?v=3', 'cimenticio-alpino-face2.webp?v=3'] },
        { id: 'cimenticio-sorvel-leve',  nome: 'Sorvel Leve',  w: 260, h: 75,
          texturas: ['cimenticio-brisa-face1.webp?v=2', 'cimenticio-brisa-face2.webp?v=3'] },
        { id: 'cimenticio-thurgo-denso',  nome: 'Thurgo Denso',  w: 260, h: 75,
          texturas: ['cimenticio-urban-face1.webp?v=2', 'cimenticio-urban-face2.webp?v=3'] }
      ]
    },
    rockface: {
      nome: 'Rockface',
      itens: [
        { id: 'rockface-kelthar-branco', nome: 'Kelthar Branco', w: 290, h: 95,
          texturas: ['rockface-alpino-face1.webp?v=3', 'rockface-alpino-face2.webp?v=3'] },
        { id: 'rockface-yavrin-ameno',  nome: 'Yavrin Ameno',  w: 260, h: 75,
          texturas: ['rockface-brisa-face1.webp?v=2', 'rockface-brisa-face2.webp?v=3'] },
        { id: 'rockface-rundak-bruto',  nome: 'Rundak Bruto',  w: 290, h: 95,
          texturas: ['rockface-urban-face1.webp?v=3', 'rockface-urban-face2.webp?v=1'] }
      ]
    }
  };

  function colecaoDe(id) {
    if (id && id.indexOf('cimenticio-') === 0) return COLECOES.cimenticio;
    if (id && id.indexOf('rockface-') === 0)   return COLECOES.rockface;
    return COLECOES.brick;
  }

  var THUMB_V = 2; // bump sempre que as imagens *-frontal-thumb.webp forem substituídas

  // Miniaturas dedicadas pra alguns produtos (foto de textura própria, recortada
  // pro seletor de padrão de assentamento) - usadas SÓ aqui, não mexe no
  // *-frontal-thumb.webp compartilhado com home/quiz/galeria do produto.
  var SWATCH_V = 2; // bump sempre que os arquivos *-swatch.webp forem substituídos
  var SWATCH_OVERRIDES = {
    'rockface-alpino':   'rockface-alpino-swatch.webp',
    'rockface-brisa':    'rockface-brisa-swatch.webp',
    'rockface-urban':    'rockface-urban-swatch.webp',
    'cimenticio-alpino': 'cimenticio-alpino-swatch.webp',
    'cimenticio-brisa':  'cimenticio-brisa-swatch.webp',
    'cimenticio-urban':  'cimenticio-urban-swatch.webp',
    // Kharun Funda não tinha miniatura própria -- o seletor de cor
    // (e o de segunda cor, nos padrões bicolor) caía no frontal-thumb
    // compartilhado, que na prática reaproveitava uma foto do array geral
    // do produto em vez de uma textura de perto de verdade. Reportado pelo
    // Rafael em 02/08/2026, foto nova fornecida por ele.
    // Kharun Funda não tinha miniatura própria -- o seletor de cor
    // (e o de segunda cor, nos padrões bicolor) caía no frontal-thumb
    // compartilhado, que na prática reaproveitava uma foto do array geral
    // do produto em vez de uma textura de perto de verdade. Reportado pelo
    // Rafael em 02/08/2026, foto nova fornecida por ele.
    'brick-rusticatto-sertao': 'brick-rusticatto-sertao-swatch.webp',
    // Itens "Verso" (03/08/2026): produtos novos, sem *-frontal-thumb.webp
    // (não têm página de produto própria), precisam de override sempre.
    'brick-rusticatto-fume-verso':        'brick-rusticatto-fume-verso-swatch.webp',
    'brick-rusticatto-palha-verso':       'brick-rusticatto-palha-verso-swatch.webp',
    'brick-rusticatto-terra-negra-verso': 'brick-rusticatto-terra-negra-verso-swatch.webp'
  };

  function textureUrl(id)  { return id + '-frontal.webp'; }
  function thumbUrl(id) {
    if (SWATCH_OVERRIDES[id]) return SWATCH_OVERRIDES[id] + '?v=' + SWATCH_V;
    return id + '-frontal-thumb.webp?v=' + THUMB_V;
  }
  function findItem(id) {
    var col = colecaoDe(id);
    return col.itens.filter(function (b) { return b.id === id; })[0] || col.itens[0];
  }

  // Tom médio (RGB) de cada peça, amostrado da foto real (face1) em 40x40px.
  // Gerado uma vez via script (ver README/COLABORACAO item 61) -- se uma
  // textura for substituída, regenerar esta tabela (não é crítico deixar
  // desatualizado, só faz o pareamento de cor ficar menos preciso).
  var TONS = {
    'brick-eco-palha': [174,160,134],
    'brick-rusticatto-palha': [152,141,116],
    'brick-lumus': [155,170,204],
    'brick-mescla-prime': [178,162,136],
    'brick-natura': [173,117,101],
    'brick-rosso-prime': [169,120,91],
    'brick-rusticatto-sertao': [200,139,97],
    'brick-rusticatto-fume': [45,61,73],
    'brick-rusticatto-rosso': [141,100,69],
    'brick-rusticatto-terra-negra': [58,77,92],
    'brick-terra-cerrado': [157,113,74],
    'cimenticio-alpino': [231,231,226],
    'cimenticio-brisa': [192,179,154],
    'cimenticio-urban': [151,151,151],
    'rockface-alpino': [216,219,219],
    'rockface-brisa': [207,196,153],
    'rockface-urban': [173,172,173]
  };

  function distanciaCor(idA, idB) {
    var a = TONS[idA], b = TONS[idB];
    if (!a || !b) return 999999; // sem dado -- nao prioriza nem penaliza
    var dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function getSegundaCor(brickId, baixoContraste) {
    // Escolhe automaticamente uma segunda cor da MESMA coleção, usando a
    // distância real de tom (RGB médio da foto) em vez de só "outra peça
    // qualquer da lista". Sem `baixoContraste`: pega uma peça de distância
    // MODERADA (nem a mais parecida, nem a mais diferente) -- alinhado à
    // tendência 2025-2026 de contraste sutil, não extremo (ver item 61 do
    // COLABORACAO.md). Com `baixoContraste`: pega a mais PARECIDA em tom,
    // pros padrões que a pesquisa marcou como visualmente carregados em
    // alto contraste (Cesta, Escama, Diagonal Cruzada, Cata-vento).
    var col = colecaoDe(brickId);
    var itens = col.itens;
    var candidatos = itens.filter(function (b) { return b.id !== brickId; });
    if (!candidatos.length) return itens[0];
    candidatos = candidatos.slice().sort(function (a, b) {
      return distanciaCor(brickId, a.id) - distanciaCor(brickId, b.id);
    });
    if (baixoContraste) return candidatos[0];
    var idx = Math.floor(candidatos.length / 2);
    return candidatos[idx];
  }

  // Padrões — cat segue a taxonomia do catálogo de paginações
  // (corrido / geometrico / especial); nivel: 1 fácil · 2 médio · 3 avançado
  var PATTERNS = [
    { id: 'corrido12',  label: 'Amarrado 1/2',    cat: 'corrido',    nivel: 1, bicolor: true,
      desc: 'O clássico — deslocamento de meia peça a cada fiada.' },
    { id: 'corrido13',  label: 'Terço Corrido',   cat: 'corrido',    nivel: 1, bicolor: true,
      desc: 'Deslocamento de um terço, ritmo mais alongado.' },
    { id: 'quarto',     label: 'Quarto Corrido',  cat: 'corrido',    nivel: 1, bicolor: true,
      desc: 'Deslocamento de um quarto — escalonado sutil, quase diagonal.' },
    { id: 'fiadas',     label: 'Fiadas Duplas',   cat: 'corrido',    nivel: 2, bicolor: true,
      desc: 'Pares de fiadas alinhadas, deslocando a cada dupla. Ritmo mais largo.' },
    { id: 'empilhado',  label: 'Junta a Prumo',   cat: 'corrido',    nivel: 2, bicolor: true,
      desc: 'Sem deslocamento — grid puro, leitura industrial e contemporânea.' },
    { id: 'vertical',   label: 'Vertical',        cat: 'especial',   nivel: 2, bicolor: true,
      desc: 'Peças em pé — alonga o ambiente e destaca panos de parede.' },
    { id: 'cesta',      label: 'Cesta',           cat: 'geometrico', nivel: 2, bicolor: true, baixoContraste: true,
      desc: 'Blocos alternados na horizontal e vertical — efeito de trama têxtil.' },
    { id: 'espinha',    label: 'Espinha de Peixe', cat: 'geometrico', nivel: 3, bicolor: true,
      desc: 'Peças em 45° alternadas — acabamento premium.' },
    { id: 'diagonal',   label: 'Diagonal',        cat: 'geometrico', nivel: 3, bicolor: true,
      desc: 'Amarrado girado em 45° — amplia visualmente e gera mais recortes.' },
    { id: 'flandres',   label: 'Flandrês',        cat: 'corrido',    nivel: 2, bicolor: true,
      desc: 'Alternância de uma peça deitada e uma de topo em cada fiada. Padrão europeu clássico com textura visual rica.' },
    { id: 'americano',  label: 'Americano',       cat: 'corrido',    nivel: 2, bicolor: true,
      desc: 'A cada 3 a 5 fiadas amarradas, uma fiada de topo. Cria listras horizontais de textura diferenciada.' },
    { id: 'misto',      label: 'Misto',           cat: 'geometrico', nivel: 3, bicolor: true,
      desc: 'Alternância entre fiadas horizontais e fiadas verticais — dois planos de textura distintos.' },
    { id: 'ingles',     label: 'Inglês',          cat: 'corrido',    nivel: 2, bicolor: true,
      desc: 'Fiadas alternadas de peças deitadas e fiadas inteiras de topo — um dos padrões mais antigos da alvenaria.' },
    { id: 'inglescruzado', label: 'Inglês Cruzado', cat: 'corrido',  nivel: 3, bicolor: true,
      desc: 'Variação do Inglês em que as fiadas de topo se alternam com offset, criando cruzamentos diagonais sutis.' },
    { id: 'catavento',  label: 'Cata-vento',      cat: 'geometrico', nivel: 3, bicolor: true, baixoContraste: true,
      desc: 'Quatro peças envolvem um quadrado central em rotação — forte identidade visual.' },
    { id: 'monge',      label: 'Monge',           cat: 'corrido',    nivel: 3, bicolor: true,
      desc: 'Dois tijolos deitados seguidos de um de topo em cada fiada, alternando o offset.' },
    { id: 'jardim',     label: 'Jardim',          cat: 'corrido',    nivel: 2, bicolor: true,
      desc: 'Três tijolos deitados para cada um de topo — variação mais discreta do Monge.' },
    { id: 'losango',    label: 'Losango',         cat: 'geometrico', nivel: 3, bicolor: true,
      desc: 'Paginação empilhada girada 45°, formando losangos entre as juntas.' },
    { id: 'aleatorio',  label: 'Aleatório',       cat: 'especial',   nivel: 2, bicolor: true,
      desc: 'Peças em comprimentos variados sem padrão fixo de offset — resultado orgânico e rústico.' },
    { id: 'diagonalcruzada', label: 'Diagonal Cruzada', cat: 'geometrico', nivel: 3, bicolor: true, baixoContraste: true,
      desc: 'Duas camadas em diagonais opostas (+30° e −30°) sobrepostas, formando uma trama visual complexa.' },
    { id: 'escama',     label: 'Escama',          cat: 'geometrico', nivel: 2, bicolor: true, baixoContraste: true,
      desc: 'Peças quadradas sobrepostas em offset diagonal, imitando escamas de peixe.' },
    { id: 'larga',      label: 'Junta Larga',     cat: 'corrido',    nivel: 1, bicolor: true,
      desc: 'Paginação amarrada com rejunte generoso — a junta vira elemento visual tão importante quanto o brick.' },
    { id: 'xadrezbicolor', label: 'Xadrez Bicolor', cat: 'especial', nivel: 1, bicolor: true,
      desc: 'Alternância de dois tons de brick no padrão amarrado — explora cores contrastantes da mesma linha.' },
    { id: 'modquadrado', label: 'Módulo Quadrado', cat: 'especial', nivel: 2, bicolor: true,
      desc: 'Grupos de três peças formam módulos verticais, alternados em dois tons — efeito modular e preciso.' },
    { id: 'gotico',      label: 'Gótico',          cat: 'especial', nivel: 3, bicolor: true,
      desc: 'Uma peça deitada e uma de topo em cada fiada, bicolor — padrão medieval de grande riqueza visual.' }
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

  /* ---------- Geradores novos (item 25 padrões — branch feature/paginacoes-completas) ---------- */

  function genFlandres(wallW, wallH, mw, mh, gap) {
    // Alternância de peça deitada (stretcher) e peça de topo (header) em cada fiada.
    var hw = mh * 1.2; // largura aproximada da peça "de topo"
    var rects = [];
    var stepY = mh + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    var unit = mw + gap + hw + gap;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var off = (Math.abs(r) % 2) * (unit / 2);
      var cols = Math.ceil((wallW + unit * 2) / unit) + 2;
      for (var c = -2; c < cols; c++) {
        var x = c * unit - off;
        rects.push({ x: x, y: y, w: mw, h: mh, rot: 0 });
        rects.push({ x: x + mw + gap, y: y, w: hw, h: mh, rot: 0 });
      }
    }
    return rects;
  }

  function genIngles(wallW, wallH, mw, mh, gap) {
    // Fiadas inteiras de topo alternando com fiadas inteiras deitadas.
    var hw = mh * 1.2;
    var rects = [];
    var stepY = mh + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var stretcherRow = (Math.abs(r) % 2) === 0;
      var pieceW = stretcherRow ? mw : hw;
      var stepX = pieceW + gap;
      var cols = Math.ceil((wallW + stepX * 2) / stepX) + 2;
      for (var c = -2; c < cols; c++) {
        rects.push({ x: c * stepX, y: y, w: pieceW, h: mh, rot: 0 });
      }
    }
    return rects;
  }

  function genInglesCruzado(wallW, wallH, mw, mh, gap) {
    // Igual ao Inglês, mas a fiada de topo alterna offset de meio-header a cada
    // ocorrência, criando o cruzamento diagonal sutil entre as juntas verticais.
    var hw = mh * 1.2;
    var rects = [];
    var stepY = mh + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    var headerRowCount = 0;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var stretcherRow = (Math.abs(r) % 2) === 0;
      if (stretcherRow) {
        var stepXs = mw + gap;
        var colsS = Math.ceil((wallW + stepXs * 2) / stepXs) + 2;
        for (var c = -2; c < colsS; c++) {
          rects.push({ x: c * stepXs, y: y, w: mw, h: mh, rot: 0 });
        }
      } else {
        headerRowCount++;
        var stepXh = hw + gap;
        var offH = (headerRowCount % 2) * (stepXh / 2);
        var colsH = Math.ceil((wallW + stepXh * 2) / stepXh) + 2;
        for (var c2 = -2; c2 < colsH; c2++) {
          rects.push({ x: c2 * stepXh - offH, y: y, w: hw, h: mh, rot: 0 });
        }
      }
    }
    return rects;
  }

  function genAmericano(wallW, wallH, mw, mh, gap) {
    // Fiadas amarradas normais, com uma fiada inteira de topo a cada 4 fiadas.
    var hw = mh * 1.2;
    var rects = [];
    var stepY = mh + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    var HEADER_EVERY = 4;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var rr = ((r % HEADER_EVERY) + HEADER_EVERY) % HEADER_EVERY;
      if (rr === 0) {
        var stepXh = hw + gap;
        var colsH = Math.ceil((wallW + stepXh * 2) / stepXh) + 2;
        for (var c = -2; c < colsH; c++) {
          rects.push({ x: c * stepXh, y: y, w: hw, h: mh, rot: 0 });
        }
      } else {
        var stepXs = mw + gap;
        var off = (Math.floor(r / HEADER_EVERY) % 2) * (stepXs / 2);
        var colsS = Math.ceil((wallW + stepXs * 2) / stepXs) + 2;
        for (var c2 = -2; c2 < colsS; c2++) {
          rects.push({ x: c2 * stepXs - off, y: y, w: mw, h: mh, rot: 0 });
        }
      }
    }
    return rects;
  }

  function genMonge(wallW, wallH, mw, mh, gap) {
    // Duas peças deitadas + uma de topo por unidade, offset alternando a cada fiada.
    var hw = mh * 1.2;
    var rects = [];
    var stepY = mh + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    var unit = mw * 2 + gap * 3 + hw;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var off = (Math.abs(r) % 2) * (unit / 2);
      var cols = Math.ceil((wallW + unit * 2) / unit) + 2;
      for (var c = -2; c < cols; c++) {
        var x = c * unit - off;
        rects.push({ x: x, y: y, w: mw, h: mh, rot: 0 });
        rects.push({ x: x + mw + gap, y: y, w: mw, h: mh, rot: 0 });
        rects.push({ x: x + mw * 2 + gap * 2, y: y, w: hw, h: mh, rot: 0 });
      }
    }
    return rects;
  }

  function genJardim(wallW, wallH, mw, mh, gap) {
    // Três peças deitadas + uma de topo — variação mais discreta do Monge.
    var hw = mh * 1.2;
    var rects = [];
    var stepY = mh + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    var unit = mw * 3 + gap * 4 + hw;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var off = (Math.abs(r) % 2) * (unit / 2);
      var cols = Math.ceil((wallW + unit * 2) / unit) + 2;
      for (var c = -2; c < cols; c++) {
        var x = c * unit - off;
        rects.push({ x: x, y: y, w: mw, h: mh, rot: 0 });
        rects.push({ x: x + mw + gap, y: y, w: mw, h: mh, rot: 0 });
        rects.push({ x: x + (mw + gap) * 2, y: y, w: mw, h: mh, rot: 0 });
        rects.push({ x: x + (mw + gap) * 3, y: y, w: hw, h: mh, rot: 0 });
      }
    }
    return rects;
  }

  function genLosango(wallW, wallH, mw, mh, gap) {
    // Igual ao Diagonal, mas a base é empilhada (sem offset) — forma losangos
    // regulares em vez do recorte irregular do amarrado girado.
    var R = Math.ceil(Math.sqrt(wallW * wallW + wallH * wallH)) + mw * 2;
    var base = genCorrido(R, R, mw, mh, gap, 0);
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

  function seededRand(seed) {
    var x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function genAleatorio(wallW, wallH, mw, mh, gap) {
    // Peças de comprimento variável, sem offset fixo — irregularidade
    // controlada por um pseudo-random determinístico (estável entre re-renders,
    // não usa Math.random() puro pra não "piscar" a cada resize).
    var rects = [];
    var stepY = mh + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var x = -mw * 2;
      var seed = r * 97 + 1;
      var guard = 0;
      while (x < wallW + mw * 2 && guard < 200) {
        var variance = 0.55 + seededRand(seed) * 0.9; // 0.55x–1.45x da largura padrão
        var w = mw * variance;
        rects.push({ x: x, y: y, w: w, h: mh, rot: 0 });
        x += w + gap;
        seed += 1.7;
        guard++;
      }
    }
    return rects;
  }

  function genCataVento(wallW, wallH, mw, mh, gap) {
    // Módulo quadrado: 4 peças em rotação ao redor de um quadrado central.
    var rects = [];
    var B = mw; // lado do módulo
    var legW = mh; // espessura da peça
    var legLen = B - legW;
    if (legLen <= 0) legLen = B * 0.5; // guarda contra proporções degeneradas
    var stepB = B + gap;
    var rows = Math.ceil(wallH / stepB) + 2;
    var cols = Math.ceil(wallW / stepB) + 2;
    for (var r = -1; r < rows; r++) {
      for (var c = -1; c < cols; c++) {
        var X = c * stepB, Y = r * stepB;
        // rot 0.001 (em vez de 0): imperceptível visualmente, mas força o
        // motor a usar o recorte proporcional por peça (background-size:
        // cover) em vez do truque de "janela" na textura contínua da parede
        // — necessário porque essas peças não têm a proporção real do
        // tijolo fotografado, e a janela contínua as deixava esticadas.
        rects.push({ x: X, y: Y, w: legLen, h: legW, rot: 0.001 });
        rects.push({ x: X + B - legW, y: Y, w: legW, h: legLen, rot: 90 });
        rects.push({ x: X + legW, y: Y + B - legW, w: legLen, h: legW, rot: 0.001 });
        rects.push({ x: X, y: Y + legW, w: legW, h: legLen, rot: 90 });
        var centerSide = Math.max(4, legLen - gap);
        rects.push({ x: X + legW, y: Y + legW, w: centerSide, h: centerSide, rot: 0.001 });
      }
    }
    return rects;
  }

  function genDiagonalAngulo(wallW, wallH, mw, mh, gap, angleDeg, offsetFrac) {
    var R = Math.ceil(Math.sqrt(wallW * wallW + wallH * wallH)) + mw * 2;
    var base = genCorrido(R, R, mw, mh, gap, offsetFrac == null ? 0.5 : offsetFrac);
    var rad = angleDeg * Math.PI / 180;
    var cos = Math.cos(rad), sin = Math.sin(rad);
    var half = R / 2;
    return base.map(function (b) {
      var cx = b.x + b.w / 2 - half;
      var cy = b.y + b.h / 2 - half;
      var nx = cx * cos - cy * sin + wallW / 2;
      var ny = cx * sin + cy * cos + wallH / 2;
      return { x: nx - b.w / 2, y: ny - b.h / 2, w: b.w, h: b.h, rot: angleDeg };
    });
  }

  function genDiagonalCruzada(wallW, wallH, mw, mh, gap) {
    // Duas camadas diagonais opostas (+30°/-30°), com gap ampliado em cada
    // camada pra sobra "respirar" entre as duas tramas sobrepostas.
    var gapWide = gap * 3;
    var layer1 = genDiagonalAngulo(wallW, wallH, mw, mh, gapWide, 30, 0.5);
    var layer2 = genDiagonalAngulo(wallW, wallH, mw, mh, gapWide, -30, 0.5);
    return layer1.concat(layer2);
  }

  function genEscama(wallW, wallH, mw, mh, gap) {
    // Quadrados sobrepostos em offset diagonal, imitando escamas — cada fiada
    // é pintada por cima da anterior (array em ordem topo→base).
    var rects = [];
    var S = mw * 0.8;
    var overlapY = S * 0.35;
    var stepY = S - overlapY;
    var stepX = S + gap;
    var rows = Math.ceil(wallH / stepY) + 3;
    var cols = Math.ceil(wallW / stepX) + 3;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var off = (Math.abs(r) % 2) * (stepX / 2);
      for (var c = -2; c < cols; c++) {
        var x = c * stepX - off;
        // rot 0.001: mesma correção do Cata-vento -- peça quadrada, não usa
        // a proporção real do tijolo, então precisa do recorte por peça
        // (cover) em vez da janela contínua na parede, senão distorce.
        rects.push({ x: x, y: y, w: S, h: S, rot: 0.001 });
      }
    }
    return rects;
  }

  function genXadrezBicolor(wallW, wallH, mw, mh, gap) {
    // Amarrado normal (igual corrido12), mas cada peça carrega colorIdx
    // 0 ou 1 num xadrez real -- considera o deslocamento de meia-peça de
    // cada fiada pra alternância ficar em diagonal, não em coluna reta.
    var rects = [];
    var stepY = mh + gap;
    var stepX = mw + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var off = (Math.abs(r) % 2) * (mw * 0.5);
      var cols = Math.ceil((wallW + mw * 2) / stepX) + 2;
      for (var c = -2; c < cols; c++) {
        var x = c * stepX - off;
        var colorIdx = ((Math.abs(r) % 2) + (((c % 2) + 2) % 2)) % 2;
        rects.push({ x: x, y: y, w: mw, h: mh, rot: 0, colorIdx: colorIdx });
      }
    }
    return rects;
  }

  function genModuloQuadrado(wallW, wallH, mw, mh, gap) {
    // Módulos verticais de 3 peças empilhadas (mw de largura, 3×mh de
    // altura), lado a lado, alternando colorIdx a cada módulo.
    var rects = [];
    var moduleH = mh * 3 + gap * 2;
    var stepX = mw + gap;
    var stepY = moduleH + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    var cols = Math.ceil(wallW / stepX) + 2;
    for (var r = -1; r < rows; r++) {
      for (var c = -1; c < cols; c++) {
        var X = c * stepX;
        var Y = r * stepY;
        var colorIdx = ((r + c) % 2 + 2) % 2;
        for (var i = 0; i < 3; i++) {
          rects.push({ x: X, y: Y + i * (mh + gap), w: mw, h: mh, rot: 0, colorIdx: colorIdx });
        }
      }
    }
    return rects;
  }

  function genGotico(wallW, wallH, mw, mh, gap) {
    // Mesma geometria do Flandrês (deitada + topo em cada fiada), mas cada
    // peça de topo usa colorIdx 1 -- contraste entre a fiada corrida e a
    // peça de topo, como descrito ("uma peça deitada e uma de topo... bicolor").
    var hw = mh * 1.2;
    var rects = [];
    var stepY = mh + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    var unit = mw + gap + hw + gap;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var off = (Math.abs(r) % 2) * (unit / 2);
      var cols = Math.ceil((wallW + unit * 2) / unit) + 2;
      for (var c = -2; c < cols; c++) {
        var x = c * unit - off;
        rects.push({ x: x, y: y, w: mw, h: mh, rot: 0, colorIdx: 0 });
        rects.push({ x: x + mw + gap, y: y, w: hw, h: mh, rot: 0, colorIdx: 1 });
      }
    }
    return rects;
  }

  function genMisto(wallW, wallH, mw, mh, gap) {
    // Faixas alternadas: fiadas horizontais amarradas / peças verticais.
    var rects = [];
    var bandH = mh * 3 + gap * 3;
    var bands = Math.ceil(wallH / bandH) + 2;
    for (var b = -1; b < bands; b++) {
      var bandY = b * bandH;
      var horizontal = (Math.abs(b) % 2) === 0;
      if (horizontal) {
        var rowsInBand = 3;
        for (var i = 0; i < rowsInBand; i++) {
          var y = bandY + i * (mh + gap);
          var off = (i % 2) * (mw + gap) / 2;
          var stepX = mw + gap;
          var cols = Math.ceil((wallW + stepX * 2) / stepX) + 2;
          for (var c = -2; c < cols; c++) {
            rects.push({ x: c * stepX - off, y: y, w: mw, h: mh, rot: 0 });
          }
        }
      } else {
        var stepXv = mh + gap;
        var stepYv = mw + gap;
        var colsV = Math.ceil(wallW / stepXv) + 2;
        var rowsV = Math.ceil(bandH / stepYv) + 2;
        for (var cv = -1; cv < colsV; cv++) {
          var offv = (Math.abs(cv) % 2) * stepYv * 0.5;
          for (var rv = -1; rv < rowsV; rv++) {
            var cx = cv * stepXv + mh / 2;
            var cy = bandY + rv * stepYv - offv + mw / 2;
            rects.push({ x: cx - mw / 2, y: cy - mh / 2, w: mw, h: mh, rot: 90 });
          }
        }
      }
    }
    return rects;
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
    var rects = (function () {
      switch (patternId) {
        case 'corrido13': return genCorrido(wallW, wallH, mw, mh, gap, 1 / 3);
        case 'quarto':     return genCorrido(wallW, wallH, mw, mh, gap, 1 / 4);
        case 'fiadas':     return genCorrido(wallW, wallH, mw, mh, gap, 0.5, 2);
        case 'empilhado':  return genEmpilhado(wallW, wallH, mw, mh, gap);
        case 'vertical':   return genVertical(wallW, wallH, mw, mh, gap);
        case 'cesta':      return genCesta(wallW, wallH, mw, mh, gap);
        case 'diagonal':   return genDiagonal(wallW, wallH, mw, mh, gap);
        case 'espinha':    return genEspinha(wallW, wallH, mw, gap);
        case 'flandres':        return genFlandres(wallW, wallH, mw, mh, gap);
        case 'ingles':           return genIngles(wallW, wallH, mw, mh, gap);
        case 'inglescruzado':    return genInglesCruzado(wallW, wallH, mw, mh, gap);
        case 'americano':        return genAmericano(wallW, wallH, mw, mh, gap);
        case 'monge':            return genMonge(wallW, wallH, mw, mh, gap);
        case 'jardim':           return genJardim(wallW, wallH, mw, mh, gap);
        case 'losango':          return genLosango(wallW, wallH, mw, mh, gap);
        case 'aleatorio':        return genAleatorio(wallW, wallH, mw, mh, gap);
        case 'catavento':        return genCataVento(wallW, wallH, mw, mh, gap);
        case 'diagonalcruzada':  return genDiagonalCruzada(wallW, wallH, mw, mh, gap);
        case 'escama':           return genEscama(wallW, wallH, mw, mh, gap);
        case 'misto':            return genMisto(wallW, wallH, mw, mh, gap);
        case 'larga':            return genCorrido(wallW, wallH, mw, mh, gap * 2.5, 0.5);
        case 'xadrezbicolor':    return genXadrezBicolor(wallW, wallH, mw, mh, gap);
        case 'modquadrado':      return genModuloQuadrado(wallW, wallH, mw, mh, gap);
        case 'gotico':           return genGotico(wallW, wallH, mw, mh, gap);
        case 'corrido12':
        default:           return genCorrido(wallW, wallH, mw, mh, gap, 0.5);
      }
    })();
    return colorirPecas(patternId, rects, mw, mh, gap);
  }

  function colorirPecas(patternId, rects, mw, mh, gap) {
    // Aplica `colorIdx` (0 ou 1) por peça pra padrões bicolor cuja função
    // geradora NÃO já define isso sozinha (xadrezbicolor/modquadrado/gotico
    // continuam com a lógica própria deles, embutida na geometria -- essa
    // função não mexe nesses três). Roda só com base em x/y/w/h/rot que já
    // existem no retângulo -- nenhuma das 22 funções geradoras precisou ser
    // alterada pra isso. Regras vêm do item 61 do COLABORACAO.md (pesquisa
    // de convenção real de alvenaria/revestimento bicolor).
    function marcar(fn) {
      return rects.map(function (r) {
        var novo = {};
        for (var k in r) novo[k] = r[k];
        novo.colorIdx = fn(r);
        return novo;
      });
    }
    switch (patternId) {
      // Família corrido: xadrez por posição (linha/coluna)
      case 'corrido12': case 'corrido13': case 'quarto': case 'fiadas':
      case 'empilhado': case 'larga':
        return marcar(function (r) {
          var col = Math.round(r.x / Math.max(r.w, 1));
          var row = Math.round(r.y / Math.max(r.h, 1));
          return ((row % 2) + (col % 2) + 4) % 2;
        });
      // Vertical: listra por coluna
      case 'vertical':
        return marcar(function (r) {
          var col = Math.round(r.x / Math.max(r.w, 1));
          return ((col % 2) + 2) % 2;
        });
      // Família diagonal: faixa diagonal (não xadrez por peça)
      case 'diagonal': case 'losango':
        return marcar(function (r) {
          var banda = Math.max(mw, mh) * 1.4;
          var idx = Math.floor((r.x + r.y) / banda);
          return ((idx % 2) + 2) % 2;
        });
      // Família clássico (diaper bond): peça de topo (mais estreita) recebe
      // a cor de destaque, peça deitada fica na cor base
      case 'flandres': case 'ingles': case 'inglescruzado':
      case 'americano': case 'monge': case 'jardim':
        return marcar(function (r) { return r.w < mw * 0.75 ? 1 : 0; });
      // Espinha de Peixe: mistura de tom 50/50 (não por orientação da perna
      // -- pesquisa mostrou que não é a convenção de mercado real)
      // Espinha de Peixe: cada FILEIRA inteira já tem uma única orientação
      // (45°/135°, alternando linha a linha -- ver comentário em
      // genEspinha). Usar esse sinal pronto pra colorir gera faixa
      // horizontal limpa, sem risco de desalinhamento como uma banda
      // diagonal genérica teria nessa geometria específica.
      case 'espinha':
        return marcar(function (r) { return r.rot === 135 ? 1 : 0; });
      // Aleatório: mistura ponderada 70/30 (convenção real de blend de
      // tijolo — mínimo de 3 tons na prática, aqui simplificado pra 2)
      case 'aleatorio':
        return marcar(function (r) {
          return seededRand(r.x * 0.13 + r.y * 0.29 + 7) < 0.7 ? 0 : 1;
        });
      // Cesta e Misto: já alternam rot 0°/90° por módulo/faixa na própria
      // geometria -- reaproveita esse sinal como cor
      case 'cesta': case 'misto':
        return marcar(function (r) { return r.rot === 90 ? 1 : 0; });
      // Escama: por fiada (banda de cor), como telhado de ardósia bicolor
      case 'escama':
        return marcar(function (r) {
          var row = Math.round(r.y / Math.max(r.h, 1));
          return ((row % 2) + 2) % 2;
        });
      // Diagonal Cruzada: uma cor sólida por camada (+30° vs -30°)
      case 'diagonalcruzada':
        return marcar(function (r) { return r.rot > 0 ? 0 : 1; });
      // Cata-vento: só a peça central (quadrada) recebe a cor de destaque
      case 'catavento':
        return marcar(function (r) { return Math.abs(r.w - r.h) < 2 ? 1 : 0; });
      default:
        return rects; // xadrezbicolor / modquadrado / gotico já vêm prontos
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

    // Padrões bicolor (agora os 25 suportam -- ver item 61 do
    // COLABORACAO.md), mas só entram em modo bicolor se `state.usarBicolor`
    // estiver ligado (checkbox opt-in) -- nenhum padrão vem bicolor por
    // padrão. Peças com colorIdx === 1 usam a segunda cor quando ativo.
    var patternDef = null;
    for (var pi = 0; pi < PATTERNS.length; pi++) { if (PATTERNS[pi].id === state.pattern) { patternDef = PATTERNS[pi]; break; } }
    var pecaB = null, texturasB = null, urlB = null;
    if (patternDef && patternDef.bicolor && state.usarBicolor) {
      pecaB = findItem(state.brickIdB || getSegundaCor(state.brickId, !!patternDef.baixoContraste).id);
      texturasB = pecaB.texturas || null;
      urlB = "url('" + textureUrl(pecaB.id) + "')";
    }

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

      var usaSegundaCor = b.colorIdx === 1 && pecaB;
      var texturasAtivo = usaSegundaCor ? texturasB : texturas;
      var urlAtivo = usaSegundaCor ? urlB : url;

      if (texturasAtivo) {
        var face = Math.floor(hashPos(b.x, b.y, 1) * texturasAtivo.length) % texturasAtivo.length;
        var gira = hashPos(b.x, b.y, 2) > 0.5;
        el.style.backgroundImage = "url('" + texturasAtivo[face] + "')";
        // cover em vez de "100% 100%": recorta proporcionalmente ao centro
        // em vez de esticar a foto pra caber na caixa. Pra peças com a
        // proporção natural do tijolo (a maioria dos padrões já existentes)
        // o resultado é idêntico -- só passa a importar (e corrige a
        // distorção) nas peças com formato diferente, como os quadrados de
        // Escama e Cata-vento.
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = '50% 50%';
        var ang = (b.rot || 0) + (gira ? 180 : 0);
        if (ang) {
          el.style.transformOrigin = 'center center';
          el.style.transform = 'rotate(' + ang + 'deg)';
        }
      } else if (b.rot) {
        el.style.transformOrigin = 'center center';
        el.style.transform = 'rotate(' + b.rot + 'deg)';
        el.style.backgroundImage = urlAtivo;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = '50% 50%';
      } else {
        // truque de "janela reveladora": a textura cobre toda a
        // parede numa única escala e cada peça revela seu recorte,
        // criando continuidade fotográfica entre as peças.
        // (bicolor sem `texturas` fotográfica: cai aqui só se a peça B
        // também não tiver `texturas`; usa a mesma janela contínua da
        // peça B, ainda proporcional porque essas peças normalmente têm
        // w/h do tijolo natural nos padrões bicolor que criamos.)
        el.style.backgroundImage = urlAtivo;
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

  function buildSwatchesB(root, state, onChange) {
    // Espelha buildSwatches, mas pra segunda cor dos padrões bicolor
    // (Xadrez Bicolor, Módulo Quadrado, Gótico). Só fica visível quando o
    // padrão ativo tem `bicolor: true` -- ver toggleSwatchesBVisibility em
    // initOne. Marca `state.brickIdBManual = true` ao ser usado, pra
    // avisar o resto do código que a pessoa escolheu à mão e o
    // auto-pareamento (getSegundaCor) não deve mais sobrescrever.
    var wrap = root.querySelector('.pgn-swatches-b');
    if (!wrap) return;
    wrap.innerHTML = '';
    colecaoDe(state.brickId).itens.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pgn-swatch' + (b.id === state.brickIdB ? ' is-active' : '');
      btn.setAttribute('data-brick', b.id);
      btn.setAttribute('title', b.nome);
      btn.setAttribute('aria-label', b.nome + ' (segunda cor)');
      btn.innerHTML = '<img src="' + thumbUrl(b.id) + '" alt="' + b.nome + '" loading="lazy">';
      btn.addEventListener('click', function () {
        if (state.brickIdB === b.id) return;
        state.brickIdB = b.id;
        state.brickIdBManual = true;
        wrap.querySelectorAll('.pgn-swatch').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
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
    if (id === 'flandres' || id === 'ingles')   { for (i = 0; i < 3; i++) { s += r(4, 4 + i * 11, 20, 9); s += r(28, 4 + i * 11, 9, 9); s += r(41, 4 + i * 11, 20, 9); } }
    if (id === 'inglescruzado') { for (i = 0; i < 3; i++) { var hx = (i % 2) * 5; s += r(4, 4 + i * 11, 20, 9); s += r(28 + hx, 4 + i * 11, 9, 9); s += r(41 + hx, 4 + i * 11, 20, 9); } }
    if (id === 'americano')  { s = r(4, 4, 60, 8) + r(4, 15, 28, 8) + r(36, 15, 28, 8) + r(4, 26, 28, 8) + r(36, 26, 28, 8); }
    if (id === 'monge')      { for (i = 0; i < 2; i++) { var mx = (i % 2) * 8; s += r(4 + mx, 4 + i * 15, 18, 9) + r(24 + mx, 4 + i * 15, 18, 9) + r(44 + mx, 4 + i * 15, 9, 9); } }
    if (id === 'jardim')     { s = r(4, 6, 14, 9) + r(20, 6, 14, 9) + r(36, 6, 14, 9) + r(52, 6, 8, 9) + r(4, 21, 14, 9) + r(20, 21, 14, 9) + r(36, 21, 14, 9) + r(52, 21, 8, 9); }
    if (id === 'losango')    { s = '<g transform="rotate(45 34 20)">'; for (i = -1; i < 3; i++) for (c = -1; c < 3; c++) s += r(2 + c * 22, 2 + i * 11, 20, 9); s += '</g>'; }
    if (id === 'aleatorio')  { s = r(4, 4, 14, 9) + r(21, 4, 24, 9) + r(48, 4, 12, 9) + r(4, 15, 26, 9) + r(33, 15, 16, 9) + r(52, 15, 10, 9) + r(4, 26, 20, 9) + r(27, 26, 30, 9); }
    if (id === 'catavento')  { s = r(4, 4, 20, 8) + r(26, 4, 8, 20) + r(12, 26, 20, 8) + r(4, 12, 8, 20) + r(12, 12, 8, 8); }
    if (id === 'diagonalcruzada') { s = '<g transform="rotate(30 34 20)">' + r(4, 18, 60, 5) + '</g><g transform="rotate(-30 34 20)">' + r(4, 18, 60, 5) + '</g><g transform="rotate(30 34 20)">' + r(4, 8, 60, 5) + '</g><g transform="rotate(-30 34 20)">' + r(4, 28, 60, 5) + '</g>'; }
    if (id === 'escama')     { for (i = 0; i < 2; i++) for (c = -1; c < 4; c++) s += r(4 + c * 17 + (i % 2) * 8.5, 4 + i * 14, 15, 15); }
    if (id === 'misto')      { s = r(4, 4, 60, 6) + r(4, 12, 60, 6) + r(4, 22, 9, 14) + r(15, 22, 9, 14) + r(26, 22, 9, 14) + r(37, 22, 9, 14) + r(48, 22, 9, 14); }
    if (id === 'larga')      { for (i = 0; i < 3; i++) for (c = -1; c < 3; c++) s += r(5 + c * 24 + (i % 2) * 12, 5 + i * 12, 19, 8); }
    if (id === 'xadrezbicolor') { for (i = 0; i < 3; i++) for (c = -1; c < 3; c++) s += r(4 + c * 22 + (i % 2) * 11, 4 + i * 11, 20, 9); }
    if (id === 'modquadrado') { for (c = 0; c < 4; c++) for (i = 0; i < 3; i++) s += r(4 + c * 16, 4 + i * 11, 13, 9); }
    if (id === 'gotico')     { for (i = 0; i < 3; i++) { s += r(4, 4 + i * 11, 20, 9); s += r(28, 4 + i * 11, 9, 9); s += r(41, 4 + i * 11, 20, 9); } }
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
      brickIdB: null,            // segunda cor -- preenchido logo abaixo
      brickIdBManual: false,     // true assim que a pessoa escolher a segunda cor à mão
      usarBicolor: false,        // opt-in -- todos os 25 padrões suportam, mas nenhum come\u00e7a bicolor sozinho
      pattern: padraoInicial,
      ambiente: 'claro',
      vista: 'frontal',
      filtro: 'todos',
      junta: 8,                 // mm — mesmo valor da calculadora de m²
      rejunte: REJUNTES[0]
    };

    function padraoAtivo() {
      return PATTERNS.filter(function (p) { return p.id === state.pattern; })[0] || PATTERNS[0];
    }

    state.brickIdB = getSegundaCor(state.brickId, !!padraoAtivo().baixoContraste).id;

    var nameLabel = root.querySelector('.pgn-current-name');
    if (nameLabel) nameLabel.textContent = findItem(state.brickId).nome;

    var descLabel = root.querySelector('.pgn-pattern-desc');
    if (descLabel) descLabel.textContent = padraoAtivo().desc;

    var checkboxBicolor = root.querySelector('.pgn-bicolor-checkbox');

    function toggleSwatchesBVisibility() {
      var wrapB = root.querySelector('.pgn-swatches-b');
      if (wrapB) wrapB.hidden = !state.usarBicolor;
    }

    function rerender() {
      renderWall(root, state);
      var colorLink = root.querySelector('.pgn-color-link');
      if (colorLink) colorLink.setAttribute('href', 'produto-' + state.brickId + '.html');
    }

    if (checkboxBicolor) {
      checkboxBicolor.addEventListener('change', function () {
        state.usarBicolor = checkboxBicolor.checked;
        toggleSwatchesBVisibility();
        rerender();
      });
    }

    // onChange da cor PRIMÁRIA: se a segunda cor ainda não foi escolhida à
    // mão, recalcula o auto-pareamento (respeitando baixoContraste do
    // padrão ativo) pra acompanhar a nova cor primária.
    function onPrimaryChange() {
      if (!state.brickIdBManual) {
        state.brickIdB = getSegundaCor(state.brickId, !!padraoAtivo().baixoContraste).id;
        buildSwatchesB(root, state, onSecondaryChange);
      }
      rerender();
    }

    function onSecondaryChange() {
      rerender();
    }

    // onChange do PADRÃO: se a segunda cor não foi escolhida à mão,
    // recalcula o auto-pareamento -- padrões diferentes podem pedir
    // baixoContraste diferente. O checkbox "usar duas cores" NÃO muda
    // sozinho ao trocar de padrão (fica como a pessoa deixou).
    function onPatternChange() {
      if (!state.brickIdBManual) {
        state.brickIdB = getSegundaCor(state.brickId, !!padraoAtivo().baixoContraste).id;
        buildSwatchesB(root, state, onSecondaryChange);
      }
      rerender();
    }

    buildSwatches(root, state, onPrimaryChange);
    buildSwatchesB(root, state, onSecondaryChange);
    toggleSwatchesBVisibility();
    buildPatternButtons(root, state, onPatternChange);
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
