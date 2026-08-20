// ============================================================
// UP Co. Suite — CLIENT_CONFIG
// Instância: BRUTO Cerâmica (brutoceramica.com.br)
// ============================================================
// Único arquivo editado no onboarding de cada cliente.
// Todos os módulos lêem daqui. Nunca hardcode dados de cliente
// fora deste bloco.
// ============================================================

const DEMO_MODE = false; // false em produção real. A suíte já operou em produção (backend real, todas as pontes testadas) por mais de uma semana antes de public_html/up/ ser apagado por um deploy Git que mirava um estado desatualizado do repo (ver COLABORACAO.md, item sobre pastas fora do Git). bruto-secrets/API/ fica FORA de public_html — não foi tocado por esse deploy, então o backend real deve seguir intacto no servidor. Confirmar isso ao subir esta versão antes de assumir que está tudo certo.

const CLIENT_CONFIG = {
  // ── Identidade ──────────────────────────────────────────
  empresa_id:           'bruto-ceramica',
  empresa:              'BRUTO',
  setor:                'Curadoria de revestimentos cerâmicos artesanais',
  porte:                'micro',
  cidade:               'São Paulo, SP',
  tempo_mercado:        '2 anos',

  // ── Financeiro ──────────────────────────────────────────
  faturamento_estimado: 'R$ 45.000/mês',
  ticket_medio:         'R$ 3.200',
  meta_mrr:             55000,

  // ── Comercial ───────────────────────────────────────────
  publico_alvo:         'Arquitetos, designers, construtoras, revendedores e residencial de alta exigência',
  principais_servicos:  [
    'Brick — tijolinho aparente artesanal (11 modelos)',
    'Cimentício — acabamento liso contemporâneo (3 modelos)',
    'Rockface — texturizado tipo pedra, uso externo (3 modelos)'
  ],
  sazonalidade:         'Maior volume de especificação em projetos de arquitetura no início do ano; picos de fechamento acompanhando cronograma de obra dos clientes B2B.',

  // ── Estratégia ──────────────────────────────────────────
  dores_mapeadas: [
    'Leads de campanha esfriando sem follow-up estruturado (sem visão de funil hoje)',
    'Nenhum controle financeiro consolidado além do Precificador de orçamento',
    'Pedidos e amostras sem visão executiva de gargalo (produção, frete, aprovação)'
  ],
  objetivos: [
    'Reduzir orçamento parado sem follow-up para menos de 48h',
    'Consolidar visão financeira semanal (receita vs. meta, saldo, contas a pagar)',
    'Migrar Precificador para precificador.brutoceramica.com.br'
  ],
  kpis_criticos: [
    'Orçamentos enviados x aprovados',
    'Tempo médio até resposta do lead',
    'Amostras solicitadas x pedidos fechados'
  ],

  // ── Comunicação ─────────────────────────────────────────
  tom_voz: 'Direto, técnico, sem enrolação. Fala como quem entende de obra e de projeto — não como quem empurra revestimento genérico. Honesto sobre prazo e variação natural do artesanal.',
  contexto_adicional: 'Bruto não fabrica — é curadoria com parceria direta de fábrica. Site institucional + 3 ferramentas próprias já em produção (Atendimento Técnico com IA, Ordem de Serviço, Precificador). A Suíte UP entra como camada de visão executiva por cima dessas ferramentas, sem duplicar o que já existe.',

  // ── Contato oficial ──────────────────────────────────────
  // Conferido em 12/08/2026 contra a KB de produção (atendimento/index.html)
  // e o restante do repositório — é o único WhatsApp/e-mail real que aparece
  // em qualquer lugar do site. Os valores anteriores aqui (99004-9468 /
  // bruto.com.br) estavam errados — domínio e número inventados/desatualizados.
  whatsapp_phone:   '+55 11 95045-8882',
  email_oficial:    'contato@brutoceramica.com.br',
  evolution_api_url: '', // preencher em produção, se decidido reativar

  // ── UP·Voice — alertas proativos ─────────────────────────
  rafael_whatsapp:      '', // WhatsApp do responsável Bruto que recebe cópia dos alertas — preencher
  voice_daily_limit:    1,     // máximo de alertas ao cliente final por dia
  voice_require_approval: true, // responsável aprova antes de enviar ao cliente final

  // ── Backend (produção) ───────────────────────────────────
  // A Bruto roda em Hostinger compartilhado (PHP + MySQL, sem Node/Supabase).
  // Em produção, DATA_LAYER deve apontar para endpoints PHP próprios lendo
  // o banco u764636502_bruto_interno — não para Supabase.
  // Preenchido quando a ponte PHP estiver pronta. Em DEMO_MODE, ignorado.
  api_base_url:  '', // ex: 'https://up.brutoceramica.com.br/api'
};

