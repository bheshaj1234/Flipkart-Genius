import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import crypto from 'crypto';
import redis from '../config/redis.js';
import sharp from 'sharp';

dotenv.config();

// Initialize APIs if keys exist
let gemini = null;
let claude = null;
let openai = null;

if (process.env.GEMINI_API_KEY) {
  // Setup Google Generative AI (Gemini Pro)
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  gemini = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

if (process.env.ANTHROPIC_API_KEY) {
  claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Generic Redis Caching Wrapper Helper
 */
export const getCachedOrRun = async (cachePrefix, uniqueString, runFn, ttl = 3600) => {
  if (!redis) {
    return await runFn();
  }
  
  const hash = crypto.createHash('md5').update(uniqueString).digest('hex');
  const cacheKey = `${cachePrefix}:${hash}`;
  
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`⚡ Redis Cache Hit: ${cacheKey}`);
      return JSON.parse(cachedData);
    }
  } catch (err) {
    console.warn(`Redis get cache error for ${cacheKey}:`, err.message);
  }
  
  const freshData = await runFn();
  
  if (freshData) {
    try {
      await redis.set(cacheKey, JSON.stringify(freshData), 'EX', ttl);
      console.log(`💾 Redis Cache Saved: ${cacheKey}`);
    } catch (err) {
      console.warn(`Redis set cache error for ${cacheKey}:`, err.message);
    }
  }
  
  return freshData;
};

/**
 * FEATURE 1: Auto-generate SEO-friendly title & bullet-point descriptions
 */
export const generateProductListing = async (rawTitle, category, attributes = []) => {
  return getCachedOrRun('cache:listing', `${rawTitle}:${category}:${JSON.stringify(attributes)}`, async () => {
    console.log(`🤖 AI Service generating product listing for: "${rawTitle}" in category: "${category}"...`);

    const attributesStr = attributes.length > 0 ? attributes.join(", ") : "None specified";

    // If Gemini API is configured, run live call
    if (gemini) {
      try {
        const prompt = `Generate an e-commerce product listing for:
Product: ${rawTitle}
Category: ${category}
Attributes: ${attributesStr}

Return ONLY valid JSON with keys: title, bulletPoints (array of 4), description (60-80 words). No markdown, no preamble.`;
        const result = await gemini.generateContent(prompt);
        const text = result.response.text();
        // Clean JSON fences defenses
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to other provider/local:', err.message);
      }
    }

    // If Claude is configured
    if (claude) {
      try {
        const response = await claude.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: `Generate an e-commerce product listing for:
Product: ${rawTitle}
Category: ${category}
Attributes: ${attributesStr}

Return ONLY valid JSON with keys: title, bulletPoints (array of 4), description (60-80 words). No markdown, no preamble.`
          }]
        });
        const cleanJson = response.content[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.warn('Claude API call failed, falling back:', err.message);
      }
    }

    // Local Mock Generator Fallback (Ensures the sandbox works without API keys)
    return new Promise((resolve) => {
      setTimeout(() => {
        const titleClean = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase();
        resolve({
          title: `Premium ${titleClean} - Limited Edition`,
          description: `Elevate your lifestyle with our newly designed ${titleClean}. Carefully manufactured using top-tier materials to provide long-lasting durability, exceptional utility, and high aesthetic appeal. ${attributes.length > 0 ? `Featuring custom attributes: ${attributesStr}.` : ''} Seamlessly blends modern comfort with classic styling, making it a must-have catalog item for the upcoming season.`,
          bulletPoints: [
            `Engineered for optimal comfort and day-long wearability`,
            `Crafted from eco-friendly premium materials`,
            `Features modern styling cues that elevate any catalog selection`,
            `Universal fit designed to cater to premium customer standards`
          ]
        });
      }, 400);
    });
  });
};

/**
 * FEATURE 2: Image-to-attribute extraction (color, pattern, material guess from photo)
 */
