import type { KanaChar } from '../types'

// Base gojuon (46 characters) for both scripts, grouped by consonant row.
// Dakuten/handakuten/yoon combos are a natural next data addition using the
// same shape — the learning + quiz UI already reads `group` generically.
const ROWS: Array<[string, Array<[string, string]>]> = [
  ['vowels', [['a', 'あ'], ['i', 'い'], ['u', 'う'], ['e', 'え'], ['o', 'お']]],
  ['k-row', [['ka', 'か'], ['ki', 'き'], ['ku', 'く'], ['ke', 'け'], ['ko', 'こ']]],
  ['s-row', [['sa', 'さ'], ['shi', 'し'], ['su', 'す'], ['se', 'せ'], ['so', 'そ']]],
  ['t-row', [['ta', 'た'], ['chi', 'ち'], ['tsu', 'つ'], ['te', 'て'], ['to', 'と']]],
  ['n-row', [['na', 'な'], ['ni', 'に'], ['nu', 'ぬ'], ['ne', 'ね'], ['no', 'の']]],
  ['h-row', [['ha', 'は'], ['hi', 'ひ'], ['fu', 'ふ'], ['he', 'へ'], ['ho', 'ほ']]],
  ['m-row', [['ma', 'ま'], ['mi', 'み'], ['mu', 'む'], ['me', 'め'], ['mo', 'も']]],
  ['y-row', [['ya', 'や'], ['yu', 'ゆ'], ['yo', 'よ']]],
  ['r-row', [['ra', 'ら'], ['ri', 'り'], ['ru', 'る'], ['re', 'れ'], ['ro', 'ろ']]],
  ['w-row', [['wa', 'わ'], ['wo', 'を']]],
  ['n', [['n', 'ん']]]
]

const HIRA_TO_KATA: Record<string, string> = {
  あ: 'ア', い: 'イ', う: 'ウ', え: 'エ', お: 'オ',
  か: 'カ', き: 'キ', く: 'ク', け: 'ケ', こ: 'コ',
  さ: 'サ', し: 'シ', す: 'ス', せ: 'セ', そ: 'ソ',
  た: 'タ', ち: 'チ', つ: 'ツ', て: 'テ', と: 'ト',
  な: 'ナ', に: 'ニ', ぬ: 'ヌ', ね: 'ネ', の: 'ノ',
  は: 'ハ', ひ: 'ヒ', ふ: 'フ', へ: 'ヘ', ほ: 'ホ',
  ま: 'マ', み: 'ミ', む: 'ム', め: 'メ', も: 'モ',
  や: 'ヤ', ゆ: 'ユ', よ: 'ヨ',
  ら: 'ラ', り: 'リ', る: 'ル', れ: 'レ', ろ: 'ロ',
  わ: 'ワ', を: 'ヲ', ん: 'ン'
}

export const hiraganaSet: KanaChar[] = ROWS.flatMap(([group, chars]) =>
  chars.map(([romaji, kana]) => ({
    id: `hira-${romaji}`,
    kana,
    romaji,
    type: 'hiragana' as const,
    group
  }))
)

export const katakanaSet: KanaChar[] = ROWS.flatMap(([group, chars]) =>
  chars.map(([romaji, kana]) => ({
    id: `kata-${romaji}`,
    kana: HIRA_TO_KATA[kana],
    romaji,
    type: 'katakana' as const,
    group
  }))
)

export const kanaGroups = ROWS.map(([group]) => group)
