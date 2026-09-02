import type { RawVerse } from './types'

const GAP_PENALTY = -0.05
const ORPHAN_THRESHOLD = 0.08
const ANCHOR_MIN_SCORE = 0.14

const PT_NUMBERS: Record<string, string> = {
  dois: '2', duas: '2', tres: '3', quatro: '4', cinco: '5', seis: '6', sete: '7', oito: '8', nove: '9',
  dez: '10', onze: '11', doze: '12', treze: '13', catorze: '14', quinze: '15', dezesseis: '16',
  dezessete: '17', dezoito: '18', dezenove: '19', vinte: '20', trinta: '30', quarenta: '40',
  cinquenta: '50', sessenta: '60', setenta: '70', oitenta: '80', noventa: '90', cem: '100',
  cento: '100', duzentos: '200', duzentas: '200', trezentos: '300', trezentas: '300',
  quatrocentos: '400', quatrocentas: '400', quinhentos: '500', quinhentas: '500',  seiscentos: '600', seiscentas: '600', setecentos: '700', setecentas: '700',
  oitocentos: '800', oitocentas: '800', novecentos: '900', novecentas: '900', mil: '1000',
}

const EN_NUMBERS: Record<string, string> = {
  one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  ten: '10', eleven: '11', twelve: '12', thirteen: '13', fourteen: '14', fifteen: '15',
  sixteen: '16', seventeen: '17', eighteen: '18', nineteen: '19', twenty: '20', thirty: '30',
  forty: '40', fifty: '50', sixty: '60', seventy: '70', eighty: '80', ninety: '90',
  hundred: '100', thousand: '1000',
}

const EN_COMPOUNDS: Array<[RegExp, string]> = [
  [/two hundred/g, '200'], [/three hundred/g, '300'], [/four hundred/g, '400'], [/five hundred/g, '500'],
  [/six hundred/g, '600'], [/seven hundred/g, '700'], [/eight hundred/g, '800'], [/nine hundred/g, '900'],
  [/one hundred/g, '100'], [/ten thousand/g, '10000'], [/one thousand/g, '1000'],
  [/two thousand/g, '2000'], [/three thousand/g, '3000'],
  [/five hundredth/g, '500'], [/six hundredth/g, '600'], [/seven hundredth/g, '700'],
  [/eight hundredth/g, '800'], [/nine hundredth/g, '900'], [/ten thousandth/g, '10000'],
  [/one thousandth/g, '1000'], [/two thousandth/g, '2000'], [/three thousandth/g, '3000'],
]

