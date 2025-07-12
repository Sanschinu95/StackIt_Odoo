"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField, Chip, Box, Typography, Alert, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";


// Import Editor.js directly
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import Code from "@editorjs/code";
import Delimiter from "@editorjs/delimiter";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";


export default function AskPage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [editorData, setEditorData] = useState<any>(null);
  const [error, setError] = useState("");

  const editorRef = useRef<any>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Check authentication
    if (status === "loading") return;
    
    if (!session) {
      router.push("/");
      return;
    }

    const initEditor = () => {
      if (!editorRef.current && document.getElementById("editorjs")) {
        console.log('Attempting to initialize editor...');
        initializeEditor();
      }
    };

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      initEditor();
    }, 100);

    return () => clearTimeout(timer);
  }, [session, status, router]);

  const initializeEditor = async () => {
    try {
      console.log('Initializing Editor.js...');
      
      // Check if the holder element exists
      const holderElement = document.getElementById("editorjs");
      if (!holderElement) {
        throw new Error('Editor holder element not found');
      }
      
      console.log('Creating Editor.js instance...');
      
      // Fixed configuration for better cursor handling
      const config = {
        holder: "editorjs",
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
              placeholder: 'Start writing your question...',
              preserveBlank: true,
              keepBlank: true,
              preserveLineBreaks: true,
              htmlSanitizer: (html: string) => html
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
          }
        },
        placeholder: "Describe your question in detail...",
        minHeight: 200,
        autofocus: false,
        readOnly: false,
        onChange: async () => {
          try {
            if (editorRef.current) {
              const data = await editorRef.current.save();
              setEditorData(data);
            }
          } catch (error) {
            console.error('Error saving editor data:', error);
          }
        },
        onReady: () => {
          setEditorReady(true);
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
      };
      
      editorRef.current = new EditorJS(config);
      
    } catch (error) {
      console.error('Error initializing Editor.js:', error);
      setError(`Failed to initialize editor: ${error.message}. Please refresh the page.`);
      
      // Try to show a fallback textarea
      const holderElement = document.getElementById("editorjs");
      if (holderElement) {
        holderElement.innerHTML = `
          <textarea 
            placeholder="Describe your question in detail..." 
            style="width: 100%; min-height: 300px; padding: 16px; background: #23242b; color: #e0e0e0; border: 1px solid #333; border-radius: 8px; font-family: inherit; resize: vertical;"
          ></textarea>
        `;
      }
    }
  };

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
      const editor = editorRef.current;
      if (!editor) {
        setError("Editor not ready. Please wait a moment and try again.");
        setLoading(false);
        return;
      }
      
      console.log('Saving editor data...');
      const output = await editor.save();
      console.log('Editor output:', output);
      
      // Validate the output
      if (!output || !output.blocks || !Array.isArray(output.blocks)) {
        throw new Error('Invalid editor data format');
      }
      
      // Check if there's any content
      const hasContent = output.blocks.some((block: any) => {
        if (block.type === 'paragraph' && block.data?.text) {
          let text = '';
          if (typeof block.data.text === 'string') {
            text = block.data.text;
          } else if (block.data.text && typeof block.data.text === 'object') {
            // Handle rich text objects
            if (block.data.text.blocks) {
              text = block.data.text.blocks.map((b: any) => b.text || '').join('');
            } else {
              text = block.data.text.text || block.data.text.content || '';
            }
          }
          return text.trim().length > 0;
        }
        // Consider other block types as content
        if (block.type === 'header' || block.type === 'list' || block.type === 'quote' || block.type === 'code') {
          return true;
        }
        return false;
      });
      
      if (!hasContent) {
        throw new Error('Please add some content to your question');
      }
      
      const description = JSON.stringify(output);
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
            {/* Custom Toolbar */}
            {editorReady && (
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                background: '#181920', 
                borderRadius: 2, 
                border: '1px solid #333',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center'
              }}>
                <Typography variant="caption" sx={{ color: '#b3b3b3', mr: 2, fontWeight: 500 }}>
                  Add Block:
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (editorRef.current) {
                      editorRef.current.blocks.insert('paragraph', { text: '' });
                    }
                  }}
                  sx={{ 
                    color: '#2d7be5', 
                    borderColor: '#2d7be5',
                    fontSize: '0.8rem',
                    py: 0.5,
                    px: 1.5,
                    '&:hover': { borderColor: '#1e5bb8' }
                  }}
                >
                  Text
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (editorRef.current) {
                      editorRef.current.blocks.insert('header', { text: 'Heading', level: 2 });
                    }
                  }}
                  sx={{ 
                    color: '#2d7be5', 
                    borderColor: '#2d7be5',
                    fontSize: '0.8rem',
                    py: 0.5,
                    px: 1.5,
                    '&:hover': { borderColor: '#1e5bb8' }
                  }}
                >
                  Header
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (editorRef.current) {
                      editorRef.current.blocks.insert('list', { style: 'unordered', items: [''] });
                    }
                  }}
                  sx={{ 
                    color: '#2d7be5', 
                    borderColor: '#2d7be5',
                    fontSize: '0.8rem',
                    py: 0.5,
                    px: 1.5,
                    '&:hover': { borderColor: '#1e5bb8' }
                  }}
                >
                  List
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (editorRef.current) {
                      editorRef.current.blocks.insert('quote', { text: '', caption: '' });
                    }
                  }}
                  sx={{ 
                    color: '#2d7be5', 
                    borderColor: '#2d7be5',
                    fontSize: '0.8rem',
                    py: 0.5,
                    px: 1.5,
                    '&:hover': { borderColor: '#1e5bb8' }
                  }}
                >
                  Quote
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (editorRef.current) {
                      editorRef.current.blocks.insert('code', { code: '' });
                    }
                  }}
                  sx={{ 
                    color: '#2d7be5', 
                    borderColor: '#2d7be5',
                    fontSize: '0.8rem',
                    py: 0.5,
                    px: 1.5,
                    '&:hover': { borderColor: '#1e5bb8' }
                  }}
                >
                  Code
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (editorRef.current) {
                      editorRef.current.blocks.insert('delimiter', {});
                    }
                  }}
                  sx={{ 
                    color: '#2d7be5', 
                    borderColor: '#2d7be5',
                    fontSize: '0.8rem',
                    py: 0.5,
                    px: 1.5,
                    '&:hover': { borderColor: '#1e5bb8' }
                  }}
                >
                  Divider
                </Button>
              </Box>
            )}
            
            <div 
              id="editorjs" 
              style={{ 
                background: '#23242b', 
                borderRadius: 8, 
                minHeight: 300, 
                padding: 16,
                border: '1px solid #333',
                position: 'relative',
                zIndex: 1,
                color: '#e0e0e0',
                fontFamily: 'inherit',
                fontSize: '1rem',
                lineHeight: '1.5',
                cursor: 'text'
              }} 
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