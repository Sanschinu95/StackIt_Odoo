"use client";
import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Button, TextField } from '@mui/material';
import EditorToolbar from './EditorToolbar';

interface FastEditorProps {
  placeholder?: string;
  initialData?: any;
  onChange?: (data: any) => void;
  onReady?: () => void;
  minHeight?: number;
  readOnly?: boolean;
  showToolbar?: boolean;
  onEditorReady?: (editor: any) => void;
}

export default function FastEditor({
  placeholder = "Start writing...",
  initialData,
  onChange,
  onReady,
  minHeight = 200,
  readOnly = false,
  showToolbar = true,
  onEditorReady
}: FastEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onChangeRef = useRef(onChange);
  const onReadyRef = useRef(onReady);

  // Update the ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Update the ref when onReady changes
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize with initial data
  useEffect(() => {
    if (initialData && initialData.blocks && initialData.blocks.length > 0) {
      const textContent = initialData.blocks
        .map((block: any) => block.data?.text || '')
        .join('\n');
      setText(textContent);
    }
  }, [initialData]);

  // Pass text content directly for onChange
  useEffect(() => {
    if (onChangeRef.current && isEditorReady) {
      // Format as Editor.js data structure
      const editorData = {
        blocks: [
          {
            type: 'paragraph',
            data: { text: text }
          }
        ]
      };
      onChangeRef.current(editorData);
    }
  }, [text, isEditorReady]);

  // Simulate editor ready
  useEffect(() => {
    if (isClient) {
      setIsEditorReady(true);
      if (onReadyRef.current) {
        onReadyRef.current();
      }
      if (onEditorReady) {
        onEditorReady({
          save: async () => ({
            blocks: [
              {
                type: 'paragraph',
                data: { text: text }
              }
            ]
          }),
          clear: () => setText(''),
          render: (data: any) => {
            if (data && data.blocks && data.blocks.length > 0) {
              const textContent = data.blocks
                .map((block: any) => block.data?.text || '')
                .join('\n');
              setText(textContent);
            }
          }
        });
      }
    }
  }, [isClient, onEditorReady]);

  const handleToolbarAction = async (format: string) => {
    if (!textareaRef.current || readOnly) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    let replacement = '';
    switch (format) {
      case 'header':
        replacement = `# ${selectedText || 'Header'}`;
        break;
      case 'list':
        replacement = `• ${selectedText || 'List item'}`;
        break;
      case 'quote':
        replacement = `> ${selectedText || 'Quote'}`;
        break;
      case 'code':
        replacement = `\`${selectedText || 'code'}\``;
        break;
      case 'delimiter':
        replacement = `---\n${selectedText}`;
        break;
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      default:
        return;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setText(newText);

    // Set cursor position after the replacement
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + replacement.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  if (!isClient) {
    return (
      <Box sx={{ 
        minHeight: minHeight, 
        background: '#23242b', 
        borderRadius: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress size={24} sx={{ color: '#2d7be5' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {showToolbar && !readOnly && (
        <EditorToolbar 
          onFormat={handleToolbarAction}
          disabled={false}
        />
      )}
      <TextField
        multiline
        fullWidth
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={readOnly}
        inputRef={textareaRef}
        sx={{
          background: '#23242b',
          borderRadius: showToolbar ? '0 0 8px 8px' : '8px',
          minHeight: minHeight,
          border: '1px solid #333',
          borderTop: showToolbar ? 'none' : '1px solid #333',
          '& .MuiOutlinedInput-root': {
            color: '#e0e0e0',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: 'transparent' },
            '&.Mui-focused fieldset': { borderColor: 'transparent' }
          },
          '& .MuiInputBase-input': {
            color: '#e0e0e0',
            '&::placeholder': {
              color: '#b3b3b3',
              opacity: 1
            }
          }
        }}
        inputProps={{
          style: {
            minHeight: minHeight - 32,
            padding: '16px',
            lineHeight: '1.5'
          }
        }}
      />
    </Box>
  );
} 