const PT_GLOSSARY: Record<string, string> = {
  e: 'and', ou: 'or', mas: 'but', nao: 'not', quando: 'when', entao: 'then', tambem: 'also',
  outro: 'another', outros: 'other', outra: 'another', outras: 'other',
  porque: 'because', pois: 'because', onde: 'where', como: 'how', assim: 'so', todos: 'all',
  todo: 'all', todas: 'all', cada: 'every', primeiro: 'first', primeira: 'first', ultimo: 'last',
  ultima: 'last', antes: 'before', depois: 'after', agora: 'now', ainda: 'yet', sempre: 'forever',
  jamais: 'never', nada: 'nothing', quem: 'who', qual: 'which', la: 'there',
  senhor: 'lord', deus: 'god', deuses: 'gods', ceu: 'heaven', ceus: 'heavens', anjo: 'angel',
  anjos: 'angels', gloria: 'glory', terra: 'earth', justo: 'righteous', justos: 'righteous',
  eleito: 'elect', eleitos: 'elect', escolhido: 'chosen', escolhidos: 'chosen',
  pecador: 'sinner', pecadores: 'sinners', pecado: 'sin', pecados: 'sins', morte: 'death',
  morrera: 'die', fogo: 'fire', agua: 'water', aguas: 'waters', luz: 'light',
  trevas: 'darkness', nome: 'name', dia: 'day', dias: 'days', noite: 'night', noites: 'nights',
  ano: 'year', anos: 'years', mes: 'month', meses: 'months', vida: 'life',
  monte: 'mountain', montes: 'mountains', montanha: 'mountain',
  montanhas: 'mountains', arvore: 'tree', arvores: 'trees', estrela: 'star', estrelas: 'stars',
  lua: 'moon', sol: 'sun', porta: 'gate', portas: 'gates', portais: 'portals', espirito: 'spirit',
  espiritos: 'spirits', homem: 'man', homens: 'men', filho: 'son', filhos: 'sons',
  filha: 'daughter', filhas: 'daughters', pai: 'father', pais: 'fathers', mae: 'mother',
  irmaos: 'brethren', irmao: 'brother', esposa: 'wife', esposas: 'wives', mulher: 'woman',
  mulheres: 'women', geracao: 'generation', geracoes: 'generations', eterno: 'eternal',
  eterna: 'eternal', eternamente: 'ever', seculos: 'ever', santo: 'holy', santa: 'holy',
  santos: 'saints', santas: 'saints', grande: 'great', grandes: 'great', rei: 'king',
  reis: 'kings', trono: 'throne', tronos: 'thrones', juizo: 'judgment', julgamento: 'judgment',
  livro: 'book', livros: 'books', mao: 'hand', maos: 'hands', olho: 'eye',
  olhos: 'eyes', boca: 'mouth', bocas: 'mouths', cabeca: 'head', cabecas: 'heads', rosto: 'face',
  rostos: 'faces', coracao: 'heart', coracoes: 'hearts', alma: 'soul', almas: 'souls',
  carne: 'flesh', sangue: 'blood', lei: 'law', palavra: 'word', palavras: 'words', voz: 'voice',
  vozes: 'voices', casa: 'house', casas: 'houses', morada: 'mansion', moradas: 'mansions',
  reino: 'kingdom', coroa: 'crown', cetro: 'sceptre', poder: 'power', forca: 'strength',
  sabedoria: 'wisdom', sabio: 'wise', sabios: 'wise', entendimento: 'understanding',
  conhecimento: 'knowledge', misterio: 'mystery', misterios: 'mysteries', segredo: 'secret',
  segredos: 'secrets', escondido: 'hidden', revelado: 'revealed', revelar: 'reveal',
  mundo: 'world', abismo: 'abyss', paraiso: 'paradise', jardim: 'garden', diluvio: 'deluge',
  arca: 'ark', gigante: 'giant', gigantes: 'giants', vigilantes: 'watchers', sentinela: 'watcher',
  sentinelas: 'watchers', parabola: 'parable', parabolas: 'parables', visao: 'vision',
  visoes: 'visions', sonho: 'dream', sonhos: 'dreams', profeta: 'prophet', profetas: 'prophets',
  escrituras: 'scriptures', mandamento: 'commandment', mandamentos: 'commandments',
  iniquidade: 'iniquity', impiedade: 'ungodliness', impios: 'wicked', impio: 'wicked',
  maldito: 'cursed', malditos: 'cursed', bendito: 'blessed', benditos: 'blessed',
  bencao: 'blessing', bencaos: 'blessings', benzeu: 'blessed', abencoou: 'blessed',
  oracao: 'prayer', louvor: 'praise', majestade: 'majesty', oriente: 'east', leste: 'east',
  sul: 'south', norte: 'north', ocidente: 'west', poente: 'west', verao: 'summer',
  inverno: 'winter', chuva: 'rain', orvalho: 'dew', nuvem: 'cloud', nuvens: 'clouds',
  neve: 'snow', gelo: 'ice', granizo: 'hail', vento: 'wind', ventos: 'winds',
  relampago: 'lightning', relampagos: 'lightnings', trovao: 'thunder', trovoes: 'thunders',
  tempestade: 'tempest', rio: 'river', rios: 'rivers', mar: 'sea', mares: 'seas',
  fonte: 'fountain', fontes: 'fountains', deserto: 'desert', vale: 'valley', vales: 'valleys',
  rocha: 'rock', rochas: 'rocks', pedra: 'stone', pedras: 'stones', leao: 'lion', leoes: 'lions',
  lobo: 'wolf', lobos: 'wolves', tigres: 'tigers', cao: 'dog', caes: 'dogs', javali: 'boar',
  javalis: 'boars', raposa: 'fox', raposas: 'foxes', abutre: 'vulture', abutres: 'vultures',
  corvo: 'raven', corvos: 'ravens', aguia: 'eagle', aguias: 'eagles', ave: 'bird', aves: 'birds',
  bestas: 'beasts', animais: 'animals', vaca: 'cow', vacas: 'kine', touro: 'bull',
  carneiro: 'ram', carneiros: 'rams', ovelha: 'sheep', ovelhas: 'sheep', bode: 'goat',
  bodes: 'goats', cordeiro: 'lamb', cordeiros: 'lambs', altar: 'altar', altares: 'altars',
  sacrificio: 'sacrifice', sacrificios: 'sacrifices', incenso: 'incense', idolos: 'idols',
  demonio: 'devil', demonios: 'devils', tartaro: 'tartarus', praga: 'plague', pragas: 'plagues',
  doenca: 'plague', ferida: 'plague', feridas: 'plagues', hostes: 'hosts', exercito: 'hosts',
  milhares: 'thousands', multidao: 'multitude', numero: 'number', numeros: 'numbers',
  enoque: 'enoch', noe: 'noah', matusalem: 'mathusala',
  lameque: 'lamech', jarede: 'jared', adao: 'adam', miguel: 'michael', gabriel: 'gabriel',
  rafael: 'raphael', uriel: 'uriel', fanuel: 'phanuel', azaso: 'azaziel', hermon: 'armon',
  eden: 'eden', siao: 'zion', libano: 'lebanon', partos: 'parthians', medas: 'medes',
  mostrou: 'shewed', mostrar: 'shew', vi: 'saw', viu: 'saw', olhem: 'behold', vejam: 'behold',
  escutem: 'hear', ouvi: 'heard', ouviu: 'heard', falou: 'spoke', disse: 'said', diz: 'said',
  respondeu: 'answered', perguntou: 'asked', perguntei: 'asked', dou: 'give', deu: 'gave',
  dar: 'give', feito: 'made', fazer: 'make', cair: 'fall', caiu: 'fell', desceu: 'descended',
  descer: 'descend', desceram: 'descended', subiu: 'ascended', subir: 'ascend',
  levantou: 'rose', voar: 'fly', voou: 'flew', nascer: 'be born', nasceu: 'was born',
  pariu: 'brought forth', parir: 'bring forth', escreveu: 'wrote',
  escrevi: 'wrote', escrito: 'written', ler: 'read', le: 'read', chamou: 'called',
  chamado: 'called', chamar: 'call', chama: 'called', jurou: 'sware', jurar: 'swear',
  jurei: 'have sworn', temei: 'fear', temor: 'fear', medo: 'fear',
  tremer: 'tremble', tremerao: 'tremble', chorei: 'wept', chorar: 'weep', chorarao: 'weep',
  pranto: 'lamentation', lamento: 'lamentation', lamentos: 'lamentations', gritos: 'outcries',
  grito: 'outcry',
}

