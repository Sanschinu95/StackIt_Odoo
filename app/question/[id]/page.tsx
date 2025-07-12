"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button, Chip, Box, Typography, Divider, Alert, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

// Dynamic imports for better performance
let EditorJS: any = null;
if (typeof window !== "undefined") {
  EditorJS = require("@editorjs/editorjs").default;
}

const Header = dynamic(() => import("@editorjs/header"), { ssr: false });
const List = dynamic(() => import("@editorjs/list"), { ssr: false });
const Paragraph = dynamic(() => import("@editorjs/paragraph"), { ssr: false });
const Quote = dynamic(() => import("@editorjs/quote"), { ssr: false });
const Code = dynamic(() => import("@editorjs/code"), { ssr: false });
const Delimiter = dynamic(() => import("@editorjs/delimiter"), { ssr: false });
const Marker = dynamic(() => import("@editorjs/marker"), { ssr: false });
const InlineCode = dynamic(() => import("@editorjs/inline-code"), { ssr: false });
const LinkTool = dynamic(() => import("@editorjs/link"), { ssr: false });
const Checklist = dynamic(() => import("@editorjs/checklist"), { ssr: false });
const Table = dynamic(() => import("@editorjs/table"), { ssr: false });

const EditorOutput = dynamic(() => import("@/components/EditorOutput"), { ssr: false });

