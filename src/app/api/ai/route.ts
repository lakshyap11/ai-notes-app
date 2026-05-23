import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the endpoint is dynamically processed (since it uses environment variables and process context)
export const dynamic = "force-dynamic";

interface RequestBody {
  action: "summarize" | "grammar" | "improve" | "chat";
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

      case "improve":
        prompt = `You are an expert writing coach. Refine the following text to dramatically improve its clarity, flow, vocabulary, and professional tone. Make it sound elegant, concise, and beautifully structured. Maintain the key points, but enhance the phrasing significantly. Return only the improved text. Do not add any explanation, meta-commentary, or conversational filler.\n\nOriginal Text:\n"""\n${content}\n"""`;
        break;

      case "chat":
        if (noteContext && noteContext.trim() !== "") {
          prompt = `You are a brilliant AI writing companion. Below is the active note the user is currently drafting:\n\nActive Note:\n"""\n${noteContext}\n"""\n\nUser Question/Message:\n"""\n${content}\n"""\n\nPlease answer the user's question, keeping the active note in mind as context. Keep your response minimal, helpful, conversational, and beautifully formatted in markdown.`;
        } else {
          prompt = `You are a brilliant, minimalist AI writing companion. The user is asking you a question or giving you a prompt:\n\nUser Input:\n"""\n${content}\n"""\n\nAddress their request in a helpful, concise, conversational, and structured manner in clean markdown.`;
        }
        break;

      default:
        return NextResponse.json(
          {
            error: "Unsupported Action",
            message: `The action '${action}' is not supported. Supported actions are: 'summarize', 'grammar', 'improve', 'chat'.`,
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