export function normalizeText(s: string, lang?: 'pt' | 'en'): string {
  let text = s
  if (lang === 'en') {
    for (const [re, replacement] of EN_COMPOUNDS) text = text.replace(re, replacement)
  }
  text = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (lang === 'pt') {
    const numbers = PT_NUMBERS
    const glossary = PT_GLOSSARY
    return text
      .split(' ')
      .map((t) => numbers[t] ?? glossary[t] ?? t)
      .join(' ')
  }
  if (lang === 'en') {
    return text
      .split(' ')
      .map((t) => EN_NUMBERS[t] ?? t)
      .join(' ')
  }
  return text
}

type VerseFeatures = {
  trigrams: Set<string>
  tokens: Set<string>
  digits: Set<string>
}

function buildFeatures(verse: RawVerse, lang: 'pt' | 'en'): VerseFeatures {
  const normalized = normalizeText(verse.text, lang)
  const tokens = new Set(normalized.split(' ').filter(Boolean))
  const digits = new Set((verse.text.match(/\d+/g) ?? []).map(Number).map(String))
  for (const t of tokens) if (/^\d+$/.test(t)) digits.add(t)
  const padded = ` ${normalized} `
  const trigrams = new Set<string>()
  for (let i = 0; i + 3 <= padded.length; i++) {
    trigrams.add(padded.slice(i, i + 3))
  }
  return { trigrams, tokens, digits }
}

