"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField, Chip, Box, Typography, Alert, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import FastEditor from "@/components/FastEditor";

export default function AskPage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorData, setEditorData] = useState<any>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Check authentication
    if (status === "loading") return;
    
    if (!session) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  const handleAddTag = (e: any) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleTagInputKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleAddTag(e);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError("Please enter a title");
      return false;
    }
    if (title.length < 10) {
      setError("Title must be at least 10 characters long");
      return false;
    }
    if (tags.length === 0) {
      setError("Please add at least one tag");
      return false;
    }
    
    // Handle both Editor.js format and plain text format
    let hasContent = false;
    
    if (typeof editorData === 'string') {
      // Plain text format from FastEditor
      hasContent = editorData.trim().length > 0;
    } else if (editorData && editorData.blocks && editorData.blocks.length > 0) {
      // Editor.js format
      hasContent = editorData.blocks.some((block: any) => 
        block.data && block.data.text && block.data.text.trim().length > 0
      );
    }
    
    if (!hasContent) {
      setError("Please add some content to your question");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    
    // Check authentication
    if (!session?.user?.id) {
      setError("You must be logged in to ask a question");
      return;
    }
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Convert plain text to Editor.js format if needed
      let description;
      if (typeof editorData === 'string') {
        // Convert plain text to Editor.js format
        description = JSON.stringify({
          blocks: [
            {
              type: 'paragraph',
              data: { text: editorData }
            }
          ]
        });
      } else {
        // Already in Editor.js format
        description = JSON.stringify(editorData);
      }
      
      console.log('Final description:', description);
      
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description, tags }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        const errorMessage = errorData.error || 'Failed to submit question';
        const details = errorData.details ? ` (${errorData.details})` : '';
        throw new Error(errorMessage + details);
      }
      
      console.log('Question created successfully');
      
      router.push("/");
    } catch (error: any) {
      console.error('Submit error:', error);
      setError(error.message || "Failed to submit question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect if not authenticated
  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ color: '#fff', mb: 3, textAlign: 'center' }}>
        Ask a Question
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, background: '#2d1b1b', color: '#ff6b6b', border: '1px solid #ff6b6b' }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Title *
          </Typography>
          <TextField
            label="What's your question? Be specific."
            variant="outlined"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            inputProps={{ maxLength: 150 }}
            helperText={`${title.length}/150 characters`}
            sx={{ 
              background: '#23242b', 
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                color: '#e0e0e0',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#2d7be5' },
                '&.Mui-focused fieldset': { borderColor: '#2d7be5' }
              },
              '& .MuiInputLabel-root': {
                color: '#b3b3b3',
                '&.Mui-focused': { color: '#2d7be5' }
              },
              '& .MuiFormHelperText-root': {
                color: '#b3b3b3'
              }
            }}
          />
        </Box>
        
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Description *
          </Typography>
          <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 2 }}>
            Provide all the information someone would need to answer your question. 
            Use headers, lists, code blocks, and formatting to make it clear.
          </Typography>


          
          <Box sx={{ position: 'relative' }}>
            <FastEditor
              placeholder="Describe your question in detail..."
              minHeight={300}
              onChange={setEditorData}
              onReady={() => setEditorReady(true)}
            />

            {!editorReady && (
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
          </Box>
        </Box>
        
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Tags * (up to 5)
          </Typography>
          <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 2 }}>
            Add relevant tags to help others find your question.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {tags.map((tag) => (
              <Chip 
                key={tag} 
                label={tag} 
                onDelete={() => handleDeleteTag(tag)} 
                style={{ background: '#2d7be5', color: '#fff' }}
                deleteIcon={<span style={{ color: '#fff' }}>×</span>}
              />
            ))}
          </Box>
          <Box style={{ display: 'flex', gap: 8 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Add tag (press Enter)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              disabled={tags.length >= 5}
              helperText={tags.length >= 5 ? "Maximum 5 tags allowed" : ""}
              sx={{ 
                background: '#23242b', 
                borderRadius: 2,
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  color: '#e0e0e0',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#2d7be5' },
                  '&.Mui-focused fieldset': { borderColor: '#2d7be5' }
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#b3b3b3',
                  opacity: 1
                },
                '& .MuiFormHelperText-root': {
                  color: '#b3b3b3'
                }
              }}
            />
            <Button 
              onClick={handleAddTag} 
              variant="outlined" 
              disabled={!tagInput.trim() || tags.length >= 5}
              style={{ color: '#2d7be5', borderColor: '#2d7be5' }}
            >
              Add
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            type="button"
            variant="outlined" 
            onClick={() => router.push('/')}
            disabled={loading}
            sx={{ 
              color: '#b3b3b3', 
              borderColor: '#333',
              px: 4,
              py: 1.5
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !editorReady}
            sx={{ 
              background: '#2d7be5',
              px: 4,
              py: 1.5,
              '&:hover': { background: '#1e5bb8' },
              '&:disabled': { background: '#333' }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: '#fff' }} />
                Submitting...
              </Box>
            ) : (
              'Submit Question'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
} 