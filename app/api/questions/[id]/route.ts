import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Question from "@/models/Question";
// Import models to ensure they're registered
import "@/models/User";
import "@/models/Answer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('GET /api/questions/[id] - Starting request');
    
    await dbConnect();
    console.log('Database connected successfully');
    
    const { id } = await params;
    console.log('Question ID:', id);
    
    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      console.log('Invalid ObjectId format:', id);
      return NextResponse.json(
        { error: "Invalid question ID format" },
        { status: 400 }
      );
    }

    console.log('Searching for question with ID:', id);
    
    // Find the question by ID first
    let question = await Question.findById(id);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Try to populate related data, but don't fail if it doesn't work
    try {
      await question.populate('user', 'name email');
      await question.populate({
        path: 'answers',
        populate: { path: 'user', select: 'name email' }
      });
    } catch (populateError) {
      console.warn('Population failed, returning question without populated data:', populateError);
    }

    console.log('Query result: Question found');

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 