function computeIdf(featuresList: VerseFeatures[]): Map<string, number> {
  const df = new Map<string, number>()
  const total = featuresList.length
  for (const f of featuresList) {
    for (const t of f.tokens) {
      df.set(t, (df.get(t) ?? 0) + 1)
    }
  }
  const idf = new Map<string, number>()
  for (const [t, d] of df) {
    idf.set(t, Math.max(Math.log(total / (1 + d)), 0.1))
  }
  return idf
}

function setDice(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  return (2 * inter) / (a.size + b.size)
}

function weightedTokenDice(a: Set<string>, b: Set<string>, idf: Map<string, number>): number {
  if (!a.size || !b.size) return 0
  let inter = 0
  let sa = 0
  let sb = 0
  for (const t of a) {
    const w = idf.get(t) ?? 1
    sa += w
    if (b.has(t)) inter += w
  }
  for (const t of b) {
    sb += idf.get(t) ?? 1
  }
  return (2 * inter) / (sa + sb)
}

function pairScore(a: VerseFeatures, b: VerseFeatures, idf: Map<string, number>): number {
  const tri = setDice(a.trigrams, b.trigrams)
  const tok = weightedTokenDice(a.tokens, b.tokens, idf)
  const dig = setDice(a.digits, b.digits)
  return 0.45 * tri + 0.45 * tok + 0.1 * dig
}

export function buildScoreMatrix(pt: RawVerse[], en: RawVerse[]): Float32Array {
  const n = pt.length
  const m = en.length
  const fa = pt.map((v) => buildFeatures(v, 'pt'))
  const fb = en.map((v) => buildFeatures(v, 'en'))
  const idf = computeIdf([...fa, ...fb])
  const S = new Float32Array(n * m)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      S[i * m + j] = pairScore(fa[i], fb[j], idf)
    }
  }
  return S
}

export function similarity(a: string, b: string): number {
  const fa = buildFeatures({ ch: 0, vs: 0, text: a, notes: [] }, 'pt')
  const fb = buildFeatures({ ch: 0, vs: 0, text: b, notes: [] }, 'en')
  return pairScore(fa, fb, new Map())
}

function argmaxRow(S: Float32Array, m: number, i: number): number {
  let best = 0
  let bestVal = -Infinity
  for (let j = 0; j < m; j++) {
    const v = S[i * m + j]
    if (v > bestVal) {
      bestVal = v
      best = j
    }
  }
  return best
}

function argmaxCol(S: Float32Array, n: number, m: number, j: number): number {
  let best = 0
  let bestVal = -Infinity
  for (let i = 0; i < n; i++) {
    const v = S[i * m + j]
    if (v > bestVal) {
      bestVal = v
      best = i
    }
  }
  return best
}

function longestIncreasingSubsequence(pairs: Array<[number, number]>): Array<[number, number]> {
  if (pairs.length === 0) return []
  const indices = pairs.map((_, k) => k).sort((a, b) => pairs[a][0] - pairs[b][0])
  const prev: number[] = new Array(pairs.length).fill(-1)
  const tailPair: number[] = []
  for (const k of indices) {
    let lo = 0
    let hi = tailPair.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (pairs[tailPair[mid]][1] < pairs[k][1]) lo = mid + 1
      else hi = mid
    }
    if (lo > 0) prev[k] = tailPair[lo - 1]
    if (lo === tailPair.length) tailPair.push(k)
    else tailPair[lo] = k
  }
  const result: Array<[number, number]> = []
  let cur = tailPair[tailPair.length - 1]
  while (cur !== undefined && cur !== -1) {
    result.push(pairs[cur])
    cur = prev[cur]
  }
  return result.reverse()
}

