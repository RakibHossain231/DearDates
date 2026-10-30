import { getOccasionLabel } from "@/lib/occasions";

export interface WishPromptOptions {
  recipientName: string;
  relationship: string;
  occasion: string;
  tone: string;
  language: string; // "bn" | "en" | "banglish" | "islamic" | "formal_bn"
  extraNotes?: string;
}

export async function generateAiWish(options: WishPromptOptions): Promise<string> {
  const { recipientName, relationship, occasion, tone, language, extraNotes } = options;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const occasionName = getOccasionLabel(occasion);
      const prompt = `
        You are an elite, highly empathetic creative greeting writer for the DearDates celebration app.
        Write an authentic, memorable, and personalized wish tailored specifically to these parameters:
        - Recipient Name: ${recipientName}
        - Relationship: ${relationship}
        - Celebration Occasion: ${occasionName} (code: ${occasion})
        - Tone & Mood: ${tone}
        - Language: ${
          language === "bn"
            ? "Bengali (খাঁটি প্রমিত বাংলা লিপি)"
            : language === "banglish"
            ? "Banglish (Bengali written in English letters / alphabet)"
            : language === "islamic"
            ? "Islamic Greeting with authentic Arabic Duas transliterated / written in Bengali"
            : language === "formal_bn"
            ? "সাধু ও মার্জিত গম্ভীর বাংলা"
            : "English (Natural, heartfelt English)"
        }
        ${extraNotes ? `- Extra Specific Details / Memories: ${extraNotes}` : ""}

        Crucial Instructions:
        1. Contextual Accuracy: The message MUST strictly address the exact occasion (${occasionName}). Never mention age/birthdays if it is an Eid, Wedding, or Graduation!
        2. Relationship Dynamic: Address ${recipientName} fittingly according to relationship (${relationship}) — e.g. Mother as "মা", spouse with tender romance, best friend playfully/casually, mentor/boss with respect.
        3. Tone Precision: Embody the requested tone (${tone}) faithfully. If funny, be witty and humorous; if Islamic, include authentic heartfelt Duas (যেমন: তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম, বারাকাল্লাহু ফিকুম, আল্লাহ আপনার নেক আমল কবুল করুন); if romantic, write poetic and intimate lines.
        4. Output Format: Return ONLY the greeting message text ready to be sent. No preamble, no quote marks, no bullet points.
        5. Emojis: Include 2-4 tasteful, fitting emojis.
      `;

      // Try gemini-1.5-flash or gemini-2.0-flash
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 350,
            },
          }),
        }
      );

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText && generatedText.trim().length > 10) {
        return generatedText.trim().replace(/^["']|["']$/g, "");
      }
    } catch (err) {
      console.warn("Gemini API call failed, using intelligent template engine:", err);
    }
  }

  // Fallback high-quality curated template generator
  return getTemplateWish(options);
}

