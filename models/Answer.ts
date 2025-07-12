import mongoose, { Schema, Document, models } from 'mongoose';

export interface IAnswer extends Document {
  content: any; // changed from string to any
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  votes: number;
  voters: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  content: { type: Schema.Types.Mixed, required: true }, // changed from String to Mixed
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  votes: { type: Number, default: 0 },
  voters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export default models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema); 