function findAnchors(S: Float32Array, n: number, m: number): Array<[number, number]> {
  const bestEnForPt = new Int32Array(n)
  for (let i = 0; i < n; i++) bestEnForPt[i] = argmaxRow(S, m, i)
  const bestPtForEn = new Int32Array(m)
  for (let j = 0; j < m; j++) bestPtForEn[j] = argmaxCol(S, n, m, j)

  const mutual: Array<[number, number]> = []
  for (let i = 0; i < n; i++) {
    const j = bestEnForPt[i]
    if (bestPtForEn[j] === i && S[i * m + j] >= ANCHOR_MIN_SCORE) {
      mutual.push([i, j])
    }
  }
  const anchors = longestIncreasingSubsequence(mutual)
  if (anchors.length === 0 || anchors[0][0] !== 0 || anchors[0][1] !== 0) anchors.unshift([0, 0])
  if (anchors[anchors.length - 1][0] !== n - 1 || anchors[anchors.length - 1][1] !== m - 1) {
    anchors.push([n - 1, m - 1])
  }
  return anchors
}

export type AlignOp =
  | { type: 'diag'; pt: number; en: number; score: number }
  | { type: 'ptOnly'; pt: number }
  | { type: 'enOnly'; en: number }

function alignSegment(S: Float32Array, m: number, i0: number, i1: number, j0: number, j1: number): AlignOp[] {
  if (i1 < i0 || j1 < j0) {
    const ops: AlignOp[] = []
    for (let i = i0; i <= i1; i++) ops.push({ type: 'ptOnly', pt: i })
    for (let j = j0; j <= j1; j++) ops.push({ type: 'enOnly', en: j })
    return ops
  }
  const n = i1 - i0 + 1
  const w = j1 - j0 + 1
  const W = w + 1
  const dp = new Float64Array((n + 1) * W)
  const tb = new Uint8Array((n + 1) * W)

  for (let j = 1; j <= w; j++) {
    dp[j] = dp[j - 1] + GAP_PENALTY
    tb[j] = 2
  }
  for (let i = 1; i <= n; i++) {
    dp[i * W] = dp[(i - 1) * W] + GAP_PENALTY
    tb[i * W] = 1
  }
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= w; j++) {
      const score = S[(i0 + i - 1) * m + (j0 + j - 1)]
      const diag = dp[(i - 1) * W + (j - 1)] + score
      const up = dp[(i - 1) * W + j] + GAP_PENALTY
      const left = dp[i * W + (j - 1)] + GAP_PENALTY
      let best = diag
      let dir = 0
      if (up > best) {
        best = up
        dir = 1
      }
      if (left > best) {
        best = left
        dir = 2
      }
      dp[i * W + j] = best
      tb[i * W + j] = dir
    }
  }

  const ops: AlignOp[] = []
  let i = n
  let j = w
  while (i > 0 || j > 0) {
    const dir = i === 0 ? 2 : j === 0 ? 1 : tb[i * W + j]
    if (dir === 0) {
      ops.push({
        type: 'diag',
        pt: i0 + i - 1,
        en: j0 + j - 1,
        score: S[(i0 + i - 1) * m + (j0 + j - 1)],
      })
      i--
      j--
    } else if (dir === 1) {
      ops.push({ type: 'ptOnly', pt: i0 + i - 1 })
      i--
    } else {
      ops.push({ type: 'enOnly', en: j0 + j - 1 })
      j--
    }
  }
  ops.reverse()
  return ops
}

export function alignSequences(pt: RawVerse[], en: RawVerse[], S: Float32Array): AlignOp[] {
  const n = pt.length
  const m = en.length
  const anchors = findAnchors(S, n, m)
  console.log(`Anchors: ${anchors.length}`)

  const ops: AlignOp[] = []
  for (let k = 0; k < anchors.length; k++) {
    const [i0, j0] = anchors[k]
    if (k === 0) {
      if (i0 > 0) for (let i = 0; i < i0; i++) ops.push({ type: 'ptOnly', pt: i })
      if (j0 > 0) for (let j = 0; j < j0; j++) ops.push({ type: 'enOnly', en: j })
    }
    ops.push({ type: 'diag', pt: i0, en: j0, score: S[i0 * m + j0] })
    if (k + 1 < anchors.length) {
      const [i1, j1] = anchors[k + 1]
      ops.push(...alignSegment(S, m, i0 + 1, i1 - 1, j0 + 1, j1 - 1))
    }
  }
  return ops
}

export type AlignmentResult = {
  ptToEn: number[][]
  orphanEn: number[]
  diagScores: number[]
}

