"use client";
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';

const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), { ssr: false });

interface Answer {
  _id: string;
  content: any;
  user: {
    name: string;
    email: string;
  };
  votes: number;
  createdAt: string;
}

interface AnswerListProps {
  questionId: string;
  refreshTrigger: number;
}

export default function AnswerList({ questionId, refreshTrigger }: AnswerListProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    fetchAnswers();
  }, [questionId, refreshTrigger]);

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/answers?questionId=${questionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnswers(data.answers || []);
      } else {
        throw new Error('Failed to fetch answers');
      }
    } catch (error) {
      setError('Failed to load answers');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerVote = async (answerId: string, type: 'up' | 'down') => {
    if (!session) {
      setError('Please login to vote');
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId, type }),
      });

      if (response.ok) {
        // Refresh answers to get updated votes
        fetchAnswers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to vote');
      }
    } catch (error: any) {
      setError(error.message || 'Error voting');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#2d7be5' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3, background: '#2d1b1b', color: '#ff6b6b', border: '1px solid #ff6b6b' }}>
        {error}
      </Alert>
    );
  }

  if (answers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" sx={{ color: '#b3b3b3' }}>
          No answers yet. Be the first to answer this question!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
        {answers.length} Answer{answers.length !== 1 ? 's' : ''}
      </Typography>
      
      {answers.map((answer) => (
        <Box
          key={answer._id}
          sx={{
            background: '#181920',
            borderRadius: 2,
            p: 3,
            mb: 3,
            border: '1px solid #333'
          }}
        >
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            {/* Vote buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
              <Button
                size="small"
                variant="outlined"
                sx={{ color: '#2d7be5', borderColor: '#2d7be5', minWidth: 36, mb: 1, '&:hover': { borderColor: '#1e5bb8' } }}
                onClick={() => handleAnswerVote(answer._id, 'up')}
              >
                ▲
              </Button>
              <Typography sx={{ color: '#fff', fontWeight: 600 }}>{answer.votes || 0}</Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{ color: '#2d7be5', borderColor: '#2d7be5', minWidth: 36, mt: 1, '&:hover': { borderColor: '#1e5bb8' } }}
                onClick={() => handleAnswerVote(answer._id, 'down')}
              >
                ▼
              </Button>
            </Box>
            
            {/* Answer content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                    {answer.user?.name || 'Anonymous'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                    {new Date(answer.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                {(() => {
                  try {
                    // Extract text content from the answer
                    let textContent = '';
                    
                    if (typeof answer.content === 'string') {
                      // If it's already a string, use it directly
                      textContent = answer.content;
                    } else if (answer.content && answer.content.blocks) {
                      // If it's Editor.js format, extract text from blocks
                      textContent = answer.content.blocks
                        .map((block: any) => block.data?.text || '')
                        .join('\n');
                    } else {
                      // Fallback: try to stringify the content
                      textContent = JSON.stringify(answer.content);
                    }
                    
                    return <MarkdownRenderer content={textContent} />;
                  } catch (error) {
                    return (
                      <Typography sx={{ color: '#ff6b6b' }}>
                        Error loading answer content.
                      </Typography>
                    );
                  }
                })()}
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
} 