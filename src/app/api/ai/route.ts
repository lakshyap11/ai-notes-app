import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the endpoint is dynamically processed (since it uses environment variables and process context)
export const dynamic = "force-dynamic";

interface RequestBody {
  action: "summarize" | "grammar" | "improve" | "chat" | "grammar_fix";
  content: string;
  noteContext?: string; // Optional context of the active note for open-ended chats
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Gemini API Key configuration
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Gemini API Error]: GEMINI_API_KEY is not defined in environment variables.");
      return NextResponse.json(
        {
          error: "API Configuration Missing",
          message: "The Gemini API Key is not configured on the server. Please add GEMINI_API_KEY to your environment or .env.local file.",
        },
        { status: 501 }
      );
    }

    // 2. Parse and validate JSON request body
    let body: RequestBody;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON", message: "Please provide a valid JSON request body." },
        { status: 400 }
      );
    }

    const { action, content, noteContext } = body;

    if (!action || !content) {
      return NextResponse.json(
        {
          error: "Missing Parameters",
          message: "Both 'action' and 'content' parameters are required in the request body.",
        },
        { status: 400 }
      );
    }

    // 3. Route specific prompts based on requested action
    let prompt = "";
    switch (action) {
      case "summarize":
        prompt = `You are an elite, minimal note-taking assistant. Your task is to summarize the following note content. Provide a concise, highly-structured executive summary in clean markdown bullet points, focusing only on the most important takeaways and actionable items. Do not add introductory conversational filler. Start directly with the summary.\n\nNote Content:\n"""\n${content}\n"""`;
        break;

      case "grammar":
        prompt = `You are a professional editor. Please proofread the following text for spelling, grammar, punctuation, and sentence phrasing errors. Fix all mistakes while keeping the core meaning, original perspective, and structure intact. Return only the corrected text. Do not add any explanation, meta-commentary, or conversational filler.\n\nOriginal Text:\n"""\n${content}\n"""`;
        break;

      case "grammar_fix":
        prompt = `You are a minimally invasive editor. Your task is ONLY to correct spelling mistakes, punctuation errors, typos, and minor grammatical issues in the text below.
Strict Rules:
1. DO NOT rewrite the text heavily.
2. DO NOT change the emotional tone, vocabulary level, or conversational personality.
3. Keep the writing style casual, raw, and authentic to the user's voice.
4. Return ONLY the corrected text. Do not add any introduction, explanations, meta-commentary, or conversational filler.

Text to Correct:
"""
${content}
"""`;
        break;

      case "improve":
        prompt = `You are an expert writing coach. Refine the following text to dramatically improve its clarity, flow, vocabulary, and professional tone. Make it sound elegant, concise, and beautifully structured. Maintain the key points, but enhance the phrasing significantly. Return only the improved text. Do not add any explanation, meta-commentary, or conversational filler.\n\nOriginal Text:\n"""\n${content}\n"""`;
        break;

      case "chat":
        if (noteContext && noteContext.trim() !== "") {
          prompt = `You are a thoughtful late-night friend. You are calm, emotionally intelligent, subtle, natural, conversational, and human. Reflect with the user without sounding like a therapist.
Below is the active note the user is drafting, which you should use as key context for your discussion:
Active Note Context:
"""
${noteContext}
"""

User Message:
"""
${content}
"""

Your Role & Strict Conversational Rules:
1. KEEP RESPONSES SHORT: Your reply must be very concise: 1 to 3 sentences maximum. Sometimes even a single sentence. Avoid long paragraphs, essays, or overexplaining.
2. NATURAL HUMAN TONE: Use pauses (like "Yeah...", "Honestly..."), subtle wording, conversational rhythm, and emotionally realistic responses (e.g., "Yeah... that sounds draining honestly.", "Maybe you've just been overwhelmed for too long.", "That kind of thing can stay in your head for hours.", "I get why that would bother you.").
3. NEVER USE AI-LIKE PHRASES: NEVER say things like "I understand how you feel", "It's important to acknowledge", "Your feelings are valid", "Thank you for sharing", "As an AI companion", "I'm here for you", "Take care of your mental health", therapy jargon, corporate empathy, motivational speeches, or assistant-like phrasing.
4. MORE HUMAN IMPERFECTION: Keep it slightly casual, emotionally restrained, realistic, and thoughtful rather than perfectly polished. Text like a real person at night.
5. CONVERSATIONAL FLOW: React naturally. Do not give unsolicited advice constantly. You can ask an occasional small follow-up question if it feels natural.
6. MATCH USER ENERGY: If the user types short/casual/emotional messages, match that vibe perfectly.
7. FORMATTING: Do NOT output markdown headers, list structures, bold lists, or dividers unless explicitly requested. Write plain, natural conversational paragraphs. Keep it short.`;
        } else {
          prompt = `You are a thoughtful late-night friend. You are calm, emotionally intelligent, subtle, natural, conversational, and human. Reflect with the user without sounding like a therapist.

User Prompt/Message:
"""
${content}
"""

Your Role & Strict Conversational Rules:
1. KEEP RESPONSES SHORT: Your reply must be very concise: 1 to 3 sentences maximum. Sometimes even a single sentence. Avoid long paragraphs, essays, or overexplaining.
2. NATURAL HUMAN TONE: Use pauses (like "Yeah...", "Honestly..."), subtle wording, conversational rhythm, and emotionally realistic responses (e.g., "Yeah... that sounds draining honestly.", "Maybe you've just been overwhelmed for too long.", "That kind of thing can stay in your head for hours.", "I get why that would bother you.").
3. NEVER USE AI-LIKE PHRASES: NEVER say things like "I understand how you feel", "It's important to acknowledge", "Your feelings are valid", "Thank you for sharing", "As an AI companion", "I'm here for you", "Take care of your mental health", therapy jargon, corporate empathy, motivational speeches, or assistant-like phrasing.
4. MORE HUMAN IMPERFECTION: Keep it slightly casual, emotionally restrained, realistic, and thoughtful rather than perfectly polished. Text like a real person at night.
5. CONVERSATIONAL FLOW: React naturally. Do not give unsolicited advice constantly. You can ask an occasional small follow-up question if it feels natural.
6. MATCH USER ENERGY: If the user types short/casual/emotional messages, match that vibe perfectly.
7. FORMATTING: Do NOT output markdown headers, list structures, bold lists, or dividers unless explicitly requested. Write plain, natural conversational paragraphs. Keep it short.`;
        }
        break;

      default:
        return NextResponse.json(
          {
            error: "Unsupported Action",
            message: `The action '${action}' is not supported. Supported actions are: 'summarize', 'grammar', 'improve', 'chat', 'grammar_fix'.`,
          },
          { status: 400 }
        );
    }

    // 4. Initialize Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-2.5-flash for highly optimized performance and quick response speeds
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 5. Query the Gemini model
    console.log(`[Gemini API Request]: Invoking gemini-2.5-flash for action: "${action}"`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Received empty text response from Gemini API.");
    }

    // 6. Return response
    return NextResponse.json({
      action,
      response: text.trim(),
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("[Gemini API Route Error]:", error);
    
    return NextResponse.json(
      {
        error: "Gemini Integration Failed",
        message: error.message || "An unexpected error occurred while communicating with the AI service.",
      },
      { status: 500 }
    );
  }
}
