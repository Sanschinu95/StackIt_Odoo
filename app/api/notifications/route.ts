import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const notifications = await Notification.find({ user: session.user.id })
    .sort({ read: 1, createdAt: -1 })
    .limit(20);
  return NextResponse.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  await Notification.updateMany({ user: session.user.id, read: false }, { $set: { read: true } });
  return NextResponse.json({ success: true });
} 