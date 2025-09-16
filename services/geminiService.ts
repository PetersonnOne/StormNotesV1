import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { GroundingSource, AmbiguousLocationError, TimezoneCardData, ChatMessage } from '@/types';
import { cacheService } from '@/services/cacheService';

const apiKey = process.env.GEMINI_API_KEY as string;
const ai = new GoogleGenAI({ apiKey });

type ParsedTimezoneData = Omit<TimezoneCardData, 'id' | 'initialTime'> & { initialTime: string };

const parseGeminiResponse = (text: string): { [key:string]: string } => {
  const lines = text.split('\n');
  const result: { [key: string]: string } = {};
  for (const line of lines) {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      result[key] = value;
    }
  }
  return result;
};

const extractGroundingSources = (response: GenerateContentResponse): GroundingSource[] => {
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (!chunks) return [];
    
    return chunks.map(chunk => ({
        uri: chunk.web?.uri || '#',
        title: chunk.web?.title || 'Unknown Source'
    })).filter(source => source.uri !== '#');
};

export const getTimezoneData = async (location: string) => {
  const cacheKey = location.toLowerCase();
  const cached = cacheService.get<ReturnType<typeof getTimezoneData>>(cacheKey);
  if (cached) {
    // We need to return a new Date object from the cached ISO string
    const data = await cached;
    return { ...data, initialTime: new Date(data.initialTime) };
  }

  const prompt = `For the location '${location}', provide the current local time in 'YYYY-MM-DDTHH:mm:ss' format, the official IANA timezone name (e.g., 'America/New_York'), the current UTC offset (e.g., '+01:00' or '-07:00'), whether Daylight Saving Time is currently active (true/false), a corrected or more specific location name, and a brief note about the next DST change (e.g., "DST ends on Nov 5, 2024" or "DST starts on Mar 10, 2024").
If the location is ambiguous (e.g., 'Springfield'), respond ONLY with a line starting with 'AMBIGUOUS:' followed by a pipe-separated list of specific locations (e.g., 'AMBIGUOUS: Springfield, Illinois, USA | Springfield, Massachusetts, USA').
Format a successful response as a simple key-value string, with each key-value pair on a new line, like this:
Time: ...
Timezone: ...
Offset: ...
DST: ...
Location: ...
DST Info: ...
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const responseText = response.text.trim();
  if (responseText.startsWith('AMBIGUOUS:')) {
    const locations = responseText.replace('AMBIGUOUS:', '').trim().split('|').map(l => l.trim());
    throw new AmbiguousLocationError(locations);
  }

  const parsed = parseGeminiResponse(responseText);

  if (!parsed.Time || !parsed.Timezone || !parsed.Offset || !parsed.DST || !parsed.Location || !parsed['DST Info']) {
    throw new Error(`Could not parse the response from AI for '${location}'. Response: ${responseText}`);
  }

  const result = {
    initialTime: new Date(parsed.Time),
    timezone: parsed.Timezone,
    utcOffset: parsed.Offset,
    isDst: parsed.DST.toLowerCase() === 'true',
    location: parsed.Location,
    dstInfo: parsed['DST Info'],
    groundingSources: extractGroundingSources(response),
  };

  cacheService.set(cacheKey, result);

  return result;
};


export const convertTime = async (dateTime: string, fromZone: string, toZone: string) => {
    const prompt = `Convert the date and time '${dateTime}' from the '${fromZone}' timezone to the '${toZone}' timezone.
Provide a detailed explanation of the conversion, including the resulting timezone name (e.g., EDT) and any DST considerations.
Your response MUST be formatted as follows:
1. The first line must contain ONLY the converted date and time in 'YYYY-MM-DD HH:mm:ss' format.
2. Subsequent lines should contain the detailed explanation.

Example response:
2025-09-14 10:48:00
The date and time '2025-09-14T14:48' from the 'UTC' timezone converts to '2025-09-14 10:48:00' in the 'America/New_York' timezone. In September 2025, the 'America/New_York' timezone observes Eastern Daylight Time (EDT), which has an offset of UTC-4 hours.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const responseText = response.text.trim();
    const lines = responseText.split('\n');
    
    if (lines.length < 2 || !/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(lines[0])) {
        throw new Error('Failed to convert time. AI returned an invalid format.');
    }

    const convertedTime = lines[0];
    const explanation = lines.slice(1).join('\n').trim();

    return {
        convertedTime,
        explanation,
        groundingSources: extractGroundingSources(response)
    };
};

