export interface WishPromptOptions {
  recipientName: string;
  relationship: string;
  occasion: string;
  tone: string;
  language: "bn" | "en" | "banglish";
  extraNotes?: string;
}

export async function generateAiWish(options: WishPromptOptions): Promise<string> {
  const { recipientName, relationship, occasion, tone, language, extraNotes } = options;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `
        You are a warm, thoughtful greeting writer for the DearDates app.
        Write a personalized wish based on the following details:
        - Recipient Name: ${recipientName}
        - Relationship: ${relationship}
        - Occasion: ${occasion}
        - Tone: ${tone} (e.g. Funny, Heartfelt, Poetic, Professional, Emotional)
        - Language: ${language === "bn" ? "Bengali (বাংলা লিপি)" : language === "banglish" ? "Banglish (Bengali in English alphabet)" : "English"}
        ${extraNotes ? `- Additional Context: ${extraNotes}` : ""}

        Instructions:
        - Return ONLY the greeting message text without explanations or quotation marks.
        - Include suitable emojis.
        - Make it sound natural, sincere, and perfectly suited to the relationship and tone.
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 300,
            },
          }),
        }
      );

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        return generatedText.trim();
      }
    } catch (err) {
      console.error("Gemini API error:", err);
    }
  }

  // Fallback high-quality curated templates if Gemini key is not added yet:
  return getTemplateWish(options);
}

function getTemplateWish({ recipientName, relationship, occasion, tone, language }: WishPromptOptions): string {
  if (language === "bn") {
    if (tone.toLowerCase().includes("funny")) {
      return `শুভ ${occasion}, ${recipientName}! 🎂 বয়স তো আরেক বছর বাড়ল, এবার কি একটু বড়দের মতো আচরণ করবা নাকি আগের মতোই পাগলামি চলতেই থাকবে? যা-ই হোক, দিনটা অনেক অনেক আনন্দের কাটুক! 🎉🥳`;
    }
    if (tone.toLowerCase().includes("emotional") || tone.toLowerCase().includes("heartfelt")) {
      return `প্রিয় ${recipientName}, আজকের এই বিশেষ দিনে তোমার জন্য রইল হৃদয়ের গভীর থেকে অজস্র শুভকামনা ও ভালোবাসা। তোমার জীবনের প্রতিটি পদক্ষেপ সাফল্য ও অনাবিল শান্তিতে ভরে উঠুক। শুভ ${occasion}! ❤️✨`;
    }
    return `শুভ ${occasion}, ${recipientName}! আশা করি আজকের বিশেষ দিনটি তোমার জন্য দারুণ সব আনন্দের মুহূর্ত আর ভালোবাসা নিয়ে আসবে। আগামী দিনগুলো আরও সুন্দর ও সফল হোক! 🎈🌟`;
  }

  if (language === "banglish") {
    if (tone.toLowerCase().includes("funny")) {
      return `Shuvo ${occasion}, ${recipientName}! 🎂 Boyos to arek bochor barlo, treat kobe diccho? Enjoy your day to the fullest! 🥳🎉`;
    }
    return `Shuvo ${occasion}, ${recipientName}! Tomar jibone shob shomoy anondo ar shukh thakuk. Have an awesome celebration today! ❤️✨`;
  }

  // English
  if (tone.toLowerCase().includes("funny")) {
    return `Happy ${occasion}, ${recipientName}! 🎉 Another year older, but definitely not any wiser! May your day be as awesome and unforgettable as you are. 🎂✨`;
  }
  if (tone.toLowerCase().includes("emotional") || tone.toLowerCase().includes("heartfelt")) {
    return `Dearest ${recipientName}, wishing you a truly wonderful ${occasion}! You bring so much joy and light into everyone's life. May this upcoming year grant all your deepest dreams and hopes. With all my love! ❤️🥂`;
  }
  return `Happy ${occasion}, ${recipientName}! Wishing you a fantastic day filled with laughter, joy, and wonderful memories with your loved ones. Have a blast! 🌟🎁`;
}
