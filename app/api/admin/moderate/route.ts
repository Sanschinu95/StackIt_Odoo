import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import Question from "@/models/Question";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (session?.user?.email !== 'admin@stackit.com') {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    await dbConnect();
    const { questionId, action } = await request.json();

    if (!questionId || !action) {
      return NextResponse.json({ error: "Question ID and action are required" }, { status: 400 });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    let newStatus = 'active';
    switch (action) {
      case 'approve':
        newStatus = 'active';
        break;
      case 'moderate':
        newStatus = 'moderated';
        break;
      case 'delete':
        newStatus = 'deleted';
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    question.status = newStatus;
    question.updatedAt = new Date();
    await question.save();

    return NextResponse.json({ 
      success: true, 
      message: `Question ${action}d successfully`,
      question 
    });
  } catch (error) {
    console.error("Admin moderation error:", error);
    return NextResponse.json({ error: "Failed to moderate question" }, { status: 500 });
  }
} 