export function groupAlignment(
  pt: RawVerse[],
  en: RawVerse[],
  ops: AlignOp[],
  S: Float32Array,
): AlignmentResult {
  const m = en.length
  const ptToEn: number[][] = Array.from({ length: pt.length }, () => [])
  const orphanEn: number[] = []
  const diagScores: number[] = []

  const diagPtAt = new Map<number, number>()
  for (let k = 0; k < ops.length; k++) {
    const op = ops[k]
    if (op.type === 'diag') {
      diagPtAt.set(k, op.pt)
      diagScores.push(op.score)
    }
  }

  const nearestDiagPt = (from: number, forward: boolean): number => {
    if (forward) {
      for (let k = from + 1; k < ops.length; k++) {
        const p = diagPtAt.get(k)
        if (p !== undefined) return p
      }
      return -1
    }
    for (let k = from - 1; k >= 0; k--) {
      const p = diagPtAt.get(k)
      if (p !== undefined) return p
    }
    return -1
  }

  for (let k = 0; k < ops.length; k++) {
    const op = ops[k]
    if (op.type === 'diag') {
      ptToEn[op.pt].push(op.en)
    } else if (op.type === 'enOnly') {
      const prev = nearestDiagPt(k, false)
      const next = nearestDiagPt(k, true)
      const candidates = [prev, next].filter((p) => p !== -1)
      let best = -1
      let bestScore = 0
      for (const p of candidates) {
        const s = S[p * m + op.en]
        if (s > bestScore) {
          bestScore = s
          best = p
        }
      }
      if (best >= 0 && bestScore >= ORPHAN_THRESHOLD) {
        ptToEn[best].push(op.en)
      } else {
        orphanEn.push(op.en)
      }
    }
  }

  for (const list of ptToEn) {
    list.sort((a, b) => a - b)
  }

  return { ptToEn, orphanEn, diagScores }
}

const WEAK_THRESHOLD = 0.08
const REMATCH_MIN = 0.1
const REMATCH_WINDOW = 30

export type RefinementResult = {
  ptToEn: number[][]
  orphanEn: number[]
  transposedPt: Set<number>
}

export function refineAlignment(
  en: RawVerse[],
  ptToEn: number[][],
  orphanEn: number[],
  S: Float32Array,
): RefinementResult {
  const m = en.length
  const attached = new Map<number, number>()
  for (let i = 0; i < ptToEn.length; i++) {
    for (const j of ptToEn[i]) attached.set(j, i)
  }

  const poolPt: number[] = []
  const poolEn: number[] = []
  const originals = new Map<number, number[]>()

  for (let i = 0; i < ptToEn.length; i++) {
    let maxScore = 0
    for (const j of ptToEn[i]) maxScore = Math.max(maxScore, S[i * m + j])
    if (ptToEn[i].length === 0) {
      poolPt.push(i)
    } else if (maxScore < WEAK_THRESHOLD) {
      originals.set(i, [...ptToEn[i]])
      for (const j of ptToEn[i]) {
        attached.delete(j)
        poolEn.push(j)
      }
      ptToEn[i] = []
      poolPt.push(i)
    }
  }
  for (const j of orphanEn) poolEn.push(j)

  const inPool = new Set<number>(poolPt)
  const neighborBounds = (p: number): [number, number] => {
    let prevMaxEn = -1
    for (let k = p - 1; k >= 0; k--) {
      if (ptToEn[k].length && !inPool.has(k)) {
        prevMaxEn = Math.max(...ptToEn[k])
        break
      }
    }
    let nextMinEn = -1
    for (let k = p + 1; k < ptToEn.length; k++) {
      if (ptToEn[k].length && !inPool.has(k)) {
        nextMinEn = Math.min(...ptToEn[k])
        break
      }
    }
    const lo = prevMaxEn === -1 ? 0 : Math.max(0, prevMaxEn - REMATCH_WINDOW)
    const hi = nextMinEn === -1 ? m - 1 : Math.min(m - 1, nextMinEn + REMATCH_WINDOW)
    return [lo, hi]
  }

  const candidates: Array<{ p: number; e: number; s: number }> = []
  for (const p of poolPt) {
    const [lo, hi] = neighborBounds(p)
    for (const e of poolEn) {
      if (e < lo || e > hi) continue
      const s = S[p * m + e]
      if (s >= REMATCH_MIN) candidates.push({ p, e, s })
    }
  }
  candidates.sort((a, b) => b.s - a.s)

  const usedPt = new Set<number>()
  const usedEn = new Set<number>()
  const transposedPt = new Set<number>()
  for (const { p, e } of candidates) {
    if (usedPt.has(p) || usedEn.has(e)) continue
    usedPt.add(p)
    usedEn.add(e)
    ptToEn[p].push(e)

    let prevMaxEn = -1
    for (let k = p - 1; k >= 0; k--) {
      if (ptToEn[k].length && !usedPt.has(k) && !originals.has(k)) {
        prevMaxEn = Math.max(...ptToEn[k])
        break
      }
    }
    let nextMinEn = -1
    for (let k = p + 1; k < ptToEn.length; k++) {
      if (ptToEn[k].length && !usedPt.has(k) && !originals.has(k)) {
        nextMinEn = Math.min(...ptToEn[k])
        break
      }
    }
    if ((prevMaxEn !== -1 && e < prevMaxEn) || (nextMinEn !== -1 && e > nextMinEn)) {
      transposedPt.add(p)
    }
  }

  for (const [p, ens] of originals) {
    if (!usedPt.has(p)) {
      ptToEn[p] = ens
      for (const e of ens) usedEn.add(e)
    }
  }

  for (const list of ptToEn) {
    list.sort((a, b) => a - b)
  }
  const remainingOrphans = poolEn.filter((j) => !usedEn.has(j))

  return { ptToEn, orphanEn: remainingOrphans, transposedPt }
}