// ── Camada de operação BRUTO ────────────────────────────────
// Vocabulário e regras do segmento de revestimento por especificação.
// Os módulos leem daqui em vez de usar termos genéricos de CRM/PME.
// Fonte: KB do Atendimento Técnico (catálogo, prazos, tipos de cliente)
// + pesquisa de mercado do segmento.
const BRUTO_OPS = {

  // Amostra física — regras oficiais (fonte: KB do Atendimento).
  // Ponto que já gerou informação errada antes: o frete NÃO é grátis.
  // "Amostras em casa" é o serviço, não uma isenção de frete.
  amostra: {
    max_por_pedido:    3,
    frete_gratis:      false,  // cliente paga; valor varia por região e é
                               // confirmado ANTES do envio, nunca prometido de cabeça
    custo_peca_medio:  63,     // custo médio da peça enviada — sai do bolso da Bruto
    followup_dias:     7,      // sem retorno após esse prazo → alerta
    // Por que rastrear por modelo: são 17 SKUs e cada amostra despachada é
    // peça real com custo. Modelo que consome amostra e nunca vira pedido é
    // prejuízo recorrente invisível — só aparece somando meses.
    rastrear_por_modelo: true,
  },

  // Etapas do funil — venda por especificação, não SaaS.
  // A amostra física é etapa própria porque é o momento de maior
  // risco de esfriamento: o material sai da mão da Bruto e a decisão
  // passa a acontecer sem acompanhamento.
  funil: [
    { id:'contato',    nome:'Contato',          cor:'#6E6E6E', desc:'Chegou pelo site, anúncio ou WhatsApp' },
    { id:'qualificado',nome:'Qualificado',      cor:'#8B5CF6', desc:'Sabemos linha, metragem e tipo de cliente' },
    { id:'amostra',    nome:'Amostra enviada',  cor:'#D44000', desc:'Peça física na mão de quem decide' },
    { id:'orcamento',  nome:'Orçamento',        cor:'#F5A623', desc:'Valor e prazo confirmados por consultor' },
    { id:'fechamento', nome:'Fechamento',       cor:'#27AE60', desc:'Negociando condição, prazo ou volume' },
    { id:'ganho',      nome:'Pedido ✓',         cor:'#27AE60', desc:'Virou OS' },
    { id:'perdido',    nome:'Perdido',          cor:'#E74C3C', desc:'Sem resposta, escolheu outro ou desistiu' },
  ],

  // Tipos de cliente — espelham exatamente o enum já usado no
  // Atendimento Técnico (`clienteTipo`). Não inventar categorias novas:
  // qualquer divergência quebra o join com as sessões reais.
  tipos_cliente: [
    { id:'arquiteto',   nome:'Arquiteto/Designer', ciclo:'longo',  nota:'Especifica para o cliente final — decisão em duas camadas' },
    { id:'construtor',  nome:'Construtor',         ciclo:'longo',  nota:'Volume maior, preso ao cronograma de obra' },
    { id:'revendedor',  nome:'Revendedor',         ciclo:'longo',  nota:'Condição comercial fora do catálogo — sempre escalar' },
    { id:'residencial', nome:'Residencial (DIY)',  ciclo:'curto',  nota:'Decide sozinho, ciclo mais rápido, ticket menor' },
    { id:'comercial',   nome:'Comercial',          ciclo:'medio',  nota:'Fachada/loja — prazo costuma ser o fator crítico' },
    { id:'outro',       nome:'Outro',              ciclo:'medio',  nota:'' },
  ],

  // Linhas do catálogo real — faixa de preço por m² (fonte: KB)
  linhas: [
    { id:'brick',      nome:'Brick',      modelos:11, faixa:[104.90, 197.90], uso:'Interno e externo' },
    { id:'cimenticio', nome:'Cimentício', modelos:3,  faixa:[186.90, 186.90], uso:'Interno e externo' },
    { id:'rockface',   nome:'Rockface',   modelos:3,  faixa:[186.90, 252.90], uso:'Exclusivamente externo' },
  ],

  // Regras operacionais que viram alerta automático nos módulos
  slas: {
    resposta_lead_horas:        24,  // lead sem resposta vira alerta
    orcamento_parado_horas:     48,  // orçamento sem retorno vira alerta
    amostra_followup_dias:       7,  // amostra entregue sem contato vira alerta
    confirmacao_data_dias_uteis: 3,  // prazo pra dar data exata ao cliente
    entrega_dias_uteis:      [7,15], // prazo total (produção + frete já somados)
  },

  // Cadência de follow-up — venda por especificação morre por silêncio,
  // não por objeção. Referência de mercado: a maior taxa de conversão
  // acontece a partir do 7º contato, mas quase metade das empresas não
  // faz nem o primeiro follow-up e só ~10% passam de três.
  cadencia_followup: [
    { toque:1, quando:'D+1',  canal:'WhatsApp', objetivo:'Confirmar que recebeu e tirar dúvida técnica' },
    { toque:2, quando:'D+3',  canal:'WhatsApp', objetivo:'Oferecer amostra física se ainda não pediu' },
    { toque:3, quando:'D+7',  canal:'Ligação',  objetivo:'Entender em que estágio está o projeto' },
    { toque:4, quando:'D+14', canal:'WhatsApp', objetivo:'Mandar aplicação real parecida com o projeto dele' },
    { toque:5, quando:'D+30', canal:'WhatsApp', objetivo:'Checar se a obra saiu do papel' },
  ],
};

