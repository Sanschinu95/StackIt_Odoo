import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiAnalysis: {
    autoTags: {
      tags: [String],
      confidence: Number,
      reasoning: String
    },
    moderation: {
      isAppropriate: Boolean,
      confidence: Number,
      issues: [String],
      suggestions: [String]
    },
    summary: {
      summary: String,
      keyPoints: [String],
      category: String,
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
      }
    },
    duplicateCheck: {
      isDuplicate: Boolean,
      similarQuestions: [String],
      confidence: Number
    }
  },
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'moderated', 'closed', 'deleted'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }
}, {
  timestamps: true
});

// Indexes for better performance
questionSchema.index({ title: 'text', tags: 'text' });
questionSchema.index({ user: 1, createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ status: 1 });
questionSchema.index({ 'aiAnalysis.summary.category': 1 });
questionSchema.index({ 'aiAnalysis.summary.difficulty': 1 });

// Virtual for answer count
questionSchema.virtual('answerCount').get(function() {
  return this.answers.length;
});



// Method to update answer status
questionSchema.methods.updateAnswerStatus = function() {
  this.isAnswered = this.answers.length > 0;
  return this.save();
};

// Method to increment views
questionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get trending questions
questionSchema.statics.getTrending = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ votes: -1, views: -1, createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .populate('answers');
};

// Static method to get questions by category
questionSchema.statics.getByCategory = function(category: string, limit = 20) {
  return this.find({ 
    status: 'active',
    'aiAnalysis.summary.category': category 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .populate('answers');
};

// Static method to get questions by difficulty
questionSchema.statics.getByDifficulty = function(difficulty: string, limit = 20) {
  return this.find({ 
    status: 'active',
    'aiAnalysis.summary.difficulty': difficulty 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .populate('answers');
};

// Static method to get similar questions
questionSchema.statics.getSimilar = function(questionId: string, limit = 5) {
  return this.findById(questionId).then((question: any) => {
    if (!question) return [];
    
    return this.find({
      _id: { $ne: questionId },
      status: 'active',
      $or: [
        { tags: { $in: question.tags } },
        { 'aiAnalysis.summary.category': question.aiAnalysis?.summary?.category }
      ]
    })
      .sort({ votes: -1, createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .populate('answers');
  });
};

export default mongoose.models.Question || mongoose.model('Question', questionSchema); 