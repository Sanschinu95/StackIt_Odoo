"use client";
import { useState, useRef, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";

export default function TestEditorPage() {
  const [editorReady, setEditorReady] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !editorRef.current && document.getElementById("test-editor")) {
      initializeEditor();
    }
  }, [isClient]);

  const initializeEditor = async () => {
    try {
      console.log('Initializing test Editor.js...');
      
      const holderElement = document.getElementById("test-editor");
      if (!holderElement) {
        throw new Error('Editor holder element not found');
      }
      
      const EditorJSModule = await import("@editorjs/editorjs");
      const ParagraphModule = await import("@editorjs/paragraph");
      
      const config: any = {
        holder: "test-editor",
        tools: {
          paragraph: {
            class: ParagraphModule.default,
            config: {
              placeholder: 'Test paragraph...',
              preserveBlank: true
            }
          }
        },
        placeholder: "Test editor...",
        minHeight: 200,
        onReady: () => {
          console.log('Test editor is ready!');
          setEditorReady(true);
        },
        data: {
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: 'Test content'
              }
            }
          ]
        }
      };
      
      editorRef.current = new EditorJSModule.default(config);
    } catch (error: any) {
      console.error('Error initializing test editor:', error);
      setError(error.message);
    }
  };

  const testSave = async () => {
    if (editorRef.current) {
      try {
        const data = await editorRef.current.save();
        console.log('Test editor data:', data);
        alert('Editor data saved successfully! Check console for details.');
      } catch (error) {
        console.error('Error saving test editor data:', error);
        alert('Error saving editor data!');
      }
    }
  };

  if (!isClient) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 3 }}>
          Editor.js Test Page
        </Typography>
        <Typography sx={{ color: '#b3b3b3' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h4" sx={{ color: '#fff', mb: 3 }}>
        Editor.js Test Page
      </Typography>
      
      {error && (
        <Typography sx={{ color: '#ff6b6b', mb: 2 }}>
          Error: {error}
        </Typography>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: '#b3b3b3', mb: 2 }}>
          Editor Status: {editorReady ? 'Ready' : 'Loading...'}
        </Typography>
        
        <div 
          id="test-editor" 
          style={{ 
            background: '#23242b', 
            borderRadius: 8, 
            minHeight: 200, 
            padding: 16,
            border: '1px solid #333'
          }} 
        />
      </Box>
      
      <Button 
        onClick={testSave}
        disabled={!editorReady}
        variant="contained"
        sx={{ 
          background: '#2d7be5',
          '&:hover': { background: '#1e5bb8' }
        }}
      >
        Test Save
      </Button>
    </Box>
  );
} 