"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Alert, 
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { 
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Block as BlockIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";

interface Question {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  user: { name: string; email: string };
  createdAt: string;
  status: string;
  aiAnalysis?: {
    moderation: {
      isAppropriate: boolean;
      confidence: number;
      issues: string[];
      suggestions: string[];
    };
    summary: {
      category: string;
      difficulty: string;
    };
  };
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.email !== 'admin@stackit.com') {
      router.push('/');
      return;
    }
    fetchQuestions();
  }, [session, router]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (questionId: string, action: 'approve' | 'moderate' | 'delete') => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, action })
      });

      if (response.ok) {
        await fetchQuestions();
        setShowDialog(false);
        setSelectedQuestion(null);
      }
    } catch (error) {
      console.error('Error moderating question:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getQuestionsByStatus = (status: string) => {
    return questions.filter(q => q.status === status);
  };

  const getModerationScore = (question: Question) => {
    if (!question.aiAnalysis?.moderation) return 0;
    return question.aiAnalysis.moderation.confidence * 100;
  };

  const getModerationColor = (question: Question) => {
    const score = getModerationScore(question);
    if (score > 80) return '#4caf50';
    if (score > 60) return '#ff9800';
    return '#f44336';
  };

  if (session?.user?.email !== 'admin@stackit.com') {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: '#ff6b6b' }}>
          Access Denied. Admin privileges required.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#2d7be5' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ color: '#fff', mb: 3 }}>
        🤖 Admin Moderation Panel
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ 
          mb: 3,
          '& .MuiTab-root': { color: '#b3b3b3' },
          '& .Mui-selected': { color: '#2d7be5' },
          '& .MuiTabs-indicator': { backgroundColor: '#2d7be5' }
        }}
      >
        <Tab label={`Pending Review (${getQuestionsByStatus('active').length})`} />
        <Tab label={`Moderated (${getQuestionsByStatus('moderated').length})`} />
        <Tab label={`Deleted (${getQuestionsByStatus('deleted').length})`} />
      </Tabs>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(() => {
          const statusMap = ['active', 'moderated', 'deleted'];
          const currentQuestions = getQuestionsByStatus(statusMap[activeTab]);
          
          if (currentQuestions.length === 0) {
            return (
              <Alert severity="info" sx={{ background: '#181920', color: '#b3b3b3' }}>
                No questions in this category.
              </Alert>
            );
          }

          return currentQuestions.map((question) => (
            <Card key={question._id} sx={{ background: '#181920', border: '1px solid #333' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#fff', flex: 1 }}>
                    {question.title}
                  </Typography>
                  
                  {/* AI Moderation Score */}
                  {question.aiAnalysis?.moderation && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${getModerationScore(question).toFixed(0)}%`}
                        size="small"
                        sx={{
                          background: getModerationColor(question),
                          color: '#fff',
                          fontWeight: 600
                        }}
                      />
                      {question.aiAnalysis.moderation.isAppropriate ? (
                        <CheckIcon sx={{ color: '#4caf50' }} />
                      ) : (
                        <WarningIcon sx={{ color: '#ff9800' }} />
                      )}
                    </Box>
                  )}
                </Box>

                {/* AI Analysis Display */}
                {question.aiAnalysis && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      {question.aiAnalysis.summary?.category && (
                        <Chip 
                          label={question.aiAnalysis.summary.category} 
                          size="small" 
                          sx={{ background: '#2d7be5', color: '#fff', fontSize: '0.7rem' }} 
                        />
                      )}
                      {question.aiAnalysis.summary?.difficulty && (
                        <Chip 
                          label={question.aiAnalysis.summary.difficulty} 
                          size="small" 
                          sx={{ 
                            background: question.aiAnalysis.summary.difficulty === 'beginner' ? '#4caf50' : 
                                       question.aiAnalysis.summary.difficulty === 'intermediate' ? '#ff9800' : '#f44336',
                            color: '#fff', 
                            fontSize: '0.7rem'
                          }} 
                        />
                      )}
                    </Box>
                    
                    {question.aiAnalysis.moderation.issues.length > 0 && (
                      <Alert severity="warning" sx={{ background: '#2d1b1b', color: '#ff9800', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          AI Detected Issues:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {question.aiAnalysis.moderation.issues.map((issue, index) => (
                            <li key={index} style={{ color: '#ff9800' }}>{issue}</li>
                          ))}
                        </ul>
                      </Alert>
                    )}
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {question.tags.map((tag) => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      sx={{ background: '#23242b', color: '#b3b3b3', fontSize: '0.7rem' }} 
                    />
                  ))}
                </Box>

                <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 2 }}>
                  {question.user?.name || 'Anonymous'} &middot; {new Date(question.createdAt).toLocaleString()}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <IconButton
                    onClick={() => {
                      setSelectedQuestion(question);
                      setShowDialog(true);
                    }}
                    sx={{ color: '#2d7be5' }}
                  >
                    <ViewIcon />
                  </IconButton>
                  
                  {question.status === 'active' && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CheckIcon />}
                        onClick={() => handleModerationAction(question._id, 'approve')}
                        disabled={actionLoading}
                        sx={{ 
                          color: '#4caf50', 
                          borderColor: '#4caf50',
                          '&:hover': { borderColor: '#45a049' }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<BlockIcon />}
                        onClick={() => handleModerationAction(question._id, 'moderate')}
                        disabled={actionLoading}
                        sx={{ 
                          color: '#ff9800', 
                          borderColor: '#ff9800',
                          '&:hover': { borderColor: '#f57c00' }
                        }}
                      >
                        Moderate
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleModerationAction(question._id, 'delete')}
                        disabled={actionLoading}
                        sx={{ 
                          color: '#f44336', 
                          borderColor: '#f44336',
                          '&:hover': { borderColor: '#d32f2f' }
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          ));
        })()}
      </Box>

      {/* Question Detail Dialog */}
      <Dialog 
        open={showDialog} 
        onClose={() => setShowDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: '#181920',
            color: '#e0e0e0'
          }
        }}
      >
        {selectedQuestion && (
          <>
            <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid #333' }}>
              {selectedQuestion.title}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ color: '#e0e0e0', mb: 2 }}>
                {selectedQuestion.description}
              </Typography>
              
              {selectedQuestion.aiAnalysis && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                    AI Analysis
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {selectedQuestion.aiAnalysis.summary?.category && (
                      <Chip label={selectedQuestion.aiAnalysis.summary.category} />
                    )}
                    {selectedQuestion.aiAnalysis.summary?.difficulty && (
                      <Chip label={selectedQuestion.aiAnalysis.summary.difficulty} />
                    )}
                  </Box>
                  
                  {selectedQuestion.aiAnalysis.moderation.issues.length > 0 && (
                    <Alert severity="warning" sx={{ background: '#2d1b1b', color: '#ff9800' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Issues Detected:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {selectedQuestion.aiAnalysis.moderation.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}
                  
                  {selectedQuestion.aiAnalysis.moderation.suggestions.length > 0 && (
                    <Alert severity="info" sx={{ background: '#181920', color: '#2d7be5', mt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Suggestions:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {selectedQuestion.aiAnalysis.moderation.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid #333', p: 2 }}>
              <Button onClick={() => setShowDialog(false)} sx={{ color: '#b3b3b3' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
} 