import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Get user ID
    const user = await User.findOne({ email: (session as any).user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { questionId, answerId, type } = await req.json();

    // Voting on a question
    if (questionId) {
      const question = await Question.findById(questionId);
      if (!question) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }
      if (!Array.isArray(question.voters)) {
        question.voters = [];
      }
      if (question.voters.includes(user._id)) {
        return NextResponse.json({ error: 'Already voted' }, { status: 400 });
      }
      question.votes += type === 'down' ? -1 : 1;
      question.voters.push(user._id);
      await question.save();

      return NextResponse.json({ question });
    }

    // Voting on an answer
    if (answerId) {
      const answer = await Answer.findById(answerId);
      if (!answer) {
        return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
      }
      if (!Array.isArray(answer.voters)) {
        answer.voters = [];
      }
      if (answer.voters.includes(user._id)) {
        return NextResponse.json({ error: 'Already voted' }, { status: 400 });
      }
      answer.votes += type === 'down' ? -1 : 1;
      answer.voters.push(user._id);
      await answer.save();

      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: 'Missing questionId or answerId' }, { status: 400 });
  } catch (error) {
    console.error('Vote API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
} 