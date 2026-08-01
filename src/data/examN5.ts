import type { ExamQuestion } from '../types'

// Real, correct N5-level practice questions covering the official section
// types (moji=script/kanji reading, goi=vocabulary, bunpou=grammar,
// dokkai=reading). This is a genuine working set, not filler — extend it
// through the Admin Panel or by appending objects of this same shape.
export const examN5: ExamQuestion[] = [
  {
    id: 'q-n5-moji-1', level: 'N5', category: 'moji', difficulty: 1,
    prompt: '「学校」の読み方はどれですか。',
    choices: ['がっこう', 'がこう', 'かっこう', 'がっこ'],
    correctIndex: 0,
    explanation: '「学校」is read がっこう (gakkou), meaning "school".',
    tags: ['reading']
  },
  {
    id: 'q-n5-moji-2', level: 'N5', category: 'moji', difficulty: 1,
    prompt: '「先生」の読み方はどれですか。',
    choices: ['せんせえ', 'せいせん', 'せんせい', 'せんぜい'],
    correctIndex: 2,
    explanation: '「先生」is read せんせい (sensei), meaning "teacher".',
    tags: ['reading']
  },
  {
    id: 'q-n5-moji-3', level: 'N5', category: 'moji', difficulty: 2,
    prompt: '「今日」の読み方はどれですか。',
    choices: ['こんにち', 'きょう', 'いまび', 'こんじつ'],
    correctIndex: 1,
    explanation: '「今日」is read きょう (kyou), meaning "today".',
    tags: ['reading']
  },
  {
    id: 'q-n5-goi-1', level: 'N5', category: 'goi', difficulty: 1,
    prompt: 'わたしは まいあさ みずを のみます。「のみます」の いみは？',
    choices: ['eat', 'drink', 'see', 'buy'],
    correctIndex: 1,
    explanation: '「飲みます (nomimasu)」means "to drink".',
    tags: ['vocab']
  },
  {
    id: 'q-n5-goi-2', level: 'N5', category: 'goi', difficulty: 1,
    prompt: '( ) に　なにが　入りますか。「へやが　とても　＿＿です。」',
    choices: ['おおきい', 'たべる', 'いきます', 'がっこう'],
    correctIndex: 0,
    explanation: 'おおきい (big) correctly fills the blank describing the room.',
    tags: ['vocab']
  },
  {
    id: 'q-n5-bunpou-1', level: 'N5', category: 'bunpou', difficulty: 1,
    prompt: 'わたし＿　がくせいです。',
    choices: ['を', 'は', 'に', 'で'],
    correctIndex: 1,
    explanation: 'The topic particle は marks "私" as the topic: "As for me, I am a student."',
    tags: ['particles']
  },
  {
    id: 'q-n5-bunpou-2', level: 'N5', category: 'bunpou', difficulty: 2,
    prompt: 'まいにち　がっこう＿　いきます。',
    choices: ['が', 'を', 'へ', 'と'],
    correctIndex: 2,
    explanation: 'へ (or に) marks direction of movement: "I go to school every day."',
    tags: ['particles']
  },
  {
    id: 'q-n5-bunpou-3', level: 'N5', category: 'bunpou', difficulty: 2,
    prompt: 'きのう　ともだち＿　えいがを　みました。',
    choices: ['と', 'の', 'は', 'か'],
    correctIndex: 0,
    explanation: 'と marks "together with": "I watched a movie with a friend yesterday."',
    tags: ['particles']
  },
  {
    id: 'q-n5-dokkai-1', level: 'N5', category: 'dokkai', difficulty: 2,
    prompt: 'わたしは まいあさ 7じに おきます。あさごはんを たべて、8じに いえを でます。がっこうまで あるいて 15ふん かかります。\n\n「わたし」は なんじに いえを でますか。',
    passage: 'わたしは まいあさ 7じに おきます。あさごはんを たべて、8じに いえを でます。がっこうまで あるいて 15ふん かかります。',
    choices: ['7じ', '8じ', '15ふん', 'わかりません'],
    correctIndex: 1,
    explanation: 'The passage states 「8じに いえを でます」— leaves the house at 8 o\u2019clock.',
    tags: ['reading-comprehension']
  },
  {
    id: 'q-n5-dokkai-2', level: 'N5', category: 'dokkai', difficulty: 2,
    prompt: 'たなかさんは にほんごの せんせいです。まいしゅう げつようびから きんようびまで がっこうで おしえます。しゅうまつは いえで ほんを よみます。\n\n「たなかさん」は しゅうまつ なにを しますか。',
    passage: 'たなかさんは にほんごの せんせいです。まいしゅう げつようびから きんようびまで がっこうで おしえます。しゅうまつは いえで ほんを よみます。',
    choices: ['がっこうで おしえます', 'いえで ほんを よみます', 'にほんごを べんきょうします', 'かいしゃで はたらきます'],
    correctIndex: 1,
    explanation: 'The passage says on weekends, Tanaka-san reads books at home (しゅうまつは いえで ほんを よみます).',
    tags: ['reading-comprehension']
  },
  {
    id: 'q-n5-choukai-1', level: 'N5', category: 'choukai', difficulty: 1,
    prompt: 'あしたは あめです。かさを もっていきます。',
    choices: ['Today is rainy', 'Tomorrow is rainy, so I will bring an umbrella', 'Yesterday was sunny', 'I forgot my umbrella'],
    correctIndex: 1,
    explanation: '「あした」means tomorrow, 「あめ」means rain, and 「かさをもっていきます」means "I will bring an umbrella".',
    tags: ['listening']
  },
  {
    id: 'q-n5-choukai-2', level: 'N5', category: 'choukai', difficulty: 2,
    prompt: 'すみません、えきまで どうやって いきますか。まっすぐ いって、つぎの かどを みぎに まがってください。',
    choices: ['Turn left at the first corner', 'Go straight, then turn right at the next corner', 'Take the train', 'The station is closed'],
    correctIndex: 1,
    explanation: '「まっすぐいって」= go straight, 「つぎのかどをみぎにまがってください」= turn right at the next corner.',
    tags: ['listening', 'directions']
  }
]
