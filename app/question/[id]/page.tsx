"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Chip, Box, Typography, Divider, Alert, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

// Remove all top-level Editor.js imports and require statements
// All Editor.js imports should only be done dynamically inside useEffect

const EditorOutput = dynamic(() => import("@/components/EditorOutput"), { ssr: false });
const AnswerEditor = dynamic(() => import("@/components/AnswerEditor"), { ssr: false });
const AnswerList = dynamic(() => import("@/components/AnswerList"), { ssr: false });

export default function QuestionDetailPage() {
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshAnswers, setRefreshAnswers] = useState(0);

  const { id } = useParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`/api/questions/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch question');
      }
      const data = await res.json();
      setQuestion(data.question);
    } catch (error) {
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionVote = async (type: 'up' | 'down') => {
    if (!session) {
      setError("Please login to vote");
      return;
    }

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: id, type }),
      });

      if (response.ok) {
        // Refresh question data to get updated votes
        fetchQuestion();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to vote');
      }
    } catch (error: any) {
      setError(error.message || "Error voting");
    }
  };

  const handleAnswerSubmitted = () => {
    setRefreshAnswers(prev => prev + 1);
  };

  // --- Render ---
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
      <CircularProgress sx={{ color: '#2d7be5' }} />
    </Box>
  );
  
  if (!question) return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" sx={{ color: '#ff6b6b' }}>Question not found.</Typography>
    </Box>
  );
  
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, background: '#2d1b1b', color: '#ff6b6b', border: '1px solid #ff6b6b' }}>
          {error}
        </Alert>
      )}
      
      {/* Question Card */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, alignItems: 'flex-start', background: '#181920', borderRadius: 2, p: 3, boxShadow: '0 2px 8px #0002' }}>
        {/* Vote buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
          <Button
            size="small"
            variant="outlined"
            sx={{ color: '#2d7be5', borderColor: '#2d7be5', minWidth: 36, mb: 1, '&:hover': { borderColor: '#1e5bb8' } }}
            onClick={() => handleQuestionVote('up')}
          >
            ▲
          </Button>
          <Typography sx={{ color: '#fff', fontWeight: 600 }}>{question.votes || 0}</Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{ color: '#2d7be5', borderColor: '#2d7be5', minWidth: 36, mt: 1, '&:hover': { borderColor: '#1e5bb8' } }}
            onClick={() => handleQuestionVote('down')}
          >
            ▼
          </Button>
        </Box>
        
        {/* Question content */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ color: '#fff', mb: 1, wordBreak: 'break-word' }}>
            {question.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            {question.tags.map((tag: string) => (
              <Chip key={tag} label={tag} size="small" sx={{ background: '#2d7be5', color: '#fff', fontWeight: 500, fontSize: '0.7rem' }} />
            ))}
          </Box>
          <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 2 }}>
            {question.user?.name || 'Anonymous'} &middot; {new Date(question.createdAt).toLocaleString()}
          </Typography>
          <Box sx={{ mb: 2 }}>
            {(() => {
              try {
                const descriptionData = JSON.parse(question.description);
                return <EditorOutput data={descriptionData} />;
              } catch (error) {
                return <Typography sx={{ color: '#ff6b6b' }}>Error loading question content.</Typography>;
              }
            })()}
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ my: 4, borderColor: '#333' }} />
      
      {/* Answer Editor */}
      <AnswerEditor 
        questionId={id as string} 
        onAnswerSubmitted={handleAnswerSubmitted}
      />
      
      <Divider sx={{ my: 4, borderColor: '#333' }} />
      
      {/* Answer List */}
      <AnswerList 
        questionId={id as string} 
        refreshTrigger={refreshAnswers}
      />
      
      <Divider sx={{ my: 4, borderColor: '#333' }} />
      
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
          Question Details
        </Typography>
        <Typography variant="body1" sx={{ color: '#b3b3b3' }}>
          This question has been viewed {question.views || 0} times
        </Typography>
        {question.aiAnalysis?.summary && (
          <Box sx={{ mt: 3, p: 3, background: '#181920', borderRadius: 2, textAlign: 'left' }}>
            <Typography variant="subtitle1" sx={{ color: '#2d7be5', mb: 1 }}>
              AI Analysis Summary
            </Typography>
            <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 2 }}>
              {question.aiAnalysis.summary.summary}
            </Typography>
            {question.aiAnalysis.summary.keyPoints && question.aiAnalysis.summary.keyPoints.length > 0 && (
              <Box>
                <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 1 }}>
                  Key Points:
                </Typography>
                <ul style={{ color: '#e0e0e0', margin: 0, paddingLeft: '20px' }}>
                  {question.aiAnalysis.summary.keyPoints.map((point: string, index: number) => (
                    <li key={index} style={{ marginBottom: '4px' }}>{point}</li>
                  ))}
                </ul>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
} 