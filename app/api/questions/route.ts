import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/dbConnect";
import Question from "@/models/Question";
import { geminiService } from "@/lib/gemini";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const filter = searchParams.get('filter') || 'newest';
    
    let query: any = {};
    
    if (userId) {
      query.user = userId;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    let sortOption: any = {};
    switch (filter) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { votes: -1, createdAt: -1 };
        break;
      case 'unanswered':
        query.answers = { $size: 0 };
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const questions = await Question.find(query)
      .populate('user', 'name email')
      .populate({
        path: 'answers',
        populate: { path: 'user', select: 'name email' }
      })
      .sort(sortOption)
      .limit(50);
    
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/questions - Starting request processing');
    
    const session = await getServerSession(authOptions);
    console.log('Session check:', { hasSession: !!session, userId: session?.user?.id });
    
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');
    
    const { title, description, tags } = await request.json();
    console.log('Request data received:', { title, descriptionLength: description?.length, tags });

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    // Extract plain text from Editor.js content for AI analysis
    const contentData = JSON.parse(description);
    const plainText = contentData.blocks
      ?.map((block: any) => block.data?.text || '')
      .join(' ')
      .replace(/<[^>]*>/g, '') || '';

    // AI Analysis
    console.log('Starting AI analysis...');
    let aiAnalysis;
    try {
      aiAnalysis = await geminiService.analyzeContent(title, plainText);
      console.log('AI analysis completed successfully');
    } catch (error) {
      console.error('AI analysis failed:', error);
      aiAnalysis = null;
    }

    // Check for duplicate questions
    let duplicateCheck = { isDuplicate: false, similarQuestions: [], confidence: 0 };
    try {
      const existingQuestions = await Question.find({}, 'title').limit(10);
      const existingTitles = existingQuestions.map(q => q.title);
      duplicateCheck = await geminiService.detectDuplicateQuestions(title, existingTitles);
    } catch (error) {
      console.error('Duplicate check failed:', error);
    }

    // Combine user tags with AI suggestions
    const finalTags = [...new Set([
      ...(tags || []),
      ...(aiAnalysis?.autoTags.tags || [])
    ])].slice(0, 8); // Limit to 8 tags total

    // Create question with AI analysis data
    console.log('Creating question object...');
    const question = new Question({
      title,
      description,
      tags: finalTags,
      user: session.user.id,
      aiAnalysis: aiAnalysis ? {
        autoTags: aiAnalysis.autoTags,
        moderation: aiAnalysis.moderation,
        summary: aiAnalysis.summary,
        duplicateCheck
      } : null,
      createdAt: new Date(),
      votes: 0,
      voters: [],
      answers: []
    });

    console.log('Saving question to database...');
    await question.save();
    console.log('Question saved successfully');

    // Populate user data
    await question.populate('user', 'name email');

    return NextResponse.json({ 
      question,
      aiAnalysis: aiAnalysis ? {
        autoTags: aiAnalysis.autoTags,
        moderation: aiAnalysis.moderation,
        summary: aiAnalysis.summary,
        duplicateCheck
      } : null
    });
  } catch (error) {
    console.error("Error creating question:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ 
      error: "Failed to create question", 
      details: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 