// Random selector helper for variety
function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getTemplateWish({
  recipientName,
  relationship,
  occasion,
  tone,
  language,
  extraNotes,
}: WishPromptOptions): string {
  const occ = (occasion || "BIRTHDAY").toUpperCase();
  const rel = (relationship || "Friend").toLowerCase();
  const t = (tone || "warm").toLowerCase();
  const lang = (language || "bn").toLowerCase();

  const isMom = rel.includes("mother") || rel.includes("মা");
  const isDad = rel.includes("father") || rel.includes("বাবা");
  const isParent = isMom || isDad || rel.includes("parent");
  const isSpouse = rel.includes("husband") || rel.includes("wife") || rel.includes("partner") || rel.includes("lover") || rel.includes("fianc");
  const isBestie = rel.includes("best") || rel.includes("friend") || rel.includes("buddy") || rel.includes("দোস্ত") || rel.includes("বন্ধু");
  const isBoss = rel.includes("boss") || rel.includes("mentor") || rel.includes("colleague") || rel.includes("client") || rel.includes("teacher");
  const isSibling = rel.includes("brother") || rel.includes("sister") || rel.includes("ভাই") || rel.includes("বোন");

  const isFunny = t.includes("funny") || t.includes("roast") || t.includes("playful") || t.includes("মজার");
  const isRomantic = t.includes("romantic") || t.includes("sweet") || t.includes("মিষ্টি") || t.includes("প্রেম");
  const isIslamic = t.includes("islamic") || t.includes("blessed") || t.includes("dua") || lang.includes("islamic") || t.includes("দোয়া");
  const isFormal = t.includes("formal") || t.includes("respect") || t.includes("মার্জিত") || lang.includes("formal");
  const isPoetic = t.includes("poetic") || t.includes("aesthetic") || t.includes("কাব্যিক");
  const isShort = t.includes("short") || t.includes("punchy") || t.includes("সংক্ষিপ্ত");

  // 1. EID-UL-FITR
  if (occ.includes("EID_FITR") || occ.includes("FITR")) {
    if (lang === "en") {
      if (isFunny) return pickRandom([
        `Eid Mubarak, ${recipientName}! 🌙✨ May your day be filled with lots of food, zero drama, and heavy pockets from Salami! Have an awesome feast! 🥳🎉`,
        `Happy Eid, ${recipientName}! 🌙 Remember, calories on Eid don't count, so eat until you can't move! Enjoy to the fullest! 🍖🍨`
      ]);
      if (isSpouse) return pickRandom([
        `Eid Mubarak to the love of my life, ${recipientName}! 🌙💖 Your smile is brighter than the Eid crescent. Thank you for making every day feel like a festival. Love you always! ✨🌹`,
        `Dearest ${recipientName}, celebrating this blessed Eid by your side is my greatest joy. May Allah shower our life together with peace and eternal romance. Eid Mubarak, my heart! 🌙🥂`
      ]);
      return pickRandom([
        `Eid Mubarak, ${recipientName}! 🌙🤲 May the divine blessings of Allah bring you peace, boundless joy, good health, and immense prosperity today and always! 🎉✨`,
        `Wishing you and your family a truly blessed Eid-ul-Fitr, ${recipientName}! May all your prayers and fasts be accepted. Have a memorable celebration! 🌙🌸`
      ]);
    }

    if (lang === "banglish") {
      if (isFunny && isBestie) return pickRandom([
        `Eid Mubarak dost ${recipientName}! 🌙✨ Eibar kintu kono bahana cholbe na, double salami dite hobe! Shob kacha biriyani ar semai eka eka khash na, amader o dakhis! 🥳🎉`,
        `Eid Mubarak ${recipientName}! 🌙 Boyos to holo, ekhon salami dabi kora bondho kore choto der salami deya shuru kor! Have a grand Eid bro! 🍖🥂`
      ]);
      return pickRandom([
        `Eid Mubarak ${recipientName}! 🌙🤲 Allah tomar shob nek dua ar roza kobul koruk. Tomar jibon anondo ar shantite vore uthuk! Have a blessed celebration! ✨🎉`,
        `Wishing you a very happy Eid-ul-Fitr, ${recipientName}! Eid er anondo ghire thakuk tomake ar tomar poribar ke. Eid Mubarak! 🌙💖`
      ]);
    }

    // Bangla
    if (isFunny && (isBestie || isSibling)) return pickRandom([
      `ঈদ মোবারক দোস্ত ${recipientName}! 🌙✨ এবার ঈদে কিন্তু কোনো বাহানা চলবে না, ডাবল সালামি দিতে হবে! একা একা সেমাই আর বিরিয়ানি সাবাড় না করে আমাদের দিকেও একটু নজর রাখিস! ফাটিয়ে এনজয় কর আজকের দিনটা! 🥳🎉`,
      `ঈদ মোবারক ${recipientName}! 🌙 বয়স তো অনেক বাড়ল, এবার ছোটদের মতো সালামি ভিক্ষা করা বন্ধ করে আমাদের সালামি দেওয়া শুরু কর! খাওয়া-দাওয়ার টেবিল ফাঁকা করার শুভকামনা রইল! 🍖😂`
    ]);

    if (isSpouse) return pickRandom([
      `আমার ঈদের চাঁদ তুমি, ${recipientName}! 🌙❤️ তোমার হাসিতেই আমার প্রতিটি দিন ঈদের চেয়েও রঙিন। আজকের এই পবিত্র দিনে তোমার জন্য রইল আমার হৃদয়ের সবটুকু ভালোবাসা আর অন্তহীন শুভকামনা। ঈদ মোবারক আমার ভালোবাসা! 🌹✨`,
      `প্রিয়তম ${recipientName}, তোমার ভালোবাসাই আমার জীবনের সবচেয়ে বড় নেয়ামত। মহান আল্লাহ আমাদের এই বন্ধন চির অমলিন রাখুন। ঈদের অনেক অনেক ভালোবাসা ও শুভেচ্ছা! 🌙💖`
    ]);

    if (isParent) return pickRandom([
      `শ্রদ্ধেয় ${isMom ? "মা" : isDad ? "বাবা" : recipientName}, আপনাকে পবিত্র ঈদ-উল-ফিতরের আন্তরিক মোবারকবাদ! 🌙🤲 মহান আল্লাহ আপনার নেক আমল কবুল করুন, আপনাকে সুস্থ ও দীর্ঘজীবী রাখুন। আপনার ছায়াই আমাদের সবচেয়ে বড় আশ্রয়। ঈদ মোবারক! ❤️🌸`,
      `আমার প্রিয় ${recipientName}, আজকের এই পবিত্র দিনে দোয়া করি আল্লাহ আপনার জীবন বরকত, শান্তি আর আনন্দে পরিপূর্ণ করে দিন। শুভ ঈদ মোবারক! 🌙🤲`
    ]);

    if (isIslamic) return pickRandom([
      `তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম! 🌙🤲 পবিত্র ঈদ-উল-ফিতরের আন্তরিক মোবারকবাদ ${recipientName}। মহান রাব্বুল আলামিন আপনার রোজা, নামাজ ও সমস্ত নেক আমল কবুল করে নিন এবং আপনার ওপর রহমতের বারিধারা বর্ষণ করুন। ঈদ মোবারক! 🌸✨`,
      `ঈদ মোবারক ${recipientName}! 🌙 আল্লাহ আপনার জীবনকে সুখ, ঈমানি দৃঢ়তা এবং তাকওয়ার আলোয় আলোকিত করুন। আপনার ও আপনার পরিবারের জন্য রইল দোয়া ও আন্তরিক মোবারকবাদ। 🤲🌹`
    ]);

    return pickRandom([
      `পবিত্র ঈদ-উল-ফিতরের প্রাণঢালা শুভেচ্ছা ও মোবারকবাদ, ${recipientName}! 🌙✨ ত্যাগের মাস শেষে এই ঈদের প্রতিটি মুহূর্ত আপনার জীবনে বয়ে আনুক অনাবিল আনন্দ, শান্তি ও অফুরন্ত বরকত। ঈদ মোবারক! 🎉🌸`,
      `ঈদ মোবারক ${recipientName}! 🌙 আনন্দ, সম্প্রীতি আর ভালোবাসায় ভরে উঠুক আপনার ঈদের প্রতিটি ক্ষণ। পরিবারের সবাইকে নিয়ে খুব সুন্দর আর স্মৃতিময় একটি ঈদ কাটুক! 🥳🎈`
    ]);
  }

  // 2. EID-UL-ADHA
  if (occ.includes("EID_ADHA") || occ.includes("ADHA")) {
    if (lang === "en") {
      return pickRandom([
        `Eid-ul-Adha Mubarak, ${recipientName}! 🕋🌙 May the spirit of sacrifice and devotion illuminate your path and bring profound blessings to you and your loved ones. 🤲✨`,
        `Wishing you a joyful and blessed Eid-ul-Adha, ${recipientName}! May your prayers and sacrifices be accepted by Almighty Allah. Have a wonderful feast! 🍖🎉`
      ]);
    }
    return pickRandom([
      `ঈদ-উল-আযহা মোবারক ${recipientName}! 🕋🌙 ত্যাগের মহিমায় উদ্ভাসিত হোক এই পবিত্র দিনটি। মহান আল্লাহ আপনার কোরবানি ও নেক দোয়া কবুল করুন এবং পরিবারে শান্তি ও সুখ দান করুন। তাকাব্বালাল্লাহু মিন্না ওয়া মিনকুম! 🤲✨`,
      `পবিত্র কোরবানির ঈদের আন্তরিক মোবারকবাদ ${recipientName}! 🌙🍖 আত্মত্যাগ আর ক্ষমার শিক্ষায় সুন্দর হোক আমাদের জীবন। পরিবারের সবাইকে নিয়ে অনেক আনন্দের একটি ঈদ কাটুক! ঈদ মোবারক! 🌸🎉`
    ]);
  }

  // 3. BIRTHDAY
  if (occ.includes("BIRTHDAY")) {
    if (lang === "en") {
      if (isFunny) return pickRandom([
        `Happy Birthday, ${recipientName}! 🎂🎉 Another year older, but definitely not any wiser! Where is the giant party and treat? Have a blast today! 🥳🍻`,
        `Happy Birthday to one of the few people whose birthday I don't need Facebook to remind me of! Stay awesome, ${recipientName}! 🎈✨`
      ]);
      if (isSpouse) return pickRandom([
        `Happy Birthday to the love of my life, ${recipientName}! 🎂💖 You make every single moment brighter and sweeter. I love you more with every passing day. Cheers to you, my darling! 🥂🌹`,
        `Dearest ${recipientName}, you are my greatest blessing and favorite person in the world. May this year bring you all the love and happiness you deserve! Happy Birthday! ❤️✨`
      ]);
      return pickRandom([
        `Happy Birthday, ${recipientName}! 🎂✨ May this year be filled with exciting opportunities, good health, and joyful moments. Wishing you endless happiness! 🥳🎉`,
        `Wishing you a very Happy Birthday, ${recipientName}! 🎈 May your dreams take flight and every wish of yours come true. Have an incredible celebration today! 🌟🎁`
      ]);
    }

    if (lang === "banglish") {
      if (isFunny) return pickRandom([
        `Happy Birthday dost ${recipientName}! 🎂 Boyos to arek bochor barlo, treat kobe dicchis bol? Ajker din ta pura fatiye enjoy kor! 🥳🎉`,
        `Shuvo Jonmodin ${recipientName}! 🎈 Budhhi shudhdhi hoilo na ektao, tobuo toke bhalobashi! Treat ready rakhis! 🍻🎂`
      ]);
      return pickRandom([
        `Happy Birthday ${recipientName}! 🎂✨ Tomar agami bochor ta onk shundor ar shofol hok. Enjoy your special day to the fullest! ❤️🎉`,
        `Shuvo Jonmodin ${recipientName}! Wishing you lots of love, good health, and joy today and always! 🌟🎁`
      ]);
    }

    // Bangla
    if (isFunny && (isBestie || isSibling)) return pickRandom([
      `শুভ জন্মদিন দোস্ত ${recipientName}! 🎂🎉 বয়স তো দেখতে দেখতে এক বছর বেড়ে গেল, কিন্তু আক্কেল কি কোনোদিন হবে রে? যা-ই হোক, আজকের দিনটা ফাটিয়ে এনজয় কর আর বিশাল এক ট্রিটের আয়োজন জলদি করিস! হ্যাপি বার্থডে! 🥳🍻`,
      `শুভ জন্মদিন ${recipientName}! 🎈 বয়স বাড়ছে বাড়ুক, মনের ভেতরের এই পাগলামি যেন কখনোই কমে না যায়! সারাজীবন যেন এমন হাসিখুশি থাকতে পারিস। ট্রিট ফাঁকি দিলে খবর আছে কিন্তু! 🎂😂`
    ]);

    if (isSpouse) return pickRandom([
      `শুভ জন্মদিন আমার হৃদয়ের মানুষ, ${recipientName}! 🎂💖 তোমার ভালোবাসায় আমার জীবন রঙিন আর পূর্ণ। প্রার্থনা করি তোমার সব স্বপ্ন আর ইচ্ছা সত্যি হোক। তোমায় অনেক অনেক ভালোবাসি, আজ এবং আজীবন! 🌹✨`,
      `আমার পৃথিবীর সবচেয়ে প্রিয় মানুষটাকে জন্মদিনের একরাশ ভালোবাসা! 🎂❤️ তুমি পাশে থাকলে যেকোনো পথ সহজ মনে হয়। সৃষ্টিকর্তা তোমাকে দীর্ঘায়ু আর সুস্বাস্থ্য দান করুন। শুভ জন্মদিন ${recipientName}! 🥂🌸`
    ]);

    if (isMom) return pickRandom([
      `শুভ জন্মদিন আমার পৃথিবীর শ্রেষ্ঠ মা, ${recipientName}! 🎂❤️ তোমার নিঃস্বার্থ ভালোবাসা আর স্নেহের ঋণ কোনোদিন শোধ করতে পারব না। সৃষ্টিকর্তা তোমাকে সবসময় সুস্থ, নিরাপদ ও দীর্ঘায়ু রাখুন। অনেক ভালোবাসি মা! 🌸🤲`,
      `মাগো, তোমার ভালোবাসাই আমার সবচেয়ে বড় শক্তি। জন্মদিনে তোমার জন্য রইল অন্তহীন শ্রদ্ধা, ভালোবাসা আর শুভকামনা। শুভ জন্মদিন মা! 🎂❤️`
    ]);

    if (isDad) return pickRandom([
      `শুভ জন্মদিন বাবা, ${recipientName}! 🎂❤️ আপনার ত্যাগ আর ভালোবাসার ছায়ায় আমি আজ এতদূর আসতে পেরেছি। মহান আল্লাহ আপনাকে সুস্থ ও দীর্ঘ জীবন দান করুন। শুভ জন্মদিন বাবা! 🌟🤲`,
      `আমার জীবনের আসল সুপারহিরো বাবা! জন্মদিনে আপনার প্রতি রইল অশেষ শ্রদ্ধা ও ভালোবাসা। শুভ জন্মদিন ${recipientName}! 🎂🎉`
    ]);

    if (isIslamic) return pickRandom([
      `শুভ জন্মদিন ${recipientName}! 🎂🤲 মহান আল্লাহ তায়ালা আপনার জীবনে অফুরন্ত বরকত দান করুন, নেক আমল বাড়িয়ে দিন এবং আপনাকে ঈমান, আমল ও সুস্বাস্থ্যের সাথে দীর্ঘায়ু নসিব করুন। শুভকামনা রইল! 🌸✨`,
      `বারাকাল্লাহু ফিকুম ${recipientName}! জীবনের নতুন এই বছরে আল্লাহ আপনার সব নেক দোয়া কবুল করুন এবং প্রতিটি পদক্ষেপে সাহায্য করুন। শুভ জন্মদিন! 🎂🤲`
    ]);

    return pickRandom([
      `শুভ জন্মদিন, ${recipientName}! 🎂🎉 আজকের এই বিশেষ দিনে তোমার জন্য রইল হৃদয়ের গভীর থেকে অজস্র ভালোবাসা ও শুভকামনা। নতুন বছরটি তোমার জীবনে নিয়ে আসুক দারুণ সব অর্জন ও অনাবিল সুখ। অনেক আনন্দময় একটি দিন কাটুক! 🎈🌟`,
      `শুভ জন্মদিন ${recipientName}! 🎂✨ তোমার জীবনের প্রতিটি পাতা সাফল্য, সুস্বাস্থ্য আর ভালোবাসায় ভরে উঠুক। সবসময় এমন হাসিখুশি আর প্রাণবন্ত থেকো! হ্যাপি বার্থডে! 🥳💖`
    ]);
  }

  // 4. ANNIVERSARY
  if (occ.includes("ANNIVERSARY")) {
    if (lang === "en") {
      return pickRandom([
        `Happy Anniversary, ${recipientName}! 💍💖 May the beautiful bond of love, trust, and companionship you share continue to grow deeper with every passing year. Cheers to your journey! 🥂✨`,
        `Wishing you a very Happy Anniversary, ${recipientName}! May your love story continue to inspire and blossom with endless happiness! 🌹🎉`
      ]);
    }
    if (isSpouse) return pickRandom([
      `শুভ বিবাহবার্ষিকী আমার প্রিয়তম ${recipientName}! 💍💖 তোমার হাত ধরে পথচলার প্রতিটি মুহূর্ত আমার জীবনের শ্রেষ্ঠ আশীর্বাদ। বছরের পর বছর আমাদের ভালোবাসা যেন এমন অমলিন আর গভীর থাকে। ভালোবাসি তোমায় আজীবন! 🥂🌹`,
      `আমার জীবনের সবচেয়ে সুন্দর সিদ্ধান্তের নাম তুমি, ${recipientName}! শুভ বিবাহবার্ষিকী! একসাথে হাজার বছর পার করার এই পথচলা চিরসুন্দর হোক! ❤️✨`
    ]);
    return pickRandom([
      `শুভ বিবাহবার্ষিকী ${recipientName}! 💍🌸 আপনাদের ভালোবাসার এই সুন্দর জুটি চিরদিন এমনই অমলিন আর হাসিখুশি থাকুক। আগামী দিনগুলো আরও অনেক আনন্দ, শান্তি ও সৌহার্দ্যে পূর্ণ হোক! 🥂✨`,
      `বিবাহবার্ষিকীর প্রাণঢালা অভিনন্দন ও শুভেচ্ছা ${recipientName}! আপনাদের বন্ধন যেন আজীবন ভালোবাসা আর পারস্পরিক শ্রদ্ধার প্রতীক হয়ে থাকে। অনেক অনেক শুভকামনা! 🌹🎉`
    ]);
  }

  // 5. NEW YEAR
  if (occ.includes("NEW_YEAR")) {
    if (lang === "en") {
      return pickRandom([
        `Happy New Year, ${recipientName}! 🎆✨ May this coming year bring new opportunities, endless laughter, great health, and remarkable achievements into your life! 🥳🥂`,
        `Wishing you a joyful and prosperous New Year, ${recipientName}! May 2026 and beyond be your most extraordinary chapter yet! 🌟🎉`
      ]);
    }
    return pickRandom([
      `শুভ নববর্ষ, নতুন বছরের অনেক অনেক শুভেচ্ছা ${recipientName}! 🎆✨ ফেলে আসা বছরের সব ক্লান্তি আর দুঃখ মুছে গিয়ে নতুন বছর তোমার জীবনে নিয়ে আসুক নতুন আশা, নতুন উদ্যম আর একরাশ রঙিন সাফল্য! হ্যাপি নিউ ইয়ার! 🥳🥂`,
      `নতুন বছরের আন্তরিক শুভকামনা ${recipientName}! 🌟 নতুন সম্ভাবনা আর আলোয় ভরে উঠুক আপনার জীবনের প্রতিটি দিন। পরিবার নিয়ে অনেক ভালো থাকুন সবসময়! 🎆💖`
    ]);
  }

  // 6. VALENTINE
  if (occ.includes("VALENTINE")) {
    if (lang === "en") {
      return pickRandom([
        `Happy Valentine's Day, ${recipientName}! ❤️🌹 You make my world a softer, brighter, and infinitely more beautiful place. Thank you for being you! 💖✨`,
        `Dearest ${recipientName}, happy Valentine's Day! Sending all my love, hugs, and sweetest wishes your way today and every day! 🥂🌹`
      ]);
    }
    return pickRandom([
      `হ্যাপি ভ্যালেন্টাইনস ডে, ভালোবাসা দিবসের অনেক ভালোবাসা ${recipientName}! ❤️🌹 তুমি পাশে থাকলে পৃথিবীটা সত্যিই রূপকথার মতো মনে হয়। প্রতিটি দিন তোমার ভালোবাসায় ধন্য। ভালোবাসি তোমায় অনেক! 💖✨`,
      `আমার প্রিয় মানুষ ${recipientName}, ভালোবাসা দিবসে তোমার জন্য রইল হৃদয়ের সবটুকু ভালোবাসা। তুমিই আমার হাসির কারণ, আমার প্রশান্তির আশ্রয়। শুভ ভালোবাসা দিবস! 🌹❤️`
    ]);
  }

  // 7. GRADUATION
  if (occ.includes("GRADUATION")) {
    if (lang === "en") {
      return pickRandom([
        `Huge congratulations on your graduation, ${recipientName}! 🎓🌟 All your dedication and sleepless nights have paid off. The world is yours to conquer—go shine bright! 🚀🎉`,
        `Happy Graduation, ${recipientName}! 🎓 So tremendously proud of your achievement. Wishing you grand success in all your future ventures! 🏆✨`
      ]);
    }
    return pickRandom([
      `প্রাণঢালা অভিনন্দন গ্র্যাজুয়েট ${recipientName}! 🎓🌟 তোমার অক্লান্ত পরিশ্রম আর একাগ্রতা আজ সাফল্যের মুকুট পরিয়েছে। তোমার এই বিরাট অর্জনে আমরা অত্যন্ত গর্বিত! আগামী পথচলায় আরও বড় বড় সাফল্যের চূড়া স্পর্শ করো। শুভকামনা রইল! 🚀🏆`,
      `গ্র্যাজুয়েশন সম্পন্ন করার জন্য মন থেকে শুভেচ্ছা ${recipientName}! 🎓 তোমার মেধা আর নিষ্ঠা তোমাকে অনন্য উচ্চতায় নিয়ে যাবে এই বিশ্বাস আমাদের আছে। অনেক ভালোবাসা ও শুভকামনা! 🌟🎉`
    ]);
  }

  // 8. JOB PROMOTION
  if (occ.includes("JOB_PROMOTION") || occ.includes("PROMOTION")) {
    if (lang === "en") {
      return pickRandom([
        `Hearty congratulations on your well-deserved promotion, ${recipientName}! 💼🚀 Your hard work, passion, and leadership truly set you apart. Wishing you soaring success in this new role! 🏆🎉`,
        `Huge congrats on the promotion, ${recipientName}! 🌟 Nobody deserves this milestone more than you. Keep leading the way forward! 👏✨`
      ]);
    }
    return pickRandom([
      `অসাধারণ খবর ${recipientName}, পদোন্নতির জন্য মন থেকে প্রাণঢালা অভিনন্দন! 💼🚀 তোমার মেধা, দক্ষতা আর দায়িত্বশীলতার যোগ্য স্বীকৃতি এটি। নতুন দায়িত্বে তোমার ক্যারিয়ার আরও নতুন উচ্চতায় পৌঁছাক! অনেক অনেক শুভকামনা! 🎉🏆`,
      `প্রমোশনের জন্য অনেক অনেক শুভেচ্ছা ${recipientName}! 👏💼 তোমার নিষ্ঠা আর পরিশ্রম সত্যিই প্রশংসনীয়। সামনের দিনগুলোতে আরও বড় বড় সাফল্য তোমার সঙ্গী হোক! 🌟🚀`
    ]);
  }

  // 9. NEWBORN BABY
  if (occ.includes("NEW_BORN") || occ.includes("BABY")) {
    if (lang === "en") {
      return pickRandom([
        `Welcome to the world, little angel! 👶🍼 Huge congratulations to you and your family, ${recipientName}! May your precious baby be blessed with boundless health, joy, and love. 🌸✨`,
        `Warmest congratulations on the arrival of your sweet baby, ${recipientName}! May parenthood bring you the sweetest moments and purest happiness! 🍼💖`
      ]);
    }
    return pickRandom([
      `নতুন রাজপুত্র/রাজকন্যার আগমনে হৃদয়খোলা অভিনন্দন ও ভালোবাসা ${recipientName}! 👶🍼 আপনার ছোট্ট সোনামণির জীবন আলো, সুস্থতা আর অফুরন্ত আনন্দে ভরে উঠুক। নতুন বাবা-মাকে অনেক অনেক মোবারকবাদ! 🌸🎈`,
      `ঘরে নতুন মেহমান আসার খুশিতে অনেক অনেক শুভেচ্ছা ${recipientName}! 👶💖 ছোট্ট পরীর সুস্বাস্থ্য ও মঙ্গল কামনা করি। আপনাদের পরিবারে আনন্দের বন্যা বইতে থাকুক! 🍼✨`
    ]);
  }

  // 10. HOUSEWARMING
  if (occ.includes("HOUSEWARMING") || occ.includes("HOME")) {
    return pickRandom([
      `নতুন ঠিকানার জন্য অনেক অনেক অভিনন্দন ও শুভেচ্ছা ${recipientName}! 🏡✨ আপনার এই নতুন বাড়িটি সবসময় শান্তি, ভালোবাসা, সুস্বাস্থ্য আর হাসিখুশি মুহূর্তে মুখরিত থাকুক। শুভ গৃহপ্রবেশ! 🌸🔑`,
      `Hearty congratulations on your new home, ${recipientName}! 🏡🎉 May your new abode be filled with warmth, endless laughter, and cherished family memories! 🔑✨`
    ]);
  }

  // 11. FRIENDSHIP
  if (occ.includes("FRIENDSHIP")) {
    return pickRandom([
      `হ্যাপি ফ্রেন্ডশিপ ডে দোস্ত ${recipientName}! 🤝💖 তোর মতো একজন খাঁটি বন্ধু পাশে থাকা মানে জীবনের অর্ধেক টেনশন এমনিতেই নাই! সারা জীবন আমাদের এই বন্ডিং এমন অটুট থাকুক। লাভ ইউ ব্রো! 🥳🍻`,
      `Happy Friendship Day, ${recipientName}! 🤝✨ Thank you for always having my back, for the late-night laughs, and for being such a loyal, true friend. Cheers to our lifetime bond! 💖🎉`
    ]);
  }

  // 12. PARENTS DAY
  if (occ.includes("PARENTS_DAY") || occ.includes("MOTHER") || occ.includes("FATHER")) {
    return pickRandom([
      `শ্রদ্ধেয় ${recipientName}, আপনার নিঃস্বার্থ ভালোবাসা, ত্যাগ আর স্নেহের ঋণ কোনোদিন শোধ করা সম্ভব নয়। আপনি আমাদের জীবনের সবচেয়ে বড় উপহার। সৃষ্টিকর্তা আপনাকে দীর্ঘায়ু ও সুস্থ রাখুন! অনেক ভালোবাসি! 💐❤️`,
      `Dearest ${recipientName}, thank you for your boundless love, endless sacrifices, and unconditional guidance. You are my world and my greatest blessing. Love you forever! 🌸💖`
    ]);
  }

  // 13. GET WELL SOON
  if (occ.includes("GET_WELL")) {
    return pickRandom([
      `দ্রুত সুস্থ হয়ে ওঠো ${recipientName}! 🩹💐 তোমার হাসিমুখ ছাড়া চারপাশটা কেমন যেন ফিকে লাগে। প্রার্থনা করি সৃষ্টিকর্তা তোমাকে দ্রুত পূর্ণ সুস্থতা ও নতুন শক্তি দান করুন। নিজের যত্ন নিয়ো! 🤲🌸`,
      `Wishing you a very speedy and complete recovery, ${recipientName}! 🩹✨ Sending warm healing thoughts, love, and prayers your way. Get well soon! 🌸🤲`
    ]);
  }

  // 14. THANK YOU
  if (occ.includes("THANK_YOU")) {
    return pickRandom([
      `হৃদয়ের গভীর থেকে অজস্র ধন্যবাদ ${recipientName}! 🙏✨ তোমার আন্তরিকতা, সহায়তা আর স্নেহের জন্য আমি চিরকৃতজ্ঞ। তোমার মতো মনের মানুষ পাওয়া সত্যি এক পরম পাওয়া। ভালো থেকো সবসময়! 🌸💖`,
      `Thank you so very much, ${recipientName}! 🙏💖 Your kindness, generosity, and thoughtful support mean the absolute world to me. Truly grateful for you! 🌟✨`
    ]);
  }

  // 15. DIWALI
  if (occ.includes("DIWALI")) {
    return pickRandom([
      `শুভ দীপাবলি ও দীপান্বিতা লক্ষ্মীপূজার আন্তরিক প্রীতি ও শুভেচ্ছা ${recipientName}! 🪔✨ প্রদীপের পবিত্র আলো আপনার জীবন থেকে সব অন্ধকার দূর করে সুখ, শান্তি, সমৃদ্ধি ও আনন্দ বয়ে আনুক। হ্যাপি দিওয়ালি! 🪔🌟`,
      `Wishing you and your family a dazzling and blessed Diwali, ${recipientName}! 🪔✨ May the festival of lights illuminate your life with health, fortune, and boundless joy! 🌟🎉`
    ]);
  }

  // 16. CHRISTMAS
  if (occ.includes("CHRISTMAS")) {
    return pickRandom([
      `শুভ বড়দিন, মেরি ক্রিসমাস ${recipientName}! 🎄✨ যিশুখ্রিষ্টের প্রেমের বাণীতে আলোকিত হোক আপনার জীবন। ভালোবাসা, আনন্দ ও শান্তিতে ভরে উঠুক এই বড়দিন ও ছুটির মৌসুম! 🎅🎁`,
      `Merry Christmas, ${recipientName}! 🎄🎅 May the peace, joy, and warmth of Christmas fill your heart and home today and throughout the upcoming year! 🎁✨`
    ]);
  }

  // 17. CUSTOM / DEFAULT
  if (lang === "en") {
    return pickRandom([
      `Warmest celebration greetings to you, ${recipientName}! 🌟✨ May this special occasion bring you immense happiness, delightful surprises, and sweet memories to cherish forever! 🎉🎁`,
      `Wishing you a fantastic celebration, ${recipientName}! 🎈 May your day be as extraordinary and wonderful as you are! Cheers! 🥂🌟`
    ]);
  }

  return pickRandom([
    `প্রিয় ${recipientName}, আজকের এই বিশেষ আয়োজনে তোমার জন্য রইল আমার হৃদয়ের গভীর থেকে প্রাণঢালা শুভেচ্ছা ও ভালোবাসা! 🌟✨ দিনটি তোমার জন্য দারুণ সব আনন্দের মুহূর্ত আর অনন্য স্মৃতি বয়ে আনুক। অনেক অনেক শুভকামনা! 🎉💖`,
    `আন্তরিক শুভেচ্ছা ও ভালোবাসা গ্রহণ করো ${recipientName}! 🌸 প্রতিটি দিন তোমার জীবনে সাফল্য আর আনন্দের নতুন গল্প লিখুক। সবসময় ভালো থেকো আর হাসিখুশি থেকো! 🎈✨`
  ]);
}