export const getReminderDelay = async (reminderDateTime: string, reminderZone: string) => {
    const prompt = `Calculate the number of milliseconds from right now until '${reminderDateTime}' in the '${reminderZone}' timezone. Provide only the number of milliseconds as an integer.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const delay = parseInt(response.text.trim(), 10);
    if (isNaN(delay) || delay < 0) {
        throw new Error('Could not set reminder in the past or AI returned an invalid delay.');
    }

    return delay;
};

export const composeReminderEmail = async (message: string, timezone: string) => {
    const prompt = `Generate a friendly and professional HTML email for a reminder.
The reminder is for: "${message}"
The reminder's timezone context is: "${timezone}"

Your response MUST be formatted as follows, with "---" as a separator:
1. The first line must be the email subject.
2. The remaining lines must be the HTML body of the email.

Example:
Reminder: Team Meeting
---
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; color: #333; }
  .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto; }
  .header { font-size: 24px; color: #007bff; }
</style>
</head>
<body>
  <div class="container">
    <h1 class="header">Just a friendly reminder!</h1>
    <p>This is a reminder for your scheduled event:</p>
    <p><strong>${message}</strong></p>
    <p><small>This reminder was set for the ${timezone} timezone.</small></p>
  </div>
</body>
</html>
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    const responseText = response.text.trim();
    const parts = responseText.split('---');
    if (parts.length < 2) {
        throw new Error("AI failed to generate a valid email format.");
    }

    return {
        subject: parts[0].trim(),
        body: parts.slice(1).join('---').trim(),
    };
};

const fileToGenerativePart = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL. Could not extract mime type and data.");
  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
};

export const sendChatMessage = async (history: ChatMessage[], newUserMessage: ChatMessage) => {
    const contents: Content[] = history.map(msg => {
        let textContent = msg.text;
        if (msg.attachment?.type === 'text') {
            textContent += `\n\n--- Content from ${msg.attachment.name} ---\n${msg.attachment.content}`;
        }
        
        const parts: Content['parts'] = [{ text: textContent }];
        if (msg.attachment?.type === 'image') {
            try {
                parts.push(fileToGenerativePart(msg.attachment.content));
            } catch (e) {
                console.error("Skipping invalid image from history:", e);
            }
        }
        return { role: msg.role, parts };
    });
    
    let userTextContent = newUserMessage.text;
    if (newUserMessage.attachment?.type === 'text') {
        userTextContent += `\n\n--- Content from ${newUserMessage.attachment.name} ---\n${newUserMessage.attachment.content}`;
    }

    const userParts: Content['parts'] = [{ text: userTextContent }];
    if (newUserMessage.attachment?.type === 'image') {
        try {
            userParts.push(fileToGenerativePart(newUserMessage.attachment.content));
        } catch (e) {
            console.error(e);
            throw new Error('There was an issue processing the image. Please try another one.');
        }
    }
    contents.push({ role: 'user', parts: userParts });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
        });

        if (!response.text && response.candidates?.[0]?.finishReason === 'SAFETY') {
            throw new Error("The response was blocked due to safety settings. Please adjust your prompt.");
        }
        
        if (!response.text) {
             throw new Error("The AI returned an empty response. It might be due to a content policy or other restriction.");
        }

        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (error instanceof Error) {
            throw new Error(`The AI service failed to respond. Reason: ${error.message}`);
        }
        throw new Error("An unexpected error occurred with the AI service.");
    }
};

export const analyzeText = async (fileContent: string): Promise<{summary: string; sentiment: string}> => {
    const prompt = `Analyze the following text. Provide a concise summary (2-3 sentences) and a one-word sentiment analysis (Positive, Negative, or Neutral).
Format your response exactly like this:
SUMMARY: [Your summary here]
SENTIMENT: [Your sentiment here]
---
TEXT TO ANALYZE:
${fileContent}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    const text = response.text;
    const summaryMatch = text.match(/SUMMARY: (.*)/);
    const sentimentMatch = text.match(/SENTIMENT: (.*)/);

    if (!summaryMatch || !sentimentMatch) {
        throw new Error("AI failed to return the analysis in the expected format.");
    }
    
    return {
        summary: summaryMatch[1].trim(),
        sentiment: sentimentMatch[1].trim(),
    };
};

export const composeAnalysisEmail = async (summary: string, sentiment: string, filename: string) => {
    const prompt = `Generate a professional HTML email to a colleague summarizing the analysis of a document.
The document's name is: "${filename}"
The analysis summary is: "${summary}"
The overall sentiment was: "${sentiment}"

Your response MUST be formatted as follows, with "---" as a separator:
1. The first line must be the email subject.
2. The remaining lines must be the HTML body of the email.

Make the email friendly, clear, and professional.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    const responseText = response.text.trim();
    const parts = responseText.split('---');
    if (parts.length < 2) {
        throw new Error("AI failed to generate a valid email format for the analysis.");
    }

    return {
        subject: parts[0].trim(),
        body: parts.slice(1).join('---').trim(),
    };
};

export const generateText = async (prompt: string) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    if (!response.text && response.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error("The response was blocked due to safety settings. Please adjust your prompt.");
    }
    
    if (!response.text) {
         throw new Error("The AI returned an empty response. It might be due to a content policy or other restriction.");
    }

    return response.text;
};