export default function QuestionDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [editorData, setEditorData] = useState<any>(null);
  const [error, setError] = useState("");
  const editorRef = useRef<any>(null);
  const [questionVoteLoading, setQuestionVoteLoading] = useState(false);
  const [questionVotes, setQuestionVotes] = useState(0);
  const [questionVoters, setQuestionVoters] = useState<string[]>([]);
  // Add answer vote loading state
  const [answerVoteLoading, setAnswerVoteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/questions`)
      .then((res) => res.json())
      .then((data) => {
        const q = (data.questions || []).find((q: any) => q._id === id);
        setQuestion(q);
        setAnswers(q?.answers || []);
        setQuestionVotes(q?.votes || 0);
        setQuestionVoters(q?.voters || []);
        setLoading(false);
      });
  }, [id]);

  // Cleanup and re-initialize EditorJS for answer form
  useEffect(() => {
    let editorInstance: any = null;
    const init = async () => {
      if (session && document.getElementById('answer-editor')) {
        if (editorRef.current) {
          await editorRef.current.isReady;
          editorRef.current.destroy();
          editorRef.current = null;
        }
        try {
          editorInstance = new EditorJS({
            holder: 'answer-editor',
            tools: {
              header: { class: Header, config: { placeholder: 'Enter a header', levels: [1,2,3,4], defaultLevel: 2 }, inlineToolbar: ['marker', 'link'] },
              list: { class: List, inlineToolbar: true, config: { defaultStyle: 'unordered' } },
              paragraph: { class: Paragraph, inlineToolbar: ['marker', 'link', 'bold', 'italic'], config: { placeholder: 'Write your answer here...', preserveBlank: true, keepBlank: true } },
              quote: { class: Quote, inlineToolbar: true, config: { quotePlaceholder: 'Enter a quote', captionPlaceholder: 'Quote\'s author' } },
              code: { class: Code, config: { placeholder: 'Enter a code' } },
              delimiter: Delimiter,
              marker: { class: Marker, shortcut: 'CMD+SHIFT+M' },
              inlineCode: { class: InlineCode, shortcut: 'CMD+SHIFT+C' },
              linkTool: { class: LinkTool, config: { endpoint: '/api/link-preview' } },
              checklist: { class: Checklist, inlineToolbar: true },
              table: { class: Table, inlineToolbar: true, config: { rows: 2, cols: 3 } },
            },
            placeholder: 'Write your answer here...',
            minHeight: 200,
            autofocus: true,
            onChange: async () => {
              try {
                const data = await editorInstance.save();
                setEditorData(data);
              } catch (error) {
                console.error('Error saving editor data:', error);
              }
            },
            onReady: () => {
              setEditorReady(true);
            },
            data: { blocks: [{ type: 'paragraph', data: { text: '' } }] }
          });
          editorRef.current = editorInstance;
        } catch (error) {
          setError('Failed to initialize editor. Please refresh the page.');
        }
      }
    };
    setEditorReady(false);
    setEditorData(null);
    setError("");
    init();
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [session, id]);

  const initializeEditor = async () => {
    try {
      editorRef.current = new EditorJS({
        holder: 'answer-editor',
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3, 4],
              defaultLevel: 2
            },
            inlineToolbar: ['marker', 'link']
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: ['marker', 'link', 'bold', 'italic'],
            config: {
              placeholder: 'Write your answer here...',
              preserveBlank: true,
              keepBlank: true
            }
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author'
            }
          },
          code: {
            class: Code,
            config: {
              placeholder: 'Enter a code'
            }
          },
          delimiter: Delimiter,
          marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M'
          },
          inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+C'
          },
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link-preview',
            }
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            },
          }
        },
        placeholder: 'Write your answer here...',
        minHeight: 200,
        autofocus: true,
        onChange: async () => {
          try {
            const data = await editorRef.current.save();
            setEditorData(data);
          } catch (error) {
            console.error('Error saving editor data:', error);
          }
        },
        onReady: () => {
          setEditorReady(true);
          console.log('Editor is ready to work!');
        },
        data: {
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: ''
              }
            }
          ]
        }
      });
    } catch (error) {
      console.error('Error initializing Editor.js:', error);
      setError('Failed to initialize editor. Please refresh the page.');
    }
  };

  const validateAnswer = () => {
    if (!editorData || !editorData.blocks || editorData.blocks.length === 0) {
      setError("Please add some content to your answer");
      return false;
    }
    const hasContent = editorData.blocks.some((block: any) => 
      block.data && block.data.text && block.data.text.trim().length > 0
    );
    if (!hasContent) {
      setError("Please add some content to your answer");
      return false;
    }
    return true;
  };

  const handleSubmitAnswer = async () => {
    if (!session) {
      setError("Please login to submit an answer");
      return;
    }

    setError("");
    
    if (!validateAnswer()) return;

    if (!editorRef.current) {
      setError("Editor not ready. Please wait a moment and try again.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await editorRef.current.save();
      
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: id,
          content: JSON.stringify(data),
        }),
      });

      if (response.ok) {
        const { answer } = await response.json();
        setAnswers([...answers, answer]);
        if (editorRef.current) {
          editorRef.current.clear();
        }
        setEditorData(null);
        setError("");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit answer');
      }
    } catch (error: any) {
      setError(error.message || "Error submitting answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (answerId: string) => {
    if (!session) {
      setError("Please login to upvote");
      return;
    }

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId }),
      });

      if (response.ok) {
        const { answer } = await response.json();
        setAnswers(answers.map(a => 
          a._id === answerId ? { ...a, votes: answer.votes, voters: answer.voters } : a
        ));
      } else {
        const error = await response.json();
        setError(error.error || "Failed to upvote");
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      setError("Error upvoting");
    }
  };

  // Upvote/downvote logic for question
  const handleQuestionVote = async (type: 'up' | 'down') => {
    if (!session) {
      setError('Please login to vote');
      return;
    }
    setQuestionVoteLoading(true);
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: id, type }),
      });
      if (response.ok) {
        const { question } = await response.json();
        setQuestionVotes(question.votes);
        setQuestionVoters(question.voters);
      } else {
        const error = await response.json();
        console.error('Question vote error:', error); // <-- log backend error
        setError(error.error || 'Failed to vote');
      }
    } catch (error) {
      setError('Error voting');
    } finally {
      setQuestionVoteLoading(false);
    }
  };

  // Upvote/downvote logic for answers
  const handleAnswerVote = async (answerId: string, type: 'up' | 'down') => {
    if (!session) {
      setError('Please login to vote');
      return;
    }
    setAnswerVoteLoading(answerId + type);
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId, type }),
      });
      if (response.ok) {
        const { answer } = await response.json();
        setAnswers(answers.map(a => a._id === answerId ? { ...a, votes: answer.votes, voters: answer.voters } : a));
      } else {
        const error = await response.json();
        console.error('Answer vote error:', error); // <-- log backend error
        setError(error.error || 'Failed to vote');
      }
    } catch (error) {
      setError('Error voting');
    } finally {
      setAnswerVoteLoading(null);
    }
  };

  // --- Answer Editor Loading Fallback ---
  const [editorTimeout, setEditorTimeout] = useState(false);
  useEffect(() => {
    if (!editorReady) {
      const timer = setTimeout(() => setEditorTimeout(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setEditorTimeout(false);
    }
  }, [editorReady, id]);

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
      {/* --- Unified Question Card --- */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, alignItems: 'flex-start', background: '#181920', borderRadius: 2, p: 3, boxShadow: '0 2px 8px #0002' }}>
        {/* Vote buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
          <Button
            size="small"
            variant="outlined"
            sx={{ color: '#2d7be5', borderColor: '#2d7be5', minWidth: 36, mb: 1, '&:hover': { borderColor: '#1e5bb8' } }}
            onClick={() => handleQuestionVote('up')}
            disabled={questionVoters?.includes(session?.user?.id) || questionVoteLoading}
          >
            ▲
          </Button>
          <Typography sx={{ color: '#fff', fontWeight: 600 }}>{questionVotes}</Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{ color: '#2d7be5', borderColor: '#2d7be5', minWidth: 36, mt: 1, '&:hover': { borderColor: '#1e5bb8' } }}
            onClick={() => handleQuestionVote('down')}
            disabled={questionVoters?.includes(session?.user?.id) || questionVoteLoading}
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
      
      <Typography variant="h5" sx={{ color: '#fff', mb: 3 }}>
        Answers ({answers.length})
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
        {answers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: '#b3b3b3' }}>
              No answers yet. Be the first to help!
            </Typography>
          </Box>
        )}
        
        {answers.map((a: any) => (
          <Box key={a._id} sx={{ background: '#181920', borderRadius: 2, p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#e0e0e0', mb: 2, fontWeight: 600 }}>
              {a.user?.name || 'Anonymous'} &middot; {new Date(a.createdAt).toLocaleString()}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              {(() => {
                try {
                  const answerData = JSON.parse(a.content);
                  return <EditorOutput data={answerData} />;
                } catch (error) {
                  console.error('Error parsing answer content:', error);
                  return (
                    <Typography sx={{ color: '#ff6b6b' }}>
                      Error loading answer content.
                    </Typography>
                  );
                }
              })()}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                size="small" 
                variant="outlined" 
                sx={{ 
                  color: '#2d7be5', 
                  borderColor: '#2d7be5', 
                  fontSize: '0.8rem',
                  '&:hover': { borderColor: '#1e5bb8' }
                }}
                onClick={() => handleAnswerVote(a._id, 'up')}
                disabled={a.voters?.includes(session?.user?.id) || answerVoteLoading === a._id + 'up'}
              >
                ▲ Upvote ({a.votes || 0})
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{ color: '#2d7be5', borderColor: '#2d7be5', fontSize: '0.8rem', '&:hover': { borderColor: '#1e5bb8' } }}
                onClick={() => handleAnswerVote(a._id, 'down')}
                disabled={a.voters?.includes(session?.user?.id) || answerVoteLoading === a._id + 'down'}
              >
                ▼ Downvote
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
      
      {/* Answer Form */}
      {session && (
        <Box sx={{ mt: 4, p: 4, background: '#181920', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
            Your Answer
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 3 }}>
            Provide a clear, detailed answer to help the community. Use formatting tools to make your answer easy to read.
          </Typography>
          
          <Box sx={{ position: 'relative', mb: 3 }}>
            <div 
              id="answer-editor" 
              style={{ 
                background: '#23242b', 
                borderRadius: 8, 
                padding: 16, 
                minHeight: 250,
                border: '1px solid #333'
              }}
            />
            {!editorReady && !editorTimeout && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <CircularProgress size={20} sx={{ color: '#2d7be5' }} />
                <Typography sx={{ color: '#b3b3b3' }}>Loading editor...</Typography>
              </Box>
            )}
            {!editorReady && editorTimeout && (
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <Typography sx={{ color: '#ff6b6b', mb: 1 }}>Editor failed to load.</Typography>
                <Button variant="outlined" onClick={() => window.location.reload()} sx={{ color: '#2d7be5', borderColor: '#2d7be5' }}>
                  Retry
                </Button>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handleSubmitAnswer}
              disabled={submitting || !editorReady}
              sx={{ 
                background: '#2d7be5',
                px: 4,
                py: 1.5,
                '&:hover': { background: '#1e5bb8' },
                '&:disabled': { background: '#333' }
              }}
            >
              {submitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: '#fff' }} />
                  Submitting...
                </Box>
              ) : (
                'Submit Answer'
              )}
            </Button>
          </Box>
        </Box>
      )}
      
      {!session && (
        <Box sx={{ mt: 4, p: 4, background: '#181920', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Join the Discussion
          </Typography>
          <Typography variant="body1" sx={{ color: '#b3b3b3' }}>
            Please login to submit an answer and help the community
          </Typography>
        </Box>
      )}
    </Box>
  );
} 