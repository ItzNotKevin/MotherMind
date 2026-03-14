import type { Message, Scenario, SupportFeedback } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

async function generate(prompt: string, systemInstruction?: string): Promise<string> {
  const body = {
    ...(systemInstruction && {
      system_instruction: { parts: [{ text: systemInstruction }] },
    }),
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
    },
  };

  const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as GeminiResponse;
  return data.candidates[0].content.parts[0].text;
}

export async function getConversationResponse(
  scenario: Scenario,
  messages: Message[],
  userMessage: string,
): Promise<string> {
  const systemInstruction = `You are playing the role of a ${scenario.aiRole} in a real conversation.
The person speaking with you is a newcomer mother who is practicing English.

RULES (follow strictly):
- Respond in 1-2 SHORT sentences only. Never more.
- Use very simple, clear, everyday English. Short words.
- Be warm, patient, and natural.
- Do NOT break character or offer any language help.
- React naturally to what the mother says, even if her English is imperfect.
- After 2-3 exchanges, wrap up the conversation warmly (e.g. "Thank you so much! Have a wonderful day.").`;

  const history = messages
    .map((m) => `${m.role === 'ai' ? 'You' : 'Mother'}: ${m.text}`)
    .join('\n');

  const prompt = `${history ? `Conversation so far:\n${history}\n\n` : ''}Mother says: "${userMessage}"

Reply as the ${scenario.aiRole}. Keep it to 1-2 simple sentences.`;

  return generate(prompt, systemInstruction);
}

export async function generateSupportFeedback(
  scenario: Scenario,
  messages: Message[],
): Promise<SupportFeedback> {
  const userMessages = messages.filter((m) => m.role === 'user');
  const fullConversation = messages
    .map((m) => `${m.role === 'ai' ? 'Staff' : 'Mother'}: ${m.text}`)
    .join('\n');

  const systemInstruction = `You are a warm, supportive English language coach helping a newcomer mother.
Give gentle, practical feedback. Never use grammar jargon. Be encouraging.`;

  const prompt = `Scenario: "${scenario.title}" — talking to a ${scenario.aiRole}

Full conversation:
${fullConversation}

The mother said: ${userMessages.map((m) => `"${m.text}"`).join(' and ')}

Return ONLY a valid JSON object. No markdown. No explanation. Just the JSON:
{
  "say_it_better": "Start with 'A clearer way to say it:' then give the improved version of what the mother said",
  "understand_it_better": "Start with 'This question means:' then explain in simple words what the staff was asking. Max 2 sentences.",
  "practice_word": "one important single word from this conversation",
  "practice_phrase": "a short useful phrase (3-6 words) the mother could use",
  "practice_sentence": "one complete, natural sentence she could say in this situation",
  "encouragement": "A warm 1-sentence encouragement. Be gentle. Examples: 'Good try! You got your message across.', 'Very close! You are doing great.'"
}`;

  const raw = await generate(prompt, systemInstruction);

  try {
    const cleaned = raw.replace(/```json\n?|\n?```|```/g, '').trim();
    return JSON.parse(cleaned) as SupportFeedback;
  } catch {
    // Fallback feedback so the app never crashes
    return {
      say_it_better: `A clearer way to say it: "${userMessages[0]?.text ?? 'I need help, please'}"`,
      understand_it_better: 'This question means: How can I help you today?',
      practice_word: 'appointment',
      practice_phrase: 'I need help with',
      practice_sentence: 'I would like to make an appointment, please.',
      encouragement: 'Good try! You got your message across. Keep practicing!',
    };
  }
}
