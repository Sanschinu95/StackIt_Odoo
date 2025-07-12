import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { geminiService } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, type } = await request.json();

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    let result;
    switch (type) {
      case 'answer_suggestions':
        result = await geminiService.generateAnswerSuggestions(question);
        break;
      case 'auto_tags':
        result = await geminiService.autoTagContent(question, '');
        break;
      case 'moderation':
        result = await geminiService.moderateContent(question, '');
        break;
      case 'summary':
        result = await geminiService.summarizeContent(question, '');
        break;
      default:
        return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI suggestions error:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
} 