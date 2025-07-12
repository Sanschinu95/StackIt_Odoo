import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import Notification from '@/models/Notification';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const { questionId, content } = await req.json();
  if (!questionId || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const answer = await Answer.create({
    content,
    user: session.user.id,
    question: questionId,
    votes: 0,
    voters: [],
  });
  await Question.findByIdAndUpdate(questionId, { $push: { answers: answer._id } });
  
  // Create notification for question owner
  const question = await Question.findById(questionId).populate('user');
  if (question && question.user && question.user.toString() !== session.user.id) {
    await Notification.create({
      user: question.user,
      type: 'new_answer',
      message: `New answer on "${question.title}"`,
      question: questionId,
      read: false,
    });
  }
  
  return NextResponse.json({ answer });
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  let query = {};
  if (userId) {
    query = { user: userId };
  }
  
  const answers = await Answer.find(query)
    .populate('user', 'name email image')
    .populate('question', 'title');
  return NextResponse.json({ answers });
} 