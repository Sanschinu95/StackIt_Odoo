"use client";
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  FormatQuote,
  Title,
  HorizontalRule
} from '@mui/icons-material';

interface EditorToolbarProps {
  onFormat: (format: string) => void;
  disabled?: boolean;
}

export default function EditorToolbar({ onFormat, disabled = false }: EditorToolbarProps) {
  const toolbarItems = [
    {
      icon: <Title />,
      tooltip: 'Header',
      format: 'header',
      action: () => onFormat('header')
    },
    {
      icon: <FormatBold />,
      tooltip: 'Bold',
      format: 'bold',
      action: () => onFormat('bold')
    },
    {
      icon: <FormatItalic />,
      tooltip: 'Italic',
      format: 'italic',
      action: () => onFormat('italic')
    },
    {
      icon: <FormatListBulleted />,
      tooltip: 'Bullet List',
      format: 'list',
      action: () => onFormat('list')
    },
    {
      icon: <FormatListNumbered />,
      tooltip: 'Numbered List',
      format: 'list',
      action: () => onFormat('list')
    },
    {
      icon: <FormatQuote />,
      tooltip: 'Quote',
      format: 'quote',
      action: () => onFormat('quote')
    },
    {
      icon: <Code />,
      tooltip: 'Code Block',
      format: 'code',
      action: () => onFormat('code')
    },
    {
      icon: <HorizontalRule />,
      tooltip: 'Divider',
      format: 'delimiter',
      action: () => onFormat('delimiter')
    }
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        background: '#1a1b23',
        borderRadius: '8px 8px 0 0',
        border: '1px solid #333',
        borderBottom: 'none'
      }}
    >
      {toolbarItems.map((item, index) => (
        <Box key={item.format + index}>
          <Tooltip title={item.tooltip} placement="top">
            <span>
              <IconButton
                size="small"
                onClick={item.action}
                disabled={disabled}
                sx={{
                  color: '#b3b3b3',
                  '&:hover': {
                    background: '#2d7be5',
                    color: '#fff'
                  },
                  '&:disabled': {
                    color: '#666'
                  }
                }}
              >
                {item.icon}
              </IconButton>
            </span>
          </Tooltip>
          {index < toolbarItems.length - 1 && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: '#333', mx: 0.5 }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
} 