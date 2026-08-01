import type { VocabWord } from '../types'

// A real, correct starter set of JLPT N5 vocabulary. Schema matches the
// question-bank pattern used across the app: extend this array, or add rows
// through the Admin Panel, to grow toward full N5 coverage (and duplicate the
// file for N4–N1 following the same shape).
export const vocabN5: VocabWord[] = [
  { id: 'n5-001', level: 'N5', kanji: '私', kana: 'わたし', romaji: 'watashi', meaning: 'I / me', example: '私は学生です。', exampleMeaning: 'I am a student.', tags: ['pronoun'] },
  { id: 'n5-002', level: 'N5', kanji: '学校', kana: 'がっこう', romaji: 'gakkou', meaning: 'school', example: '学校へ行きます。', exampleMeaning: 'I go to school.', tags: ['place'] },
  { id: 'n5-003', level: 'N5', kanji: '先生', kana: 'せんせい', romaji: 'sensei', meaning: 'teacher', example: '先生はやさしいです。', exampleMeaning: 'The teacher is kind.', tags: ['people'] },
  { id: 'n5-004', level: 'N5', kanji: '食べる', kana: 'たべる', romaji: 'taberu', meaning: 'to eat', example: '朝ごはんを食べます。', exampleMeaning: 'I eat breakfast.', tags: ['verb'] },
  { id: 'n5-005', level: 'N5', kanji: '飲む', kana: 'のむ', romaji: 'nomu', meaning: 'to drink', example: '水を飲みます。', exampleMeaning: 'I drink water.', tags: ['verb'] },
  { id: 'n5-006', level: 'N5', kanji: '友達', kana: 'ともだち', romaji: 'tomodachi', meaning: 'friend', example: '友達と遊びます。', exampleMeaning: 'I play with my friend.', tags: ['people'] },
  { id: 'n5-007', level: 'N5', kanji: '今日', kana: 'きょう', romaji: 'kyou', meaning: 'today', example: '今日は暑いです。', exampleMeaning: 'Today is hot.', tags: ['time'] },
  { id: 'n5-008', level: 'N5', kanji: '明日', kana: 'あした', romaji: 'ashita', meaning: 'tomorrow', example: '明日は休みです。', exampleMeaning: 'Tomorrow is a day off.', tags: ['time'] },
  { id: 'n5-009', level: 'N5', kanji: '大きい', kana: 'おおきい', romaji: 'ookii', meaning: 'big', example: 'この犬は大きいです。', exampleMeaning: 'This dog is big.', tags: ['adjective'] },
  { id: 'n5-010', level: 'N5', kanji: '小さい', kana: 'ちいさい', romaji: 'chiisai', meaning: 'small', example: '小さい部屋です。', exampleMeaning: "It's a small room.", tags: ['adjective'] },
  { id: 'n5-011', level: 'N5', kanji: '本', kana: 'ほん', romaji: 'hon', meaning: 'book', example: '本を読みます。', exampleMeaning: 'I read a book.', tags: ['object'] },
  { id: 'n5-012', level: 'N5', kanji: '水', kana: 'みず', romaji: 'mizu', meaning: 'water', example: '水がほしいです。', exampleMeaning: 'I want water.', tags: ['object'] },
  { id: 'n5-013', level: 'N5', kanji: '車', kana: 'くるま', romaji: 'kuruma', meaning: 'car', example: '車で行きます。', exampleMeaning: 'I go by car.', tags: ['object'] },
  { id: 'n5-014', level: 'N5', kanji: '駅', kana: 'えき', romaji: 'eki', meaning: 'station', example: '駅はどこですか。', exampleMeaning: 'Where is the station?', tags: ['place'] },
  { id: 'n5-015', level: 'N5', kanji: '会社', kana: 'かいしゃ', romaji: 'kaisha', meaning: 'company', example: '会社で働きます。', exampleMeaning: 'I work at a company.', tags: ['place'] },
  { id: 'n5-016', level: 'N5', kanji: '行く', kana: 'いく', romaji: 'iku', meaning: 'to go', example: '公園に行きます。', exampleMeaning: 'I go to the park.', tags: ['verb'] },
  { id: 'n5-017', level: 'N5', kanji: '来る', kana: 'くる', romaji: 'kuru', meaning: 'to come', example: '友達が来ます。', exampleMeaning: 'A friend is coming.', tags: ['verb'] },
  { id: 'n5-018', level: 'N5', kanji: '見る', kana: 'みる', romaji: 'miru', meaning: 'to see / watch', example: 'テレビを見ます。', exampleMeaning: 'I watch TV.', tags: ['verb'] },
  { id: 'n5-019', level: 'N5', kanji: '好き', kana: 'すき', romaji: 'suki', meaning: 'to like', example: '音楽が好きです。', exampleMeaning: 'I like music.', tags: ['adjective'] },
  { id: 'n5-020', level: 'N5', kanji: '嫌い', kana: 'きらい', romaji: 'kirai', meaning: 'to dislike', example: '虫が嫌いです。', exampleMeaning: 'I dislike bugs.', tags: ['adjective'] },
  { id: 'n5-021', level: 'N5', kanji: '', kana: 'おいしい', romaji: 'oishii', meaning: 'delicious', example: 'このラーメンはおいしいです。', exampleMeaning: 'This ramen is delicious.', tags: ['adjective'] },
  { id: 'n5-022', level: 'N5', kanji: '家', kana: 'いえ', romaji: 'ie', meaning: 'house / home', example: '家に帰ります。', exampleMeaning: 'I go home.', tags: ['place'] },
  { id: 'n5-023', level: 'N5', kanji: '時間', kana: 'じかん', romaji: 'jikan', meaning: 'time', example: '時間がありません。', exampleMeaning: "I don't have time.", tags: ['time'] },
  { id: 'n5-024', level: 'N5', kanji: '毎日', kana: 'まいにち', romaji: 'mainichi', meaning: 'every day', example: '毎日勉強します。', exampleMeaning: 'I study every day.', tags: ['time'] },
  { id: 'n5-025', level: 'N5', kanji: '勉強', kana: 'べんきょう', romaji: 'benkyou', meaning: 'study', example: '日本語を勉強します。', exampleMeaning: 'I study Japanese.', tags: ['noun'] },
  { id: 'n5-026', level: 'N5', kanji: '仕事', kana: 'しごと', romaji: 'shigoto', meaning: 'work / job', example: '仕事は忙しいです。', exampleMeaning: 'Work is busy.', tags: ['noun'] },
  { id: 'n5-027', level: 'N5', kanji: '買う', kana: 'かう', romaji: 'kau', meaning: 'to buy', example: '果物を買います。', exampleMeaning: 'I buy fruit.', tags: ['verb'] },
  { id: 'n5-028', level: 'N5', kanji: '売る', kana: 'うる', romaji: 'uru', meaning: 'to sell', example: '店で野菜を売ります。', exampleMeaning: 'The shop sells vegetables.', tags: ['verb'] },
  { id: 'n5-029', level: 'N5', kanji: '新しい', kana: 'あたらしい', romaji: 'atarashii', meaning: 'new', example: '新しい靴を買いました。', exampleMeaning: 'I bought new shoes.', tags: ['adjective'] },
  { id: 'n5-030', level: 'N5', kanji: '古い', kana: 'ふるい', romaji: 'furui', meaning: 'old (things)', example: 'これは古い本です。', exampleMeaning: 'This is an old book.', tags: ['adjective'] }
]
