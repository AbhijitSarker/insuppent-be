import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generatePersonalizedEmails = async (lead) => {
  const prompt = `Generate three different personalized email messages for a lead with the following details:\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nAddress: ${lead.address}\nZip Code: ${lead.zipCode}\nState: ${lead.state}\nType: ${lead.type}\n\nEach email should be a JSON object with 'subject', 'body', and 'tone' fields.\nThe first email should have a friendly tone, the second a professional tone, and the third a casual tone.\nReturn the emails as a JSON array of objects in this order.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant for writing sales emails.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1100,
    temperature: 0.8,
  });

  const text = response.choices[0].message.content;
  // Try to parse as JSON array of objects with tone
  try {
    // Remove markdown code block if present
    const cleanText = text.replace(/^```json[\s\S]*?\n|```$/g, '').trim();
    const emails = JSON.parse(cleanText);
    if (Array.isArray(emails) && emails.length === 3 && emails.every(e => e.subject && e.body && e.tone)) {
      return emails;
    }
  } catch (e) {
    // fallback below
  }
  // Fallback: try to extract objects from string
  const objectRegex = /\{[\s\S]*?\}/g;
  const matches = text.match(objectRegex);
  if (matches && matches.length) {
    const tones = ['friendly', 'professional', 'casual'];
    const emails = matches.map((str, i) => {
      try {
        const obj = JSON.parse(str);
        if (!obj.tone) obj.tone = tones[i] || '';
        return obj;
      } catch {
        // Try to extract subject/body manually
        const subject = str.match(/subject['"]?\s*:\s*['"]([^'"]+)['"]/i)?.[1] || '';
        const body = str.match(/body['"]?\s*:\s*['"]([\s\S]+)['"]/i)?.[1] || '';
        const tone = str.match(/tone['"]?\s*:\s*['"]([^'"]+)['"]/i)?.[1] || tones[i] || '';
        return { subject, body, tone };
      }
    });
    return emails.slice(0, 3);
  }
  // Last fallback: treat as plain text, split and wrap
  const tones = ['friendly', 'professional', 'casual'];
  return text.split(/\n\n+/).filter(Boolean).slice(0, 3).map((body, i) => ({ subject: `Email ${i+1}`, body, tone: tones[i] || '' }));
};
