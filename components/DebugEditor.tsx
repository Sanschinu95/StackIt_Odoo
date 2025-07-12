import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface DebugEditorProps {
  data: any;
  onFix?: () => void;
}

const DebugEditor: React.FC<DebugEditorProps> = ({ data, onFix }) => {
  const analyzeData = () => {
    if (!data || !data.blocks) {
      return { valid: false, issues: ['No data or blocks found'] };
    }

    const issues: string[] = [];
    const blockAnalysis: any[] = [];

    data.blocks.forEach((block: any, index: number) => {
      const blockInfo: any = {
        index,
        type: block.type,
        hasData: !!block.data,
        dataKeys: block.data ? Object.keys(block.data) : [],
        textType: block.data?.text ? typeof block.data.text : 'undefined',
        textLength: block.data?.text ? block.data.text.length : 0
      };

      if (block.type === 'paragraph') {
        if (!block.data) {
          issues.push(`Block ${index}: No data object`);
        } else if (!block.data.text) {
          issues.push(`Block ${index}: No text property`);
        } else if (typeof block.data.text !== 'string') {
          issues.push(`Block ${index}: Text is not string (${typeof block.data.text})`);
        } else if (block.data.text.trim().length === 0) {
          issues.push(`Block ${index}: Empty text content`);
        }
      }

      blockAnalysis.push(blockInfo);
    });

    return {
      valid: issues.length === 0,
      issues,
      blockAnalysis,
      totalBlocks: data.blocks.length
    };
  };

  const analysis = analyzeData();

  if (analysis.valid) {
    return null; // Don't show debug info if everything is valid
  }

  return (
    <Box sx={{ 
      p: 2, 
      background: '#2d1b1b', 
      border: '1px solid #ff6b6b', 
      borderRadius: 2, 
      mb: 2 
    }}>
      <Typography variant="h6" sx={{ color: '#ff6b6b', mb: 2 }}>
        🐛 Editor Debug Information
      </Typography>
      
      <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 1 }}>
        Total blocks: {analysis.totalBlocks}
      </Typography>
      
      <Typography variant="body2" sx={{ color: '#ff6b6b', mb: 2, fontWeight: 600 }}>
        Issues found: {analysis.issues.length}
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        {analysis.issues.map((issue, index) => (
          <Typography key={index} variant="body2" sx={{ color: '#ff9800', mb: 0.5 }}>
            • {issue}
          </Typography>
        ))}
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#e0e0e0', mb: 1, fontWeight: 600 }}>
          Block Analysis:
        </Typography>
        {analysis.blockAnalysis.map((block, index) => (
          <Box key={index} sx={{ mb: 1, p: 1, background: '#181920', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
              Block {block.index}: {block.type} | Data: {block.hasData ? 'Yes' : 'No'} | 
              Text type: {block.textType} | Length: {block.textLength}
            </Typography>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => console.log('Editor data:', data)}
          sx={{ color: '#2d7be5', borderColor: '#2d7be5' }}
        >
          Log Data
        </Button>
        {onFix && (
          <Button 
            size="small" 
            variant="outlined" 
            onClick={onFix}
            sx={{ color: '#4caf50', borderColor: '#4caf50' }}
          >
            Try Fix
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default DebugEditor; 