// ── Escopo ativo da suíte ───────────────────────────────────
// Operação de 3 pessoas não sustenta 10 painéis. Núcleo = uso diário.
// Apoio = consulta pontual. Adiado = fica no código, some da navegação
// até fazer sentido (basta mover o id de volta para ligar).
const SUITE_LAYOUT = {
  nucleo:  ['up-dash', 'up-lead', 'up-flow', 'up-vault'],
  apoio:   ['up-base', 'up-voice', 'up-gos', 'up-team'],
  adiado:  ['up-core', 'up-mind'],
};

// ── Exposição global ────────────────────────────────────────
// `const` no topo de um script clássico NÃO vira propriedade de window.
// Os módulos acessam via window.*, então a ligação é explícita aqui.
window.CLIENT_CONFIG = CLIENT_CONFIG;
window.BRUTO_OPS     = BRUTO_OPS;
window.SUITE_LAYOUT  = SUITE_LAYOUT;
window.DEMO_MODE     = DEMO_MODE;

// ── Identidade visual BRUTO ─────────────────────────────────
// Fonte: bruto-brandbook.html — Ferro / Grafite / Concreto / Titânio / Argamassa
// Tipografia: Barlow Condensed (headings) + Barlow (corpo)
const BRAND = {
  bg:     '#0A0A0A', // Ferro
  bg2:    '#141414', // Ferro → Grafite, um degrau acima
  bg3:    '#1C1C1C', // Grafite
  text:   '#F0EEEC', // Argamassa
  muted:  '#B2AFAB', // Titânio
  dim:    '#5C5956', // Concreto escurecido p/ contraste em fundo escuro
  teal:   '#D44000', // Accent BRUTO (cor viva da marca, tom terracota/queimado)
  border: '#2A2724',
  green:  '#27AE60',
  amber:  '#F5A623',
  red:    '#E74C3C',
};

(function applyBrand() {
  const r = document.documentElement;
  Object.entries(BRAND).forEach(([k, v]) => r.style.setProperty(`--${k}`, v));
  // Derivados com opacidade
  const hex = (h, a) => h + Math.round(a * 255).toString(16).padStart(2, '0');
  r.style.setProperty('--teal-12',  hex(BRAND.teal, .12));
  r.style.setProperty('--teal-22',  hex(BRAND.teal, .22));
  r.style.setProperty('--green-12', hex(BRAND.green, .12));
  r.style.setProperty('--red-12',   hex(BRAND.red, .12));
  r.style.setProperty('--amber-12', hex(BRAND.amber, .12));
})();
