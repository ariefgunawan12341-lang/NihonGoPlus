import type { ExamQuestion } from '../types'

// A real, correct N4 starter question set — same shape as examN5.ts.
export const examN4: ExamQuestion[] = [
  {
    id: 'q-n4-moji-1', level: 'N4', category: 'moji', difficulty: 2,
    prompt: '「経験」の読み方はどれですか。',
    choices: ['けいけん', 'きょうけん', 'けいげん', 'きょうげん'],
    correctIndex: 0,
    explanation: '「経験」is read けいけん (keiken), meaning "experience".',
    tags: ['reading']
  },
  {
    id: 'q-n4-goi-1', level: 'N4', category: 'goi', difficulty: 2,
    prompt: 'この もんだいは とても（　　）です。',
    choices: ['ふくざつ', 'たぶん', 'じゅんび', 'やくそく'],
    correctIndex: 0,
    explanation: '複雑（ふくざつ, complicated）correctly describes a difficult problem.',
    tags: ['vocab']
  },
  {
    id: 'q-n4-bunpou-1', level: 'N4', category: 'bunpou', difficulty: 2,
    prompt: 'あめが ふって いる＿、さんぽに いきました。',
    choices: ['のに', 'ので', 'から', 'まで'],
    correctIndex: 0,
    explanation: '「のに」expresses contrast: "Even though it was raining, I went for a walk."',
    tags: ['grammar']
  },
  {
    id: 'q-n4-bunpou-2', level: 'N4', category: 'bunpou', difficulty: 3,
    prompt: 'にほんごが じょうずに なる＿、まいにち れんしゅうします。',
    choices: ['ように', 'そうに', 'らしく', 'まま'],
    correctIndex: 0,
    explanation: '「ように」expresses purpose: "In order to become good at Japanese, I practice every day."',
    tags: ['grammar']
  },
  {
    id: 'q-n4-dokkai-1', level: 'N4', category: 'dokkai', difficulty: 2,
    prompt: 'わたしは らいねん りゅうがくする よていです。それで、いま にほんごを べんきょうして います。じゅんびは たいへんですが、たのしいです。\n\n「わたし」は なぜ にほんごを べんきょうして いますか。',
    passage: 'わたしは らいねん りゅうがくする よていです。それで、いま にほんごを べんきょうして います。じゅんびは たいへんですが、たのしいです。',
    choices: ['しごとの ため', 'らいねん りゅうがくする よていだから', 'にほんじんの ともだちが いるから', 'せんせいに いわれたから'],
    correctIndex: 1,
    explanation: 'The passage says the writer plans to study abroad next year, so they are preparing by studying Japanese now.',
    tags: ['reading-comprehension']
  },
  {
    id: 'q-n4-choukai-1', level: 'N4', category: 'choukai', difficulty: 2,
    prompt: 'かいぎは 三時に はじまりますが、しりょうの じゅんびが あるので、二時半に きて ください。',
    choices: ['The meeting starts at 2:30', 'Arrive at 2:30 to prepare materials before the 3 o\u2019clock meeting', 'The meeting was cancelled', 'Bring your own materials at 3 o\u2019clock'],
    correctIndex: 1,
    explanation: '「二時半に来てください」means "please come at 2:30" to prepare materials before the 3:00 meeting.',
    tags: ['listening']
  }
]
