import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { questionId, content } = await request.json();

    if (!questionId || !content) {
      return NextResponse.json({ error: 'Question ID and content are required' }, { status: 400 });
    }

    // Get user ID
    const user = await User.findOne({ email: (session as any).user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Create answer
    const answer = new Answer({
      content,
      user: user._id,
      question: questionId,
    });

    await answer.save();

    // Populate user info for response
    await answer.populate('user', 'name email');

    return NextResponse.json({ 
      message: 'Answer created successfully',
      answer 
    });

  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');
    const userId = searchParams.get('userId');

    if (!questionId && !userId) {
      return NextResponse.json({ error: 'Question ID or User ID is required' }, { status: 400 });
    }

    let query: any = {};
    
    if (questionId) {
      query.question = questionId;
    }
    
    if (userId) {
      query.user = userId;
    }

    // Fetch answers based on the query
    const answers = await Answer.find(query)
      .populate('user', 'name email')
      .populate('question', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json({ answers });

  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 