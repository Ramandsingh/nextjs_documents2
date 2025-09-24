import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(req: Request) {
  const { messages } = await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = messages.map((message: Message) => {
    if (message.role === 'user') {
      return { role: 'user', parts: [{ text: message.content }] };
    } else if (message.role === 'assistant') {
      return { role: 'model', parts: [{ text: message.content }] };
    }
    return null; // Should not happen with 'user' and 'assistant' roles
  }).filter(Boolean);

  const result = await model.generateContentStream({
    contents: prompt,
  });

  const stream = GoogleGenerativeAIStream(result);

  return new StreamingTextResponse(stream);
}