const REDISTRIBUTE_WINDOW = 25
const REDISTRIBUTE_MARGIN = 0.02
const REDISTRIBUTE_MIN = 0.13

export function redistributeAttachments(
  ptCount: number,
  ptToEn: number[][],
  S: Float32Array,
  m: number,
): number[][] {
  for (let pass = 0; pass < 2; pass++) {
    for (let p = 0; p < ptCount; p++) {
      for (const e of [...ptToEn[p]]) {
        const ownerScore = S[p * m + e]
        if (ptToEn[p].length < 2 && ownerScore >= 0.1) continue
        if (ownerScore >= REDISTRIBUTE_MIN && ptToEn[p].length < 2) continue
        let best = p
        let bestScore = ownerScore
        for (let k = Math.max(0, p - REDISTRIBUTE_WINDOW); k <= Math.min(ptCount - 1, p + REDISTRIBUTE_WINDOW); k++) {
          if (k === p || ptToEn[k].length > 0) continue
          const s = S[k * m + e]
          if (s > bestScore + REDISTRIBUTE_MARGIN && s >= REDISTRIBUTE_MIN) {
            best = k
            bestScore = s
          }
        }
        if (best !== p) {
          ptToEn[p] = ptToEn[p].filter((x) => x !== e)
          ptToEn[best].push(e)
        }
      }
    }
  }
  for (const list of ptToEn) {
    list.sort((a, b) => a - b)
  }
  return ptToEn
}

export function detectTransposed(ptToEn: number[][]): Set<number> {
  const transposed = new Set<number>()
  for (let p = 0; p < ptToEn.length; p++) {
    if (!ptToEn[p].length) continue
    let prevMaxEn = -1
    for (let k = p - 1; k >= 0; k--) {
      if (ptToEn[k].length) {
        prevMaxEn = Math.max(...ptToEn[k])
        break
      }
    }
    let nextMinEn = -1
    for (let k = p + 1; k < ptToEn.length; k++) {
      if (ptToEn[k].length) {
        nextMinEn = Math.min(...ptToEn[k])
        break
      }
    }
    const maxEn = Math.max(...ptToEn[p])
    const minEn = Math.min(...ptToEn[p])
    if ((prevMaxEn !== -1 && maxEn < prevMaxEn) || (nextMinEn !== -1 && minEn > nextMinEn)) {
      transposed.add(p)
    }
  }
  return transposed
}
