"use client";
import { useState, useCallback } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';

const FastEditor = dynamic(() => import('./FastEditor'), { ssr: false });

interface AnswerEditorProps {
  questionId: string;
  onAnswerSubmitted: () => void;
}

export default function AnswerEditor({ questionId, onAnswerSubmitted }: AnswerEditorProps) {
  const [editorData, setEditorData] = useState<string>('');
  const [editorReady, setEditorReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [editorKey, setEditorKey] = useState(0);
  const { data: session, status } = useSession();

  // Create a stable onChange callback
  const handleEditorChange = useCallback((editorData: any) => {
    console.log('Editor onChange called with data:', editorData);
    // Extract text from Editor.js format
    if (editorData && editorData.blocks && editorData.blocks.length > 0) {
      const textContent = editorData.blocks
        .map((block: any) => block.data?.text || '')
        .join('\n');
      setEditorData(textContent);
    } else {
      setEditorData('');
    }
  }, []);

  // Create stable callbacks for editor events
  const handleEditorReady = useCallback(() => {
    console.log('AnswerEditor handleEditorReady called');
    setEditorReady(true);
  }, []);

  const handleEditorInstanceReady = useCallback((instance: any) => {
    console.log('AnswerEditor handleEditorInstanceReady called with instance:', instance);
    setEditorInstance(instance);
  }, []);

  // Helper to check if the text content is empty
  const isContentEmpty = (text: string) => {
    console.log('Checking if content is empty:', text);
    
    if (!text || typeof text !== 'string') {
      console.log('No text or not a string');
      return true;
    }
    
    const trimmedText = text.trim();
    console.log('Text:', `"${text}"`, 'trimmed:', `"${trimmedText}"`);
    
    const hasContent = trimmedText.length > 0;
    console.log('Has content:', hasContent);
    return !hasContent;
  };

  const handleSubmit = async (e?: any) => {
    if (e) e.preventDefault();
    setError('');

    if (!session) {
      setError('Please login to submit an answer');
      return;
    }

    if (isContentEmpty(editorData)) {
      setError('Please add some content to your answer');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, content: editorData }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit answer');
      }
      
      // Clear the editor by forcing a re-render with a new key
      setEditorKey(prev => prev + 1);
      
      // Reset the editor data state
      setEditorData('');
      
      onAnswerSubmitted();
    } catch (error: any) {
      setError(error.message || 'Error submitting answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Box sx={{ background: '#181920', borderRadius: 2, p: 3, mb: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        Your Answer
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3, background: '#2d1b1b', color: '#ff6b6b', border: '1px solid #ff6b6b' }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Box sx={{ position: 'relative' }}>
          <FastEditor
            key={editorKey}
            placeholder="Describe your answer in detail..."
            minHeight={300}
            onChange={handleEditorChange}
            onReady={handleEditorReady}
            onEditorReady={handleEditorInstanceReady}
            showToolbar={true}
          />
          {!editorReady && (
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
              background: 'rgba(24,25,32,0.9)',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              <CircularProgress size={32} sx={{ color: '#2d7be5' }} />
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || isContentEmpty(editorData) || !editorReady}
            sx={{
              background: '#2d7be5',
              color: '#fff',
              '&:hover': { background: '#1e5bb8' },
              '&:disabled': { background: '#666', color: '#999' }
            }}
            onClick={() => {
              console.log('Button state:', {
                isSubmitting,
                isContentEmpty: isContentEmpty(editorData),
                editorReady,
                editorData
              });
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} />
                Submitting...
              </>
            ) : (
              'Submit Answer'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
} 