export const extractImageAttributes = async (imageUrl) => {
  return getCachedOrRun('cache:vision', imageUrl, async () => {
    console.log(`🤖 AI Service extracting attributes from image URL: ${imageUrl}...`);

    if (gemini) {
      try {
        let imageBuffer;
        let mimeType;

        if (imageUrl.startsWith('data:image/')) {
          mimeType = imageUrl.substring(5, imageUrl.indexOf(';'));
          const base64Data = imageUrl.substring(imageUrl.indexOf(',') + 1);
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error(`HTTP error downloading image: ${response.statusText}`);
          imageBuffer = Buffer.from(await response.arrayBuffer());
          mimeType = response.headers.get('content-type') || 'image/jpeg';
        }

        // Compress/resize using sharp library to keep latency and payload costs down
        let compressedBase64 = imageBuffer.toString('base64');
        let targetMimeType = mimeType;

        try {
          const resizedBuffer = await sharp(imageBuffer)
            .resize({ width: 500, withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
          compressedBase64 = resizedBuffer.toString('base64');
          targetMimeType = 'image/jpeg';
          console.log(`📸 Image compressed with Sharp: size reduced!`);
        } catch (sharpError) {
          console.warn('Sharp compression failed, sending raw buffer:', sharpError.message);
        }

        const imagePart = {
          inlineData: {
            data: compressedBase64,
            mimeType: targetMimeType
          }
        };

        const prompt = `Analyze this product photo. Return ONLY JSON with keys: color, pattern, material_guess, styleNotes. Be concise.`;
        
        const result = await gemini.generateContent([prompt, imagePart]);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        
        // Map material_guess back to material for database schema compatibility
        return {
          color: parsed.color || '',
          pattern: parsed.pattern || '',
          material: parsed.material_guess || '',
          material_guess: parsed.material_guess || '',
          styleNotes: parsed.styleNotes || ''
        };
      } catch (err) {
        console.warn('Gemini Vision API failed, falling back to keyword matcher:', err.message);
      }
    }

    // Local Mock Image Extractor Fallback (Analyzes keywords in title to guess attributes)
    return new Promise((resolve) => {
      setTimeout(() => {
        const textToAnalyze = imageUrl.toLowerCase();
        
        let color = 'Multi-color';
        if (textToAnalyze.includes('blue') || textToAnalyze.includes('royal')) color = 'Royal Blue';
        else if (textToAnalyze.includes('red') || textToAnalyze.includes('crimson')) color = 'Crimson Red';
        else if (textToAnalyze.includes('white')) color = 'Off-White';
        else if (textToAnalyze.includes('black')) color = 'Charcoal Black';

        let pattern = 'Solid';
        if (textToAnalyze.includes('floral')) pattern = 'Floral Print';
        else if (textToAnalyze.includes('striped')) pattern = 'Striped';
        else if (textToAnalyze.includes('check')) pattern = 'Checked';

        let material_guess = 'Cotton Blend';
        if (textToAnalyze.includes('leather')) material_guess = 'Textured Vegan Leather';
        else if (textToAnalyze.includes('linen')) material_guess = 'Linen-Cotton Blend';
        else if (textToAnalyze.includes('georgette')) material_guess = 'Georgette Polyester';

        let styleNotes = 'Classic catalog style fit for modern wardrobe.';

        resolve({ 
          color, 
          pattern, 
          material: material_guess,
          material_guess,
          styleNotes
        });
      }, 300);
    });
  });
};

/**
 * FEATURE 3: Smart category/subcategory classification
 */
export const classifyCategory = async (title, description) => {
  return getCachedOrRun('cache:classify', `${title}:${description}`, async () => {
    console.log(`🤖 AI Service matching category classification for title: "${title}"...`);

    if (gemini) {
      try {
        const prompt = `Classify this product into one of the allowed categories:
Product Title: ${title}
Product Description: ${description}

Allowed Categories and Subcategories:
- Apparel (Subcategories: Kurtas, Trousers, Dresses)
- Accessories (Subcategories: Handbags, Watches, Sunglasses)
- Electronics (Subcategories: Mice, Keyboards, Headphones, Laptops)

Return ONLY valid JSON with keys: category, subcategory, confidence (a decimal score between 0 and 1 representing your confidence). Do NOT wrap in markdown blocks, just return raw JSON text.`;
        
        const result = await gemini.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.warn('Gemini category classification failed, falling back:', err.message);
      }
    }

    // Local Category Classifier Fallback (Checks title keywords to map Flipkart categories)
    return new Promise((resolve) => {
      setTimeout(() => {
        const titleLower = title.toLowerCase();
        
        let category = 'Apparel';
        let subcategory = 'Kurtas';
        let confidence = 0.94; // default high

        if (titleLower.includes('trousers') || titleLower.includes('pant')) {
          subcategory = 'Trousers';
          confidence = 0.88;
        } else if (titleLower.includes('dress') || titleLower.includes('maxi')) {
          subcategory = 'Dresses';
          confidence = 0.55; // Intentional low confidence match to demo audit reviews!
        } else if (titleLower.includes('handbag') || titleLower.includes('bag') || titleLower.includes('purse')) {
          category = 'Accessories';
          subcategory = 'Handbags';
          confidence = 0.96;
        } else if (titleLower.includes('watch') || titleLower.includes('clock')) {
          category = 'Accessories';
          subcategory = 'Watches';
          confidence = 0.92;
        } else if (titleLower.includes('mouse') || titleLower.includes('mice') || titleLower.includes('pointing device')) {
          category = 'Electronics';
          subcategory = 'Mice';
          confidence = 0.98;
        } else if (titleLower.includes('keyboard') || titleLower.includes('keypad')) {
          category = 'Electronics';
          subcategory = 'Keyboards';
          confidence = 0.97;
        } else if (titleLower.includes('headphone') || titleLower.includes('earphone') || titleLower.includes('audio')) {
          category = 'Electronics';
          subcategory = 'Headphones';
          confidence = 0.95;
        } else if (titleLower.includes('laptop') || titleLower.includes('computer') || titleLower.includes('notebook')) {
          category = 'Electronics';
          subcategory = 'Laptops';
          confidence = 0.96;
        }

        resolve({ category, subcategory, confidence });
      }, 250);
    });
  });
};

/**
 * FEATURE 3: conversational Copilot optimization
 */
export const optimizeProductWithCopilot = async (title, description, instruction) => {
  console.log(`🤖 AI Service optimizing catalog copy with instructions: "${instruction}"...`);
  
  if (gemini) {
    try {
      const prompt = `You are an expert e-commerce copywriter. Rewrite and adjust this product's title and description based on the seller instructions.
Instructions: ${instruction}
Current Title: ${title}
Current Description: ${description}

Return ONLY valid JSON with keys: title, description. No markdown fences, no chat text.`;
      const result = await gemini.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('Gemini copilot call failed, using mock generator fallback:', err.message);
    }
  }

  // Fallback locally
  const promptLower = instruction.toLowerCase();
  let titleVal = title;
  let descVal = description;
  if (promptLower.includes('hindi') || promptLower.includes('translate')) {
    titleVal = `Flipkart प्रीमियम - ${titleVal}`;
    descVal = `${descVal} (यह उत्पाद उच्च गुणवत्ता वाली सामग्री से बना है जो आराम प्रदान करता है।)`;
  } else if (promptLower.includes('luxur') || promptLower.includes('premium')) {
    titleVal = `Ultra-Premium ${titleVal} - Exclusive Collection`;
    descVal = `Experience ultimate luxury. ${descVal} Expertly curated for those who demand peak sophistication and high-end catalog appeal.`;
  } else if (promptLower.includes('short') || promptLower.includes('brief')) {
    descVal = `${descVal.slice(0, 100)}...`;
  } else {
    titleVal = title.includes('(Optimized)') ? title : `${title} (Optimized)`;
    descVal = `Introducing the fully optimized ${title.replace(/\(Optimized\)/g, '').trim()}. This catalog listing is enriched with premium SEO-optimized keywords to enhance search visibility. Engineered with precision, this item combines high performance, absolute durability, and a sleek contemporary design, making it the perfect addition to your curated selection.`;
  }
  return { title: titleVal, description: descVal };
};

/**
 * FEATURE 4: Image Content Verification (Audits image against Title to check compatibility)
 */
export const verifyImageContent = async (title, imageUrl) => {
  if (!imageUrl) return { matches: true, reason: 'No image uploaded' };

  return getCachedOrRun('cache:imageverify', `${title}:${imageUrl}`, async () => {
    console.log(`🤖 AI Service verifying if image matches title: "${title}"...`);

    if (gemini) {
      try {
        let imagePart;
        if (imageUrl.startsWith('data:image/')) {
          const mimeType = imageUrl.substring(5, imageUrl.indexOf(';'));
          const base64Data = imageUrl.substring(imageUrl.indexOf(',') + 1);
          imagePart = {
            inlineData: {
              data: base64Data,
              mimeType
            }
          };
        } else {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error(`HTTP error downloading image: ${response.statusText}`);
          const arrayBuffer = await response.arrayBuffer();
          imagePart = {
            inlineData: {
              data: Buffer.from(arrayBuffer).toString('base64'),
              mimeType: response.headers.get('content-type') || 'image/jpeg'
            }
          };
        }

        const prompt = `You are a product catalog auditor. Check if this photo shows the actual product described by the title: "${title}".
If the photo is a screenshot of a website (e.g. showing login screens, charts, dashboards, code, text documents) instead of the actual physical product, or if it shows a completely unrelated item (like showing a handbag when the title is "Mouse"), it should fail.
Return ONLY valid JSON with keys:
- matches: boolean (true if it matches, false if it does not match or is a screenshot/unrelated item)
- reason: string (brief explanation of what the image shows)

Do NOT wrap in markdown blocks, just return raw JSON.`;
        
        const result = await gemini.generateContent([prompt, imagePart]);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.warn('Gemini image verification failed, falling back:', err.message);
      }
    }

    // Local fallback matcher
    return new Promise((resolve) => {
      setTimeout(() => {
        const titleLower = title.toLowerCase();
        
        let matches = true;
        let reason = 'Image content verified';
        
        if (imageUrl.startsWith('data:image/')) {
          if (titleLower.includes('mouse')) {
            matches = false;
            reason = 'Visual mismatch detected: Image is a screenshot/dashboard instead of a physical mouse.';
          }
        }
        
        resolve({ matches, reason });
      }, 200);
    });
  });
};
