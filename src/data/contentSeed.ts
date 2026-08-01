import type { ContentItem } from '../types/content'

// Real, correct starter content for the generic content_items collection,
// covering Kanji, Grammar, SSW, and Kaigo Fukushishi. Small but genuine sets —
// extend through the Admin Panel (which already has full CRUD for every kind
// here) to grow toward full coverage.

const kanjiN5: ContentItem[] = [
  { id: 'kanji-001', kind: 'kanji', level: 'N5', title: '日', reading: 'ニチ・ひ', meaning: 'day, sun', example: '今日はいい天気です。', exampleMeaning: 'Today is nice weather.', order: 1 },
  { id: 'kanji-002', kind: 'kanji', level: 'N5', title: '人', reading: 'ジン・ひと', meaning: 'person', example: 'あの人は先生です。', exampleMeaning: 'That person is a teacher.', order: 2 },
  { id: 'kanji-003', kind: 'kanji', level: 'N5', title: '大', reading: 'ダイ・おお', meaning: 'big', example: '大きい犬です。', exampleMeaning: "It's a big dog.", order: 3 },
  { id: 'kanji-004', kind: 'kanji', level: 'N5', title: '小', reading: 'ショウ・ちい', meaning: 'small', example: '小さい部屋です。', exampleMeaning: "It's a small room.", order: 4 },
  { id: 'kanji-005', kind: 'kanji', level: 'N5', title: '水', reading: 'スイ・みず', meaning: 'water', example: '水を飲みます。', exampleMeaning: 'I drink water.', order: 5 },
  { id: 'kanji-006', kind: 'kanji', level: 'N5', title: '火', reading: 'カ・ひ', meaning: 'fire', example: '火を消します。', exampleMeaning: 'I put out the fire.', order: 6 },
  { id: 'kanji-007', kind: 'kanji', level: 'N5', title: '木', reading: 'モク・き', meaning: 'tree, wood', example: '木の下で休みます。', exampleMeaning: 'I rest under the tree.', order: 7 },
  { id: 'kanji-008', kind: 'kanji', level: 'N5', title: '山', reading: 'サン・やま', meaning: 'mountain', example: '山に登ります。', exampleMeaning: 'I climb the mountain.', order: 8 },
  { id: 'kanji-009', kind: 'kanji', level: 'N5', title: '学', reading: 'ガク・まな', meaning: 'study, learning', example: '学校に行きます。', exampleMeaning: 'I go to school.', order: 9 },
  { id: 'kanji-010', kind: 'kanji', level: 'N5', title: '生', reading: 'セイ・い', meaning: 'life, birth', example: '先生に聞きます。', exampleMeaning: 'I ask the teacher.', order: 10 }
]

const grammarN5: ContentItem[] = [
  { id: 'gram-001', kind: 'grammar', level: 'N5', title: '〜は〜です', reading: '', meaning: 'X is Y (topic + copula)', example: '私は学生です。', exampleMeaning: 'I am a student.', order: 1 },
  { id: 'gram-002', kind: 'grammar', level: 'N5', title: '〜があります／います', reading: '', meaning: 'there is/are (inanimate/animate)', example: '机の上に本があります。', exampleMeaning: 'There is a book on the desk.', order: 2 },
  { id: 'gram-003', kind: 'grammar', level: 'N5', title: '〜ませんか', reading: '', meaning: 'Won\u2019t you...? (invitation)', example: '一緒に行きませんか。', exampleMeaning: "Won't you go together?", order: 3 },
  { id: 'gram-004', kind: 'grammar', level: 'N5', title: '〜たいです', reading: '', meaning: 'want to do ~', example: '日本へ行きたいです。', exampleMeaning: 'I want to go to Japan.', order: 4 },
  { id: 'gram-005', kind: 'grammar', level: 'N5', title: '〜てください', reading: '', meaning: 'please do ~', example: 'ここに座ってください。', exampleMeaning: 'Please sit here.', order: 5 },
  { id: 'gram-006', kind: 'grammar', level: 'N5', title: '〜ないでください', reading: '', meaning: 'please don\u2019t do ~', example: 'ここで写真を撮らないでください。', exampleMeaning: "Please don't take photos here.", order: 6 }
]

const sswKaigo: ContentItem[] = [
  { id: 'ssw-001', kind: 'ssw', level: 'N4', category: 'Kaigo (Nursing Care)', title: '入浴介助', reading: 'にゅうよくかいじょ', meaning: 'bathing assistance', example: '入浴介助を行います。', exampleMeaning: 'I provide bathing assistance.', order: 1 },
  { id: 'ssw-002', kind: 'ssw', level: 'N4', category: 'Kaigo (Nursing Care)', title: '車椅子', reading: 'くるまいす', meaning: 'wheelchair', example: '車椅子を押します。', exampleMeaning: 'I push the wheelchair.', order: 2 },
  { id: 'ssw-003', kind: 'ssw', level: 'N4', category: 'Food Service', title: '仕込み', reading: 'しこみ', meaning: 'food preparation', example: '朝、仕込みをします。', exampleMeaning: 'I prepare food in the morning.', order: 1 },
  { id: 'ssw-004', kind: 'ssw', level: 'N4', category: 'Construction', title: '足場', reading: 'あしば', meaning: 'scaffolding', example: '足場を組み立てます。', exampleMeaning: 'I assemble the scaffolding.', order: 1 }
]

const kaigoFukushishi: ContentItem[] = [
  { id: 'kaigo-001', kind: 'kaigo', level: 'N3', category: 'Vocabulary', title: '要介護', reading: 'ようかいご', meaning: 'requiring long-term care', example: '要介護3と認定されました。', exampleMeaning: 'Certified as care-level 3.', order: 1 },
  { id: 'kaigo-002', kind: 'kaigo', level: 'N3', category: 'Medical Terms', title: '褥瘡', reading: 'じょくそう', meaning: 'bedsore / pressure ulcer', example: '褥瘡を予防します。', exampleMeaning: 'I prevent bedsores.', order: 1 },
  { id: 'kaigo-003', kind: 'kaigo', level: 'N3', category: 'Ethics', title: '尊厳', reading: 'そんげん', meaning: 'dignity', example: '利用者の尊厳を守ります。', exampleMeaning: "I protect the client's dignity.", order: 1 },
  { id: 'kaigo-004', kind: 'kaigo', level: 'N3', category: 'Care Knowledge', title: '認知症', reading: 'にんちしょう', meaning: 'dementia', example: '認知症の方を介護します。', exampleMeaning: 'I care for a person with dementia.', order: 1 }
]

export const contentSeed: ContentItem[] = [...kanjiN5, ...grammarN5, ...sswKaigo, ...kaigoFukushishi]
