import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import Notification from '@/models/Notification';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { answerId, questionId, type } = await req.json();

    // Voting on an answer
    if (answerId) {
      const answer = await Answer.findById(answerId);
      if (!answer) {
        return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
      }
      if (!Array.isArray(answer.voters)) {
        answer.voters = [];
      }
      if (answer.voters.includes(session.user.id)) {
        return NextResponse.json({ error: 'Already voted' }, { status: 400 });
      }
      answer.votes += type === 'down' ? -1 : 1;
      answer.voters.push(session.user.id);
      await answer.save();

      // Create notification for answer owner
      if (answer.user.toString() !== session.user.id) {
        await Notification.create({
          user: answer.user,
          type: type === 'down' ? 'downvote' : 'upvote',
          message: `Your answer received a ${type === 'down' ? 'downvote' : 'upvote'}`,
          answer: answerId,
          read: false,
        });
      }
      return NextResponse.json({ answer });
    }

    // Voting on a question
    if (questionId) {
      const question = await Question.findById(questionId);
      if (!question) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }
      if (!Array.isArray(question.voters)) {
        question.voters = [];
      }
      if (question.voters.includes(session.user.id)) {
        return NextResponse.json({ error: 'Already voted' }, { status: 400 });
      }
      question.votes += type === 'down' ? -1 : 1;
      question.voters.push(session.user.id);
      await question.save();

      // Optionally: create notification for question owner
      // ...

      return NextResponse.json({ question });
    }

    return NextResponse.json({ error: 'Missing answerId or questionId' }, { status: 400 });
  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error?.message || error }, { status: 500 });
  }
} 