import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generatePersonalizedEmails = async (lead) => {
  const prompt = `Generate three distinctly different personalized email messages for a lead with the following details:\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nAddress: ${lead.address}\nZip Code: ${lead.zipCode}\nState: ${lead.state}\nType: ${lead.type}\n\nEach email should be a JSON object with 'subject', 'body', and 'tone' fields.\n\n1. Friendly tone email: Warm, personal, and conversational. Use casual language while maintaining professionalism.\n2. Professional tone email: Formal, business-like, and structured. Focus on credentials and expertise.\n3. Casual tone email: Very relaxed and informal, like talking to a friend, but still maintaining business appropriateness.\n\nEach email body must be COMPLETELY DIFFERENT in content and approach while incorporating the lead's details. The structure should be:\n\nHi [First Name],\n\n[Unique opening paragraph based on tone]\n\n[Unique value proposition paragraph based on tone]\n\n[Unique call to action based on tone]\n\n[Appropriate closing based on tone]\nYour Name\nYour Company\n[Phone Number] | [Email]\n[Website Link]\n\nIMPORTANT:\n- Each email must have entirely different content, not just rephrased versions of the same message\n- For the 'body' field, return the content as HTML, with each paragraph wrapped in <p>...</p> tags\n- Use 2 <br> tags for new lines, only <p> for paragraphs\n- Keep the closing placeholders as shown\n- Return the emails as a JSON array of objects in the specified tone order\n\nExample approaches (but create your own unique content):\nFriendly: Focus on understanding and helping with their needs\nProfessional: Emphasize expertise and market knowledge\nCasual: Share relatable experiences and create connection. note: by lead type mortgage, i mean mortgage protection`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant for writing sales emails.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 2000,
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
