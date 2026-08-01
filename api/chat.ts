// Vercel serverless function (Edge runtime). POST /api/chat.
// Keeps ANTHROPIC_API_KEY server-side — never expose it as a VITE_ var.
// Local dev: run via `vercel dev` (plain `vite dev` won't serve this route).

interface ChatRequestBody {
  action?: 'reply' | 'score'
  mode: string
  scenario: string
  messages: { role: 'user' | 'assistant'; text: string }[]
}

const SENSEI_NAME = 'Arif Boncel Sensei'

const MODE_PROMPTS: Record<string, string> = {
  'free-chat': 'This is FREE-FORM Q&A mode, not a roleplay scenario. The learner may ask general questions, request sentence corrections, ask for translations (Indonesian <-> Japanese), or ask for grammar explanations. Answer directly and helpfully in a mix of Japanese and Indonesian/English as appropriate to the question — you do not need to stay "in character" as anyone other than yourself.',
  beginner: 'The learner is a BEGINNER. Use simple vocabulary, short sentences, and include romaji in parentheses for anything non-trivial.',
  intermediate: 'The learner is INTERMEDIATE. Use natural conversational Japanese with occasional new vocabulary, minimal romaji.',
  advanced: 'The learner is ADVANCED. Use natural, native-paced Japanese with idiomatic expressions and no romaji.',
  jlpt: 'This is JLPT PRACTICE. Use vocabulary and grammar patterns appropriate to the stated JLPT level, similar to what would appear on the exam.',
  'job-interview': 'This is a JAPANESE JOB INTERVIEW simulation. Use polite/keigo business Japanese and ask realistic interview questions.',
  'ssw-interview': 'This is an SSW (Specified Skilled Worker) VISA INTERVIEW simulation. Ask about work experience, availability, and basic workplace Japanese relevant to the stated industry, in polite Japanese.',
  'kaigo-interview': 'This is a KAIGO FUKUSHISHI (care worker) INTERVIEW/practice simulation. Ask about care scenarios, use care-related vocabulary, and keep a professional, polite tone.'
}

async function callAnthropic(apiKey: string, system: string, messages: { role: 'user' | 'assistant'; content: string }[]) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 500, system, messages })
  })
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Anthropic API error: ${errText}`)
  }
  const data = await response.json()
  return (data.content ?? [])
    .map((block: { type: string; text?: string }) => (block.type === 'text' ? block.text : ''))
    .filter(Boolean)
    .join('\n')
}

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Model did not return JSON')
  return JSON.parse(match[0])
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured on the server. Add it in your Vercel project environment variables.' }),
      { status: 500 }
    )
  }

  let body: ChatRequestBody
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const { scenario, messages, mode = 'beginner', action = 'reply' } = body
  if (!Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'messages must be an array' }), { status: 400 })
  }

  try {
    if (action === 'score') {
      const transcript = messages.map((m) => `${m.role === 'user' ? 'Learner' : 'Teacher'}: ${m.text}`).join('\n')
      const system = `You are ${SENSEI_NAME}, a Japanese teacher evaluating a learner's role-play conversation practice (scenario: "${scenario}"). Score their Japanese output only (ignore the teacher's own lines) on grammar, vocabulary use, and appropriateness, from 0-100. Respond with ONLY a JSON object: {"score": <number>, "feedback": "<2-3 sentence constructive feedback in Indonesian>"}. No other text.`
      const text = await callAnthropic(apiKey, system, [{ role: 'user', content: transcript }])
      const parsed = extractJson(text) as { score: number; feedback: string }
      return new Response(JSON.stringify(parsed), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    const modeInstruction = MODE_PROMPTS[mode] ?? MODE_PROMPTS.beginner
    const system =
      mode === 'free-chat'
        ? `You are ${SENSEI_NAME}, a friendly, patient Japanese teacher. ${modeInstruction} Keep replies to 2-5 sentences. Respond with ONLY a JSON object: {"reply": "<your helpful answer>", "correction": ""}. The correction field should always be an empty string in this mode (it's only used in roleplay modes). No text outside the JSON.`
        : `You are ${SENSEI_NAME}, a friendly, patient Japanese conversation teacher running a role-play scenario: "${scenario}". ${modeInstruction} Keep replies to 2-4 sentences so the conversation stays interactive. Stay in character for the scenario. Respond with ONLY a JSON object: {"reply": "<your in-character Japanese response>", "correction": "<if the learner's last message had a notable grammar/vocab mistake, a short one-sentence correction in Indonesian; otherwise an empty string>"}. No text outside the JSON.`

    const text = await callAnthropic(apiKey, system, messages.map((m) => ({ role: m.role, content: m.text })))
    const parsed = extractJson(text) as { reply: string; correction: string }
    return new Response(JSON.stringify(parsed), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { status: 500 })
  }
}

export const config = {
  runtime: 'edge'
}
